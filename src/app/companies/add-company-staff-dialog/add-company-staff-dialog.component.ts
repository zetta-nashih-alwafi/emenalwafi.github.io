import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { UserService } from 'app/service/user/user.service';
import { SchoolService } from 'app/service/schools/school.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'ng2-validation';
import { CompanyService } from 'app/service/company/company.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AskRevisionDialogComponent } from '../ask-revision-dialog/ask-revision-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { interval, PartialObserver, Subject, Observable } from 'rxjs';
import { debounceTime, map, startWith, takeUntil } from 'rxjs/operators';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { truncate } from 'fs';
import { Router } from '@angular/router';
import { CountryService } from 'app/shared/services/country.service';

interface Entity {
  entity_name: string;
  school_type: string;
  group_of_schools: string;
  school: string;
  assigned_rncp_title: string;
  class: string;
  type: string;
}
@Component({
  selector: 'ms-add-company-staff-dialog',
  templateUrl: './add-company-staff-dialog.component.html',
  styleUrls: ['./add-company-staff-dialog.component.scss'],
})
export class AddCompanyStaffDialogComponent implements OnInit, OnDestroy {
  @ViewChild('exportSwal', { static: true }) exportSwal: any;
  @ViewChild('errorSwal', { static: true }) errorSwal: any;
  private subs = new SubSink();
  userForm: UntypedFormGroup;
  currentUser: any;
  companyId: any;
  operation: string;
  isRegistered: boolean;
  selectedEntity: string;
  selectedSchoolType: string;
  selectedSchool: string;
  selectedRncpTitle: string;
  companyName: string;
  isLoading = true;
  companySelect = [];
  nameMentor: string;
  emailValidated: string;
  payloadd;
  // dropdown data

  companyList: any;
  // companies = [{ company_name: 'Company 1', _id: '5b3e06e727a41d7a83376066' }];
  companies: any;
  tempEmail: any;

  schools: any[] = [];
  userTypes: any[] = [];
  CurUser: any;
  isUserAdmtc = false;
  isUserAcadir = false;
  isUserAcadAdmin = false;
  isSubmit = true;
  companyData: any;
  currentCompanyName: any;
  mentorData: any;
  entityData: any;
  companyPass: any;
  dataSwal: any;
  disableForm = true;
  countdownHabis = false;
  isDisabled = true;
  isCase3 = false;
  private intVal: any;
  private timeOutVal: any;
  userTypeList: any[][] = [];

  ispause = new Subject();
  public time = 120;
  timer: Observable<number>;
  timerObserver: PartialObserver<number>;
  isTypeEmail = false;

  selectedUsertype = [];

  isWaitingForResponse;
  dataUserExisting;
  currentUserTypeId;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  countryCodeList: any[] = [];
  dialCodeControl = new UntypedFormControl(null);
  // *************** END OF property to store data of country dial code

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any, // data that come from parent component's dialog.open()
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddCompanyStaffDialogComponent>,
    private userService: UserService,
    private schoolService: SchoolService,
    public translate: TranslateService,
    private companyService: CompanyService,
    private utilService: UtilityService,
    private CurUserService: AuthService,
    private dialog: MatDialog,
    private permission: NgxPermissionsService,
    private router: Router,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.isRegistered = false;
    this.selectedEntity = 'company';
    this.initUserForm();

    this.getUserTypesByEntity();
    if (this.parentData) {
      if(this.parentData?.countryCodeList?.length) this.countryCodeList = this.parentData?.countryCodeList;
      this.currentUser = this.parentData.userData;
      this.operation = this.parentData.operation;
      this.companyId = this.parentData.companyId;
      if (this.operation === 'edit') {
        this.companyPass = this.parentData.companyData;
        this.tempEmail = this.companyPass && this.companyPass.email ? this.companyPass.email : '';
        this.addEntitiesForm();
      } else {
        this.disableFormField();
        const data = {
          entity_name: 'company',
          companies: this.companyId,
        };
        this.entities.get('0').patchValue(data);
        this.isLoading = false;
      }
    }
    this.keyupEmail();
    this.getCompanyData();

    // *************** Function to get data current user
    this.CurUser = this.CurUserService.getLocalStorageUser();
    this.entityData = this.CurUser?.entities.find((entity) => entity?.type?.name === 'Academic Director');
    const isPermission = this.CurUserService.getPermission();
    const currentUserEntity = this.CurUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    // *************** Cek User Type & Permission Access User to Company Data
    this.isUserAcadir = !!this.permission.getPermission('Academic Director');
    this.isUserAcadAdmin = !!this.permission.getPermission('Academic Admin');
    this.isUserAdmtc = this.utilService.isUserEntityADMTC();

    // ======================================================
    this.timer = interval(1000).pipe(takeUntil(this.ispause));
    this.timerObserver = {
      next: (a: number) => {
        if (this.time === 0) {
          this.ispause.next();
        }
        this.time -= 1;
      },
    };
  }

  selectionDialCode(event) {
    this.userForm?.get('phone_number_indicative')?.reset();
    this.userForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  } 

  // *************** Function to generate entity form
  addEntitiesForm() {
    let entities = [];
    this.companyPass.entities.forEach((el) => {
      el.companies.forEach((element) => {
        if (element._id === this.companyId) {
          entities.push(el);
        }
      });
    });
    entities = _.uniqBy(entities, 'type._id');
    for (let i = 0; i < entities.length; i++) {
      if (i > 0) {
        this.addEntities();
      }
    }
    this.getEntitiesData();
  }

  // *************** Function to get data entity
  getEntitiesData() {
    this.subs.sink = this.userService.getUserDialogData(this.companyPass._id).subscribe(
      (resp) => {
        this.currentUser = resp;
        const currCompany = _.cloneDeep(resp);
        let currEntities = [];
        currCompany.entities.forEach((el) => {
          el.companies.forEach((element) => {
            if (element._id === this.companyId) {
              currEntities.push(el);
            }
          });
        });
        currEntities = _.uniqBy(currEntities, 'type._id');
        currCompany.entities = currEntities;
        this.userForm.patchValue(currCompany);
        if(currCompany?.phone_number_indicative) {
          const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === currCompany?.phone_number_indicative)
          if(findIdx >= 0) this.dialCodeControl?.patchValue(this.countryCodeList[findIdx]);
        };

        const entities: any[] = currEntities.map((entity) => {
          const data = {};
          data['entity_name'] = entity.entity_name;
          if (entity.type) {
            data['type'] = entity.type._id;
          }
          if (entity.group_of_school) {
            data['group_of_school'] = entity.group_of_school._id;
          }
          if (entity.school) {
            data['school'] = entity.school._id;
          }
          if (entity.assigned_rncp_title) {
            data['assigned_rncp_title'] = entity.assigned_rncp_title._id;
          }
          if (entity.class) {
            data['class'] = entity.class._id;
          }
          data['school_type'] = entity.school_type;

          return data;
        });

        for (let i = 0; i < entities.length; i++) {
          this.schools.push([]);

          this.entities.get(i.toString()).patchValue(entities[i]);
          this.entities.get(i.toString()).get('companies').setValue(this.companyId);

          this.getUserTypes(entities[i].entity_name, i.toString());
        }
        if (entities.length > 1) {
          this.userTypeList[0] = _.filter(this.userTypes, function (data) {
            return data.value === entities[0].type;
          });
        }
        this.userTypeList[1] = _.filter(this.userTypes, function (data) {
          return data.value !== entities[0].type;
        });

        if (entities && entities.length) {
          entities.forEach((entity) => {
            console.log('ini entity', entity);
            this.selectedUsertype.push(entity.type);
          });
        }

        this.isLoading = false;
      },
      (err) => {
        this.CurUserService.postErrorLog(err);
        console.log('[Response BE][Error] : ', err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
        this.isLoading = false;
      },
    );
  }
  
  // *************** Function to initialize form field
  initUserForm() {
    this.userForm = this.fb.group({
      entities: this.fb.array([this.initEntitiesFormGroup()]),
      civility: [null, Validators.required],
      first_name: [null, [Validators.required, removeSpaces]],
      last_name: [null, [Validators.required, removeSpaces]],
      email: [null, [CustomValidators.email, Validators.required, removeSpaces]],
      position: [null, [removeSpaces]],
      office_phone: ['', [Validators.maxLength(11), CustomValidators.number, removeSpaces]],
      direct_line: ['', [CustomValidators.number, removeSpaces]],
      portable_phone: ['', [Validators.maxLength(11), CustomValidators.number, removeSpaces]],
      phone_number_indicative: [null],
    });
  }

  initEntitiesFormGroup() {
    return this.fb.group({
      entity_name: [this.selectedEntity, Validators.required],
      companies: [this.parentData.companyId],
      type: [null, Validators.required],
      school_type: [null],
      assigned_rncp_title: [null],
      school: [null],
      class: [null],
      group_of_school: [null],
    });
  }
  // *************** End of Function to initialize form field

  // *************** Function to add new entity
  addEntities() {
    const dataType = this.userForm.get('entities').get('0').get('type').value;
    this.userTypeList[1] = _.filter(this.userTypes, function (data) {
      return data.value !== dataType;
    });
    const dataType1 = _.filter(this.userTypes, function (data) {
      return data.value !== dataType;
    });
    this.userTypeList[0] = _.filter(this.userTypes, function (data) {
      return data.value === dataType;
    });
    console.log(dataType1);
    this.entities.push(this.initEntitiesFormGroup());
    this.userForm.get('entities').get('0').get('type').setValue(dataType);
    this.userForm
      .get('entities')
      .get('1')
      .get('type')
      .setValue(dataType1 && dataType1.length ? dataType1[0].value : dataType1);
  }

  // *************** Function to add check entity
  addEntitiesCheck() {
    this.entities.push(this.initEntitiesFormGroup());
  }

  // *************** Function to remove entity
  removeEntities(index: number) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DASHBOARD_DELETE.deletedTitle'),
      html: this.translate.instant('this action will delete entity !'),
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
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);
        clearInterval(this.timeOutVal);
        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.userTypeList[0] = this.userTypes;
        this.entities.removeAt(index);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('EVENT_S1.TITLE'),
          html: this.translate.instant('entity deleted'),
          confirmButtonText: this.translate.instant('ERROR_HANDLER.OK'),
          allowOutsideClick: false,
        });
      }
    });
  }

  get entities(): UntypedFormArray {
    return this.userForm.get('entities') as UntypedFormArray;
  }

  // *************** Function to disable/enable form field
  disableFormField() {
    this.userForm.get('first_name').disable();
    this.userForm.get('last_name').disable();
    this.userForm.get('position').disable();
    this.userForm.get('office_phone').disable();
    this.userForm.get('direct_line').disable();
    this.userForm.get('portable_phone').disable();
    this.userForm.get('phone_number_indicative').disable();
    this.dialCodeControl.disable();
  }
  enableFormField() {
    this.userForm.get('first_name').enable();
    this.userForm.get('last_name').enable();
    this.userForm.get('position').enable();
    this.userForm.get('office_phone').enable();
    this.userForm.get('direct_line').enable();
    this.userForm.get('portable_phone').enable();
    this.userForm.get('phone_number_indicative').enable();
    this.dialCodeControl.enable();
  }
  // *************** End of Function to disable/enable form field

  // *************** Function to check/validate email only
  validateEmail() {
    this.isLoading = true;
    const payload = this.userForm.getRawValue();
    const companyId = this.companyId;
    const email = payload.email;
    this.subs.sink = this.companyService.validateEmailMentor(companyId, email).subscribe(
      (resp) => {
        if (resp) {
          // this.currentCompanyName = resp.mentor.entities[0].companies.company_name;
          this.isLoading = false;
          this.dataSwal = resp.mentor;
          if (resp.message === 'case 1') {
            this.emailValidated = 'no';
            if (this.isUserAcadir || this.isUserAcadAdmin) {
              this.swalMent1();
            } else if (this.isUserAdmtc) {
              this.swalMent2();
            }
          } else if (resp.message === 'case 4') {
            this.emailValidated = 'no';
            // if (this.isUserAcadir || this.isUserAcadAdmin) {
            //   this.swalMent5(resp);
            // } else if (this.isUserAdmtc) {
            //   // this.swalMent6();
            //   this.swalMent5a(resp);
            // }
            this.swalMent5(resp);
            this.isSubmit = true;
          } else if (resp.message === 'case 2') {
            this.emailValidated = 'no';

            this.swalMent3(resp);
            // *************** The swal updated from task QA-023https://docs.google.com/spreadsheets/d/1amFQzAcimUPttkK3lQkG_xptaB_oY4V07lMULviqqQM/edit#gid=946086603
            // if (this.isUserAdmtc) {
            //   this.swalMent3(resp);
            // } else if (this.isUserAcadir || this.isUserAcadAdmin) {
            //   this.timer.subscribe(this.timerObserver);
            //   this.exportSwal.show();
            // } else {
            //   this.makeUserAsCompanyMemberForCase2(resp);
            // }
          } else if (resp.message === 'case 3') {
            // *************** Hide The rules to show swalMent7
            // this.swalMent7(resp);
            this.emailValidated = 'registered';

            this.isCase3 = true;
            this.disableForm = true;
            this.isSubmit = true;
            this.isDisabled = true;

            const tempResp = _.cloneDeep(resp && resp.mentor ? resp.mentor : null);
            const tempResult = _.omitBy(tempResp, _.isNil);
            if (tempResult) {
              delete tempResult.entities;
              delete tempResult.email;
            }
            this.userForm.patchValue(tempResult);
            this.disableFormField();
          } else {
            this.emailValidated = 'yes';
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              html: this.translate.instant('EMAIL_VALID'),
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              allowOutsideClick: false,
            });
            if (this.tempEmail) {
              // this.userForm.reset();
              // this.initUserForm();
              this.userForm.get('email').setValue(email);
              this.tempEmail = email;
              this.isSubmit = true;
            } else {
              this.tempEmail = email;
              this.isSubmit = true;
            }
            this.isDisabled = true;
            this.disableForm = false;
            this.enableFormField();
          }
        } else {
          this.emailValidated = 'yes';
          this.isSubmit = true;
          this.isLoading = false;
          this.isDisabled = true;
          this.disableForm = false;
          this.enableFormField();
        }
      },
      (err) => {
        this.emailValidated = '';
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
        console.log('[Response BE][Error] : ', err);
      },
    );
    this.isTypeEmail = false;
  }

  makeUserAsCompanyMemberForCase2(data) {
    if (data) {
      const user = data?.mentor ? data.mentor : '';
      const company = user?.entities[0]?.companies[0]?.company_name ? user.entities[0].companies[0].company_name : '';
      Swal.fire({
        title: this.translate.instant('NEW_MENT_S5.TITLE', { companyName: company }),
        html: this.translate.instant('NEW_MENT_S5.TEXT', {
          userCivility: user && user.civility ? this.translate.instant(user.civility) : '',
          userFirstName: user && user.first_name ? user.first_name : '',
          userLastName: user && user.last_name ? user.last_name : '',
          userType:
            user && user.entities[0] && user.entities[0].type.name
              ? this.translate.instant('USER_TYPES.' + user.entities[0].type.name)
              : '',
          companyName: company,
        }),
        type: 'warning',
        confirmButtonText: this.translate.instant('NEW_MENT_S5.BUTTON1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('NEW_MENT_S5.BUTTON2'),
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          const payload = [{ entity_name: 'company', type: '6278e027b97bfb30674e76af', companies: [this.parentData?.companyId] }];
          this.subs.sink = this.userService.MakeUserAsCompanyMember(data?.mentor?._id, payload).subscribe((resp) => console.log(resp));
          this.dialogRef.close();
        } else {
          return;
        }
      });
    }
  }

  // *************** Function to check/validate mentor data
  validateMentor() {
    this.isLoading = true;
    if (this.checkFormValidity()) {
      this.isLoading = false;
      return;
    } else {
      if (this.operation !== 'edit') {
        const payload = this.userForm.getRawValue();
        const companyId = this.companyId;
        const first_name = payload.first_name;
        const last_name = payload.last_name;
        const email = payload.email;
        const civility = payload.civility;
        this.nameMentor = civility + ' ' + first_name + ' ' + last_name;
        this.subs.sink = this.companyService.validateMentor(companyId, first_name, last_name, email).subscribe(
          (resp) => {
            if (resp && resp.message !== null) {
              if (resp.mentor !== null) {
                this.dataSwal = resp.mentor;
                this.nameMentor = resp.mentor.civility + ' ' + resp.mentor.first_name + ' ' + resp.mentor.last_name;
                this.mentorData = resp.mentor;
              }
              if (resp.message === 'case 1') {
                if (this.isUserAcadir || this.isUserAcadAdmin) {
                  this.swalMent1();
                } else if (this.isUserAdmtc) {
                  this.swalMent2();
                }
              } else if (resp.message === 'case 2') {
                if (this.isUserAdmtc) {
                  this.swalMent3(resp);
                } else if (this.isUserAcadir || this.isUserAcadAdmin) {
                  this.timer.subscribe(this.timerObserver);
                  this.exportSwal.show();
                }
              } else if (resp.message === 'case 3') {
                // this.swalMent7(resp);
                // ************** Previously disable user to add entities and show sweet alert, now allow them, and user seperate API
                this.submitCase3(resp);
              } else {
                this.submit();
              }
            } else {
              this.submit();
            }
          },
          (err) => {
            this.CurUserService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.submit();
      }
    }
  }

  // *************** Function to open sweat alert NewMent_1 until NewMent_7 based on case mentor creation
  swalMent1() {
    this.isLoading = false;
    Swal.fire({
      title: this.translate.instant('NEW_MENT_S1.TITLE'),
      html: this.translate.instant('NEW_MENT_S1.TEXT', {
        nameMentor: this.nameMentor,
      }),
      type: 'warning',
      confirmButtonText: this.translate.instant('NEW_MENT_S1.BUTTON1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('NEW_MENT_S1.BUTTON2'),
      allowOutsideClick: false,
    }).then((result) => {
      if (result && result.value) {
        const dataClose = {
          regitered: this.isRegistered,
          connectToCompany: true,
          dataMentor: this.mentorData,
        };
        this.dialogRef.close(dataClose);
      }
    });
  }
  swalMent2() {
    this.isLoading = false;
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('NEW_MENT_S2.TITLE'),
      html: this.translate.instant('NEW_MENT_S2.TEXT'),
      type: 'info',
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('NEW_MENT_S2.BUTTON', { timer: timeDisabled }),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const time = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('NEW_MENT_S2.BUTTON') + ' in ' + timeDisabled + ' sec';
        }, 1000);

        setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('NEW_MENT_S2.BUTTON');
          Swal.enableConfirmButton();
          clearTimeout(time);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      const dataClose = {
        regitered: this.isRegistered,
        connectToCompany: false,
        dataMentor: null,
        cancel: false,
      };
      this.dialogRef.close(dataClose);
    });
  }
  swalMent3(resp) {
    const mentor = resp && resp.mentor ? resp.mentor : '';
    const company =
      mentor &&
      mentor.entities &&
      mentor.entities[0] &&
      mentor.entities[0].companies &&
      mentor.entities[0].companies[0] &&
      mentor.entities[0].companies[0].company_name
        ? mentor.entities[0].companies[0].company_name
        : '';
    const html = company
      ? this.translate.instant('NEW_MENT_S3.TEXT', {
          nameMentor:
            (mentor && mentor.civility ? this.translate.instant(mentor.civility) : '') +
            ' ' +
            (mentor && mentor.last_name ? mentor.last_name?.toUpperCase() : '') +
            ' ' +
            (mentor && mentor.first_name ? mentor.first_name : ''),
          current: company,
          NewCompanyName: this.companyName,
        })
      : this.translate.instant('NEW_MENT_S3B.TEXT', {
          nameMentor:
            (mentor && mentor.civility ? this.translate.instant(mentor.civility) : '') +
            ' ' +
            (mentor && mentor.last_name ? mentor.last_name?.toUpperCase() : '') +
            ' ' +
            (mentor && mentor.first_name ? mentor.first_name : ''),
          NewCompanyName: this.companyName,
        });
    this.isLoading = false;
    Swal.fire({
      title: this.translate.instant('NEW_MENT_S3.TITLE'),
      html: html,
      type: 'question',
      confirmButtonText: this.translate.instant('NEW_MENT_S3.BUTTON1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('NEW_MENT_S3.BUTTON2'),
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        const payload = this.userForm.getRawValue();
        const email = payload.email;
        this.isLoading = false;
        this.subs.sink = this.companyService.getOneMentorId(email).subscribe(
          (resps: any) => {
            this.subs.sink = this.companyService.connectSchoolToMentorADMTC(resps._id, this.companyId).subscribe(
              (response) => {
                this.isLoading = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('USER_UPDATED.TITLE'),
                  text: this.translate.instant('USER_UPDATED.TEXT'),
                  confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
                });
                this.isRegistered = true;
                const dataClose = {
                  regitered: this.isRegistered,
                  connectToCompany: false,
                  dataMentor: null,
                  cancel: false,
                };
                this.dialogRef.close(dataClose);
              },
              (err) => {
                this.isLoading = false;
                this.CurUserService.postErrorLog(err);
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          },
          (err) => {
            this.isLoading = false;
            this.CurUserService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    });
  }
  swalMent4() {
    Swal.close();
    const payload = this.userForm.getRawValue();
    const email = payload.email;
    this.isLoading = false;
    this.subs.sink = this.companyService.getOneMentorId(email).subscribe(
      (resp: any) => {
        this.subs.sink = this.companyService.connectSchoolToMentor(resp._id, this.companyId, this.entityData.school._id).subscribe(
          (response) => {
            this.isLoading = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('USER_UPDATED.TITLE'),
              text: this.translate.instant('USER_UPDATED.TEXT'),
              confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
            });
            this.isRegistered = true;
            const dataClose = {
              regitered: this.isRegistered,
              connectToCompany: false,
              dataMentor: null,
              cancel: false,
            };
            this.dialogRef.close(dataClose);
          },
          (err) => {
            this.isLoading = false;
            this.CurUserService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      },
      (err) => {
        this.isLoading = false;
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  swalMent5(resp) {
    this.isSubmit = true;
    this.isLoading = false;
    const user = resp && resp.mentor ? resp.mentor : '';
    const tempCompanies = user.entities;
    const parentDataCompany = tempCompanies.filter((companys) => companys?.companies[0]?.company_name === this.companyName);
    const company = parentDataCompany[0]?.companies[0]?.company_name ? parentDataCompany[0]?.companies[0]?.company_name : '';
    Swal.fire({
      title: this.translate.instant('NEW_MENT_S5.TITLE', { companyName: company }),
      html: this.translate.instant('NEW_MENT_S5.TEXT', {
        userCivility: user && user.civility ? this.translate.instant(user.civility) : '',
        userFirstName: user && user.first_name ? user.first_name : '',
        userLastName: user && user.last_name ? user.last_name : '',
        userType:
          user && user.entities[0] && user.entities[0].type.name ? this.translate.instant('USER_TYPES.' + user.entities[0].type.name) : '',
        companyName: company,
      }),
      type: 'warning',
      confirmButtonText: this.translate.instant('NEW_MENT_S5.BUTTON1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('NEW_MENT_S5.BUTTON2'),
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        // this.router.navigate(['users', 'user-list'], { queryParams: { user: user._id } });
        this.dialogRef.close();
      } else {
        return;
      }
    });
  }
  swalMent6() {
    this.isLoading = false;
    Swal.fire({
      title: this.translate.instant('NEW_MENT_S6.TITLE'),
      type: 'info',
      confirmButtonText: this.translate.instant('NEW_MENT_S6.BUTTON1'),
      allowOutsideClick: false,
    }).then((result) => {
      this.isRegistered = true;
      const dataClose = {
        regitered: this.isRegistered,
        connectToCompany: false,
        dataMentor: null,
        cancel: false,
      };
      this.dialogRef.close(dataClose);
    });
  }
  swalMent7(resp) {
    const mentor = resp && resp.mentor ? resp.mentor : '';
    this.isLoading = false;
    Swal.fire({
      title: this.translate.instant('NEW_MENT_S7.TITLE'),
      html: this.translate.instant('NEW_MENT_S7.TEXT', {
        nameMentor:
          (mentor && mentor.civility ? mentor.civility : '') +
          ' ' +
          (mentor && mentor.first_name ? mentor.first_name : '') +
          ' ' +
          (mentor && mentor.last_name ? mentor.last_name : ''),
      }),
      type: 'info',
      confirmButtonText: this.translate.instant('NEW_MENT_S7.BUTTON1'),
      allowOutsideClick: false,
    }).then((result) => {
      this.isRegistered = true;
      const dataClose = {
        regitered: this.isRegistered,
        connectToCompany: false,
        dataMentor: null,
        cancel: false,
      };
      this.dialogRef.close(dataClose);
    });
  }
  // *************** End of Function to open sweat alert NewMent_1 until NewMent_7 based on case mentor creation

  // *************** Function to get All mentor from school
  getAllMentorFromSchool() {
    this.subs.sink = this.companyService.populateDataMentor(this.companyId, this.entityData.school._id).subscribe(
      (resp) => {
        const entities: any[] = resp.map((entity) => entity._id);
      },
      (err) => {
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // *************** Function to create/update data mentor
  submit() {
    this.isLoading = true;
    let payload = this.userForm.getRawValue();
    let editPayload;
    const logginUserId = this.parentData?.logginUserId && this.parentData?.from === 'financement' ? this.parentData.logginUserId : null;

    if (this.operation === 'edit') {
      editPayload = this.userForm.getRawValue();
      this.currentUser.entities.forEach((entity) => {
        entity.companies.forEach((element) => {
          let isFound = false;
          if (element._id === this.companyId) {
            isFound = true;
          }
          if (!isFound) {
            const data = {};
            data['entity_name'] = entity.entity_name;
            if (entity.type) {
              data['type'] = entity.type._id;
            }
            if (entity.group_of_school) {
              data['group_of_school'] = entity.group_of_school._id;
            }
            if (entity.school) {
              data['school'] = entity.school._id;
            }
            if (entity.assigned_rncp_title) {
              data['assigned_rncp_title'] = entity.assigned_rncp_title._id;
            }
            if (entity.class) {
              data['class'] = entity.class._id;
            }
            if (entity.companies) {
              console.log('element', element._id);
              data['companies'] = [element._id];
            }
            data['school_type'] = entity.school_type;
            editPayload.entities.push(data);
          }
        });
      });
      payload = editPayload;

      const editedUserData = this.parentData && this.parentData.companyData ? this.parentData.companyData : null;
      if (payload && payload.entities && payload.entities.length && editedUserData) {
        payload.entities.forEach((entity) => {
          if (entity && entity.entity_name === 'company' && entity.companies && typeof entity.companies === 'string') {
            const companies = [entity.companies];
            if (editedUserData.entities && editedUserData.entities.length) {
              editedUserData.entities.forEach((beforeEditEntity) => {
                if (
                  beforeEditEntity &&
                  beforeEditEntity.entity_name === 'company' &&
                  beforeEditEntity.type &&
                  entity.type === beforeEditEntity.type._id &&
                  beforeEditEntity.companies &&
                  beforeEditEntity.companies.length
                ) {
                  beforeEditEntity.companies.forEach((company) => {
                    if (!companies.includes(company._id)) {
                      companies.push(company._id);
                    }
                  });
                }
              });
            }
            entity.companies = companies;
          }
        });
      }
    }

    if (payload.entities.length > 1) {
      const company = _.uniqBy(payload.entities, 'companies');
      const data = _.uniqBy(payload.entities, 'type');
      if (data.length < payload.entities.length && company.length !== payload.entities.length) {
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('DUPLICATE_USER_TYPE.TITLE'),
          text: this.translate.instant('DUPLICATE_USER_TYPE.TEXT'),
          confirmButtonText: this.translate.instant('DUPLICATE_USER_TYPE.BUTTON'),
        });
      } else {
        for (let i = 0; i < payload.entities.length; i++) {
          // dont send school_type if the value is empty
          if (!payload.entities[i]['school_type']) {
            delete payload.entities[i]['school_type'];
          }
        }

        if (this.operation === 'edit') {
          this.subs.sink = this.userService.updateUser(this.currentUser._id, payload, this.currentUserTypeId).subscribe(
            (resp) => {
              this.isLoading = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('USER_UPDATED.TITLE'),
                text: this.translate.instant('USER_UPDATED.TEXT'),
                confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
              });
              this.isRegistered = true;
              const dataClose = {
                regitered: this.isRegistered,
                connectToCompany: false,
                dataMentor: null,
                cancel: false,
              };
              this.dialogRef.close(dataClose);
            },
            (err) => {
              this.isLoading = false;
              this.CurUserService.postErrorLog(err);
              if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
                Swal.fire({
                  title: this.translate.instant('USER_S15.TITLE'),
                  html: this.translate.instant('USER_S15.TEXT'),
                  type: 'info',
                  showConfirmButton: true,
                  confirmButtonText: this.translate.instant('USER_S15.OK'),
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
          this.subs.sink = this.userService.registerUser(payload, logginUserId, this.currentUserTypeId).subscribe(
            (resp) => {
              this.isLoading = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('USER_S9.TITLE'),
                text: this.translate.instant('USER_S9.TEXT', {
                  civility: this.translate.instant(resp.civility),
                  lastName: resp.first_name,
                  firstName: resp.last_name,
                }),
                confirmButtonText: this.translate.instant('USER_S9.OK'),
              }).then(() => {
                this.isRegistered = true;
                const dataClose = {
                  regitered: this.isRegistered,
                  connectToCompany: false,
                  dataMentor: null,
                  cancel: false,
                  mentorResp: resp,
                };
                if (this.isUserAcadir || this.isUserAcadAdmin) {
                  dataClose.connectToCompany = true;
                  dataClose.dataMentor = resp;
                }
                console.log('ini data user yang di register', dataClose);
                this.dialogRef.close(dataClose);
              });
            },
            (err) => {
              this.isLoading = false;
              this.CurUserService.postErrorLog(err);
              if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
                Swal.fire({
                  title: this.translate.instant('USER_S15.TITLE'),
                  html: this.translate.instant('USER_S15.TEXT'),
                  type: 'info',
                  showConfirmButton: true,
                  confirmButtonText: this.translate.instant('USER_S15.OK'),
                });
              } else if (err['message'] === 'GraphQL error: Email Exist') {
                Swal.fire({
                  title: this.translate.instant('USER_S16.TITLE'),
                  html: this.translate.instant('USER_S16.TEXT'),
                  type: 'info',
                  showConfirmButton: true,
                  confirmButtonText: this.translate.instant('USER_S16.OK'),
                });
              } else if (err['message'] === 'GraphQL error: user was already created but the status is deleted') {
                // this.getDataUser();
                this.registerExistingUser();
                // this.timer.subscribe(this.timerObserver);
                // this.errorSwal.show();
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
    } else {
      for (let i = 0; i < payload.entities.length; i++) {
        // dont send school_type if the value is empty
        if (!payload.entities[i]['school_type']) {
          delete payload.entities[i]['school_type'];
        }
        // dont send field company for a while until it get impelemneted in BE
        // delete payload.entities[i]['company'];
      }

      if (this.operation === 'edit') {
        this.subs.sink = this.userService.updateUser(this.currentUser._id, payload, this.currentUserTypeId).subscribe(
          (resp) => {
            this.isLoading = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('USER_UPDATED.TITLE'),
              text: this.translate.instant('USER_UPDATED.TEXT'),
              confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
            });
            this.isRegistered = true;
            const dataClose = {
              regitered: this.isRegistered,
              connectToCompany: false,
              dataMentor: null,
              cancel: false,
            };
            this.dialogRef.close(dataClose);
          },
          (err) => {
            this.isLoading = false;
            this.CurUserService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
              Swal.fire({
                title: this.translate.instant('USER_S15.TITLE'),
                html: this.translate.instant('USER_S15.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('USER_S15.OK'),
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
        this.subs.sink = this.userService.registerUser(payload, logginUserId, this.currentUserTypeId).subscribe(
          (resp) => {
            this.isLoading = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('USER_S9.TITLE'),
              text: this.translate.instant('USER_S9.TEXT', {
                civility: this.translate.instant(resp.civility),
                lastName: resp.first_name,
                firstName: resp.last_name,
              }),
              confirmButtonText: this.translate.instant('USER_S9.OK'),
            }).then(() => {
              this.isRegistered = true;
              const dataClose = {
                regitered: this.isRegistered,
                connectToCompany: false,
                dataMentor: null,
                cancel: false,
                mentorResp: resp,
              };
              if (this.isUserAcadir || this.isUserAcadAdmin) {
                dataClose.connectToCompany = true;
                dataClose.dataMentor = resp;
              }
              this.dialogRef.close(dataClose);
            });
          },
          (err) => {
            this.isLoading = false;
            this.CurUserService.postErrorLog(err);
            console.log('ini err', err);
            if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
              Swal.fire({
                title: this.translate.instant('USER_S15.TITLE'),
                html: this.translate.instant('USER_S15.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('USER_S15.OK'),
              });
            } else if (err['message'] === 'GraphQL error: Email Exist') {
              Swal.fire({
                title: this.translate.instant('USER_S16.TITLE'),
                html: this.translate.instant('USER_S16.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('USER_S16.OK'),
              });
            } else if (err['message'] === 'GraphQL error: user was already created but the status is deleted') {
              // this.getDataUser();
              this.registerExistingUser();
              // this.timer.subscribe(this.timerObserver);
              // this.errorSwal.show();
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
  }

  checkFormValidity(): boolean {
    console.log(this.userForm.value);
    if (this.userForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      this.userForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  // *************** Called when user is already registered
  submitCase3(resp) {
    const payload = this.userForm.getRawValue();
    if (resp && resp.mentor) {
      const user = _.cloneDeep(resp.mentor);

      // const tempPayload = payload.entities;
      const tempEntitiies = [];
      if (payload && payload.entities && payload.entities.length) {
        payload.entities.forEach((entity) => {
          tempEntitiies.push(_.omitBy(entity, _.isNil));
        });
      }

      const tempPayload = tempEntitiies;

      this.subs.sink = this.userService.MakeUserAsCompanyMember(user._id, tempPayload).subscribe(
        (response) => {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('USER_UPDATED.TITLE'),
            text: this.translate.instant('USER_UPDATED.TEXT'),
            confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
          }).then(() => {
            this.isRegistered = true;
            const dataClose = {
              regitered: this.isRegistered,
              connectToCompany: false,
              dataMentor: null,
              cancel: false,
            };
            if (this.isUserAcadir || this.isUserAcadAdmin) {
              dataClose.connectToCompany = true;
              dataClose.dataMentor = response;
            }
            this.dialogRef.close(dataClose);
          });
          // this.isRegistered = true;
          // const dataClose = {
          //   regitered: this.isRegistered,
          //   connectToCompany: false,
          //   dataMentor: null,
          //   cancel: false,
          // };
          // this.dialogRef.close(dataClose);
        },
        (err) => {
          this.isLoading = false;
          this.CurUserService.postErrorLog(err);
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

  // *************** Function to close dialog
  closeDialog() {
    const dataClose = {
      regitered: this.isRegistered,
      connectToCompany: false,
      dataMentor: null,
      cancel: true,
    };
    this.dialogRef.close(dataClose);
  }

  // *************** Function to get data user type company
  getUserTypes(event, index?: string) {
    this.selectedEntity = event;

    if (this.selectedEntity === 'company') {
      this.subs.sink = this.schoolService.getAllSchoolIdAndShortName().subscribe(
        (schools) => {
          const schoolArray = schools.map((school) => {
            return { value: school._id, label: school.short_name };
          });
          this.schools = schoolArray;
        },
        (err) => {
          console.log('[Response BE][Error] : ', err);
          this.CurUserService.postErrorLog(err);
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

  // *************** Function to get company data
  getCompanyData() {
    this.subs.sink = this.companyService.getOneCompany(this.companyId).subscribe(
      (resp: any) => {
        // this.companyList = resp;
        this.companies = resp;
        this.companyName = resp.company_name ? resp.company_name : '';
      },
      (err) => {
        console.log('[Response BE][Error] : ', err);
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // *************** Function to get data user type based on entity selected
  getUserTypesByEntity() {
    this.isLoading = true;
    this.subs.sink = this.companyService.getUserTypesByEntity(this.selectedEntity).subscribe(
      (userTypes) => {
        // *************** Hide Mentor and CEO user type
        const userTypeFilter = userTypes.filter((type) => type.name !== 'CEO');
        const userTypesArray = userTypeFilter.map((type) => {
          return { value: type?._id, label: type?.name };
        });
        this.userTypes = userTypesArray;
        // *************** Auto populate usertype contact company
        this.userForm.get('entities').get('0').get('type').setValue(this.userTypes[0].value);
        this.userTypeList[0] = userTypesArray;
        this.userTypeList[1] = userTypesArray;
        this.isLoading = false;
      },
      (err) => {
        console.log('[Response BE][Error] : ', err);
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // *************** Function to patch data mentor (Operation edit mentor)
  patchMentorData(id, email) {
    this.subs.sink = this.companyService.getOneMentor(id, email).subscribe(
      (resp: any) => {
        this.currentUser = resp;

        const entities: any[] = resp.entities.map((entity) => {
          const data = {};
          data['entity_name'] = entity.entity_name;
          if (entity.type) {
            data['type'] = entity.type._id;
          }
          return data;
        });
        if (entities.length > 1) {
          this.addEntitiesCheck();
        }
        this.userForm.patchValue(resp);
        for (let i = 0; i < entities.length; i++) {
          this.entities.get(i.toString()).patchValue(entities[i]);
          this.entities.get(i.toString()).get('companies').setValue(this.companyId);
          // this.entities.get(i.toString()).get('type').setValue(entities[i].type._id);

          this.getUserTypes(entities[i].entity_name, i.toString());
        }
        this.isLoading = false;
        // this.operation = 'edit';
        this.disableForm = false;
        this.enableFormField();
      },
      (err) => {
        console.log('[Response BE][Error] : ', err);
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // *************** Function to event listener key up email
  keyupEmail() {
    this.subs.sink = this.userForm
      .get('email')
      .valueChanges.pipe(debounceTime(200))
      .subscribe((search) => {
        this.isTypeEmail = true;
        if (search && search.length >= 3) {
          this.isDisabled = false;
          if (this.tempEmail && this.tempEmail === search) {
            this.isTypeEmail = false;
            this.enableFormField();
            this.isSubmit = true;
            this.disableForm = false;
            this.isDisabled = true;
          } else {
            this.isDisabled = false;
            this.disableForm = true;
            this.disableFormField();
          }
        } else {
          this.isDisabled = true;
          this.disableForm = true;
          this.disableFormField();
        }
      });
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }

  // *************** Function to dispaying error phone field
  showErrors() {
    console.log('error', this.userForm.get('office_phone'));
    console.log('error', this.userForm.get('office_phone').errors);
  }

  // *************** Function to close sweat alert NewMent_S4
  closeSwal() {
    Swal.close();
    this.isLoading = false;
    this.isRegistered = true;
    const dataClose = {
      regitered: this.isRegistered,
      connectToCompany: false,
      dataMentor: null,
      cancel: false,
    };
    this.dialogRef.close(dataClose);
  }

  // *************** Function to open ask revision dialog
  openRevisionMentor() {
    Swal.close();
    const payload = this.userForm.getRawValue();
    const email = payload.email;
    this.isLoading = false;
    this.subs.sink = this.companyService.getOneMentorId(email).subscribe(
      (resp) => {
        this.dialog
          .open(AskRevisionDialogComponent, {
            minWidth: '505px',
            width: '590px',
            minHeight: '100px',
            panelClass: 'certification-rule-pop-up',
            disableClose: true,
            data: {
              reqNumber: '_2',
              companyId: this.companyId,
              userLogin: this.CurUser._id,
              dataMentor: resp,
            },
          })
          .afterClosed()
          .subscribe((e) => {
            this.isRegistered = true;
            const dataClose = {
              regitered: this.isRegistered,
              connectToCompany: false,
              dataMentor: null,
              cancel: false,
            };
            this.dialogRef.close(dataClose);
          });
      },
      (err) => {
        this.CurUserService.postErrorLog(err);
      },
    );
  }

  // *************** Function to countdown button submit in newMent_S4
  secondsToHms(d) {
    d = Number(d);
    const s = Math.floor((d % 25) % 5);
    let sDisplay = s > 0 ? s + (s === 1 ? '' : '') : '5';
    sDisplay = sDisplay + 's';
    if (s === 1) {
      this.countdownHabis = true;
    }
    if (this.countdownHabis) {
      sDisplay = this.translate.instant('NEW_MENT_S4.BUTTON1');
    }
    return sDisplay;
  }

  // *************** Function to validate user type
  userTypeValidate(event) {
    this.userTypeList[1] = _.filter(this.userTypes, function (data) {
      return data.value !== event.value;
    });
  }

  registerExistingUser() {
    // to prevent adding 2 same entity
    const selectedEntity: Entity = this.entities.value;
    const entities: Entity[] = this.entities.value;
    let isEntityExist = false;
    entities.forEach((entity) => {
      isEntityExist = JSON.stringify(selectedEntity) === JSON.stringify(entity);
    });
    if (isEntityExist) {
      Swal.fire({ type: 'warning', title: this.translate.instant('ENTITY_EXIST') });
      return;
    }

    const payload = this.userForm.getRawValue();

    for (let i = 0; i < payload.entities.length; i++) {
      // dont send school_type if the value is empty
      if (!payload.entities[i]['school_type']) {
        delete payload.entities[i]['school_type'];
      }
    }

    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.registerUserExisting(payload, null, this.currentUserTypeId).subscribe(
      (resp) => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('USER_S9.TITLE'),
          text: this.translate.instant('USER_S9.TEXT', {
            civility: this.translate.instant(resp.civility),
            lastName: resp.first_name,
            firstName: resp.last_name,
          }),
          confirmButtonText: this.translate.instant('USER_S9.OK'),
        });
        this.isWaitingForResponse = false;
        this.isRegistered = true;

        const dataClose = {
          regitered: this.isRegistered,
          connectToCompany: false,
          dataMentor: null,
          cancel: false,
          mentorResp: resp,
        };
        // if (this.isUserAcadir || this.isUserAcadAdmin) {
        //   dataClose.connectToCompany = true;
        //   dataClose.dataMentor = resp;
        // }
        this.dialogRef.close(dataClose);
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.CurUserService.postErrorLog(err);
        if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
          Swal.fire({
            title: this.translate.instant('USER_S15.TITLE'),
            html: this.translate.instant('USER_S15.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S15.OK'),
          });
        } else if (err['message'] === 'GraphQL error: Email Exist') {
          Swal.fire({
            title: this.translate.instant('USER_S16.TITLE'),
            html: this.translate.instant('USER_S16.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S16.OK'),
          });
        } else if (err['message'] === 'GraphQL error: user was already created but the status is deleted') {
          // this.timer.subscribe(this.timerObserver);
          // this.errorSwal.show();
          this.registerExistingUser();
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

  openUpdateUser() {
    // to prevent adding 2 same entity
    // const selectedEntity: Entity = this.userEntityForm.value;
    const entities: Entity[] = this.entities.value;

    const payload = _.cloneDeep(this.dataUserExisting);
    // const payloadEntity = this.userEntityForm.getRawValue();
    payload.status = 'active';
    delete payload._id;
    delete payload.entities;
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.updateUserExisting(this.dataUserExisting._id, payload, this.currentUserTypeId).subscribe(
      (resp) => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('USER_UPDATED.TITLE'),
          text: this.translate.instant('USER_UPDATED.TEXT'),
          confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
        });
        this.isWaitingForResponse = false;
        this.isRegistered = true;

        const dataClose = {
          regitered: this.isRegistered,
          connectToCompany: false,
          dataMentor: null,
          cancel: false,
        };
        if (this.isUserAcadir || this.isUserAcadAdmin) {
          dataClose.connectToCompany = true;
          dataClose.dataMentor = resp;
          this.dialogRef.close(dataClose);
        } else {
          this.subs.sink = this.companyService.connectSchoolToMentorADMTC(resp._id, this.companyId).subscribe(
            (response) => {
              this.isLoading = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('USER_UPDATED.TITLE'),
                text: this.translate.instant('USER_UPDATED.TEXT'),
                confirmButtonText: this.translate.instant('USER_UPDATED.OK'),
              });
              this.isRegistered = true;
              const dataCloseADMTC = {
                regitered: this.isRegistered,
                connectToCompany: false,
                dataMentor: null,
                cancel: false,
              };
              this.dialogRef.close(dataCloseADMTC);
            },
            (err) => {
              this.CurUserService.postErrorLog(err);
            },
          );
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.CurUserService.postErrorLog(err);
        if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
          Swal.fire({
            title: this.translate.instant('USER_S15.TITLE'),
            html: this.translate.instant('USER_S15.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S15.OK'),
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

  getDataUser() {
    this.subs.sink = this.userService.getUserDialogData(this.currentUser._id).subscribe(
      (resp) => {
        this.dataUserExisting = resp;
        this.timer.subscribe(this.timerObserver);
        this.errorSwal.show();
      },
      (err) => {
        this.CurUserService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  /*   initFilter(){
    this.subs.sink = this.userForm.get('email').valueChanges.pipe(debounceTime(400)).subscribe((text) => {
      console.log('form binding text = ')
      console.log(text)

    });
  } */
}
