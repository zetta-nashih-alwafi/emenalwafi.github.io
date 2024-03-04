import { cloneDeep } from 'lodash';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
@Component({
  selector: 'ms-sholar-season-dialog',
  templateUrl: './sholar-season-dialog.component.html',
  styleUrls: ['./sholar-season-dialog.component.scss'],
})
export class SholarSeasonDialogComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  scholarSeasons = [];
  isWaitingForResponse = false;
  duplicateScholarSeason = new UntypedFormControl(null);
  constructor(
    private dialogRef: MatDialogRef<SholarSeasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private authService: AuthService,
    private teacherService: TeacherManagementService,
  ) {}

  ngOnInit(): void {
    this.getScholarSeason();
  }
  getScholarSeason() {
    const filter = {
      is_published: true,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.getAllScholarSeasons(filter).subscribe(
      (resp) => {
        if (resp) {
          this.scholarSeasons = cloneDeep(resp);
        } else {
          this.scholarSeasons = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: 'Error!',
          text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ')) : err,
          allowOutsideClick: false,
        });
      },
    );
  }
  validate() {
    if(this.duplicateScholarSeason.invalid){
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.duplicateScholarSeason.markAllAsTouched();
      return;
    }

    let currScholarSeason;
    if(this.scholarSeasons?.length){
      currScholarSeason = this.scholarSeasons.find(scholar => scholar?._id === this.duplicateScholarSeason.value)
    };

    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.duplicateTypeOfIntervention(this.data?.interventions, this.duplicateScholarSeason.value).subscribe(
      (resp) => {
        this.isWaitingForResponse = false
        if(resp){
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(()=>{
            this.dialogRef.close(currScholarSeason?.scholar_season)
          })
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
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
        } else if (err && err['message'] && err['message'].includes('cannot duplicate some type of intervention as the data is already exist')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('DuplicateIntervention_S1.Title', {
              scholarSeasonOrigin: this.data?.scholarSeasonId?.scholar_season,
              scholarSeasonDestination: currScholarSeason?.scholar_season,
            }),
            html: this.translate.instant('DuplicateIntervention_S1.Text', {
              scholarSeasonOrigin: this.data?.scholarSeasonId?.scholar_season,
              scholarSeasonDestination: currScholarSeason?.scholar_season,
            }),
            confirmButtonText: this.translate.instant('DuplicateIntervention_S1.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          }).then(()=>{
            this.dialogRef.close(currScholarSeason?.scholar_season);
          })
        }
      },
    );
  }
  close() {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
