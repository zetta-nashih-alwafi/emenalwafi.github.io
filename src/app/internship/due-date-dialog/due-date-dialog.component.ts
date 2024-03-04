import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { InternshipService } from 'app/service/internship/internship.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';

@Component({
  templateUrl: './due-date-dialog.component.html',
  styleUrls: ['./due-date-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class DueDateDialogComponent implements OnInit {
  studentDate = { internDate: '10/08/2021', mentorDate: '10/09/2021' };
  internshipDate = new UntypedFormControl(null);
  mentorDate = new UntypedFormControl(null);

  today = new Date();
  identityForm: UntypedFormGroup;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<DueDateDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private internshipService: InternshipService,
    private parseStringDatePipe: ParseStringDatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    // console.log('dialog data', this.data);
    this.initForm();
    if (this.data && this.data._id) {
      if (this.data.internship_report_due_date && this.data.internship_report_due_date.date) {
        this.data.internship_report_due_date.date = this.parseStringDatePipe.transformStringToDate(
          this.data.internship_report_due_date.date,
        );
        this.data.internship_report_due_date.date = moment(this.data.internship_report_due_date.date).format('YYYY-MM-DD');
      }
      if (this.data.mentor_evaluation_due_date && this.data.mentor_evaluation_due_date.date) {
        this.data.mentor_evaluation_due_date.date = this.parseStringDatePipe.transformStringToDate(
          this.data.mentor_evaluation_due_date.date,
        );
        this.data.mentor_evaluation_due_date.date = moment(this.data.mentor_evaluation_due_date.date).format('YYYY-MM-DD');
      }
      this.identityForm.patchValue(this.data);
    }
  }

  initForm() {
    this.identityForm = this.fb.group({
      internship_report_due_date: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      mentor_evaluation_due_date: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
    });
  }
  updateDate() {
    if (this.data && this.data._id) {
      const payload = _.cloneDeep(this.identityForm.value);
      payload.internship_report_due_date.date = moment(payload.internship_report_due_date.date).format('DD/MM/YYYY');
      payload.mentor_evaluation_due_date.date = moment(payload.mentor_evaluation_due_date.date).format('DD/MM/YYYY');
      payload.internship_report_due_date.time = '15:59';
      payload.mentor_evaluation_due_date.time = '15:59';
      this.subs.sink = this.internshipService.updateInternship(this.data._id, payload).subscribe(
        (resps) => {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close();
          });
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
}
