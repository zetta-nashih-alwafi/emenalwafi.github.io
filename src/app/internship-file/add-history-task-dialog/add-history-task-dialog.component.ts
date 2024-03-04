import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionService } from 'app/service/permission/permission.service';
import * as moment from 'moment';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-add-history-task-dialog',
  templateUrl: './add-history-task-dialog.component.html',
  styleUrls: ['./add-history-task-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddHistoryTaskDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  toggleValue = false;
  internalTaskToggle = true;
  form: UntypedFormGroup;
  documents: UntypedFormArray;
  users = [];
  internalChecked;
  private timeOutVal: any;
  isWaitingForResponse = false;
  isUserCertifierAdmin = false;
  isUserCertifierDir = false;
  currentUser: any;
  listUser: any;
  titleList: any;
  originalTitleList: any;
  isCRDir = false;
  isCRAdmin = false;
  rncpTitles: any;
  userTypesList: any;
  userList: any;
  userRecipientList: any;
  rncpTitlesList: any;
  originalUserTypesList: any;
  originalUserList: any;
  originalRncpTitlesList: any;
  isPermission: any;
  selectedTitleId: string[] = [];
  selectedUserTypeId: string[] = [];
  titleReady = false;
  userReady = false;
  userTypeReady = false;
  checked;
  today = new Date();
  taskData: any;
  isADMTC = false;

  classes;
  originalClassList;
  documentNameError = false;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddHistoryTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private translate: TranslateService,
    private userService: UserService,
    private utilService: UtilityService,
    private auth: AuthService,
    private permission: NgxPermissionsService,
    public permissionService: PermissionService,
    private parseLocaltoUTC: ParseLocalToUtcPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private dateAdapter: DateAdapter<Date>,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.dateAdapter.setLocale(this.translate.currentLang);
    });
    // console.log('parentData =>', this.parentData);
    this.isPermission = this.auth.getPermission();
    this.isADMTC = this.utilService.isUserEntityADMTC();
    this.isCRAdmin = !!this.permission.getPermission('Certifier Admin');
    this.isCRDir = !!this.permission.getPermission('CR School Director');
    this.currentUser = this.auth.getLocalStorageUser();
    this.isUserCertifierAdmin = this.utilService.isCertifierAdmin();
    this.isUserCertifierDir = this.utilService.isCertifierDirector();
    this.initializeForm();
    this.getDataUser();
  }

  getDataUser() {
    this.isWaitingForResponse = true;
    const legalEntity = !this.parentData.to || ['-', 'null'].includes(this.parentData.to) ? '' : this.parentData.to;
    this.subs.sink = this.financeService.GetAllUsersByLegal(legalEntity).subscribe(
      (list) => {
        this.isWaitingForResponse = false;
        this.listUser = list;
        this.userList = _.uniqBy(this.listUser, 'first_name');
        this.originalUserList = _.uniqBy(this.listUser, 'first_name');
        this.users = this.userList;
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.auth.postErrorLog(err);
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

  initializeForm() {
    this.form = this.fb.group({
      users: ['', Validators.required],
      class_id: [''],
      userTypes: [''],
      priority: ['1', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      originalRncpTitle: [''],
      originalClass: [''],
      originalUserTypes: [''],
      originalUser: [''],
      documents: this.fb.array([]),
    });
  }

  getDataTask(task) {
    // console.log('getDataTask => ', task);
    if (task) {
      const taskData = {
        internalTask: false,
        rncpTitle: task.rncp.short_name,
        users: task.user_selection.user_id ? task.user_selection.user_id.first_name + ' ' + task.user_selection.user_id.last_name : '',
        userTypes: task.user_selection.user_type_id ? task.user_selection.user_type_id.name : '',
        priority: task.priority ? task.priority.toString() : '',
        date: task.due_date
          ? this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(task.due_date.date, task.due_date.time))
          : '',
        description: task.description,
        documents: task.expected_document ? task.expected_document : [],
        originalRncpTitle: task.rncp._id,
        originalUserTypes: task.user_selection.user_type_id ? task.user_selection.user_type_id._id : '',
        originalUser: task.user_selection.user_id ? task.user_selection.user_id._id : '',
      };
      if (taskData.originalUser) {
        this.selectedUser(taskData.originalUser);
      }
      if (taskData.originalUserTypes) {
        this.selectedUserType(taskData.originalUserTypes);
      }
      this.form.patchValue(taskData);
      // console.log('this.form => ', this.form.value);
    }
  }

  categoryChange(event) {
    if (event.checked) {
      console.log('Check');
      this.form.get('users').patchValue(null);
      this.form.get('users').updateValueAndValidity();
      this.form.get('users').clearValidators();
      this.form.get('users').updateValueAndValidity();
      this.form.get('userTypes').setValidators([Validators.required]);
      this.form.get('userTypes').updateValueAndValidity();
    } else {
      console.log('Unceck');
      this.form.get('userTypes').patchValue(null);
      this.form.get('userTypes').updateValueAndValidity();
      this.form.get('userTypes').clearValidators();
      this.form.get('userTypes').updateValueAndValidity();
      this.form.get('users').setValidators([Validators.required]);
      this.form.get('users').updateValueAndValidity();
    }
    // console.log('Event : ', event, this.form.controls);
  }

  selectedUser(selectedUser) {
    this.userReady = false;
    this.form.get('originalUser').setValue(selectedUser._id);
  }

  selectedUserType(selectedUserType) {
    this.userReady = false;
    this.form.get('originalUserTypes').setValue(selectedUserType);
    const data = [];
    data.push(this.form.get('originalRncpTitle').value);
    // if selected user type is student, call API getUserTypeStudent
    if (selectedUserType === '5a067bba1c0217218c75f8ab') {
      this.userService.getUserTypeStudent(data, selectedUserType).subscribe(
        (resp) => {
          this.userRecipientList = resp;
        },
        (err) => {
          // Record error log
          this.auth.postErrorLog(err);
        },
      );
    } else {
      this.userService.getUserType(data, selectedUserType).subscribe(
        (resp) => {
          this.userRecipientList = resp;
        },
        (err) => {
          // Record error log
          this.auth.postErrorLog(err);
        },
      );
    }
    this.selectedTitleId = [this.form.get('originalRncpTitle').value];
    this.selectedUserTypeId = [selectedUserType];
  }

  intenalTaskToggleChange(event) {
    this.internalTaskToggle = event.checked;
    if (this.internalTaskToggle) {
      this.users = this.userList;
    }
  }

  documentNameErrorValidation(docAdd) {
    if (docAdd.value) {
      this.documentNameError = false;
    } else {
      this.documentNameError = true;
    }
  }

  addDocument(docAdd) {
    if (docAdd.value) {
      this.documents = this.form.get('documents') as UntypedFormArray;
      this.documents.push(this.buildDocuments(docAdd.value));
    } else {
      this.documentNameError = true;
    }
    docAdd.value = '';
  }

  buildDocuments(docName?: string) {
    return new UntypedFormGroup({
      name: new UntypedFormControl(docName ? docName : ''),
      isDocumentAssigned: new UntypedFormControl(docName ? true : false),
    });
  }

  removeDocument(i) {
    // console.log('Data Doc =>', this.documents, this.buildDocuments(''));
    const emptyDoc = JSON.stringify(this.documents.value[i]);
    const selectedDoc = JSON.stringify(this.buildDocuments('').value);
    if (emptyDoc !== selectedDoc) {
      let timeDisabled = 3;
      Swal.fire({
        title: this.translate.instant('DASHBOARD_DELETE.deletedTitle'),
        html: this.translate.instant('This action will delete document expected !'),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.documents = this.form.get('documents') as UntypedFormArray;
          this.documents.removeAt(i);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('EVENT_S1.TITLE'),
            html: this.translate.instant('Document Expected Deleted'),
            confirmButtonText: this.translate.instant('EVENT_S1.BUTTON'),
          });
        }
      });
    } else {
      this.documents = this.form.get('documents') as UntypedFormArray;
      this.documents.removeAt(i);
    }
  }

  keyupUser(event) {
    this.userReady = true;
  }
  keyupUserType(event) {
    this.userTypeReady = true;
  }
  keyupTitle(event) {
    this.titleReady = true;
  }

  valueChange(event) {
    if (event === 'title') {
      this.titleReady = false;
    } else if (event === 'user') {
      this.userReady = false;
    } else if (event === 'type') {
      this.userTypeReady = false;
    }
    // console.log('button active : ', this.titleReady, this.userReady, this.userTypeReady);
  }

  createTask() {
    // const entity = this.currentUser.entities.filter((ent) => ent.type.name === this.isPermission[0]);
    // const dataUnix = _.uniqBy(entity, 'school.short_name');
    // const schoolId = dataUnix && dataUnix[0] && dataUnix[0].school && dataUnix[0].school._id ? dataUnix[0].school._id : '';
    // const payload = _.cloneDeep(this.form.value);
    // payload.created_by = this.currentUser._id;
    // const document = this.documents ? this.documents.value : [];
    // payload.document_expecteds = [];
    // console.log('document => ', document, this.form.get('documents').value);
    // document.forEach((element) => {
    //   const dataDoc = {
    //     name: element.name,
    //   };
    //   payload.document_expecteds.push(dataDoc);
    // });

    // payload.user_selection = {
    //   selection_type: 'user',
    //   user_id: this.form.get('originalUser').value,
    // };
    // payload.created_date = {
    //   time: this.getTodayTime(),
    //   date: this.getTodayDate(),
    // };
    // payload.due_date = {
    //   date: this.getDueDate(),
    //   time: this.getTodayTime(),
    // };
    // payload.priority = parseInt(payload.priority);
    // delete payload.date;
    // delete payload.originalRncpTitle;
    // delete payload.originalUserTypes;
    // delete payload.originalUser;
    // delete payload.rncpTitle;
    // delete payload.users;
    // delete payload.userTypes;
    // delete payload.internalTask;
    // delete payload.documents;
    // delete payload.originalClass;
    // delete payload.autoClass;
    // if (schoolId !== '') {
    //   this.subs.sink = this.rncpTitleService.createTask(payload, schoolId).subscribe((data: any) => {
    //     Swal.fire({
    //       title: this.translate.instant('TASKCREATED.TITLE'),
    //       html: this.translate.instant('TASKCREATED.TEXT'),
    //       allowEscapeKey: true,
    //       type: 'success',
    //       confirmButtonText: this.translate.instant('TASKCREATED.BUTTON'),
    //     }).then((res) => {
    //       this.dialogRef.close();
    //     });
    //   });
    // } else {
    //   this.subs.sink = this.rncpTitleService.createTaskNonSchool(payload).subscribe((data: any) => {
    //     Swal.fire({
    //       title: this.translate.instant('TASKCREATED.TITLE'),
    //       html: this.translate.instant('TASKCREATED.TEXT'),
    //       allowEscapeKey: true,
    //       type: 'success',
    //       confirmButtonText: this.translate.instant('TASKCREATED.BUTTON'),
    //     }).then((res) => {
    //       this.dialogRef.close();
    //     });
    //   });
    // }
    Swal.fire({
      title: this.translate.instant('TASKCREATED.TITLE'),
      html: this.translate.instant('TASKCREATED.TEXT'),
      allowEscapeKey: true,
      type: 'success',
      confirmButtonText: this.translate.instant('TASKCREATED.BUTTON'),
    }).then((res) => {
      this.dialogRef.close();
    });
  }

  getDueDate() {
    const dueDateUTC = this.parseLocaltoUTC.transformDate(moment(this.form.get('date').value).format('DD/MM/YYYY'), '00:00');
    return dueDateUTC;
    // const today = moment(this.form.get('date').value).format('DD/MM/YYYY');
    // return today;
  }
  getTodayTime() {
    return this.parseLocaltoUTC.transform('00:00');
  }

  getTodayDate() {
    const todayUTC = this.parseLocaltoUTC.transformDate(moment(this.today).format('DD/MM/YYYY'), '00:00');
    return todayUTC;
    // const today = moment(this.today).format('DD/MM/YYYY');
    // return today;
  }
  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }
}
