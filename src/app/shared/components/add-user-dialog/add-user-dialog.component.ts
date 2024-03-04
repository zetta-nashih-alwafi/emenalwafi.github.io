import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { UserService } from 'app/service/user/user.service';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { CountryService } from 'app/shared/services/country.service';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  selector: 'ms-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss'],
})
export class AddUserDialogComponent implements OnInit {
  @ViewChild('mobileNumber', { static: false }) mobileNumberInput;
  private subs = new SubSink();
  addNewUserForm: UntypedFormGroup;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  countryCodeList;
  dialCodeControl = new UntypedFormControl(null);
  // *************** END OF property to store data of country dial code

  isWaitingForResponse = false;
  currentUser: any;
  isAlreadyRegistered = true;
  isVerifyingEmail: boolean;
  titleDialog;
  is_email_invalid;
  currentUserTypeId: any;
  emailDomainList = [
    'brassart.fr',
    'efap.com',
    'icart.fr',
    'efj.fr',
    'cread.fr',
    'ecole-mopa.fr',
    'esec.edu',
    'groupe-edh.com',
    'zetta-edh.com',
    'mbadmb.com',
    'intervenantedh-ext.com',
    '3wa.fr',
    'mode-estah.com',
    'esec.fr',
    '3wacademy.fr'
  ];
  tempEmail;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private translate: TranslateService,
    public coreService: CoreService,
    private teacherManagementService: TeacherManagementService,
    private countryService: CountryService,
    private utilService: UtilityService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initForm();
    this.setTitleDialog();
    this.initEmail();
    this.getAllCountryCodes();
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  selectionDialCode(event) {
    this.addNewUserForm?.get('phone_number_indicative')?.reset();
    this.addNewUserForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  setTitleDialog() {
    if (this.parentData && this.parentData.type && this.parentData.type === 'create-teacher') {
      this.titleDialog = 'Add Teacher';
    } else {
      this.titleDialog = 'Add New User';
    }
  }

  initForm() {
    this.addNewUserForm = this.fb.group({
      civility: ['', [Validators.required]],
      email: ['', [CustomValidators.email, Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      office_phone: ['', [Validators.maxLength(11), CustomValidators.number]],
      portable_phone: ['', [CustomValidators.number]],
      phone_number_indicative: [null],
      position: [null, [Validators.required]],
    });
  }
  initEmail() {
    this.addNewUserForm.get('email').valueChanges.subscribe((text) => {
      if (!this.isAlreadyRegistered) {
        this.isAlreadyRegistered = true;
        this.isVerifyingEmail = false;
      }
    });
  }

  verifyEmail() {
    this.isVerifyingEmail = true;
    const isValidateEmail = this.parentData?.from === 'user' ? true : null;
    this.tempEmail = this.addNewUserForm.get('email').value;
    this.subs.sink = this.userService.verifyEmail(this.addNewUserForm.get('email').value, isValidateEmail).subscribe(
      (resp) => {
        // Validation for use email domain EDH
        if (!resp?._id && resp?.incorrect_email) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SWAL_VALIDITY_EMAIL.TITLE'),
              html: this.translate.instant('SWAL_VALIDITY_EMAIL.TEXT', {
                emailDomainList: this.emailDomainList.map((item) => `<li>${item}</li>`).join(''),
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('SWAL_VALIDITY_EMAIL.BUTTON'),
            }).then(() => {
              this.dialogRef.close();
            });
            return;
        }

        if (resp?._id) {
          this.isVerifyingEmail = false;
          // fire swal that user already existed
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_USER_EXIST.TITLE'),
            text: this.translate.instant('SWAL_USER_EXIST.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_USER_EXIST.BUTTON_1'),
            showCancelButton: true,
            cancelButtonText: this.translate.instant('SWAL_USER_EXIST.BUTTON_2'),
          }).then((action) => {
            if (action.value) {
              this.router.navigate(['/users/user-list'], { queryParams: { user: resp._id } });
            }
            this.dialogRef.close();
          });
        } else {
          this.isAlreadyRegistered = false;
        }
      },
      (err) => {
        this.isVerifyingEmail = false;
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
          if( err['message']?.includes('GraphQL error: This Email Already Used As Student')){
              const errorMessage = err['message'].replaceAll('GraphQL error: This Email Already Used As Student', '');
              let studentData;
              if(errorMessage?.includes('MRS')) {
                studentData = errorMessage.replace(/\sMRS\s/gi, `${this.translate.instant('CARDDETAIL.MRS')} `);
              } else if(errorMessage?.includes('MR')) {
                studentData = errorMessage.replace(/\sMR\s/gi, `${this.translate.instant('CARDDETAIL.MR')} `);
              }

              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Checkavailability_S2.TITLE'),
                text: this.translate.instant('Checkavailability_S2.TEXT', {
                  student: studentData
                }),
                footer: `<span style="margin-left: auto">Checkavailability_S2</span>`,
                confirmButtonText: this.translate.instant('Checkavailability_S2.BTN'),
              }).then(() => {
                return;
              });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        }
      },
    );
  }

  checkFormValidity(): boolean {
    if (this.addNewUserForm.invalid) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addNewUserForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    const type = this.parentData && this.parentData.type ? this.parentData.type : '';
    if (type === 'create-teacher') {
      this.isWaitingForResponse = true;
      const payload = _.cloneDeep(this.addNewUserForm.value);
      this.createTeacher(payload);
    } else {
      this.isWaitingForResponse = true;
      const payload = _.cloneDeep(this.addNewUserForm.value);
      this.createUser(payload);
    }
  }

  createUser(payload) {
    this.subs.sink = this.userService.registerUser(payload, null, this.currentUserTypeId).subscribe(
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
          this.dialogRef.close(resp);
        });
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error);
        console.log(error.message);
        if (error.message && error.message === 'GraphQL error: Phone Number Exist') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_PHONE_EXIST.TITLE'),
            text: this.translate.instant('SWAL_PHONE_EXIST.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_PHONE_EXIST.BUTTON_1'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((action) => {
            if (action.value) {
              (this.mobileNumberInput.nativeElement as HTMLInputElement).focus();
              return;
            }
          });
        } else if (error && error['message'] && error['message'].includes('Invalid Email')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SWAL_VALIDITY_EMAIL.TITLE'),
            html: this.translate.instant('SWAL_VALIDITY_EMAIL.TEXT', {
              emailDomainList: this.emailDomainList.map((item) => `<li>${item}</li>`).join(''),
            }),
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            confirmButtonText: this.translate.instant('SWAL_VALIDITY_EMAIL.BUTTON'),
          }).then(() => {
            this.isAlreadyRegistered = false;
          });
          return;
        }
        if (error.message && error.message === 'GraphQL error: user was already created but the status is deleted') {
          this.isWaitingForResponse = true;
          this.subs.sink = this.userService.registerUserExisting(payload, null, this.currentUserTypeId).subscribe(
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
                this.dialogRef.close(resp);
              });
            },
            (err) => {
              this.isWaitingForResponse = false;
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
      },
    );
  }

  createTeacher(payload) {
    this.subs.sink = this.teacherManagementService.createTeacher(payload).subscribe(
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
          this.is_email_invalid = false;
          this.dialogRef.close(resp);
        });
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error);
        console.log(error.message);
        if (error.message && error.message === 'GraphQL error: Phone Number Exist') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_PHONE_EXIST.TITLE'),
            text: this.translate.instant('SWAL_PHONE_EXIST.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_PHONE_EXIST.BUTTON_1'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((action) => {
            if (action.value) {
              (this.mobileNumberInput.nativeElement as HTMLInputElement).focus();
              return;
            }
          });
        }

        if (error.message && error.message === 'GraphQL error: user was already created but the status is deleted') {
          this.isWaitingForResponse = true;
          this.subs.sink = this.userService.registerUserExisting(payload, null, this.currentUserTypeId).subscribe(
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
                this.dialogRef.close(resp);
              });
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.authService.postErrorLog(err);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
        if (error.message && error.message === 'GraphQL error: Invalid Email') {
          this.is_email_invalid = true;
          // this.addNewUserForm.get('email').markAsTouched({onlySelf: true});
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
