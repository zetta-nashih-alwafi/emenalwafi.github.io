import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import * as moment from 'moment';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';

interface AddSequenceDialogData {
  type: 'add' | 'edit' | 'duplicate';
  from: 'table' | 'form';
  formData: {
    _id: string;
    name: string;
    description: string;
    type_of_sequence: string;
    start_date: Date;
    end_date: Date;
    number_of_week: number;
  };
  isTemplateBuilder;
  sequenceId;
}

@Component({
  selector: 'ms-add-sequence-dialog',
  templateUrl: './add-sequence-dialog.component.html',
  styleUrls: ['./add-sequence-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class AddSequenceDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  form: UntypedFormGroup;
  loading = false;
  @Output() dateChange: EventEmitter<MatDatepickerInputEvent<Date>>;

  constructor(
    private fb: UntypedFormBuilder,
    private localToUTC: ParseLocalToUtcPipe,
    private courseSequenceServ: CourseSequenceService,
    private dialogRef: MatDialogRef<AddSequenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: AddSequenceDialogData,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  get showTypeOfSequenceError(): boolean {
    const control = this.form.get('type_of_sequence');
    return (control.dirty || control.touched) && !control.valid && !control.value;
  }

  get validateDisabled(): boolean {
    return !this.form.valid || this.loading;
  }

  initForm() {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      description: [null],
      type_of_sequence: [null, [Validators.required]],
      start_date: [null, [Validators.required]],
      end_date: [null, [Validators.required]],
      number_of_week: [null, [Validators.required]],
    });

    if (this.dialogData.type === 'edit' || this.dialogData.type === 'duplicate') {
      this.form.patchValue(this.dialogData.formData);
    }
  }

  createPayload() {
    return {
      ...this.form.value,
      number_of_week: Number(this.form.get('number_of_week').value),
      end_date: this.localToUTC.transformJavascriptDate(this.form.get('end_date').value),
      start_date: this.localToUTC.transformJavascriptDate(this.form.get('start_date').value),
    };
  }

  checkFormValidity(): boolean {
    if (this.form.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.form.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  validate() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    this.form.disable();
    this.loading = true;
    if (this.dialogData.type === 'add' || this.dialogData.type === 'duplicate') {
      if (this.dialogData && this.dialogData.isTemplateBuilder && this.dialogData.sequenceId) {
        payload.template_course_sequence_id = this.dialogData.sequenceId;
      } else if (this.dialogData && this.dialogData.isTemplateBuilder === false && this.dialogData.sequenceId) {
        payload.program_course_sequence_id = this.dialogData.sequenceId;
      }
      this.subs.sink = this.courseSequenceServ.createSequence(payload).subscribe(
        (resp) => {
          this.loading = false;
          if (this.dialogData.from === 'form') {
            this.dialogRef.close(resp);
          } else {
            this.dialogRef.close('success');
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.loading = false;
          this.form.enable();
          // GraphQL error: Date Sequence test overlap and Date Sequence test is overlapping, You cannot overlap the dates of 2 different sequences
          if (err['message'].includes('You cannot overlap the dates of 2 different sequences')) {
            let tempError = err['message'].replace('GraphQL error: ', '').split(',');
            if (tempError.length) {
              const temp = tempError[0].replaceAll('Date Sequence ', '');
              const sequences = temp.replace(' is overlapping', '').split('and ');
              Swal.fire({
                allowOutsideClick: false,
                type: 'info',
                title: this.translate.instant('TEMPLATE_OVERLAP_S1.Title'),
                html: this.translate.instant('TEMPLATE_OVERLAP_S1.Text', {
                  sequence: sequences.length > 1 && sequences[1] ? sequences[1] : '',
                }),
                confirmButtonText: this.translate.instant('TEMPLATE_OVERLAP_S1.Button'),
              }).then((confirm) => {
                if (confirm.value) {
                  this.form.get('start_date').setValue(null);
                  this.form.get('end_date').setValue(null);
                }
              });
            }
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
          }
        },
      );
    } else if (this.dialogData.type === 'edit') {
      const id = this.dialogData.formData._id;
      this.subs.sink = this.courseSequenceServ.updateSequence(id, payload).subscribe(
        (resp) => {
          this.loading = false;
          if (this.dialogData.from === 'form') {
            this.dialogRef.close(resp);
          } else {
            this.dialogRef.close('success');
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.loading = false;
          this.form.enable();
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
          }
        },
      );
    }
  }

  changeDate() {
    let listSequenceDate = [];
    let end = this.form.get('end_date').value;
    let start = this.form.get('start_date').value;
    if (start && end) {
      end = end.toLocaleDateString('en-GB');
      start = start.toLocaleDateString('en-GB');
      const list = this.getDaysBetweenDates(start, end);
      if (list && list.length) {
        listSequenceDate = list;
        const lengthDate = listSequenceDate.length;
        if (lengthDate) {
          const weekTotal = lengthDate / 7;
          this.form.get('number_of_week').setValue(this.roundToHalf(weekTotal));
        }
      }
    }
  }

  roundToHalf(value) {
    const converted = parseFloat(value);
    let decimal = converted - parseInt(converted.toString(), 10);
    decimal = Math.round(decimal * 10);
    if (decimal === 5) {
      return parseInt(converted.toString(), 10) + 0.5;
    }
    if (decimal < 1 || decimal > 6) {
      return Math.round(converted);
    } else {
      return parseInt(converted.toString(), 10) + 0.5;
    }
  }

  getDaysBetweenDates(startDate, endDate) {
    let now = _.cloneDeep(startDate);
    let end = _.cloneDeep(endDate);
    const dates = [];
    now = moment(now, 'DD/MM/YYYY').format('YYYY-MM-DD');
    end = moment(end, 'DD/MM/YYYY').format('YYYY-MM-DD');

    while (moment(now).isSameOrBefore(end)) {
      dates.push(now);
      now = moment(now).add(1, 'days');
      now = moment(now, 'YYYY-MM-DD').format('YYYY-MM-DD');
    }
    return dates;
  }
}
