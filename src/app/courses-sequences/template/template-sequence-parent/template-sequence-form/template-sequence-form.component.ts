import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { PermissionService } from 'app/service/permission/permission.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { AddTemplateSequenceDialogComponent } from '../../add-template-sequence-dialog/add-template-sequence-dialog.component';
import { AddTemplateModuleDialogComponent } from '../../add-template-module-dialog/add-template-module-dialog.component';
import { AddTemplateSubjectDialogComponent } from '../../add-template-subject-dialog/add-template-subject-dialog.component';
import { CoreService } from 'app/service/core/core.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { AddSequenceDialogComponent } from 'app/courses-sequences/sequence-table/add-sequence-dialog/add-sequence-dialog.component';
import { AddModuleDialogComponent } from 'app/courses-sequences/module-table/add-module-dialog/add-module-dialog.component';
import { AddSubjectDialogComponent } from 'app/courses-sequences/subject-table/add-subject-dialog/add-subject-dialog.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-template-sequence-form',
  templateUrl: './template-sequence-form.component.html',
  styleUrls: ['./template-sequence-form.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class TemplateSequenceFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('sequencePanel') sequencePanel: QueryList<ElementRef>;
  @ViewChildren('modulePanel') modulePanel: QueryList<ElementRef>;
  @ViewChildren('subjectPanel') subjectPanel: QueryList<ElementRef>;
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @Output() newTabGroup: EventEmitter<any> = new EventEmitter();
  @Output() getTabGroup: EventEmitter<any> = new EventEmitter();
  @Output() dateChange: EventEmitter<MatDatepickerInputEvent<Date>>;
  @Input() sequenceGroup;
  Editor = DecoupledEditor;
  @ViewChild('editorNote', { static: true }) editorNote: DecoupledEditor;
  public config = {
    placeholder: this.translate.instant('course_sequence.Academic objectives'),
    height: '20rem',
  };
  public configNote = {
    placeholder: this.translate.instant('course_sequence.Notes'),
    height: '20rem',
  };
  listSequenceDate = [];
  listDatePerSequence = [];
  isTemplateBuilder = false;
  isFormTemplateBuilder = false;
  private subs = new SubSink();
  templateForm: UntypedFormGroup;
  sequencesList = ['Seq A', 'Seq B', 'Seq C', 'Seq D', 'Seq E', 'Seq F'];
  sequencesDisabled = [];
  modulesList = ['Mod A', 'Mod B', 'Mod C', 'Mod D', 'Mod E', 'Mod F'];
  mnodulesDisabled = [];
  subjectList = ['Sub A', 'Sub B', 'Sub C', 'Sub D', 'Sub E', 'Sub F'];
  subjectsDisabled = [];
  isWaitingForResponse = false;
  templateSequenceId = null;
  dataTemplate = null;
  initialData: any;
  programId: any;
  schoolId = null;
  classGroupList = [];
  myInnerHeight = 425;

  disableSequences = [];
  disableModules = [];
  disableSubjects = [];
  disableSessions = [];

  private timeOutVal: any;
  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private coreService: CoreService,
    private translate: TranslateService,
    private courseSequenceService: CourseSequenceService,
    private parseLocalToUtc: ParseLocalToUtcPipe,
    private parseToLocal: ParseUtcToLocalPipe,
    public permissionService: PermissionService,
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private utilitySevice: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
    this.subs.sink = this.route.paramMap.subscribe((param) => {
      this.templateSequenceId = param.get('id');
    });
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp.params.hasOwnProperty('programId')) {
        this.programId = resp.params.programId;
      }
      if (resp.params.hasOwnProperty('schoolId')) {
        this.schoolId = resp.params.schoolId;
      }
    });
    if (this.router.url.includes('/template-sequences/form-detail')) {
      this.isTemplateBuilder = true;
      this.isFormTemplateBuilder = true;
    }
    this.changeTitlePage('');
    this.initFormBuilder();
    this.sinkTemplateFormValueChange();
    this.initialData = this.templateForm.getRawValue();
    if (this.templateSequenceId) {
      if (this.isTemplateBuilder) {
        this.getDataTemplateSequence();
      } else {
        this.getDataProgramSequence();
      }
    }
  }

  ngOnChanges() {
    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
    this.subs.sink = this.route.paramMap.subscribe((param) => {
      this.templateSequenceId = param.get('id');
    });
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp.params.hasOwnProperty('programId')) {
        this.programId = resp.params.programId;
      }
      if (resp.params.hasOwnProperty('schoolId')) {
        this.schoolId = resp.params.schoolId;
      }
    });
    if (this.router.url.includes('/template-sequences/form-detail')) {
      this.isTemplateBuilder = true;
      this.isFormTemplateBuilder = true;
    }
    this.changeTitlePage('');
    this.initFormBuilder();
    this.initialData = this.templateForm.getRawValue();
    if (this.templateSequenceId) {
      if (this.isTemplateBuilder) {
        this.getDataTemplateSequence();
      } else {
        this.getDataProgramSequence();
      }
    }
  }

  sinkTemplateFormValueChange() {
    this.templateForm.valueChanges.subscribe(() => {
      const initialData = JSON.stringify(this.initialData);
      const currentData = JSON.stringify(this.templateForm.getRawValue());
      this.courseSequenceService.childrenFormValidationStatus = initialData === currentData;
    });
  }
  onWheel(event: Event) {
    event?.preventDefault();
  }
  changeTitlePage(name) {
    if (this.isTemplateBuilder) {
      let names = this.translate.instant('course_sequence.Template details') + ' ' + (name ? ' - ' + name : '');
      this.pageTitleService.setTitle(names);
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        names = this.translate.instant('course_sequence.Template details') + ' ' + (name ? ' - ' + name : '');
        this.pageTitleService.setTitle(names);
      });
    } else {
      let names = this.translate.instant('course_sequence.Courses & Sequences') + ' ' + (name ? ' - ' + name : '');
      this.pageTitleService.setTitle(names);
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        names = this.translate.instant('course_sequence.Courses & Sequences') + ' ' + (name ? ' - ' + name : '');
        this.pageTitleService.setTitle(names);
      });
    }
  }

  publishFormBuilderTemplate(event: MatSlideToggleChange) {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
      return;
    }
    if (event && event.checked) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('TEMPLATE_P1.TITLE'),
        text: this.translate.instant('TEMPLATE_P1.TEXT'),
        confirmButtonText: this.translate.instant('TEMPLATE_P1.BUTTON_1'),
        cancelButtonText: this.translate.instant('TEMPLATE_P1.BUTTON_2'),
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
          this.templateForm.get('is_published').patchValue(true, { emitEvent: false });
          this.saveForm('publish');
        } else {
          this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
        }
      });
    } else {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('TEMPLATE_P2.TITLE'),
        text: this.translate.instant('TEMPLATE_P2.TEXT'),
        confirmButtonText: this.translate.instant('TEMPLATE_P2.BUTTON_1'),
        cancelButtonText: this.translate.instant('TEMPLATE_P2.BUTTON_2'),
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
          this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
          this.saveForm('unpublish');
          // this.saveTemplateDetail(false);
        } else {
          this.templateForm.get('is_published').patchValue(true, { emitEvent: false });
        }
      });
    }
  }

  getDataTemplateSequence() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.GetOneTemplateDetailFull(this.templateSequenceId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.dataTemplate = _.cloneDeep(resp);
          this.changeTitlePage(resp.name);
          this.fetchTemplateSequence(_.cloneDeep(resp));
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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

  getDataProgramSequence() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.GetOneProgramCourseSequence(this.templateSequenceId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.dataTemplate = _.cloneDeep(resp);
          if (resp.programs_id && resp.programs_id.length) {
            const programName = resp.programs_id.find((list) => list._id === this.programId);
            if (programName && programName.program) {
              this.changeTitlePage(programName.program);
            }
          }
          this.fetchProgramSequence(_.cloneDeep(resp));
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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

  fetchTemplateSequence(resp) {
    this.sequenceFormArray.clear();
    const payload = _.cloneDeep(resp);
    if (payload && payload._id) {
      if (payload.template_sequences_id && payload.template_sequences_id.length) {
        payload.sequences = payload.template_sequences_id;
        payload.sequences.forEach((sequence, seqIndex) => {
          this.addEmptySequenceFormArray();
          this.sequencesDisabled.push(false);
          if (sequence && sequence._id) {
            sequence.template_sequence_id = sequence._id;
          }
          if (sequence && sequence.sequence_id) {
            sequence.sequence_id = sequence.sequence_id;
          }
          if (sequence && sequence.start_date && sequence.start_date.date) {
            sequence.start_date.date = this.parseToLocal.transformDateToJavascriptDate(sequence.start_date.date, sequence.start_date.time);
            sequence.start_date.time = sequence.start_date.time;
          }
          if (sequence && sequence.end_date && sequence.end_date.date) {
            sequence.end_date.date = this.parseToLocal.transformDateToJavascriptDate(sequence.end_date.date, sequence.end_date.time);
            sequence.end_date.time = sequence.end_date.time;
          }
          if (sequence && sequence.template_modules_id && sequence.template_modules_id.length) {
            sequence.modules = sequence.template_modules_id;
          }
          if (sequence.modules && sequence.modules.length) {
            sequence.modules.forEach((module, modIndex) => {
              this.addEmptyModuleFormArray(seqIndex);
              this.mnodulesDisabled.push(false);
              if (module && module._id) {
                module.template_module_id = module._id;
              }
              if (module && module.module_id) {
                module.module_id = module.module_id;
              }
              if (module && module.template_subjects_id && module.template_subjects_id.length) {
                module.subjects = module.template_subjects_id;
              }
              if (module.subjects && module.subjects.length) {
                module.subjects.forEach((subject, subIndex) => {
                  this.addEmptySubjectFormArray(seqIndex, modIndex);
                  this.subjectsDisabled.push(false);
                  if (subject && subject._id) {
                    subject.template_subject_id = subject._id;
                  }
                  if (subject && subject.subject_id && subject.subject_id._id) {
                    subject.subject_id = subject.subject_id._id;
                  }
                  if (subject && subject.template_sessions_id && subject.template_sessions_id.length) {
                    subject.session_types = subject.template_sessions_id;
                  }
                  if (subject.session_types && subject.session_types.length) {
                    // if (subject && subject.volume_student_total >= 0) {
                    //   subject.volume_student_total = this.reCalculateVolumeHoursStudentPatch(
                    //     seqIndex,
                    //     modIndex,
                    //     subIndex,
                    //     subject.session_types,
                    //   );
                    // }
                    subject.session_types.forEach((session, sesIndex) => {
                      this.addEmptySessionFormArray(seqIndex, modIndex, subIndex);
                      if (session && session._id) {
                        session.session_type_id = session._id;
                      }
                      if (session && session.volume_hours) {
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
      this.initialData = this.templateForm.value;
      if (this.sequenceFormArray && this.sequenceFormArray.length) {
        const sequences = this.sequenceFormArray.value;
        sequences.forEach((sequence, index) => {
          if (sequence.start_date && sequence.start_date.date && sequence.end_date && sequence.end_date.date) {
            this.changeDate(index, 'fetch');
          }
        });
      }
    }
  }

  fetchProgramSequence(resp) {
    this.sequenceFormArray.clear();
    this.classGroupList = [];
    const payload = _.cloneDeep(resp);
    if (payload && payload._id) {
      payload.program_course_sequence_id = payload._id;
      if (payload && payload.programs_id && payload.programs_id.length) {
        payload.program_id = payload.programs_id.map((list) => list._id);
      }
      if (payload.program_sequences_id && payload.program_sequences_id.length) {
        payload.program_sequences = payload.program_sequences_id;
        // save class and group each sequence
        let classGroup = [];
        classGroup = payload.program_sequences.map((sequence) => {
          const seq = {
            program_sequence_groups: sequence.program_sequence_groups,
          };
          if (seq.program_sequence_groups && seq.program_sequence_groups.length && seq.program_sequence_groups[0]) {
            let options = [];
            options.push({ name: 'Class', value: sequence.program_sequence_groups[0].number_of_class });
            if (seq.program_sequence_groups[0].group_class_types && seq.program_sequence_groups[0].group_class_types.length) {
              sequence.program_sequence_groups[0].group_class_types.forEach((grouptype) => {
                options.push({
                  name: grouptype.name,
                  value: grouptype.group_classes_id && grouptype.group_classes_id.length ? grouptype.group_classes_id.length : 0,
                });
              });
            }
            seq.program_sequence_groups = options;
          } else {
            seq.program_sequence_groups = [];
          }
          return seq;
        });
        this.classGroupList = classGroup;
        // end save class and group each sequence
        payload.program_sequences.forEach((sequence, seqIndex) => {
          this.addEmptySequenceFormArray();
          this.sequencesDisabled.push(false);
          if (sequence && sequence._id) {
            sequence.program_sequence_id = sequence._id;
          }
          if (sequence && sequence.template_sequence_id && sequence.template_sequence_id._id) {
            sequence.template_sequence_id = sequence.template_sequence_id._id;
          }
          if (sequence && sequence.start_date && sequence.start_date.date) {
            sequence.start_date.date = this.parseToLocal.transformDateToJavascriptDate(sequence.start_date.date, sequence.start_date.time);
            sequence.start_date.time = sequence.start_date.time;
          }
          if (sequence && sequence.end_date && sequence.end_date.date) {
            sequence.end_date.date = this.parseToLocal.transformDateToJavascriptDate(sequence.end_date.date, sequence.end_date.time);
            sequence.end_date.time = sequence.end_date.time;
          }
          // let classGroup = [];
          // if (sequence.program_sequence_groups && sequence.program_sequence_groups.length && sequence.program_sequence_groups[0]) {
          //   classGroup.push({ name: 'Class', value: sequence.program_sequence_groups[0].number_of_class });
          //   if (sequence.program_sequence_groups[0].group_class_types && sequence.program_sequence_groups[0].group_class_types.length) {
          //     sequence.program_sequence_groups[0].group_class_types.forEach((grouptype) => {
          //       classGroup.push({
          //         name: grouptype.name,
          //         value: grouptype.group_classes_id && grouptype.group_classes_id.length ? grouptype.group_classes_id.length : 0,
          //       });
          //     });
          //   }
          //   this.classGroupList.push(classGroup);
          // }
          // console.log('class group', this.classGroupList);
          if (sequence.program_modules_id && sequence.program_modules_id.length) {
            sequence.program_modules = sequence.program_modules_id;
            sequence.program_modules.forEach((module, modIndex) => {
              this.addEmptyModuleFormArray(seqIndex);
              this.mnodulesDisabled.push(false);
              if (module && module._id) {
                module.program_module_id = module._id;
              }
              if (module && module.template_module_id && module.template_module_id._id) {
                module.template_module_id = module.template_module_id._id;
              }
              if (module.program_subjects_id && module.program_subjects_id.length) {
                module.program_subjects = module.program_subjects_id;
                module.program_subjects.forEach((subject, subIndex) => {
                  this.addEmptySubjectFormArray(seqIndex, modIndex);
                  this.subjectsDisabled.push(false);
                  if (subject && subject._id) {
                    subject.program_subject_id = subject._id;
                  }
                  if (
                    subject &&
                    subject.template_subject_id &&
                    subject.template_subject_id.subject_id &&
                    subject.template_subject_id.subject_id._id
                  ) {
                    subject.subject_id = subject.template_subject_id.subject_id._id;
                  }
                  if (subject && subject.template_subject_id && subject.template_subject_id.volume_student_total) {
                    subject.volume_student_total_template = subject.template_subject_id.volume_student_total;
                  } else {
                    subject.volume_student_total_template = '';
                  }
                  if (subject && subject.template_subject_id && subject.template_subject_id._id) {
                    subject.template_subject_id = subject.template_subject_id._id;
                  }
                  if (subject && subject.note) {
                    subject.note = this.utilitySevice.cleanHTML(subject.note);
                  }
                  if (subject && subject.academic_objective) {
                    subject.academic_objective = this.utilitySevice.cleanHTML(subject.academic_objective);
                  }
                  if (subject.program_sessions_id && subject.program_sessions_id.length) {
                    // if (subject && subject.volume_student_total >= 0) {
                    //   subject.volume_student_total = this.reCalculateVolumeHoursStudentPatch(
                    //     seqIndex,
                    //     modIndex,
                    //     subIndex,
                    //     subject.program_sessions_type,
                    //   );
                    // }
                    subject.program_sessions_type = subject.program_sessions_id;
                    subject.program_sessions_type.forEach((session, sesIndex) => {
                      this.addEmptySessionFormArray(seqIndex, modIndex, subIndex);
                      if (session && session._id) {
                        session.program_session_type_id = session._id;
                      }
                      if (session && session.template_session_type && session.template_session_type._id) {
                        session.template_session_type = session.template_session_type._id;
                      }
                      if (session && session.is_teacher_assigned) {
                        this.getSessionArray(seqIndex, modIndex, subIndex).at(sesIndex).disable();
                        this.disableControlSubject(seqIndex, modIndex, subIndex);
                        this.disableControlModule(seqIndex, modIndex);
                        this.disableControlSequence(seqIndex);

                        this.disableSequences.push(sequence._id);
                        this.disableModules.push(module._id);
                        this.disableSubjects.push(subject._id);
                        this.disableSessions.push(session._id);

                        this.disableSequences = _.uniqBy(this.disableSequences);
                        this.disableModules = _.uniqBy(this.disableModules);
                        this.disableSubjects = _.uniqBy(this.disableSubjects);
                        this.disableSessions = _.uniqBy(this.disableSessions);
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
      this.initialData = this.templateForm.getRawValue();
      if (this.sequenceFormArray && this.sequenceFormArray.length) {
        const sequences = this.sequenceFormArray.getRawValue();
        sequences.forEach((sequence, index) => {
          if (sequence.start_date && sequence.start_date.date && sequence.end_date && sequence.end_date.date) {
            this.changeDate(index, 'fetch');
          }
        });
      }
    }
  }

  disableControlSequence(seqIndex) {
    this.sequenceFormArray.controls[seqIndex].get('name').disable();
    this.sequenceFormArray.controls[seqIndex].get('description').disable();
    this.sequenceFormArray.controls[seqIndex].get('start_date').disable();
    this.sequenceFormArray.controls[seqIndex].get('end_date').disable();
    this.sequenceFormArray.controls[seqIndex].get('type_of_sequence').disable();
  }

  disableControlModule(seqIndex, modIndex) {
    this.getModuleArray(seqIndex).at(modIndex).get('name').disable();
    this.getModuleArray(seqIndex).at(modIndex).get('ects').disable();
  }

  disableControlSubject(seqIndex, modIndex, subIndex) {
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('name').disable();
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('ects').disable();
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_student_total').disable();
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_student_total_template').disable();
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_hours_total').disable();
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('academic_objective').disable();
    this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('note').disable();
  }

  async leaveForm() {
    const firstForm = JSON.stringify(this.initialData);
    const form = JSON.stringify(this.templateForm.getRawValue());
    if (firstForm !== form) {
      const result = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      if (!result.value) {
        if (this.isTemplateBuilder) {
          this.router.navigate(['template-sequences']);
        } else {
          const url = '/schools/school-detail';
          this.router.navigate([url + '/' + this.schoolId]);
        }
      }
    } else {
      if (this.isTemplateBuilder) {
        this.router.navigate(['template-sequences']);
      } else {
        const url = '/schools/school-detail';
        this.router.navigate([url + '/' + this.schoolId]);
      }
    }
  }

  get previewData() {
    if (this.isTemplateBuilder) {
      return {
        name: this.templateForm.get('name').value,
        description: this.templateForm.get('description').value,
        isTemplateBuilder: true,
        sequences: this.templateForm
          .get('sequences')
          .value.map(({ name, description, start_date, end_date, type_of_sequence }, seqIdx: number) => ({
            name,
            description,
            start_date:
              start_date.date && start_date.date instanceof Date ? moment(start_date.date).format('- DD/MM/YYYY') : start_date.date,
            end_date: end_date.date && end_date.date instanceof Date ? moment(end_date.date).format('- DD/MM/YYYY') : end_date.date,
            type_of_sequence: type_of_sequence ? `- ${this.translate.instant('course_sequence.' + type_of_sequence)}` : '',
            modules: this.getModuleArray(seqIdx).value.map(({ name, ects }, modIdx) => ({
              name,
              ects,
              subjects: this.getSubjectArray(seqIdx, modIdx).value.map(({ name, volume_student_total, volume_hours_total, ects }) => ({
                name,
                volume_student_total_template: volume_student_total,
                volume_hours_total,
                ects,
              })),
            })),
          })),
      };
    } else {
      return {
        name: this.templateForm.getRawValue().name,
        description: this.templateForm.getRawValue().description,
        isTemplateBuilder: false,
        sequences: this.templateForm
          .getRawValue()
          .program_sequences.map(({ name, description, start_date, end_date, type_of_sequence }, seqIdx: number) => ({
            name,
            description,
            start_date:
              start_date.date && start_date.date instanceof Date ? moment(start_date.date).format('- DD/MM/YYYY') : start_date.date,
            end_date: end_date.date && end_date.date instanceof Date ? moment(end_date.date).format('- DD/MM/YYYY') : end_date.date,
            type_of_sequence: type_of_sequence ? `- ${this.translate.instant('course_sequence.' + type_of_sequence)}` : '',
            modules: this.getModuleArray(seqIdx)
              .getRawValue()
              .map(({ name, ects }, modIdx) => ({
                name,
                ects,
                subjects: this.getSubjectArray(seqIdx, modIdx)
                  .getRawValue()
                  .map(({ name, volume_student_total, volume_hours_total, ects, volume_student_total_template }) => ({
                    name,
                    volume_student_total,
                    volume_hours_total,
                    ects,
                    volume_student_total_template,
                  })),
              })),
          })),
      };
    }
  }

  calculateVolumeHoursStudent(seqIndex, modIndex, subIndex, sesIndex) {
    const data = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
    if (data && data.length) {
      const session = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue()[sesIndex].name;
      const duration = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue()[sesIndex].duration;
      if (session >= 0 && session && parseInt(session.toString(), 10) >= 0) {
        const total = parseInt(session.toString(), 10) * (duration / 60);
        this.getSessionArray(seqIndex, modIndex, subIndex)
          .at(sesIndex)
          .get('volume_hours_student')
          .setValue(parseFloat(total.toFixed(2)));
        this.calculateVolumeHours(seqIndex, modIndex, subIndex, sesIndex);
      }
      const sessionList = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
      if (sessionList && sessionList.length) {
        let totalSession = 0;
        sessionList.forEach((type, index) => {
          totalSession = totalSession + type.volume_hours_student;
        });
        this.getSubjectArray(seqIndex, modIndex)
          .at(subIndex)
          .get('volume_student_total')
          .setValue(parseFloat(totalSession.toFixed(2)));
      } else {
        this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_student_total').setValue(0);
      }
    } else {
      this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_student_total').setValue(0);
    }
  }

  reCalculateVolumeHoursStudent(seqIndex, modIndex, subIndex) {
    const data = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
    if (data && data.length) {
      const sessionList = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
      if (sessionList && sessionList.length) {
        let totalSession = 0;
        sessionList.forEach((type, index) => {
          totalSession = totalSession + type.volume_hours_student;
        });
        this.getSubjectArray(seqIndex, modIndex)
          .at(subIndex)
          .get('volume_student_total')
          .setValue(parseFloat(totalSession.toFixed(2)));
      } else {
        this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_student_total').setValue(0);
      }

      if (sessionList && sessionList.length) {
        let totalSession = 0;
        sessionList.forEach((type, index) => {
          totalSession = totalSession + parseFloat(type.volume_hours);
        });
        this.getSubjectArray(seqIndex, modIndex)
          .at(subIndex)
          .get('volume_hours_total')
          .setValue(parseFloat(totalSession.toFixed(2)));
      } else {
        this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_hours_total').setValue(0);
      }
    } else {
      this.getSubjectArray(seqIndex, modIndex).at(subIndex).get('volume_student_total').setValue(0);
    }
  }

  reCalculateVolumeHoursStudentPatch(seqIndex, modIndex, subIndex, session) {
    const data = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
    if (data && data.length) {
      const sessionList = session;
      if (sessionList && sessionList.length) {
        let totalSession = 0;
        sessionList.forEach((type, index) => {
          totalSession = totalSession + type.volume_hours_student;
        });
        return parseFloat(totalSession.toFixed(2));
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  calculateVolumeHours(seqIndex, modIndex, subIndex, sesIndex) {
    const volume_hours_student = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue()[sesIndex].volume_hours_student;
    let class_group = 0;
    let findName = null;
    if (
      this.classGroupList &&
      this.classGroupList.length &&
      this.classGroupList[seqIndex].program_sequence_groups &&
      this.classGroupList[seqIndex].program_sequence_groups.length
    ) {
      findName = this.classGroupList[seqIndex].program_sequence_groups.find(
        (value) => this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue()[sesIndex].class_group === value.name,
      );
    }
    if (findName) {
      class_group = findName.value;
    }
    if (volume_hours_student >= 0 && parseInt(class_group.toString(), 10) >= 0) {
      const total = volume_hours_student * parseInt(class_group.toString(), 10);
      if (this.isTemplateBuilder) {
        this.getSessionArray(seqIndex, modIndex, subIndex)
          .at(sesIndex)
          .get('volume_hours')
          .setValue(parseFloat(total.toFixed(2)));
        const sessionList = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
        if (sessionList && sessionList.length) {
          let totalSession = 0;
          sessionList.forEach((type, index) => {
            totalSession = totalSession + parseFloat(type.volume_hour);
          });
          this.getSubjectArray(seqIndex, modIndex)
            .at(subIndex)
            .get('volume_hours_total')
            .setValue(parseFloat(totalSession.toFixed(2)));
        }
      } else {
        this.getSessionArray(seqIndex, modIndex, subIndex)
          .at(sesIndex)
          .get('volume_hours')
          .setValue(parseFloat(total.toFixed(2)));
        const sessionList = this.getSessionArray(seqIndex, modIndex, subIndex).getRawValue();
        if (sessionList && sessionList.length) {
          let totalSession = 0;
          sessionList.forEach((type, index) => {
            totalSession = totalSession + parseFloat(type.volume_hours);
          });
          this.getSubjectArray(seqIndex, modIndex)
            .at(subIndex)
            .get('volume_hours_total')
            .setValue(parseFloat(totalSession.toFixed(2)));
        }
      }
    }
  }

  async changeDate(ind, form?) {
    this.listSequenceDate = [];
    let end = this.sequenceFormArray.getRawValue()[ind].end_date.date;
    let start = this.sequenceFormArray.getRawValue()[ind].start_date.date;
    if (start && end) {
      end = end.toLocaleDateString('en-GB');
      start = start.toLocaleDateString('en-GB');
      const list = this.getDaysBetweenDates(start, end);
      if (list && list.length) {
        if (!this.listDatePerSequence[ind]) {
          this.listDatePerSequence.push(list);
        } else {
          this.listDatePerSequence[ind] = list;
        }
        this.listDatePerSequence.forEach((element) => {
          this.listSequenceDate = this.listSequenceDate.concat(element);
        });
        const lengthDate =
          this.listDatePerSequence && this.listDatePerSequence.length && this.listDatePerSequence[ind]
            ? this.listDatePerSequence[ind].length
            : 0;
        if (lengthDate) {
          const weekTotal = lengthDate / 7;
          this.sequenceFormArray.at(ind).get('number_of_week').setValue(this.roundToHalf(weekTotal));
        }
        if (form !== 'fetch') {
          const duplicateElements = await this.toFindDuplicates(this.listSequenceDate);
          if (duplicateElements && duplicateElements.length) {
            let rangeDate = '';
            let count = 0;
            for (const entity of duplicateElements) {
              count++;
              if (count > 1) {
                if (entity) {
                  rangeDate = rangeDate + ', ';
                  rangeDate = rangeDate + entity;
                }
              } else {
                if (entity) {
                  rangeDate = rangeDate + entity;
                }
              }
            }
            const sequenceDuplicateName = this.findDuplicateDateInSequence(list);
            Swal.fire({
              allowOutsideClick: false,
              type: 'info',
              title: this.translate.instant('TEMPLATE_OVERLAP_S1.Title'),
              html: this.translate.instant('TEMPLATE_OVERLAP_S1.Text', {
                sequence: sequenceDuplicateName ? sequenceDuplicateName : '',
              }),
              confirmButtonText: this.translate.instant('TEMPLATE_OVERLAP_S1.Button'),
            });
            this.sequenceFormArray.at(ind).get('start_date').get('date').setValue(null);
            this.sequenceFormArray.at(ind).get('end_date').get('date').setValue(null);
            this.listDatePerSequence.splice(ind, 1);
            this.listDatePerSequence.forEach((element) => {
              this.listSequenceDate = this.listSequenceDate.concat(element);
            });
          }
        }
      }
    }
  }

  changeDateAdd(ind, form?) {
    let isSave = null;
    this.listSequenceDate = [];
    let end = this.sequenceFormArray.getRawValue()[ind].end_date.date;
    let start = this.sequenceFormArray.getRawValue()[ind].start_date.date;
    if (start && end) {
      end = end.toLocaleDateString('en-GB');
      start = start.toLocaleDateString('en-GB');
      const list = this.getDaysBetweenDates(start, end);
      if (list && list.length) {
        if (!this.listDatePerSequence[ind]) {
          this.listDatePerSequence.push(list);
        } else {
          this.listDatePerSequence[ind] = list;
        }
        this.listDatePerSequence.forEach((element) => {
          this.listSequenceDate = this.listSequenceDate.concat(element);
        });
        const lengthDate =
          this.listDatePerSequence && this.listDatePerSequence.length && this.listDatePerSequence[ind]
            ? this.listDatePerSequence[ind].length
            : 0;
        if (lengthDate) {
          const weekTotal = lengthDate / 7;
          this.sequenceFormArray.at(ind).get('number_of_week').setValue(this.roundToHalf(weekTotal));
        }
        if (form !== 'fetch') {
          const duplicateElements = this.toFindDuplicates(this.listSequenceDate);
          if (duplicateElements && duplicateElements.length) {
            isSave = false;
            let rangeDate = '';
            let count = 0;
            for (const entity of duplicateElements) {
              count++;
              if (count > 1) {
                if (entity) {
                  rangeDate = rangeDate + ', ';
                  rangeDate = rangeDate + entity;
                }
              } else {
                if (entity) {
                  rangeDate = rangeDate + entity;
                }
              }
            }
            const sequenceDuplicateName = this.findDuplicateDateInSequence(list);
            this.sequenceFormArray.at(ind).get('start_date').get('date').setValue(null);
            this.sequenceFormArray.at(ind).get('end_date').get('date').setValue(null);
            this.listDatePerSequence.splice(ind, 1);
            this.listDatePerSequence.forEach((element) => {
              this.listSequenceDate = this.listSequenceDate.concat(element);
            });
            return sequenceDuplicateName;
          } else {
            isSave = 'success';
            return isSave;
          }
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

  findDuplicateDateInSequence(value) {
    if (this.listDatePerSequence.length && value) {
      let findSequence = false;
      let sequenceName = null;
      this.listDatePerSequence.forEach((list, index) => {
        const found = list.some((r) => value.includes(r));
        if (found && !findSequence) {
          findSequence = true;
          if (this.sequenceFormArray && this.sequenceFormArray.length) {
            sequenceName = this.sequenceFormArray.getRawValue()[index].name;
          }
        }
      });
      if (findSequence) {
        return sequenceName;
      } else {
        return;
      }
    } else {
      return;
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  onReadyNote(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  initFormBuilder() {
    if (this.isTemplateBuilder) {
      this.templateForm = this.fb.group({
        sequences: this.fb.array([]),
        is_published: [false],
        name: [null, Validators.required],
        template_course_sequence_id: [this.templateSequenceId],
        description: [null],
      });
    } else {
      this.templateForm = this.fb.group({
        program_sequences: this.fb.array([]),
        is_published: [false],
        name: [null],
        template_course_sequence_id: [this.templateSequenceId],
        program_id: [null],
        program_course_sequence_id: [null],
        description: [null],
      });
    }
  }

  initSequenceFormArray() {
    if (this.isTemplateBuilder) {
      return this.fb.group({
        template_sequence_id: [null],
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
        type_of_sequence: [null, Validators.required],
        number_of_week: [null],
        modules: this.fb.array([]),
      });
    } else {
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
        type_of_sequence: [null, Validators.required],
        number_of_week: [null],
        program_modules: this.fb.array([]),
      });
    }
  }

  initModuleFormArray() {
    if (this.isTemplateBuilder) {
      return this.fb.group({
        template_module_id: [null],
        module_id: [null],
        name: [null],
        short_name: [null],
        english_name: [null],
        ects: [null],
        subjects: this.fb.array([]),
      });
    } else {
      return this.fb.group({
        template_module_id: [null],
        program_module_id: [null],
        module_id: [null],
        name: [null],
        short_name: [null],
        english_name: [null],
        ects: [null],
        program_subjects: this.fb.array([]),
      });
    }
  }

  initSubjectFormArray() {
    if (this.isTemplateBuilder) {
      return this.fb.group({
        template_subject_id: [null],
        subject_id: [null],
        name: [null],
        short_name: [null],
        english_name: [null],
        volume_student_total: [null],
        volume_hours_total: [null],
        academic_objective: [null],
        note: [null],
        ects: [null],
        session_types: this.fb.array([]),
      });
    } else {
      return this.fb.group({
        template_subject_id: [null],
        program_subject_id: [null],
        subject_id: [null],
        name: [null],
        short_name: [null],
        english_name: [null],
        volume_student_total: [null],
        volume_student_total_template: [null],
        volume_hours_total: [null],
        academic_objective: [null],
        note: [null],
        ects: [null],
        program_sessions_type: this.fb.array([]),
      });
    }
  }

  initSessionFormArray() {
    if (this.isTemplateBuilder) {
      return this.fb.group({
        name: [null],
        volume_hours_student: [null],
        duration: [null],
        class_group: [null],
        volume_hours: [null],
        session_type_id: [null],
      });
    } else {
      return this.fb.group({
        name: [null],
        volume_hours_student: [null],
        duration: [null],
        class_group: [null],
        volume_hours: [null],
        template_session_type: [null],
        program_session_type_id: [null],
      });
    }
  }

  get sequenceFormArray(): UntypedFormArray {
    if (this.isTemplateBuilder) {
      return this.templateForm.get('sequences') as UntypedFormArray;
    } else {
      return this.templateForm.get('program_sequences') as UntypedFormArray;
    }
  }

  addEmptySequenceFormArray() {
    this.sequenceFormArray.push(this.initSequenceFormArray());
  }

  getModuleArray(seqIndex: number): UntypedFormArray {
    if (this.isTemplateBuilder) {
      return this.sequenceFormArray.at(seqIndex).get('modules') as UntypedFormArray;
    } else {
      return this.sequenceFormArray.at(seqIndex).get('program_modules') as UntypedFormArray;
    }
  }

  addEmptyModuleFormArray(seqIndex: number) {
    this.getModuleArray(seqIndex).push(this.initModuleFormArray());
  }

  getSubjectArray(seqIndex: number, modIndex: number): UntypedFormArray {
    if (this.isTemplateBuilder) {
      return this.getModuleArray(seqIndex).get(modIndex.toString()).get('subjects') as UntypedFormArray;
    } else {
      return this.getModuleArray(seqIndex).get(modIndex.toString()).get('program_subjects') as UntypedFormArray;
    }
  }

  addEmptySubjectFormArray(seqIndex: number, modIndex: number) {
    this.getSubjectArray(seqIndex, modIndex).push(this.initSubjectFormArray());
  }

  getSessionArray(seqIndex: number, modIndex: number, subIndex: number): UntypedFormArray {
    if (this.isTemplateBuilder) {
      return this.getSubjectArray(seqIndex, modIndex).get(subIndex.toString()).get('session_types') as UntypedFormArray;
    } else {
      return this.getSubjectArray(seqIndex, modIndex).get(subIndex.toString()).get('program_sessions_type') as UntypedFormArray;
    }
  }

  addEmptySessionFormArray(seqIndex: number, modIndex: number, subIndex: number) {
    this.getSessionArray(seqIndex, modIndex, subIndex).push(this.initSessionFormArray());
  }

  addSequenceFormTemplate() {
    if (this.sequenceFormArray.length === 10) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TEMPLATE_P4.TITLE'),
        text: this.translate.instant('TEMPLATE_P4.TEXT'),
        confirmButtonText: this.translate.instant('TEMPLATE_P4.BUTTON_1'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    this.subs.sink = this.dialog
      .open(AddTemplateSequenceDialogComponent, {
        width: '800px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp === 'add') {
          this.addSequence();
        } else if (resp && resp._id) {
          const payload = _.cloneDeep(resp);
          if (payload && payload._id) {
            payload.sequence_id = payload._id;
          }
          if (payload && payload.start_date && payload.start_date.date) {
            payload.start_date.date = this.parseToLocal.transformDateToJavascriptDate(payload.start_date.date, payload.start_date.time);
            payload.start_date.time = payload.start_date.time;
          }
          if (payload && payload.end_date && payload.end_date.date) {
            payload.end_date.date = this.parseToLocal.transformDateToJavascriptDate(payload.end_date.date, payload.end_date.time);
            payload.end_date.time = payload.end_date.time;
          }
          this.sequenceFormArray.push(this.initSequenceFormArray());
          this.sequencesDisabled.push(true);
          const lastIndex = this.sequenceFormArray.length - 1;
          this.sequenceFormArray.at(lastIndex).patchValue(payload);
          // const isSave = this.changeDateAdd(lastIndex);
          // if (isSave) {
          this.saveSequenceForm();
          // }
          setTimeout(() => {
            if (this.sequencePanel && this.sequencePanel.last && this.sequencePanel.length) {
              console.log(this.sequencePanel.toArray());
              console.log(this.sequencePanel.toArray()[this.sequencePanel.length - 1]);
              this.sequencePanel.toArray()[this.sequencePanel.length - 1].nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      });
  }

  addSequence() {
    this.subs.sink = this.dialog
      .open(AddSequenceDialogComponent, {
        width: '1000px',
        minHeight: '100px',
        disableClose: true,
        data: {
          type: 'add',
          from: 'form',
          isTemplateBuilder: this.isTemplateBuilder,
          sequenceId: this.isTemplateBuilder
            ? this.templateForm.getRawValue().template_course_sequence_id
            : this.templateForm.getRawValue().program_course_sequence_id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && resp._id) {
          const payload = _.cloneDeep(resp);
          if (payload && payload._id) {
            payload.sequence_id = payload._id;
          }
          if (payload && payload.start_date && payload.start_date.date) {
            payload.start_date.date = this.parseToLocal.transformDateToJavascriptDate(payload.start_date.date, payload.start_date.time);
            payload.start_date.time = payload.start_date.time;
          }
          if (payload && payload.end_date && payload.end_date.date) {
            payload.end_date.date = this.parseToLocal.transformDateToJavascriptDate(payload.end_date.date, payload.end_date.time);
            payload.end_date.time = payload.end_date.time;
          }
          this.sequenceFormArray.push(this.initSequenceFormArray());
          this.sequencesDisabled.push(true);
          const lastIndex = this.sequenceFormArray.length - 1;
          this.sequenceFormArray.at(lastIndex).patchValue(payload);
          // const isSave = this.changeDateAdd(lastIndex);
          // if (isSave) {
          this.saveSequenceForm();
          // }
          setTimeout(() => {
            if (this.sequencePanel && this.sequencePanel.last && this.sequencePanel.length) {
              console.log(this.sequencePanel.toArray());
              console.log(this.sequencePanel.toArray()[this.sequencePanel.length - 1]);
              this.sequencePanel.toArray()[this.sequencePanel.length - 1].nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      });
  }

  addModuleFormTemplate(seqIndex: number) {
    this.subs.sink = this.dialog
      .open(AddTemplateModuleDialogComponent, {
        width: '800px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          if (resp === 'add') {
            this.addModule(seqIndex);
          } else if (resp && resp._id) {
            const payload = _.cloneDeep(resp);
            if (payload && payload._id) {
              payload.module_id = payload._id;
            }
            this.getModuleArray(seqIndex).push(this.initModuleFormArray());
            this.mnodulesDisabled.push(true);
            const lastIndex = this.getModuleArray(seqIndex).getRawValue().length - 1;
            this.getModuleArray(seqIndex).at(lastIndex).patchValue(payload);
            this.openModulePanel(lastIndex);
            setTimeout(() => {
              if (this.modulePanel && this.modulePanel.last && this.modulePanel.length) {
                let indexModule;
                this.modulePanel.toArray().forEach((module, i) => {
                  if (module.nativeElement.innerText === resp.name.trim()) {
                    indexModule = i;
                  } else {
                    indexModule = this.modulePanel.length - 1;
                  }
                });
                this.modulePanel.toArray()[indexModule].nativeElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 500);
          }
        }
      });
  }

  addModule(seqIndex: number) {
    this.subs.sink = this.dialog
      .open(AddModuleDialogComponent, {
        width: '800px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        data: {
          type: 'add',
          data: 'form',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && resp._id) {
          const payload = _.cloneDeep(resp);
          if (payload && payload._id) {
            payload.module_id = payload._id;
          }
          this.getModuleArray(seqIndex).push(this.initModuleFormArray());
          this.mnodulesDisabled.push(true);
          const lastIndex = this.getModuleArray(seqIndex).getRawValue().length - 1;
          this.getModuleArray(seqIndex).at(lastIndex).patchValue(payload);
          this.openModulePanel(lastIndex);
          setTimeout(() => {
            if (this.modulePanel && this.modulePanel.last && this.modulePanel.length) {
              let indexModule;
              this.modulePanel.toArray().forEach((module, i) => {
                if (module.nativeElement.innerText === resp.name.trim()) {
                  indexModule = i;
                } else {
                  indexModule = this.modulePanel.length - 1;
                }
              });
              this.modulePanel.toArray()[indexModule].nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      });
  }

  addSubjectFormTemplate(seqIndex: number, modIndex: number) {
    this.subs.sink = this.dialog
      .open(AddTemplateSubjectDialogComponent, {
        width: '800px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          if (resp === 'add') {
            this.addSubject(seqIndex, modIndex);
          } else if (resp && resp._id) {
            const payload = _.cloneDeep(resp);
            if (payload && payload._id) {
              payload.subject_id = payload._id;
            }
            this.getSubjectArray(seqIndex, modIndex).push(this.initSubjectFormArray());
            this.subjectsDisabled.push(true);
            const lastIndex = this.getSubjectArray(seqIndex, modIndex).getRawValue().length - 1;
            this.getSubjectArray(seqIndex, modIndex).at(lastIndex).patchValue(payload);
            this.openSubjectPanel(lastIndex);
            setTimeout(() => {
              if (this.subjectPanel && this.subjectPanel.last && this.subjectPanel.length) {
                let indexSubject;
                this.subjectPanel.toArray().forEach((subject, i) => {
                  if (subject.nativeElement.innerText === resp.name.trim()) {
                    indexSubject = i;
                  } else {
                    indexSubject = this.subjectPanel.length - 1;
                  }
                });
                this.subjectPanel.toArray()[indexSubject].nativeElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 500);
          }
        }
      });
  }

  addSubject(seqIndex: number, modIndex: number) {
    this.subs.sink = this.dialog
      .open(AddSubjectDialogComponent, {
        width: '800px',
        disableClose: true,
        panelClass: 'certification-rule-pop-up',
        data: {
          type: 'add',
          data: 'form',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && resp._id) {
          const payload = _.cloneDeep(resp);
          if (payload && payload._id) {
            payload.subject_id = payload._id;
          }
          this.getSubjectArray(seqIndex, modIndex).push(this.initSubjectFormArray());
          this.subjectsDisabled.push(true);
          const lastIndex = this.getSubjectArray(seqIndex, modIndex).getRawValue().length - 1;
          this.getSubjectArray(seqIndex, modIndex).at(lastIndex).patchValue(payload);
          this.openSubjectPanel(lastIndex);
          setTimeout(() => {
            if (this.subjectPanel && this.subjectPanel.last && this.subjectPanel.length) {
              let indexSubject;
              this.subjectPanel.toArray().forEach((subject, i) => {
                if (subject.nativeElement.innerText === resp.name.trim()) {
                  indexSubject = i;
                } else {
                  indexSubject = this.subjectPanel.length - 1;
                }
              });
              this.subjectPanel.toArray()[indexSubject].nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      });
  }

  removeSequenceFormArray(seqIndex: number) {
    let timeDisabled = 5;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('SEQUENCE_RS1.TITLE'),
      text: this.translate.instant('SEQUENCE_RS1.TEXT'),
      confirmButtonText: this.translate.instant('SEQUENCE_RS1.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('SEQUENCE_RS1.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SEQUENCE_RS1.BUTTON_1') + `(${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SEQUENCE_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.sequenceFormArray.removeAt(seqIndex);
        this.sequencesDisabled.splice(seqIndex, 1);
        this.listDatePerSequence.splice(seqIndex, 1);
        Swal.fire({
          allowOutsideClick: false,
          type: 'success',
          title: this.translate.instant('SEQUENCE_RS2.TITLE'),
          text: this.translate.instant('SEQUENCE_RS2.TEXT'),
          confirmButtonText: this.translate.instant('SEQUENCE_RS2.BUTTON_1'),
        });
      }
    });
  }

  removeModuleFormArray(seqIndex: number, modIndex: number) {
    let timeDisabled = 5;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('MODULE_RS1.TITLE'),
      text: this.translate.instant('MODULE_RS1.TEXT'),
      confirmButtonText: this.translate.instant('MODULE_RS1.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('MODULE_RS1.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('MODULE_RS1.BUTTON_1') + `(${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('MODULE_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.getModuleArray(seqIndex).removeAt(modIndex);
        this.mnodulesDisabled.splice(modIndex, 1);
        Swal.fire({
          allowOutsideClick: false,
          type: 'success',
          title: this.translate.instant('MODULE_RS2.TITLE'),
          text: this.translate.instant('MODULE_RS2.TEXT'),
          confirmButtonText: this.translate.instant('MODULE_RS2.BUTTON_1'),
        });
      }
    });
  }

  removeSubjectFormArray(seqIndex: number, modIndex: number, subIndex: number) {
    let timeDisabled = 5;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('SUBJECT_RS1.TITLE'),
      text: this.translate.instant('SUBJECT_RS1.TEXT'),
      confirmButtonText: this.translate.instant('SUBJECT_RS1.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('SUBJECT_RS1.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SUBJECT_RS1.BUTTON_1') + `(${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SUBJECT_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.getSubjectArray(seqIndex, modIndex).removeAt(subIndex);
        this.subjectsDisabled.splice(modIndex, 1);
        Swal.fire({
          allowOutsideClick: false,
          type: 'success',
          title: this.translate.instant('SUBJECT_RS2.TITLE'),
          text: this.translate.instant('SUBJECT_RS2.TEXT'),
          confirmButtonText: this.translate.instant('SUBJECT_RS2.BUTTON_1'),
        });
      }
    });
  }

  removeSessionFormArray(seqIndex: number, modIndex: number, subIndex: number, sesIndex: number) {
    let timeDisabled = 5;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('SESSION_RS1.TITLE'),
      text: this.translate.instant('SESSION_RS1.TEXT'),
      confirmButtonText: this.translate.instant('SESSION_RS1.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('SESSION_RS1.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SESSION_RS1.BUTTON_1') + `(${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SESSION_RS1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.getSessionArray(seqIndex, modIndex, subIndex).removeAt(sesIndex);
        this.reCalculateVolumeHoursStudent(seqIndex, modIndex, subIndex);
        Swal.fire({
          allowOutsideClick: false,
          type: 'success',
          title: this.translate.instant('SESSION_RS2.TITLE'),
          text: this.translate.instant('SESSION_RS2.TEXT'),
          confirmButtonText: this.translate.instant('SESSION_RS2.BUTTON_1'),
        });
      }
    });
  }

  dropSequence(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.sequencesList = event.container.data;
      moveItemInArray(this.sequencesList, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, this.sequencesList, event.previousIndex, event.currentIndex);
    }
  }

  dropModule(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.modulesList = event.container.data;
      moveItemInArray(this.modulesList, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, this.modulesList, event.previousIndex, event.currentIndex);
    }
  }

  dropSubject(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.subjectList = event.container.data;
      moveItemInArray(this.subjectList, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, this.subjectList, event.previousIndex, event.currentIndex);
    }
  }

  closeSequencePanel(index: number) {
    if (typeof index === 'number' && index >= 0) {
      this.sequencesDisabled[index] = false;
      const modules = this.getModuleArray(index).getRawValue();
      if (modules && modules.length) {
        modules.forEach((module, modIndex) => {
          this.closeModulePanel(modIndex, index);
        });
      }
    }
  }

  openSequencePanel(index: number) {
    if (typeof index === 'number' && index >= 0) {
      this.sequencesDisabled[index] = true;
    }
  }

  closeModulePanel(index: number, seqIdx) {
    if (typeof index === 'number' && index >= 0) {
      this.mnodulesDisabled[index] = false;
      if (typeof seqIdx === 'number' && seqIdx >= 0) {
        const subjects = this.getSubjectArray(seqIdx, index).getRawValue();
        if (subjects && subjects.length) {
          subjects.forEach((subject, subIdx) => {
            this.closeSubjectPanel(subIdx);
          });
        }
      }
    }
  }

  openModulePanel(index: number) {
    if (typeof index === 'number' && index >= 0) {
      this.mnodulesDisabled[index] = true;
    }
  }

  closeSubjectPanel(index: number) {
    if (typeof index === 'number' && index >= 0) {
      this.subjectsDisabled[index] = false;
    }
  }

  openSubjectPanel(index: number) {
    if (typeof index === 'number' && index >= 0) {
      this.subjectsDisabled[index] = true;
    }
  }

  saveForm(publish?) {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    const payload = _.cloneDeep(this.templateForm.getRawValue());
    if (!this.isTemplateBuilder) {
      delete payload.name;
      delete payload.description;
    }
    const final = this.generatePayload(payload);

    if (this.isTemplateBuilder) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.courseSequenceService.CreateUpdateTemplateCourseAndSequence(final).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initialData = this.templateForm.getRawValue();
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['template-sequences/form-detail/' + resp._id]);
            });
          });
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Template already connected to program') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_P3.TITLE'),
              text: this.translate.instant('TEMPLATE_P3.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_P3.BUTTON_1'),
            });
            if (publish === 'publish') {
              this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
            } else {
              this.templateForm.get('is_published').patchValue(true, { emitEvent: false });
            }
          } else if (err['message'] === 'GraphQL error: Template is already publish') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_CONNECT_S1.TITLE'),
              text: this.translate.instant('TEMPLATE_CONNECT_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_CONNECT_S1.BUTTON_1'),
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
    } else {
      this.isWaitingForResponse = true;
      this.subs.sink = this.courseSequenceService.CreateUpdateProgramCourseAndSequence(final).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initialData = this.templateForm.getRawValue();
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((confirm) => {
            if (confirm.value) {
              setTimeout(() => this.reloadData.emit(true), 100);
            }
          });
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Template already connected to program') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_P3.TITLE'),
              text: this.translate.instant('TEMPLATE_P3.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_P3.BUTTON_1'),
            });
            if (publish === 'publish') {
              this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
            } else {
              this.templateForm.get('is_published').patchValue(true, { emitEvent: false });
            }
          } else if (err['message'] === 'GraphQL error: Template is already publish') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_CONNECT_S1.TITLE'),
              text: this.translate.instant('TEMPLATE_CONNECT_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_CONNECT_S1.BUTTON_1'),
            });
          } else if (err['message'] === 'GraphQL error: cannot update if session in teacher subject table already have assigned teacher') {
            Swal.fire({
              title: this.translate.instant('Course_and_Sequences_S1.TITLE'),
              text: this.translate.instant('Course_and_Sequences_S1.TEXT'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Course_and_Sequences_S1.BUTTON'),
            }).then(() => {
              if (this.templateSequenceId) {
                if (this.isTemplateBuilder) {
                  this.getDataTemplateSequence();
                } else {
                  this.getDataProgramSequence();
                }
              }
            });
          } else if (err && err['message'] && err['message'].includes('some sequences already assigned to students')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('StudTable_S6.Title'),
              html: this.translate.instant('StudTable_S6.Text'),
              confirmButtonText: this.translate.instant('StudTable_S6.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
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
  }

  saveSequenceForm(publish?) {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    const payload = _.cloneDeep(this.templateForm.getRawValue());
    if (!this.isTemplateBuilder) {
      delete payload.name;
      delete payload.description;
    }
    const final = this.generatePayload(payload);

    if (this.isTemplateBuilder) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.courseSequenceService.CreateUpdateTemplateCourseAndSequence(final).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initialData = this.templateForm.value;
          // if (publish === 'success') {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['template-sequences/form-detail/' + resp._id]);
            });
          });
          // } else {
          //   Swal.fire({
          //     allowOutsideClick: false,
          //     type: 'info',
          //     title: this.translate.instant('TEMPLATE_OVERLAP_S1.Title'),
          //     html: this.translate.instant('TEMPLATE_OVERLAP_S1.Text', {
          //       sequence: publish ? publish : '',
          //     }),
          //     confirmButtonText: this.translate.instant('TEMPLATE_OVERLAP_S1.Button'),
          //   }).then(() => {
          //     this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          //       this.router.navigate(['template-sequences/form-detail/' + resp._id]);
          //     });
          //   });
          // }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Template already connected to program') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_P3.TITLE'),
              text: this.translate.instant('TEMPLATE_P3.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_P3.BUTTON_1'),
            });
          } else if (err['message'] === 'GraphQL error: Template is already publish') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_CONNECT_S1.TITLE'),
              text: this.translate.instant('TEMPLATE_CONNECT_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_CONNECT_S1.BUTTON_1'),
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
    } else {
      this.isWaitingForResponse = true;
      this.subs.sink = this.courseSequenceService.CreateUpdateProgramCourseAndSequence(final).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initialData = this.templateForm.getRawValue();
          // if (publish === 'success') {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            setTimeout(() => this.reloadData.emit(true), 100);
          });
          // } else {
          //   Swal.fire({
          //     allowOutsideClick: false,
          //     type: 'info',
          //     title: this.translate.instant('TEMPLATE_OVERLAP_S1.Title'),
          //     html: this.translate.instant('TEMPLATE_OVERLAP_S1.Text', {
          //       sequence: publish ? publish : '',
          //     }),
          //     confirmButtonText: this.translate.instant('TEMPLATE_OVERLAP_S1.Button'),
          //   }).then(() => {
          //     setTimeout(() => this.reloadData.emit(true), 100);
          //   });
          // }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: Template already connected to program') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_P3.TITLE'),
              text: this.translate.instant('TEMPLATE_P3.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_P3.BUTTON_1'),
            });
            if (publish === 'publish') {
              this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
            } else {
              this.templateForm.get('is_published').patchValue(true, { emitEvent: false });
            }
          } else if (err['message'] === 'GraphQL error: Template is already publish') {
            Swal.fire({
              title: this.translate.instant('TEMPLATE_CONNECT_S1.TITLE'),
              text: this.translate.instant('TEMPLATE_CONNECT_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('TEMPLATE_CONNECT_S1.BUTTON_1'),
            });
            if (publish === 'publish') {
              this.templateForm.get('is_published').patchValue(false, { emitEvent: false });
            } else {
              this.templateForm.get('is_published').patchValue(true, { emitEvent: false });
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
  }

  generatePayload(payload) {
    if (this.isTemplateBuilder) {
      for (const sequence of payload.sequences) {
        if (sequence && sequence.start_date && sequence.start_date.date) {
          sequence.start_date = {
            date: this.parseLocalToUtc.transformDate(sequence.start_date.date.toLocaleDateString('en-GB'), '15:59'),
            time: '15:59',
          };
        }
        if (sequence && sequence.end_date && sequence.end_date.date) {
          sequence.end_date = {
            date: this.parseLocalToUtc.transformDate(sequence.end_date.date.toLocaleDateString('en-GB'), '15:59'),
            time: '15:59',
          };
        }
        if (sequence.modules && sequence.modules.length) {
          sequence.modules.forEach((module) => {
            if (module.subjects && module.subjects.length) {
              module.subjects.forEach((subject) => {
                if (subject.session_types && subject.session_types.length) {
                  subject.session_types.forEach((session) => {
                    if (session && session.name) {
                      session.name = session.name.toString();
                    }
                  });
                }
              });
            }
          });
        }
      }
    } else {
      for (const sequence of payload.program_sequences) {
        if (sequence && sequence.start_date && sequence.start_date.date) {
          sequence.start_date = {
            date: this.parseLocalToUtc.transformDate(sequence.start_date.date.toLocaleDateString('en-GB'), '15:59'),
            time: '15:59',
          };
        }
        if (sequence && sequence.end_date && sequence.end_date.date) {
          sequence.end_date = {
            date: this.parseLocalToUtc.transformDate(sequence.end_date.date.toLocaleDateString('en-GB'), '15:59'),
            time: '15:59',
          };
        }
        if (sequence.program_modules && sequence.program_modules.length) {
          sequence.program_modules.forEach((module) => {
            if (module.program_subjects && module.program_subjects.length) {
              module.program_subjects.forEach((subject) => {
                if (subject.program_sessions_type && subject.program_sessions_type.length) {
                  subject.program_sessions_type.forEach((session) => {
                    if (session && session.name) {
                      session.name = session.name.toString();
                    }
                  });
                }
                delete subject.volume_student_total_template;
              });
            }
          });
        }
      }
    }
    return payload;
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

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }

  createGroupClass(data, ind) {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    if (this.dataTemplate && ind >= 0) {
      if (this.dataTemplate.program_sequences_id && this.dataTemplate.program_sequences_id.length) {
        if (
          this.dataTemplate.program_sequences_id[ind] &&
          this.dataTemplate.program_sequences_id[ind].program_sequence_groups &&
          this.dataTemplate.program_sequences_id[ind].program_sequence_groups.length
        ) {
          this.getTabGroup.emit(data.program_sequence_id);
          return;
        }
      }
    }
    const payload = {
      name: data.name,
      program_sequence_id: data.program_sequence_id,
      number_of_class: 0,
      number_of_student_each_class: 0,
      student_classes: [],
      group_class_types: [],
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.CreateProgramSequenceGroup(payload, data.program_sequence_id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          // setTimeout(() => this.reloadData.emit(true), 100);
          if (this.templateSequenceId) {
            if (this.isTemplateBuilder) {
              this.getDataTemplateSequence();
            } else {
              if (data && data.program_sequence_id) {
                this.newTabGroup.emit(data.program_sequence_id);
              }
              this.getDataProgramSequence();
            }
          }
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Program sequence group name already exist') {
          Swal.fire({
            title: this.translate.instant('Uniquename_S1.TITLE'),
            text: this.translate.instant('Uniquename_S1.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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

  getAutomaticHeight() {
    if (this.isTemplateBuilder) {
      this.myInnerHeight = window.innerHeight - 170;
    } else {
      this.myInnerHeight = window.innerHeight - 200;
    }
    return this.myInnerHeight;
  }

  sequenceDisable(id) {
    let disable = this.disableSequences.find((seq) => seq === id);
    return disable ? false : true;
  }
  moduleDisable(id) {
    let disable = this.disableModules.find((mod) => mod === id);
    return disable ? false : true;
  }
  subjectDisable(id) {
    let disable = this.disableSubjects.find((sub) => sub === id);
    return disable ? false : true;
  }
  sessionDisable(id) {
    let disable = this.disableSessions.find((ses) => ses === id);
    return disable ? false : true;
  }
}
