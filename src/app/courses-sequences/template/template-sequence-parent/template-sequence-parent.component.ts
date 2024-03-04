import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'ms-template-sequence-parent',
  templateUrl: './template-sequence-parent.component.html',
  styleUrls: ['./template-sequence-parent.component.scss'],
})
export class TemplateSequenceParentComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  templateForm: UntypedFormGroup;
  isWaitingForResponse = false;

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private courseSequence: CourseSequenceService,
  ) {}

  ngOnInit() {
    this.initFormBuilder();
  }

  initFormBuilder() {
    this.templateForm = this.fb.group({
      sequences: this.fb.array([]),
      is_published: [false],
      _id: [null],
    });
  }

  initSequenceFormArray() {
    return this.fb.group({
      sequence_id: [null],
      template_name: [null],
      description: [null],
      start_date: this.fb.group({
        date: [null],
        time: [null],
      }),
      end_date: this.fb.group({
        date: [null],
        time: [null],
      }),
      type_of_sequence: [null],
      number_of_week: [null],
      modules: this.fb.array([]),
    });
  }

  initModuleFormArray() {
    return this.fb.group({
      module_id: [null],
      module_name: [null],
      ects: [null],
      subjects: this.fb.array([]),
    });
  }

  initSubjectFormArray() {
    return this.fb.group({
      subject_id: [null],
      volume_student_total: [null],
      volume_hours_total: [null],
      academic_objective: [null],
      note: [null],
      ects: [null],
      session_types: this.fb.array([]),
    });
  }

  initSessionFormArray() {
    return this.fb.group({
      name: [null],
      volume_hours_student: [null],
      duration: [null],
      class_group: [null],
      volume_hour: [null],
    });
  }

  get sequenceFormArray(): UntypedFormArray {
    return this.templateForm.get('sequences') as UntypedFormArray;
  }

  addEmptySequenceFormArray() {
    this.sequenceFormArray.push(this.initSequenceFormArray());
  }

  getModuleArray(seqIndex: number): UntypedFormArray {
    return this.sequenceFormArray.at(seqIndex).get('modules') as UntypedFormArray;
  }

  addEmptyModuleFormArray(seqIndex: number) {
    this.getModuleArray(seqIndex).push(this.initModuleFormArray());
  }

  getSubjectArray(seqIndex: number, modIndex: number): UntypedFormArray {
    return this.getModuleArray(seqIndex).get(modIndex.toString()).get('subjects') as UntypedFormArray;
  }

  addEmptySubjectFormArray(seqIndex: number, modIndex: number) {
    this.getSubjectArray(seqIndex, modIndex).push(this.initSubjectFormArray());
  }

  getSessionArray(seqIndex: number, modIndex: number, subIndex: number): UntypedFormArray {
    return this.getSubjectArray(seqIndex, modIndex).get(subIndex.toString()).get('session_types') as UntypedFormArray;
  }

  addEmptySessionFormArray(seqIndex: number, modIndex: number, subIndex: number) {
    this.getSessionArray(seqIndex, modIndex, subIndex).push(this.initSessionFormArray());
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
