import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ApplicationUrls } from 'app/shared/settings';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-school-detail',
  templateUrl: './school-detail.component.html',
  styleUrls: ['./school-detail.component.scss'],
})
export class SchoolDetailComponent implements OnInit {
  @ViewChild('uploadLogo', { static: false }) uploadLogo: ElementRef;
  @ViewChild('uploadStamp', { static: false }) uploadStamp: ElementRef;

  private subs = new SubSink();
  @Input() schoolId;
  schoolForm: UntypedFormGroup;

  isWaitingForResponse = false;
  isUploading = false;
  isUploadingStamp = false;
  private timeOutVal: any;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  schoolData: any;
  isOperator: boolean;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private sanitizer: DomSanitizer,
    private fileUploadService: FileUploadService,
    private intakeService: IntakeChannelService,
    private router: Router,
    private utilService: UtilityService,
    private permissions: NgxPermissionsService,
    public permissionService:PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isOperator = !!this.permissions.getPermission('operator_dir') || !!this.permissions.getPermission('operator_admin');
    this.formInit();
    if (this.schoolId) {
      this.getSchoolData();
    }
  }

  getSchoolData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetOneSchool(this.schoolId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.schoolData = _.cloneDeep(resp);
          if (this.schoolData) {
            this.schoolForm.patchValue(this.schoolData);
          }
          if (resp?.platform_account === null){
            this.schoolForm.get('platform_account').setValue("null");
          };
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
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
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  formInit() {
    this.schoolForm = this.fb.group({
      school_logo: [null],
      platform_account: [null],
      school_stamp: [null],
      short_name: [null, [Validators.required, removeSpaces]],
      long_name: [null, [Validators.required, removeSpaces]],
      tele_phone: [null, [Validators.required]],
      accounting_plan: [null, [Validators.required]],
      signalement_email: [null, [Validators.required, CustomValidators.email]],
    });
  }

  checkFormValidity(): boolean {
    if (this.schoolForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.schoolForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  onSave() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    if (this.schoolData && this.schoolData._id) {
      if (this.schoolForm.get('platform_account')?.value === "null"){
        this.schoolForm.get('platform_account').setValue(null);
      };
      this.subs.sink = this.intakeService.UpdateCandidateSchool(this.schoolForm.value, this.schoolData._id).subscribe(
        (resp) => {
          console.log('Edit School', resp);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((res) => {
            this.schoolForm.patchValue(resp);
            if(resp?.platform_account === null){
              this.schoolForm.get('platform_account').patchValue("null")
            } 
          });
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err)
          console.log('err =>', err['message']);
          if (err['message'] === 'GraphQL error: Short name already taken!') {
            Swal.fire({
              title: this.translate.instant('USER_S15.TITLE'),
              html: this.translate.instant('duplicate_school'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USER_S15.OK'),
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
      if (this.schoolForm.get('platform_account')?.value === "null"){
        this.schoolForm.get('platform_account').setValue(null);
      };
      this.subs.sink = this.intakeService.CreateCandidateSchool(this.schoolForm.value).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          console.log('Add School', resp);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then((res) => {
            this.router.navigate(['/schools/school-detail/' + resp._id]);
          });
        },
        (err) => {
          this.isWaitingForResponse = false;
          console.log('err =>', err['message']);
          this.authService.postErrorLog(err)
          if (err['message'] === 'GraphQL error: Short name already taken!') {
            Swal.fire({
              title: this.translate.instant('USER_S15.TITLE'),
              html: this.translate.instant('duplicate_school'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USER_S15.OK'),
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

  getImgURL() {
    const logo = this.schoolForm.get('school_logo').value;
    const result = this.serverimgPath + logo;
    return this.sanitizer.bypassSecurityTrustUrl(result);
  }

  getImgURLStamp() {
    const logo = this.schoolForm.get('school_stamp').value;
    const result = this.serverimgPath + logo;
    return this.sanitizer.bypassSecurityTrustUrl(result);
  }

  chooseFile(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.isUploading = true;
    if (file) {
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            this.isUploading = false;
            if (resp) {
              this.schoolForm.get('school_logo').setValue(resp.s3_file_name);
              this.uploadLogo.nativeElement.value = null;
              if (this.schoolData) {
                this.updateLogo();
              }
            }
          },
          (err) => {
            // console.log('[Response BE][Error] : ', err);
            this.isUploading = false;
            this.uploadLogo.nativeElement.value = null;
            this.authService.postErrorLog(err)
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
      } else {
        this.isUploading = false;
        this.uploadLogo.nativeElement.value = null;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Finance_S3.TITLE'),
          text: this.translate.instant('Finance_S3.TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          confirmButtonText: this.translate.instant('Finance_S3.BUTTON'),
        });
      }
    } else {
      this.isUploading = false;
    }
  }

  chooseFileStamp(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.isUploadingStamp = true;
    if (file) {
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            this.isUploadingStamp = false;
            if (resp) {
              this.schoolForm.get('school_stamp').setValue(resp.s3_file_name);
              this.uploadLogo.nativeElement.value = null;
              if (this.schoolData) {
                this.updateLogo();
              }
            }
          },
          (err) => {
            // console.log('[Response BE][Error] : ', err);
            this.isUploadingStamp = false;
            this.uploadLogo.nativeElement.value = null;
            this.authService.postErrorLog(err)
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
      } else {
        this.isUploadingStamp = false;
        this.uploadLogo.nativeElement.value = null;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Finance_S3.TITLE'),
          text: this.translate.instant('Finance_S3.TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          confirmButtonText: this.translate.instant('Finance_S3.BUTTON'),
        });
      }
    } else {
      this.isUploadingStamp = false;
    }
  }

  deleteLogo() {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_LOGO.TITLE'),
      text: this.translate.instant('DELETE_LOGO.TEXT'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CANCEL'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result && result.value) {
        this.schoolForm.get('school_logo').setValue('');
        if (this.schoolData) {
          this.updateLogo();
        }
      }
    });
  }

  deleteStamp() {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_LOGO.TITLE'),
      text: this.translate.instant('DELETE_LOGO.TEXT'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DELETE_LOGO.BUTTON_CANCEL'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_LOGO.BUTTON_CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result && result.value) {
        this.schoolForm.get('school_stamp').setValue('');
        if (this.schoolData) {
          this.updateStamp();
        }
      }
    });
  }

  updateLogo() {
    this.subs.sink = this.intakeService.UpdateCandidateSchool(this.schoolForm.value, this.schoolData._id).subscribe(
      (resp) => {
        console.log('Edit School', resp);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((res) => {
          this.schoolForm.patchValue(resp);
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        console.log('err =>', err['message']);
        this.authService.postErrorLog(err)
        if (err['message'] === 'GraphQL error: Short name already taken!') {
          Swal.fire({
            title: this.translate.instant('USER_S15.TITLE'),
            html: this.translate.instant('duplicate_school'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S15.OK'),
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

  updateStamp() {
    this.subs.sink = this.intakeService.UpdateCandidateSchool(this.schoolForm.value, this.schoolData._id).subscribe(
      (resp) => {
        console.log('Edit School', resp);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((res) => {
          this.schoolForm.patchValue(resp);
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        console.log('err =>', err['message']);
        this.authService.postErrorLog(err)
        if (err['message'] === 'GraphQL error: Short name already taken!') {
          Swal.fire({
            title: this.translate.instant('USER_S15.TITLE'),
            html: this.translate.instant('duplicate_school'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S15.OK'),
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
