import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-connect-sequences-dialog',
  templateUrl: './connect-sequences-dialog.component.html',
  styleUrls: ['./connect-sequences-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class ConnectSequencesDialogComponent implements OnInit {
  form: UntypedFormGroup;
  templateForm: UntypedFormGroup;
  templateList = [];
  templateOrigin = [];
  subs = new SubSink();
  isWaitingForResponse = false;
  schoolId = null;
  isEmpty = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConnectSequencesDialogComponent>,
    private courseService: CourseSequenceService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private utilService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.subs.sink = this.route.paramMap.subscribe((param) => {
      this.schoolId = param.get('id');
    });
    this.initForm();
    this.getAllDropdown();
  }
  initForm() {
    this.form = this.fb.group({
      template: [null, Validators.required],
    });
  }
  getAllDropdown() {
    this.isWaitingForResponse = true;
    const filter = {
      is_published: true,
    };
    this.subs.sink = this.courseService.GetAllTemplateCourseSequenceDropdown(filter).subscribe(
      (resp) => {
        if (resp) {
          const temp = cloneDeep(resp);
          this.templateOrigin = cloneDeep(resp);
          this.templateList = temp
            .filter((list) => list.name)
            .map((template) => {
              return { name: template.name, _id: template._id };
            });

          this.templateList = this.templateList.sort((groupA, groupB) => {
            if (this.utilService.simplifyRegex(groupA.name) < this.utilService.simplifyRegex(groupB.name)) {
              return -1;
            } else if (this.utilService.simplifyRegex(groupA.name) > this.utilService.simplifyRegex(groupB.name)) {
              return 1;
            } else {
              return 0;
            }
          });
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
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
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }
  connectTemplate() {
    this.isWaitingForResponse = true;
    if (this.form.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.form.markAllAsTouched();
      this.isEmpty = true;
      this.isWaitingForResponse = false;
      return;
    }
    const payload = _.cloneDeep(this.templateForm.value);
    this.subs.sink = this.courseService.CreateUpdateProgramCourseAndSequence(payload).subscribe(
      () => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close('validate');
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: cannot update if session in teacher subject table already have assigned teacher') {
          Swal.fire({
            title: this.translate.instant('Course_and_Sequences_S1.TITLE'),
            text: this.translate.instant('Course_and_Sequences_S1.TEXT'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('Course_and_Sequences_S1.BUTTON'),
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
    // const listId = this.data.map((list) => list._id);
    // const dataId = JSON.stringify(listId);
    // const id = this.form.get('template').value;
    // window.open('/template-sequences/program-sequence/' + id + '?programId=' + dataId + '&schoolId=' + this.schoolId, '_blank');
  }

  close() {
    this.dialogRef.close();
  }

  patchTemplate() {
    const id = this.form.get('template').value;
    if (id) {
      const data = this.templateOrigin.find((resp) => resp._id === id);
      if (data && data._id) {
        this.initFormBuilder();
        this.fetchTemplateSequence(data);
      }
    }
  }

  initFormBuilder() {
    const listId = this.data.map((list) => list._id);
    this.templateForm = this.fb.group({
      program_sequences: this.fb.array([]),
      is_published: [false],
      name: [null],
      template_course_sequence_id: [this.form.get('template').value],
      program_id: [listId],
      program_course_sequence_id: [null],
      description: [null],
    });
  }

  initSequenceFormArray() {
    return this.fb.group({
      template_sequence_id: [null],
      program_sequence_id: [null],
      sequence_id: [null],
      name: [null],
      description: [null],
      start_date: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      end_date: this.fb.group({
        date: [null],
        time: ['15:59'],
      }),
      type_of_sequence: [null],
      number_of_week: [null],
      program_modules: this.fb.array([]),
    });
  }

  initModuleFormArray() {
    return this.fb.group({
      template_module_id: [null],
      program_module_id: [null],
      module_id: [null],
      short_name: [null],
      english_name: [null],
      name: [null],
      ects: [null],
      program_subjects: this.fb.array([]),
    });
  }

  initSubjectFormArray() {
    return this.fb.group({
      template_subject_id: [null],
      program_subject_id: [null],
      subject_id: [null],
      short_name: [null],
      english_name: [null],
      name: [null],
      volume_student_total: [null],
      volume_hours_total: [null],
      academic_objective: [null],
      note: [null],
      ects: [null],
      program_sessions_type: this.fb.array([]),
    });
  }

  initSessionFormArray() {
    return this.fb.group({
      name: [null],
      volume_hours_student: [null],
      duration: [null],
      class_group: [null],
      volume_hours: [''],
      template_session_type: [null],
      program_session_type_id: [null],
    });
  }

  get sequenceFormArray(): UntypedFormArray {
    return this.templateForm.get('program_sequences') as UntypedFormArray;
  }

  addEmptySequenceFormArray() {
    this.sequenceFormArray.push(this.initSequenceFormArray());
  }

  getModuleArray(seqIndex: number): UntypedFormArray {
    return this.sequenceFormArray.at(seqIndex).get('program_modules') as UntypedFormArray;
  }

  addEmptyModuleFormArray(seqIndex: number) {
    this.getModuleArray(seqIndex).push(this.initModuleFormArray());
  }

  getSubjectArray(seqIndex: number, modIndex: number): UntypedFormArray {
    return this.getModuleArray(seqIndex).get(modIndex.toString()).get('program_subjects') as UntypedFormArray;
  }

  addEmptySubjectFormArray(seqIndex: number, modIndex: number) {
    this.getSubjectArray(seqIndex, modIndex).push(this.initSubjectFormArray());
  }

  getSessionArray(seqIndex: number, modIndex: number, subIndex: number): UntypedFormArray {
    return this.getSubjectArray(seqIndex, modIndex).get(subIndex.toString()).get('program_sessions_type') as UntypedFormArray;
  }

  addEmptySessionFormArray(seqIndex: number, modIndex: number, subIndex: number) {
    this.getSessionArray(seqIndex, modIndex, subIndex).push(this.initSessionFormArray());
  }

  fetchTemplateSequence(resp) {
    const payload = _.cloneDeep(resp);
    if (payload && payload._id) {
      if (payload.template_sequences_id && payload.template_sequences_id.length) {
        payload.program_sequences = payload.template_sequences_id;
        payload.program_sequences.forEach((sequence, seqIndex) => {
          this.addEmptySequenceFormArray();
          if (sequence && sequence._id) {
            sequence.template_sequence_id = sequence._id;
          }
          if (sequence && sequence.start_date && sequence.start_date.date) {
            sequence.start_date.date = sequence.start_date.date;
            sequence.start_date.time = sequence.start_date.time;
          }
          if (sequence && sequence.end_date && sequence.end_date.date) {
            sequence.end_date.date = sequence.end_date.date;
            sequence.end_date.time = sequence.end_date.time;
          }
          if (sequence && sequence.template_modules_id && sequence.template_modules_id.length) {
            sequence.program_modules = sequence.template_modules_id;
          }
          if (sequence.program_modules && sequence.program_modules.length) {
            sequence.program_modules.forEach((module, modIndex) => {
              this.addEmptyModuleFormArray(seqIndex);
              if (module && module._id) {
                module.template_module_id = module._id;
              }
              if (module && module.template_subjects_id && module.template_subjects_id.length) {
                module.program_subjects = module.template_subjects_id;
              }
              if (module.program_subjects && module.program_subjects.length) {
                module.program_subjects.forEach((subject, subIndex) => {
                  this.addEmptySubjectFormArray(seqIndex, modIndex);
                  if (subject && subject._id) {
                    subject.template_subject_id = subject._id;
                  }
                  if (subject && subject.subject_id && subject.subject_id._id) {
                    subject.subject_id = subject.subject_id._id;
                  }
                  if (subject && subject.template_sessions_id && subject.template_sessions_id.length) {
                    subject.program_sessions_type = subject.template_sessions_id;
                  }
                  if (subject.program_sessions_type && subject.program_sessions_type.length) {
                    subject.program_sessions_type.forEach((session) => {
                      this.addEmptySessionFormArray(seqIndex, modIndex, subIndex);
                      if (session && session._id) {
                        session.template_session_type = session._id;
                      }
                      if (session && session.volume_hours >= 0) {
                        session.volume_hours = session.volume_hours;
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      this.templateForm.patchValue(payload);
    }
  }
}
