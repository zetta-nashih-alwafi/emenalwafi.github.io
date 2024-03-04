import { cloneDeep } from 'lodash';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnDestroy, OnInit, Input, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PermissionService } from 'app/service/permission/permission.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-grouping-students-class-sequence',
  templateUrl: './grouping-students-class-sequence.component.html',
  styleUrls: ['./grouping-students-class-sequence.component.scss'],
})
export class GroupingStudentsClassSequenceComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  @Input() programCourseSequenceId;
  @Input() sequenceIndex;
  @Input() groupIndex;
  @Input() groupType;
  @Input() groupClasses;
  @Output() reload: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  programSequenceId = null;
  dataSource = new MatTableDataSource([]);
  displayedColumns = ['class'];
  totalGroup = 0;
  form: UntypedFormGroup;
  selectedForm: UntypedFormGroup;
  groupOptionList = [];
  isWaitingForResponse = false;
  private timeOutVal: any;
  initialForm;
  dataCount;
  page: number = 0;

  constructor(
    private translate: TranslateService,
    public permissionService: PermissionService,
    private fb: UntypedFormBuilder,
    private courseSequenceService: CourseSequenceService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.initTableForm();
    this.getClassTable();
    // this.changeTranslation();
  }

  initForm() {
    this.form = this.fb.group({
      group_classes: this.fb.array([]),
      program_sequence_id: [this.groupClasses._id],
      group_class_type_id: [this.groupType._id],
    });
  }
  initGroupClass() {
    return this.fb.group({
      group_class_id: [null],
      name: [null],
      student_classes_id: this.fb.array([]),
    });
  }

  get groupClassesArray() {
    return this.form.get('group_classes') as UntypedFormArray;
  }

  addGroupClasses() {
    this.groupClassesArray.push(this.initGroupClass());
  }

  getFormGroupClassArray(index): UntypedFormArray {
    return this.groupClassesArray.at(index).get('student_classes_id') as UntypedFormArray;
  }

  initFormGroup(name?) {
    const value = name ? name : '';
    return this.fb.group({
      name: [value],
      class: this.fb.array([]),
    });
  }

  initFormClass(id?, name?) {
    const value = name ? name : null;
    const valueId = id ? id : null;

    return this.fb.group({
      _id: [valueId],
      name: [value],
    });
  }

  addClass(index) {
    this.getFormGroupClassArray(index).push(this.initFormClass());
  }

  initGroups() {
    if (this.totalGroup && this.totalGroup > 0) {
      this.groupClassesArray.clear();
      for (let i = 0; i < this.totalGroup; i++) {
        this.addClassGroup();
      }
    } else {
      this.groupClassesArray.clear();
    }
  }

  initTableForm() {
    this.selectedForm = this.fb.group({
      class: this.fb.array([]),
    });
  }

  initSelectForm() {
    return this.fb.group({
      _id: [''],
      name: [''],
      group: [''],
    });
  }

  getClass(): UntypedFormArray {
    return this.selectedForm.get('class') as UntypedFormArray;
  }

  addClassGroup() {
    this.getClass().push(this.initSelectForm());
  }

  changeTranslation() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.getClass().length) {
        const value = this.getClass().value;
        value.forEach((classs, indexClass) => {
          const findGroup = this.groupOptionList.findIndex((group) => group.name === classs.group);
          if (findGroup !== -1) {
            const index = findGroup + 1;
            this.getClass()
              .at(indexClass)
              .get('group')
              .patchValue(this.translate.instant('ASSIGN_CORRECTOR_DIALOG.Group') + ` ${classs.group.slice(-1)}`);
          }
        });
      }
      if (this.groupOptionList.length) {
        const temp = this.groupOptionList.map((group, indexGroup) => {
          const index = indexGroup + 1;
          const groupName = group.value.toLowerCase().includes('group')
            ? this.translate.instant('ASSIGN_CORRECTOR_DIALOG.Group') + ' ' + group.value.slice(-1)
            : group.value;
          return { value: group.value, name: groupName };
        });
        this.groupOptionList = temp;
      }
    });
  }

  getClassTable() {
    this.reset();
    const groupList = [];
    const classList = [];
    const dataGroups = this.groupClasses.program_sequence_groups[0];
    if (dataGroups && dataGroups.student_classes && dataGroups.student_classes.length) {
      this.programSequenceId = this.groupClasses._id;
      dataGroups.student_classes.forEach((list) => {
        classList.push({ _id: list._id, name: list.name, group: null });
        this.addClassGroup();
      });
    }
    if (this.groupType && this.groupType.group_classes_id && this.groupType.group_classes_id.length) {
      this.totalGroup = this.groupType.group_classes_id.length;
      this.programSequenceId = this.groupClasses._id;
      this.groupType.group_classes_id.forEach((group, indexGroup) => {
        const index = indexGroup + 1;
        this.addGroupClasses();
        const lastIndex = this.groupClassesArray.length - 1;
        const groupName = group.name.toLowerCase().includes('group')
          ? this.translate.instant('ASSIGN_CORRECTOR_DIALOG.Group') + ' ' + group.name.slice(-1)
          : group.name;
        this.groupClassesArray.at(lastIndex).get('name').setValue(groupName);
        this.groupOptionList.push({ name: groupName, value: group.name });
        const connectClassList = [];
        if (group.student_classes_id && group.student_classes_id.length) {
          group.student_classes_id.forEach((list) => {
            this.addClass(indexGroup);
            connectClassList.push({ _id: list._id, name: list.name });
            if (classList.length) {
              const findClass = classList.findIndex((classs) => classs._id === list._id);
              if (findClass !== -1) {
                classList[findClass]['group'] = group.name;
                // classList[findClass]['group'] = group.name.toLowerCase().includes('group') ? this.translate.instant('ASSIGN_CORRECTOR_DIALOG.Group') + ' ' + group.name.slice(-1) : group.name;
              }
            }
          });
        }
        const dataGroup = {
          group_class_id: group._id,
          name: group.name,
          student_classes_id: connectClassList,
        };
        groupList.push(dataGroup);
      });
    } else {
      this.totalGroup = 0;
    }
    this.form.get('group_classes').patchValue(groupList);
    this.selectedForm.get('class').patchValue(classList);

    if (classList && classList.length) {
      this.dataSource.data = cloneDeep(classList);
    } else {
      this.dataSource.data = [];
    }
    this.form.valueChanges.subscribe(() => {
      this.isFormUnchanged();
    });
  }

  isFormUnchanged() {
    const initialData = JSON.stringify(this.initialForm);
    const currentData = JSON.stringify(this.form.getRawValue());
    if (initialData === currentData) {
      this.courseSequenceService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.courseSequenceService.childrenFormValidationStatus = false;
      return false;
    }
  }

  reset() {
    this.totalGroup = 0;
    this.groupOptionList = [];
    this.groupClassesArray.clear();
    this.getClass().clear();
  }

  changeGroupName(index) {
    const currGroupName = this.groupClassesArray.at(index).get('name').value;
    const lastGroupName = this.groupOptionList[index].value;
    if (this.getClass() && this.getClass().length) {
      const tableClass = this.getClass().value;
      tableClass.forEach((classs, indexClass) => {
        if (classs.group === lastGroupName) {
          this.getClass().at(indexClass).get('group').patchValue(currGroupName);
        }
      });
    }
    this.groupOptionList.splice(index, 1, { name: currGroupName, value: currGroupName });
  }

  selectedGroup(index, data) {
    const groups = this.groupClassesArray.value;
    if (this.getClass() && this.getClass().length) {
      const classId = this.getClass().at(index).get('_id').value;
      const className = this.getClass().at(index).get('name').value;
      if (groups.length) {
        groups.forEach((group, indexGroup) => {
          if (group && group.student_classes_id && group.student_classes_id.length) {
            const findClass = group.student_classes_id.findIndex((name) => classId === name._id);
            if (findClass !== -1) {
              this.getFormGroupClassArray(indexGroup).removeAt(findClass);
            }
          }
          if (group.name === data) {
            this.getFormGroupClassArray(indexGroup).push(this.initFormClass(classId, className));
          }
        });
      }
    }
  }

  onAddGroup() {
    this.totalGroup = this.totalGroup + 1;
    const name = `Group ${this.totalGroup}`;
    this.addGroupClasses();
    const lastIndex = this.groupClassesArray.length - 1;
    this.groupClassesArray.at(lastIndex).get('name').setValue(name);
    this.groupOptionList.push({ value: name, name: this.translate.instant('ASSIGN_CORRECTOR_DIALOG.Group') + ` ${this.totalGroup}` });
  }

  createPayload() {
    const temp = this.form.value;
    const groups = [];
    if (temp && temp.group_classes && temp.group_classes.length) {
      temp.group_classes.forEach((group) => {
        let classIdList = [];
        if (group.student_classes_id && group.student_classes_id.length) {
          classIdList = group.student_classes_id.map((id) => id._id);
        }
        const currGroup = {
          group_class_id: group.group_class_id,
          name: group.name,
          student_classes_id: classIdList,
        };
        groups.push(currGroup);
      });
    }
    return groups;
  }

  save() {
    const payload = this.createPayload();
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.createUpdateGroupClasses(this.groupClasses._id, payload, this.groupType._id).subscribe(
      (resp) => {
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((confirm) => {
            if (confirm.value) {
              this.courseSequenceService.childrenFormValidationStatus = true;
              this.reload.emit(true);
            }
          });
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Group class name alredy exsist' || err['message'] === 'GraphQL error: Name already exsist') {
          Swal.fire({
            title: this.translate.instant('Uniquename_S1.TITLE'),
            text: this.translate.instant('Uniquename_S1.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
          });
        } else if (err['message'] === 'GraphQL error: cannot update if session in teacher subject table already have assigned teacher') {
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
  }

  ngAfterViewInit(): void {
    this.dataCount = this.dataSource.data.length;
    this.dataSource.paginator = this.paginator;
    this.subs.sink = this.paginator.page.subscribe((page) => {
      this.page = page.pageIndex * page.pageSize;
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }

  removeGroupFormArray(seqIndex: number) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('GROUP_TYPE_RS1.TITLE'),
      text: this.translate.instant('GROUP_TYPE_RS1.TEXT'),
      confirmButtonText: this.translate.instant('GROUP_TYPE_RS1.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('GROUP_TYPE_RS1.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        this.groupClassesArray.removeAt(seqIndex);
        this.totalGroup = this.totalGroup - 1;
        this.groupOptionList.splice(seqIndex, 1);
        Swal.fire({
          allowOutsideClick: false,
          type: 'success',
          title: this.translate.instant('GROUP_TYPE_RS2.TITLE'),
          text: this.translate.instant('GROUP_TYPE_RS2.TEXT'),
          confirmButtonText: this.translate.instant('GROUP_TYPE_RS2.BUTTON_1'),
        });
      }
    });
  }

  removeTypeGroupFormArray() {
    const group = this.groupClasses.program_sequence_groups[0];
    const payload = {
      program_sequence_id: this.groupClasses._id,
      group_class_types: null,
      program_sequence_group_id: this.groupClasses.program_sequence_groups[0]._id,
    };
    if (group && group.group_class_types && group.group_class_types.length) {
      payload.group_class_types = _.cloneDeep(group.group_class_types);
      payload.group_class_types.forEach((element) => {
        if (element.group_classes_id && element.group_classes_id.length) {
          element.group_classes_id = element.group_classes_id.map((resp) => resp._id);
        }
        if (element._id) {
          element.group_class_type_id = element._id;
          delete element._id;
        }
      });
      payload.group_class_types.splice(this.groupIndex, 1);
    }

    Swal.fire({
      type: 'warning',
      title: this.translate.instant('GROUP_CLASS_TYPE_RS1.TITLE'),
      text: this.translate.instant('GROUP_CLASS_TYPE_RS1.TEXT'),
      confirmButtonText: this.translate.instant('GROUP_CLASS_TYPE_RS1.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('GROUP_CLASS_TYPE_RS1.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.courseSequenceService
          .CreateUpdateGroupTypes(payload.program_sequence_id, payload.group_class_types, payload.program_sequence_group_id)
          .subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.reload.emit(true);
              Swal.fire({
                allowOutsideClick: false,
                type: 'success',
                title: this.translate.instant('GROUP_CLASS_TYPE_RS2.TITLE'),
                text: this.translate.instant('GROUP_CLASS_TYPE_RS2.TEXT'),
                confirmButtonText: this.translate.instant('GROUP_CLASS_TYPE_RS2.BUTTON_1'),
              });
            },
            (err) => {
              // Record error log
              this.authService.postErrorLog(err);
              this.isWaitingForResponse = false;
              if (err['message'] === 'GraphQL error: Group name already used') {
                Swal.fire({
                  title: this.translate.instant('Uniquename_S1.TITLE'),
                  text: this.translate.instant('Uniquename_S1.TEXT'),
                  type: 'info',
                  showConfirmButton: true,
                  confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
                });
              } else if (
                err['message'] === 'GraphQL error: cannot update if session in teacher subject table already have assigned teacher'
              ) {
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
      }
    });
  }
}
