import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { CompanyService } from 'app/service/company/company.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-import-contract-process-dialog',
  templateUrl: './import-contract-process-dialog.component.html',
  styleUrls: ['./import-contract-process-dialog.component.scss'],
})
export class ImportContractProcessDialogComponent implements OnInit, OnDestroy {
  // importForm: FormGroup;
  // uploadedFile;
  // isWaitingForResponse;

  @ViewChild('importFile', { static: false }) importFile: any;

  importForm: UntypedFormGroup;
  file: File;
  fileType: any;
  isWaitingForResponse = false;
  classType: string;

  isFileUploaded = true;
  currentUserTypeId:any

  private subs = new SubSink();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ImportContractProcessDialogComponent>,
    private utilService: UtilityService,
    private contractService: TeacherContractService,
    private translate: TranslateService,
    private companyService: CompanyService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initForm();
    // console.log(this.data);
  }

  initForm() {
    this.importForm = this.fb.group({
      // rncp_id: [this.data && this.data.titleId ? this.data.titleId : null, [Validators.required]],
      // school_id: [this.data && this.data.schoolId ? this.data.schoolId : null],
      // class_id: [this.data && this.data.classId ? this.data.classId : null, [Validators.required]],
      file_delimeter: [this.data && this.data.delimeter ? this.data.delimeter : null, [Validators.required]],
    });
  }

  handleInputChange(fileInput: Event) {
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['csv', 'tsv'];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.file = (<HTMLInputElement>fileInput.target).files[0];
      this.isWaitingForResponse = false;
      this.isFileUploaded = true;
    } else {
      this.isFileUploaded = false;
      this.file = null;
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.csv, .tsv' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  submit() {
    if (this.importForm.invalid || !this.file) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Please fill all the required fields !'),
        html: this.translate.instant('To be able to submit the form please fill in all the required fields.'),
        confirmButtonText: this.translate.instant('I understand'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      if (!this.file) {
        this.isFileUploaded = false;
      } else {
        this.isFileUploaded = true;
      }
    } else {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Import'),
        html: this.translate.instant('Are you sure to import this file?'),
        confirmButtonText: this.translate.instant('Yes, Im Sure'),
        cancelButtonText: this.translate.instant('No, Cancel It'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonClass: 'btn-danger',
      }).then((confirm) => {
        if (confirm.value) {
          this.callImportAPI();
          // return;
        }
      });
    }
  }

  /* getDelemiters(text) {
    let delimiter = ',';
    if (this.importForm.value.file_delimeter === 'semicollon') {
      delimiter = ';';
    }
    if (this.importForm.value.file_delimeter === 'tab') {
      const test1 = text.indexOf(',');
      const test2 = text.indexOf(';');
      if (test1 === -1 && test2 === -1) {
        return 0;
      } else {
        return -1;
      }
    }
    const result = text.indexOf(delimiter);
    return result;
  }*/

  callImportAPI() {
    this.isWaitingForResponse = true;
    // alert('callImportAPI');
    // console.log(this.importForm);
    // console.log(this.importForm.value.file_delimeter);
    const payload = {
      file_delimeter: this.importForm.value.file_delimeter,
    };

    // console.log('_file', this.file, this.importForm.get('file_delimeter').value);

    if (this.data && this.data.type === 'contract') {
      this.subs.sink = this.contractService.importContractProcess(payload, this.translate.currentLang, this.file).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp && resp.not_imported === 0) {
            Swal.fire({
              allowOutsideClick: false,
              type: 'success',
              title: this.translate.instant('ImportProcess_S2.TITLE'),
              html: this.translate.instant('ImportProcess_S2.TEXT'),
              confirmButtonText: this.translate.instant('ImportProcess_S2.BUTTON'),
              // Swal.fire({
              //   type: 'success',
              //   title: this.translate.instant('Bravo !'),
              //   confirmButtonText: this.translate.instant('OK'),
            }).then(() => {
              this.dialogRef.close(this.importForm.value);
            });
          } else {
            Swal.fire({
              allowOutsideClick: false,
              type: 'warning',
              title: this.translate.instant('ImportProcess_S1.TITLE'),
              html: this.translate.instant('ImportProcess_S1.TEXT', { imported: resp.imported, not_imported: resp.not_imported }),
              confirmButtonText: this.translate.instant('ImportProcess_S1.BUTTON'),
              // Swal.fire({
              //   type: 'success',
              //   title: this.translate.instant('Bravo !'),
              //   confirmButtonText: this.translate.instant('OK'),
            }).then(() => {
              this.dialogRef.close(this.importForm.value);
            });
          }
        },
        (err) => {
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
            this.swalError(err);
          }
        },
      );
    } else if (this.data && this.data.type === 'module') {
      this.subs.sink = this.contractService
        .importModule(this.importForm.get('file_delimeter').value, this.file, this.translate.currentLang)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp && resp.module_added && resp.module_added.length > 0 && resp.module_not_added.length === 0) {
              const modules = resp.module_added.filter((mod) => mod.message === 'Success');
              if (modules && modules.length > 0) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.importForm.value);
                });
              }
            } else if (resp && resp.module_not_added && resp.module_not_added.length > 0) {
              const module = [];
              const moduleInvalid = [];
              resp.module_not_added.filter((mod) => {
                if (mod.message === 'Module name already exist') {
                  module.push(mod.name);
                } else if (mod.message === 'Required field is empty') {
                  moduleInvalid.push(mod.name);
                }
              });
              if (module && module.length > 0) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_MS2.TITLE'),
                  html: this.translate.instant('IMPORT_MS2.TEXT', {
                    moduleName: module.join(', '),
                  }),
                  confirmButtonText: this.translate.instant('IMPORT_MS2.BUTTON'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.importForm.value);
                });
              } else if (moduleInvalid && moduleInvalid.length > 0) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_MS3.TITLE'),
                  html: this.translate.instant('IMPORT_MS3.TEXT'),
                  confirmButtonText: this.translate.instant('IMPORT_MS3.BUTTON'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.importForm.value);
                });
              }
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            if (err['message'] === 'GraphQL error: No module found.') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IMPORT_MS1.TITLE'),
                text: this.translate.instant('IMPORT_MS1.TEXT'),
                confirmButtonText: this.translate.instant('IMPORT_MS1.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else {
              this.swalError(err);
            }
          },
        );
    } else if (this.data && this.data.type === 'subject') {
      this.subs.sink = this.contractService
        .importSubject(this.importForm.get('file_delimeter').value, this.file, this.translate.currentLang)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp && resp.course_subject_added && resp.course_subject_added.length > 0 && resp.course_subject_not_added.length === 0) {
              const subjects = resp.course_subject_added.filter((mod) => mod.message === 'Success');
              if (subjects && subjects.length > 0) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.importForm.value);
                });
              }
            } else if (resp && resp.course_subject_not_added && resp.course_subject_not_added.length > 0) {
              const subject = [];
              const subjectInvalid = [];
              resp.course_subject_not_added.filter((sub) => {
                if (sub.message === 'Subject name already exist') {
                  subject.push(sub.name);
                } else if (sub.message === 'Required field is empty') {
                  subjectInvalid.push(sub.name);
                }
              });
              if (subject && subject.length > 0) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_SS2.TITLE'),
                  html: this.translate.instant('IMPORT_SS2.TEXT', {
                    subjectName: subject.join(', '),
                  }),
                  confirmButtonText: this.translate.instant('IMPORT_SS2.BUTTON'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.importForm.value);
                });
              } else if (subjectInvalid && subjectInvalid.length > 0) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_SS3.TITLE'),
                  html: this.translate.instant('IMPORT_SS3.TEXT'),
                  confirmButtonText: this.translate.instant('IMPORT_SS3.BUTTON'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(this.importForm.value);
                });
              }
            }
          },
          (err) => {
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            if (err['message'] === 'GraphQL error: No course subject found.') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IMPORT_SS1.TITLE'),
                text: this.translate.instant('IMPORT_SS1.TEXT'),
                confirmButtonText: this.translate.instant('IMPORT_SS1.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else {
              this.swalError(err);
            }
          },
        );
    } else if (this.data && this.data.type === 'companies') {
      this.subs.sink = this.companyService.ImportCompanyData(this.importForm.value, this.file,this.currentUserTypeId).subscribe(
        (res) => {
          if (res) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('IMPORT_COM_S1.TITLE'),
              html: this.translate.instant('IMPORT_COM_S1.TEXT'),
              confirmButtonText: this.translate.instant('IMPORT_COM_S1.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (err && err['message'] && err['message'].includes('adding company is limited to 30 entity in 1 minute')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('ComLim_s1.TITLE'),
              html: this.translate.instant('ComLim_s1.TEXT'),
              confirmButtonText: this.translate.instant('ComLim_s1.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else if (
            err &&
            err['message'] &&
            (err['message'].includes(
              'the siret you entered is not found on the government api. please double check the siret and try again',
            ) ||
              err['message'].includes('the combination of siret/siren code and zipcode is not detected.'))
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('COMP_S1.TITLE'),
              html: this.translate.instant('COMP_S1.TEXT'),
              confirmButtonText: this.translate.instant('COMP_S1.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else if (err && err['message'] && err['message'].includes('Sorry This Company is closed')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('COMPANY_S20.TITLE'),
              html: this.translate.instant('COMPANY_S20.TEXT', { siret: '' }),
              confirmButtonText: this.translate.instant('COMPANY_S20.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'info',
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
    } else if (this.data && this.data?.type === 'country') {
      this.subs.sink = this.companyService.importCountryAndNationality(this.importForm.value, this.file).subscribe(
        (res) => {
          if (res) {
            this.isWaitingForResponse = false;
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
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      // Import assignment table for Re admission
      this.subs.sink = this.contractService
        .importAssignmentTableData(this.importForm.get('file_delimeter').value, this.file, this.translate.currentLang,this.currentUserTypeId)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if(resp === 'import in progress'){
              Swal.fire({
                type: 'success',
                title: this.translate.instant('ReAdmission_S10.TITLE'),
                text: this.translate.instant('ReAdmission_S10.TEXT'),
                confirmButtonText: this.translate.instant('ReAdmission_S10.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.dialogRef.close(this.importForm.value);
              });
            }else if (resp && !resp.is_error) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.dialogRef.close(this.importForm.value);
              });
            } else {
              if (resp.message && resp.message === 'delimeter from file and from input is different') {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_ASSIGN_S2.Title'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                });
              } else if (resp.message && resp.message === 'Column CSV error.') {
                Swal.fire({
                  type: 'info',
                  html: this.translate.instant('IMPORT_ASSIGN_S4.Title'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                });
              } else if (resp.message && resp.message === 'some data is incorrect') {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_ASSIGN_S3.Title'),
                  html: this.translate.instant('IMPORT_ASSIGN_S3.Text'),
                  confirmButtonText: this.translate.instant('IMPORT_ASSIGN_S3.Button'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                });
              } else {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('IMPORT_ASSIGN_S1.Title'),
                  html: this.translate.instant('IMPORT_ASSIGN_S1.Text'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                });
              }
            }
          },
          (err) => {
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
              this.swalError(err);
            }
          },
        );
    }

    // this.subs.sink = this.contractService.importContractProcess(this.importForm, this.translate.currentLang, this.file).subscribe(
    //   (resp) => {
    //     this.isWaitingForResponse = false;
    //     console.log(resp);
    //     if (resp && resp.schedulesNotAdded && resp.schedulesNotAdded.length) {
    //       Swal.fire({
    //         allowOutsideClick: false,
    //         type: 'success',
    //         title: this.translate.instant('RGO_S12.TITLE'),
    //         html: this.translate.instant('RGO_S12.TEXT'),
    //         confirmButtonText: this.translate.instant('RGO_S12.BUTTON'),
    //       }).then((res) => {
    //         this.closeDialog();
    //       });
    //     } else if (resp && resp.schedulesAdded && resp.schedulesAdded.length) {
    //       Swal.fire({
    //         type: 'success',
    //         title: this.translate.instant('Bravo'),
    //       }).then(() => {
    //         this.dialogRef.close(true);
    //       });
    //     }
    //   },
    //   (err) => {
    //     this.isWaitingForResponse = false;
    //     this.swalError(err);
    //   },
    // );
  }

  swalError(err) {
    this.isWaitingForResponse = false;
    if (err['message'] === 'GraphQL error: Column CSV error.') {
      Swal.fire({
        allowOutsideClick: false,
        type: 'info',
        title: this.translate.instant('RGO_S8.TITLE'),
        confirmButtonText: this.translate.instant('RGO_S8.BUTTON'),
      }).then((res) => {
        this.closeDialog();
      });
    } else if (err['message'] === 'GraphQL error: schedule already published.') {
      Swal.fire({
        allowOutsideClick: false,
        type: 'info',
        title: this.translate.instant('RGO_S8.TITLE'),
        html: this.translate.instant('RGO_S8.TEXT'),
        confirmButtonText: this.translate.instant('RGO_S8.BUTTON'),
      }).then((res) => {
        this.closeDialog();
      });
    } else if (err['message'] === 'GraphQL error: delimeter from file and from input is different') {
      Swal.fire({
        allowOutsideClick: false,
        type: 'info',
        title: this.translate.instant('STUDENT_IMPORT.DELIMITER_UNSUCCESSFULL_IMPORT.TITLE'),
        confirmButtonText: this.translate.instant('STUDENT_IMPORT.DELIMITER_UNSUCCESSFULL_IMPORT.BUTTON'),
      }).then((res) => {
        this.closeDialog();
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
        confirmButtonText: 'OK',
      }).then((res) => {
        this.closeDialog();
      });
    }
  }

  openUploadWindow() {
    this.importFile.nativeElement.click();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // initContractForm() {
  //   this.uploadContractForm = this.fb.group({
  //     template_type: [null, [Validators.required]],
  //     file_name: [null, [Validators.required]],
  //   })
  // }

  // chooseFile(fileInput: Event) {
  //   this.uploadedFile = (<HTMLInputElement>fileInput.target).files[0];
  //   console.log(this.uploadedFile);
  //   if (this.uploadedFile) {
  //     this.uploadContractForm.get('file_name').patchValue(this.uploadedFile.name);
  //   }
  // }

  // onSubmit() {
  //   const payload = {
  //     file_delimeter: this.uploadContractForm.get('template_type').value
  //   }
  //   this.isWaitingForResponse = true;
  //   this.subs.sink = this.contractService.importContractProcess(payload, this.translate.currentLang, this.uploadedFile).subscribe(resp => {
  //     this.isWaitingForResponse = false;
  //     console.log(resp);
  //     if (resp) {
  //       Swal.fire({
  //         type: 'success',
  //         title: this.translate.instant('Bravo !'),
  //         confirmButtonText : this.translate.instant('OK')
  //       }).then(result => {
  //         this.dialogRef.close(this.uploadContractForm.value);
  //       })
  //     }
  //   }, (err) => this.isWaitingForResponse = false);
  // }

  // closeDialog() {
  //   this.dialogRef.close();
  // }
}
