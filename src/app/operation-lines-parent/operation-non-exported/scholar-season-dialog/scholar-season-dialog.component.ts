import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-scholar-season-dialog',
  templateUrl: './scholar-season-dialog.component.html',
  styleUrls: ['./scholar-season-dialog.component.scss'],
})
export class ScholarSeasonDialogComponent implements OnInit {
  isWaitingForResponse = false;
  scholarList: any = [];
  private subs = new SubSink();
  scholarForm: UntypedFormGroup;

  constructor(
    private candidateService: CandidatesService,
    public translate: TranslateService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<ScholarSeasonDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getScholarSeason();
  }

  initForm() {
    this.scholarForm = this.fb.group({
      scholar_season: ['', Validators.required],
    });
  }

  getScholarSeason() {
    this.isWaitingForResponse = true;
    const filter = {
      is_published: true,
    };
    this.subs.sink = this.candidateService.getAllScholarSeasons(filter).subscribe(
      (res) => {
        if (res) {
          this.scholarList = res;
          this.isWaitingForResponse = false;
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
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  onValidate() {
    if (this.scholarForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.scholarForm.markAllAsTouched();
      return true;
    } else {
      this.dialogRef.close(this.scholarForm.get('scholar_season').value);
    }
  }
}
