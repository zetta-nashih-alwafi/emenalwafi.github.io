import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AddTypeOfGroupDialogComponent } from '../../add-type-of-group-dialog/add-type-of-group-dialog.component';

@Component({
  selector: 'ms-grouping-classes-group-sequence',
  templateUrl: './grouping-classes-group-sequence.component.html',
  styleUrls: ['./grouping-classes-group-sequence.component.scss'],
})
export class GroupingClassesSequenceComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild('autoCompleteInput', {
    read: MatAutocompleteTrigger,
    static: false,
  })
  autoComplete: MatAutocompleteTrigger;

  isWaitingForResponse = false;
  selectedIndex;
  tabIndex = 0;
  displayedColumns = ['class'];
  dataSource = new MatTableDataSource([]);

  programId;
  studentClasses;
  studentProgramSequence;
  studentTable = {
    source: new MatTableDataSource([]),
    dataCols: ['name', 'class', 'action'],
    filterCols: ['name-filter', 'class-filter', 'action-filter'],
    filter: new UntypedFormGroup({
      name: new UntypedFormControl(null),
      class: new UntypedFormControl(null),
    }),
  };
  dummyControl = new UntypedFormControl(null);

  studentClassFilterList: { student_class_id: string; name: string; students: any[] }[] = [];

  @Input() groupClasses;
  @Input() sequenceId;
  @Input() sequenceIndex;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('studentTableSort', { static: false }) studentTableSort: MatSort = new MatSort();
  @ViewChild('templateMatGroup', { static: false }) templateMatGroup: MatTabGroup;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  groupClassesForm: UntypedFormGroup;
  initialForm;

  isInit = true;

  constructor(
    private translate: TranslateService,
    public permissionService: PermissionService,
    private studentService: StudentsTableService,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private router: ActivatedRoute,
    private courseSequenceService: CourseSequenceService,
    private utilService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.subs.sink = this.router.queryParams.subscribe((res) => {
      if (res && res.programId.length) {
        this.programId = res.program_id;
      }
    });
    this.initForm();
    this.initTableClasses();
    this.patchClasses();
    this.getStudents(0);
    this.sortingDropdownFilter();
  }

  sortingDropdownFilter() {
    if (this.classesArray.value) {
      this.studentClassFilterList = _.cloneDeep(this.classesArray.value);
      this.studentClassFilterList = this.studentClassFilterList.sort((a, b) =>
        this.utilService.simplifyRegex(a.name).localeCompare(this.utilService.simplifyRegex(b.name)),
      );
    }
  }
  onWheel(event: Event) {
    event?.preventDefault();
  }
  ngAfterViewInit() {
    this.templateMatGroup._handleClick = this.checkIfAnyChildrenFormInvalid.bind(this);
    this.studentTable.source.paginator = this.paginator;
    this.studentTable.source.sort = this.studentTableSort;
    this.studentTable.source.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          const array = [];
          if (item && item.last_name) {
            array.push(String(item.last_name).toLocaleUpperCase());
          }
          if (item && item.first_name) {
            array.push(item.first_name);
          }
          return array.join(' ');
        case 'class':
          if (!item || !item._id) {
            return '';
          }
          const control = this.findStudentClassControlByID(item._id);
          return control && control.value ? control.value : this.dummyControl.value;
        default:
          return item[property];
      }
    };
    this.initFilter();
  }

  closeAutoComplete() {
    const timeOut = setTimeout(() => {
      this.autoComplete.closePanel();
      clearTimeout(timeOut);
    }, 200);
  }

  checkIfAnyChildrenFormInvalid(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (!this.courseSequenceService.childrenFormValidationStatus) {
      return this.fireUnsavedDataWarningSwal(tab, tabHeader, idx);
    }
    return true && MatTabGroup.prototype._handleClick.apply(this.templateMatGroup, [tab, tabHeader, idx]);
  }

  fireUnsavedDataWarningSwal(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('TMTC_S01.TITLE'),
      text: this.translate.instant('TMTC_S01.TEXT'),
      confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        return false;
      } else if (result.dismiss) {
        this.patchClasses();
        this.courseSequenceService.childrenFormValidationStatus = true;
        return true && MatTabGroup.prototype._handleClick.apply(this.templateMatGroup, [tab, tabHeader, idx]);
      }
    });
  }

  resetStudentTable() {
    this.studentTable.filter.patchValue({
      name: null,
      class: null,
    });
    this.studentTable.source.sort.sort({ id: null, start: null, disableClear: false });
    this.isInit = true;
    this.reloadData.emit(true);
    this.allStudentForTable = [];
    this.getStudents(0);
  }

  initFilter() {
    this.studentTable.source.filterPredicate = (data: any, filterJSON: string) => {
      const filter = JSON.parse(filterJSON);
      const student = this.studentsArray.value.find((studesnt) => studesnt._id && studesnt._id === data._id);
      const names: string[] = [];

      if (typeof filter.name === 'string') {
        filter.name = filter.name.trim().toLocaleLowerCase();
      }
      if (typeof filter.class === 'string') {
        filter.class = filter.class.trim().toLocaleLowerCase();
      }
      if (student && typeof student.class_name === 'string') {
        student.class_name = student.class_name.trim().toLocaleLowerCase();
      }
      if (data.civility && data.civility !== 'neutral') {
        names.push(this.translate.instant(data.civility));
      }
      if (data.last_name) {
        names.push(data.last_name);
      }
      if (data.first_name) {
        names.push(data.first_name);
      }

      return (
        Boolean(!filter.name || names.join('').toLocaleLowerCase().includes(filter.name.trim().toLocaleLowerCase())) &&
        Boolean(!filter.class || String(student.class_name).includes(filter.class.trim().toLocaleLowerCase()))
      );
    };
    this.subs.sink = this.studentTable.filter.valueChanges.subscribe(() => {
      this.studentTable.source.filter = JSON.stringify(this.studentTable.filter.value);
    });
  }

  onSortChange(evt: Sort) {}

  initForm() {
    this.groupClassesForm = this.fb.group({
      number_of_class: [null, [Validators.required]],
      number_of_student_each_class: [null, [Validators.required]],
      student_classes: this.fb.array([]),
      students: this.fb.array([]),
    });
  }

  initClassesFormGroup() {
    return this.fb.group({
      student_class_id: [null],
      name: [null],
      students: this.fb.array([]),
    });
  }

  initStudentsFormGroup() {
    return this.fb.group({
      _id: [null],
      class_name: [null],
      last_name: [null],
      first_name: [null],
      civility: [null],
    });
  }

  get classesArray() {
    return this.groupClassesForm.get('student_classes') as UntypedFormArray;
  }

  get studentsArray() {
    return this.groupClassesForm.get('students') as UntypedFormArray;
  }

  findStudentClassControlByID(id): UntypedFormControl {
    const students = this.studentsArray.value;
    const idx = students.findIndex((student) => id && student && student._id && student._id === id);
    return idx >= 0 && this.studentsArray.value && this.studentsArray.at(idx).value
      ? (this.studentsArray.at(idx).get('class_name') as UntypedFormControl)
      : this.dummyControl;
  }

  addClasses() {
    this.classesArray.push(this.initClassesFormGroup());
  }

  addstudents() {
    this.studentsArray.push(this.initStudentsFormGroup());
  }

  patchClasses() {
    if (this.groupClasses && this.groupClasses.program_sequence_groups && this.groupClasses.program_sequence_groups.length) {
      const groupData = this.groupClasses.program_sequence_groups[0];
      const number_of_class = groupData.number_of_class ? groupData.number_of_class : 0;
      const number_of_student_each_class = groupData.number_of_student_each_class ? groupData.number_of_student_each_class : 0;

      this.groupClassesForm.get('number_of_class').setValue(number_of_class);
      this.groupClassesForm.get('number_of_student_each_class').setValue(number_of_student_each_class);

      if (groupData && groupData.number_of_class) {
        let studentClasses = [];
        this.classesArray.clear();
        for (let i = 0; i < groupData.number_of_class; i++) {
          const className =
            groupData.student_classes && groupData.student_classes.length && groupData.student_classes[i]
              ? groupData.student_classes[i].name
              : 'Class ' + (i + 1);
          const classId =
            groupData.student_classes && groupData.student_classes.length && groupData.student_classes[i]
              ? groupData.student_classes[i]._id
              : null;
          this.addClasses();
          const studentList = [];
          // console.log(groupData);
          if (groupData.student_classes && groupData.student_classes.length && groupData.student_classes[i]) {
            if (groupData.student_classes[i].students_id && groupData.student_classes[i].students_id.length) {
              groupData.student_classes[i].students_id.forEach((student, indexStudent) => {
                const students = this.classesArray.at(i).get('students') as UntypedFormArray;
                students.push(this.initStudentsFormGroup());
                studentList.push(student);
              });
            }
          }
          const classes = {
            student_class_id: classId,
            name: className,
            students: studentList,
          };
          studentClasses.push(classes);
        }
        this.classesArray.patchValue(studentClasses);
      }

      /* if (groupData && groupData.number_of_student_each_class) {
        this.studentsArray.clear();
        for (let i = 0; i < groupData.number_of_student_each_class; i++) {
          this.addstudents();
          this.studentsArray.at(i).get('first_name').patchValue('Student');
          this.studentsArray
            .at(i)
            .get('last_name')
            .patchValue(String(i + 1));
        }
        this.patchStudents();
      }
      if (groupData && groupData) {
      } */
    }
  }

  isFormUnchanged() {
    const initialData = JSON.stringify(this.initialForm);
    const currentData = JSON.stringify(this.groupClassesForm.getRawValue());
    if (initialData === currentData) {
      this.courseSequenceService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.courseSequenceService.childrenFormValidationStatus = false;
      return false;
    }
  }

  initTableClasses() {
    const groupData = this.groupClasses.program_sequence_groups[0];
    this.subs.sink = this.groupClassesForm.get('number_of_class').valueChanges.subscribe((value) => {
      if (value) {
        const studentClasses = [];
        this.classesArray.clear();
        for (let i = 0; i < value; i++) {
          const className =
            groupData.student_classes && groupData.student_classes.length && groupData.student_classes[i]
              ? groupData.student_classes[i].name
              : 'Class ' + String(i + 1);
          const classId =
            groupData.student_classes && groupData.student_classes.length && groupData.student_classes[i]
              ? groupData.student_classes[i]._id
              : null;
          this.addClasses();

          const studentList = [];
          if (groupData.student_classes && groupData.student_classes.length && groupData.student_classes[i]) {
            if (groupData.student_classes[i].students_id && groupData.student_classes[i].students_id.length) {
              groupData.student_classes[i].students_id.forEach((student, indexStudent) => {
                studentList.push(student);
              });
            }
          }
          const classes = {
            student_class_id: classId,
            name: className,
            students: studentList,
          };
          studentClasses.push(classes);
        }
        this.classesArray.patchValue(studentClasses);
      } else {
        this.classesArray.clear();
      }
    });

    /* this.subs.sink = this.groupClassesForm.get('number_of_student_each_class').valueChanges.subscribe((value) => {
      if (value) {
        this.studentsArray.clear();
        for (let i = 0; i < value; i++) {
          this.addstudents();
          this.studentsArray.at(i).get('first_name').patchValue('Student');
          this.studentsArray
            .at(i)
            .get('last_name')
            .patchValue(String(i + 1));
        }
        console.log('qa42 student', this.groupClassesForm.value);
        this.patchStudents();
      } else {
        this.studentsArray.clear();
        this.patchStudents();
      }
    }); */
  }

  patchStudents() {
    this.dataSource.data = this.studentsArray.value;
  }

  selectTab(tab) {
    if (tab === 'classes') {
      this.allStudentForTable = [];
      this.getStudents(0);
    }
  }

  selectedTabIndex(label, idx) {
    // console.log('tab', label, idx, this.tabIndex);
  }

  checkFormValidity(): boolean {
    if (this.groupClassesForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.groupClassesForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  createPayload() {
    return {
      program_sequence_group_id: this.groupClasses.program_sequence_groups[0]._id,
      program_sequence_id: this.groupClasses._id,
      number_of_class: this.groupClassesForm.get('number_of_class').value,
      number_of_student_each_class: this.groupClassesForm.get('number_of_student_each_class').value,
      student_classes: this.groupClassesForm.get('student_classes').value.map((classes) => {
        return { ...classes, students: classes.students.map((student) => student._id) };
      }),
    };
  }

  onSave() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    // console.log('payload =>', payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.CreateUpdateStudentClasses(payload).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.courseSequenceService.childrenFormValidationStatus = true;
            this.reloadData.emit(true);
            // this.getStudentClasses();
          });
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err && err.message && err.message === 'GraphQL error: cannot add student to class, limit already reached') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('StudTable_S5.Title'),
            html: this.translate.instant('StudTable_S5.Text'),
            confirmButtonText: this.translate.instant('StudTable_S5.Button'),
            allowOutsideClick: false,
          });
        } else if (err['message'] === 'GraphQL error: cannot update or create if connected teacher subject already have teacher assigned') {
          Swal.fire({
            title: this.translate.instant('AddClass_S1.Title'),
            html: this.translate.instant('AddClass_S1.Html'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('AddClass_S1.Confirm_Button'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } else if (err['message'] === 'GraphQL error: Student class name alredy exsist') {
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
  unsavedSwal() {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('TMTC_S01.TITLE'),
      text: this.translate.instant('TMTC_S01.TEXT'),
      confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((confirm) => {
      if (confirm.value) {
        return;
      } else {
        this.courseSequenceService.childrenFormValidationStatus = true;
        // console.log('check form add after', this.courseSequenceService.childrenFormValidationStatus);
        this.onAddTypeOfGroup();
      }
    });
  }
  checkToAddTypeGroup() {
    // console.log('check form add before', this.courseSequenceService.childrenFormValidationStatus);
    if (!this.courseSequenceService.childrenFormValidationStatus) {
      this.unsavedSwal();
    } else {
      this.onAddTypeOfGroup();
    }
  }

  onAddTypeOfGroup() {
    const group = this.groupClasses.program_sequence_groups[0];
    const sequence = this.groupClasses;
    this.subs.sink = this.dialog
      .open(AddTypeOfGroupDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          title: 'Add',
          group: group,
          sequence: sequence,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.reloadData.emit(true);
        } else {
          this.patchClasses();
        }
      });
  }

  reload(event) {
    if (event) {
      this.reloadData.emit(true);
    }
  }

  allStudentForTable = [];

  getStudents(pageNumber) {
    const { snapshot } = this.router;
    const filter = {};
    const pagination = {
      limit: 300,
      page: pageNumber,
    };

    if (snapshot.queryParamMap.has('schoolId')) {
      filter['school_id'] = snapshot.queryParamMap.get('schoolId');
    }
    if (this.groupClasses && this.groupClasses.program_sequence_groups && this.groupClasses.program_sequence_groups.length) {
      const group = this.groupClasses.program_sequence_groups[0];
      if (group.program_sequence_id && group.program_sequence_id._id) {
        filter['program_sequence_id'] = group.program_sequence_id._id;
      }
    }
    filter['student_status'] = 'registered';
    //*************** This is required as there is condition in backend to unwind the program sequences data if is_registered_table === true.
    filter['is_registered_table'] = true;
    //*************** Response will be an empty array if we don't pass the field above
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.getAllStudentNames(pagination, filter).subscribe(
      (students) => {
        this.isWaitingForResponse = false;
        if (students && students.length) {
          this.allStudentForTable.push(...students);
          const page = pageNumber + 1;
          this.getStudents(page);
        } else {
          if (this.allStudentForTable && this.allStudentForTable.length) {
            if (this.isInit) {
              for (let i = 0; i < this.allStudentForTable.length; i++) {
                const group = this.initStudentsFormGroup();
                group.patchValue(this.allStudentForTable[i]);
                this.studentsArray.push(group);
              }
              this.isInit = false;
            }
            this.studentTable.source.paginator = this.paginator;
            this.studentTable.filter.patchValue({
              name: null,
              class: null,
            });
            this.studentTable.source.sort.sort({ id: null, start: null, disableClear: false });
            this.studentTable.source.data = [...this.allStudentForTable];
            this.classesArray.controls.map((control) => {
              const class_name = control.get('name').value;
              const studesnts = control.get('students') as UntypedFormArray;
              if (studesnts.length) {
                studesnts.value.map((student) => {
                  if (student && student._id) {
                    const studentIdx = this.studentsArray.value.findIndex(
                      (tableStudent) => tableStudent && tableStudent._id && tableStudent._id === student._id,
                    );
                    if (studentIdx >= 0) {
                      this.studentsArray.at(studentIdx).patchValue({ class_name });
                    }
                  }
                });
              }
            });
          }
          this.initialForm = this.groupClassesForm.value;
          this.groupClassesForm.valueChanges.subscribe(() => {
            this.isFormUnchanged();
          });
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
      },
    );
  }

  composeStudentName(student: any) {
    const name = [];
    if (student.civility && student.civility !== 'neutral') {
      name.push(this.translate.instant(student.civility));
    }
    if (student.first_name) {
      name.push(student.first_name);
    }
    if (student.last_name) {
      name.push(student.last_name);
    }
    return name.join(' ');
  }

  async removeStudentFromSequence(student: any) {
    let sequenceId = null;
    const studentId = student._id ? student._id : null;
    const studentName = this.composeStudentName(student);
    const result = await Swal.fire({
      type: 'warning',
      title: this.translate.instant('Are you sure?'),
      html: this.translate.instant('CONFIRMDELETE', { value: studentName || '' }),
      confirmButtonText: this.translate.instant('CONFIRM'),
      cancelButtonText: this.translate.instant('No'),
      showCancelButton: true,
    });

    if (this.groupClasses && this.groupClasses.program_sequence_groups && this.groupClasses.program_sequence_groups.length) {
      const group = this.groupClasses.program_sequence_groups[0];
      if (group.program_sequence_id && group.program_sequence_id._id) {
        sequenceId = group.program_sequence_id._id;
      }
    }

    if (!studentId) {
      // console.warn('No student ID');
    }
    if (!sequenceId) {
      // console.warn('No program ID');
    }
    if (result.value) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.studentService.RemoveProgramSequenceFromStudent(studentId, sequenceId).subscribe(
        async () => {
          this.isWaitingForResponse = false;
          await Swal.fire({ type: 'success', title: 'Bravo!' });
          this.isInit = true;
          this.reloadData.emit(true);
          this.allStudentForTable = [];
          this.getStudents(0);
        },
        (err) => {
          this.isWaitingForResponse = false;
          // Record error log
          this.authService.postErrorLog(err);
          // console.error('Error removing program sequence from student', err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? err['message'].replaceAll('GraphQl error:', '') : err,
          });
        },
      );
    }
  }

  onStudentClassChange(idx: number, className: string, studentFromTable) {
    const classes = this.classesArray.value;
    if (classes && classes.length) {
      for (let i = 0; i < classes.length; i++) {
        const students = this.classesArray.at(i).get('students') as UntypedFormArray;

        if (
          classes[i].name &&
          classes[i].name === className &&
          students.length === this.groupClassesForm.get('number_of_student_each_class').value
        ) {
          this.studentsArray.at(idx).patchValue({ class_name: null });
          return Swal.fire({
            type: 'warning',
            title: this.translate.instant('Max Student Reached'),
            html: this.translate.instant('Max student reached for class', { className }),
          });
        }

        const studentIdx = students.value.findIndex(
          (student) => student && studentFromTable && student._id && studentFromTable._id && student._id === studentFromTable._id,
        );

        if (studentIdx >= 0) {
          students.removeAt(studentIdx);
        }
        if (classes[i].name && classes[i].name === className) {
          const newStudent = this.initStudentsFormGroup();
          newStudent.patchValue(studentFromTable);
          students.push(newStudent);
        }
      }
    }
  }

  displayClassWithNameFn(studentClass: any) {
    if (studentClass && studentClass.name) {
      return studentClass.name;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
