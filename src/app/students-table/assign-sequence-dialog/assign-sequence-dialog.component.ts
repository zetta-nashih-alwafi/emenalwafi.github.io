import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { StudentsTableService } from '../StudentTable.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
@Component({
  selector: 'ms-assign-sequence-dialog',
  templateUrl: './assign-sequence-dialog.component.html',
  styleUrls: ['./assign-sequence-dialog.component.scss'],
})
export class AssignSequenceDialogComponent implements OnInit, OnDestroy {
  sequenceForm: UntypedFormGroup;
  sequenceList = [];
  programId;
  private subs = new SubSink();

  isWaitingForResponse = false;
  listSequence = [];
  listSequenceDate = [];
  listDatePerSequence = [];

  checkSequenceAvail = false;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AssignSequenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private studentService: StudentsTableService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.data && this.data.program_id) {
      this.programId = this.data.program_id;
      this.getSequenceDropdown();
    }
    this.initForm();
  }

  initForm() {
    this.sequenceForm = this.fb.group({
      program_sequence_ids: [null, [Validators.required]],
    });
  }

  getSequenceDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.GetOneProgram(this.programId).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res && res.course_sequence_id && res.course_sequence_id.program_sequences_id) {
          const seq = res.course_sequence_id.program_sequences_id;
          this.sequenceList = seq;
          this.sequenceFilter();
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  sequenceFilter() {
    if (this.sequenceList && this.sequenceList.length) {
      if (this.data.type === 'single') {
        if (this.data.program_sequence_ids && this.data.program_sequence_ids.length) {
          this.data.program_sequence_ids.forEach((element) => {
            this.sequenceList = this.sequenceList.filter((x) => x._id !== element._id);
          });
        }
      } else if (this.data.type === 'multiple') {
        if (this.data.program_sequence_ids && this.data.program_sequence_ids.length) {
          let result;
          for (let i = 0; i < this.data.program_sequence_ids.length; i++) {
            result = _(this.data.program_sequence_ids[0]).xorWith(this.data.program_sequence_ids[i], _.isEqual).isEmpty();
            if (!result) {
              break;
            }
          }
          if (result) {
            if (this.data.program_sequence_ids[0] && this.data.program_sequence_ids[0].length) {
              this.data.program_sequence_ids[0].forEach((element) => {
                this.sequenceList = this.sequenceList.filter((x) => x._id !== element._id);
              });
            }
          }
        }
      }
    }
  }

  onValidate() {
    if (this.sequenceForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.sequenceForm.markAllAsTouched();
      return true;
    } else {
      if (this.checkSequenceAvail) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('StudTable_S1.Title'),
          html: this.translate.instant('StudTable_S1.Text'),
          confirmButtonText: this.translate.instant('StudTable_S1.Button'),
        }).then((resp) => {
          if (this.data.type === 'single') {
            this.assignSingle();
          } else if (this.data.type === 'multiple') {
            this.assignMultiple();
          }
        });
      } else{
        if (this.data.type === 'single') {
          this.assignSingle();
        } else if (this.data.type === 'multiple') {
          this.assignMultiple();
        }
      }
    }
  }

  createPayloadSingle() {
    const payload = _.cloneDeep(this.sequenceForm.get('program_sequence_ids').value);
    // const sequence = _.cloneDeep(this.data.program_sequence_ids);
    // if (sequence && sequence.length) {
    //   sequence.forEach((seq) => {
    //     payload.push(seq._id);
    //   });
    // }
    return payload;
  }

  assignSingle() {
    const payload = this.createPayloadSingle();
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.AssignProgramSequencesToStudent(payload, this.data.student_id, this.data.candidate_id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err && err.message && String(err.message).includes('cannot add student to class, limit already reached')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('StudTable_S3.Title'),
            html: this.translate.instant('StudTable_S3.Text'),
            confirmButtonText: this.translate.instant('StudTable_S3.Button'),
            allowOutsideClick: false,
          });
        } else if (err && err.message && String(err.message).includes('sequence does not have group yet')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('StudTable_S4.Title'),
            html: this.translate.instant('StudTable_S4.Text'),
            confirmButtonText: this.translate.instant('StudTable_S4.Button'),
            allowOutsideClick: false,
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

  createPayloadMultiple() {
    const candidates = _.cloneDeep(this.data.candidates);
    const initialSequence = _.cloneDeep(this.data.program_sequence_ids);
    const payload = [];

    if (Array.isArray(candidates)) {
      candidates.forEach((candidate, index) => {
        let temp;
        let sequence = _.cloneDeep(this.sequenceForm.get('program_sequence_ids').value);
        if (initialSequence && initialSequence.length) {
          if (initialSequence[index] && initialSequence[index].length) {
            if (sequence && sequence.length) {
              let check;
              sequence.forEach((seq, i) => {
                check = initialSequence[index].filter((res) => res._id === seq);
                if (check && check.length) {
                  sequence.splice(i, 1);
                }
              });
            }
          }
        }
        temp = {
          student_id: candidate.student_id,
          candidate_id: candidate.candidate_id,
          program_sequence_ids: sequence,
        };
        payload.push(temp);
      });
    }

    return payload;
  }

  assignMultiple() {
    const payload = this.createPayloadMultiple();
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.AssignManySequencesToManyStudents(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err && err.message && String(err.message).includes('cannot add student to class, limit already reached')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('StudTable_S3.Title'),
            html: this.translate.instant('StudTable_S3.Text'),
            confirmButtonText: this.translate.instant('StudTable_S3.Button'),
            allowOutsideClick: false,
          });
        } else if (err && err.message && String(err.message).includes('sequence does not have group yet')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('StudTable_S4.Title'),
            html: this.translate.instant('StudTable_S4.Text'),
            confirmButtonText: this.translate.instant('StudTable_S4.Button'),
            allowOutsideClick: false,
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

  checkSequence(event, data, ind) {
    this.listSequenceDate = [];

    if (event.selected) {
      const sequence = event.value;
      const candidates = _.cloneDeep(this.data.candidates);
      const initialSequence = _.cloneDeep(this.data.program_sequence_ids);

      const start = data && data.start_date && data.start_date.date ? data.start_date.date : null;
      const end = data && data.end_date && data.end_date.date ? data.end_date.date : null;
      if (start && end) {
        const list = this.getDaysBetweenDates(start, end);
        if (list && list.length) {
          this.listDatePerSequence.push(list);
          this.listSequence.push(data);
          this.listDatePerSequence.forEach((element) => {
            this.listSequenceDate = this.listSequenceDate.concat(element);
          });
          const duplicateElements = this.toFindDuplicates(this.listSequenceDate);
          if (duplicateElements && duplicateElements.length) {
            let sequenceDuplicateName = '';
            if (this.listDatePerSequence.length) {
              let findSequence = false;
              this.listDatePerSequence.forEach((seq, index) => {
                const found = seq.some((r) => list.includes(r));
                if (found && !findSequence) {
                  findSequence = true;
                  if (this.listSequence && this.listSequence[index]) {
                    sequenceDuplicateName = this.listSequence[index].name;
                  }
                }
              });
            }
            Swal.fire({
              allowOutsideClick: false,
              type: 'info',
              title: this.translate.instant('TEMPLATE_OVERLAP_S1.Title'),
              html: this.translate.instant('TEMPLATE_OVERLAP_S1.Text', {
                sequence: sequenceDuplicateName ? sequenceDuplicateName : '',
              }),
              confirmButtonText: this.translate.instant('TEMPLATE_OVERLAP_S1.Button'),
            });
            const form = this.sequenceForm.get('program_sequence_ids').value
            if(data){
              const filterForm = form.filter(program=> program !== data._id)
              this.sequenceForm.get('program_sequence_ids').patchValue(filterForm)
              const findIndex = this.listSequence.findIndex((value) => value._id === data._id);
              if (this.listDatePerSequence && this.listDatePerSequence.length && findIndex >= 0 && this.listDatePerSequence[findIndex]) {
                this.listDatePerSequence.splice(findIndex, 1);
              }
              if (this.listSequence && this.listSequence.length && findIndex >= 0 && this.listSequence[findIndex]) {
                this.listSequence.splice(findIndex, 1);
              }   
            }
          }
        }
      }

      if (candidates && candidates.length) {
        candidates.forEach((candidate, index) => {
          if (initialSequence && initialSequence.length) {
            if (initialSequence[index] && initialSequence[index].length) {
              if (sequence) {
                let check;
                check = initialSequence[index].filter((res) => res._id === sequence);
                this.checkSequenceAvail = false;
                if (check && check.length) {
                  this.checkSequenceAvail = true;
                }
              }
            }
          }
        });
      }
    } else {
      if(data){
        const findIndex = this.listSequence.findIndex((value) => value._id === data._id);
        if (this.listDatePerSequence && this.listDatePerSequence.length && findIndex >= 0 && this.listDatePerSequence[findIndex]) {
          this.listDatePerSequence.splice(findIndex, 1);
        }
        if (this.listSequence && this.listSequence.length && findIndex >= 0 && this.listSequence[findIndex]) {
          this.listSequence.splice(findIndex, 1);
        }
      }
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
  toFindDuplicates(arry) {
    const uniqueElements = new Set(arry);
    const filteredElements = arry.filter((item) => {
      if (uniqueElements.has(item)) {
        uniqueElements.delete(item);
      } else {
        return item;
      }
    });
    return filteredElements;
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
