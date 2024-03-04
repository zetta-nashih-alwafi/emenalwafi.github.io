import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-duplicate-scholar-season',
  templateUrl: './duplicate-scholar-season.component.html',
  styleUrls: ['./duplicate-scholar-season.component.scss'],
})
export class DuplicateScholarSeasonComponent implements OnInit {
  private subs = new SubSink();

  scholarSeasonData;
  scholarSeasonToDuplicateId;
  currentScholarSeason;

  isWaitingForResponse = false;

  scholarSeason = new UntypedFormControl(null, Validators.required);

  constructor(
    private translate: TranslateService,
    private intakeService: IntakeChannelService,
    public dialogRef: MatDialogRef<DuplicateScholarSeasonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.getAllSchoolarSeason();
  }

  getAllSchoolarSeason() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetAllPublishedScholarSeasons(true).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.scholarSeasonData = _.cloneDeep(resp.filter((res) => res._id !== this.data.scholar_season_destination_id));
          console.log('PublishedScholarSeason', this.scholarSeasonData);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  scholarSeasonToDuplicate(event) {
    this.scholarSeasonToDuplicateId = event;
    console.log(this.scholarSeasonToDuplicateId);
  }

  submitVerification() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = {
      ...this.data,
      scholar_season_source_id: this.scholarSeasonToDuplicateId,
    };
    this.isWaitingForResponse = true;
    console.log('_payload', payload);
    this.subs.sink = this.intakeService.DuplicateScholarSeason(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          text: this.translate.instant('This Scholar Season Duplicated !'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(resp._id);
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err['message'] === 'GraphQL error: Source scholar season still empty') {
          Swal.fire({
            title: this.translate.instant('SCHOOL_S4.TITLE'),
            text: this.translate.instant('SCHOOL_S4.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('SCHOOL_S4.BUTTON'),
          });
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  checkFormValidity(): boolean {
    if (this.scholarSeason.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.scholarSeason.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }
}
