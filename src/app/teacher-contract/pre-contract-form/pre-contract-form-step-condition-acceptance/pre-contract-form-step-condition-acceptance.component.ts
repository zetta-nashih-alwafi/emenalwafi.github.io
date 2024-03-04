import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationUrls } from 'app/shared/settings';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { environment } from 'environments/environment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-pre-contract-form-step-condition-acceptance',
  templateUrl: './pre-contract-form-step-condition-acceptance.component.html',
  styleUrls: ['./pre-contract-form-step-condition-acceptance.component.scss'],
})
export class PreContractFormStepConditionAcceptanceComponent implements OnInit {
  _stepData;
  @Input() currentStepIndex;
  @Input() formDetail: any;
  @Input() userData;
  @Input() isReceiver;
  isValidator: boolean;
  isRevisionUser: any;
  isWaitingForResponse = false;
  myInnerHeight: number;
  @Input() set stepData(value: any) {
    if (value) {
      this._stepData = value;
      if (this._stepData.segments[0] && this._stepData.segments[0].acceptance_pdf) {
        this.setPreviewUrl(this._stepData.segments[0].acceptance_pdf);
      }
    }
  }
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  timeOutVal: any;

  get stepData() {
    return this._stepData;
  }

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  rawUrl: string;
  documentOnPreviewUrl: any;
  userHasDownloaded = false;
  _subs = new SubSink();
  formId: any;
  formType: string;

  constructor(
    private contractService: TeacherContractService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.formType = this.route.snapshot.queryParamMap.get('formType');
    if (this.userData && !this.formDetail.isPreview) {
      this.checkEntities();
    }
  }

  setPreviewUrl(url) {
    this.rawUrl = url;
    const result = this.serverimgPath + url + '#view=fitH';
    this.documentOnPreviewUrl = this.cleanUrlFormat(result);
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  checkEntities() {
    this.isValidator = !!this.userData.entities.find((ent) => {
      if (
        ent &&
        ent.type &&
        this.stepData.is_validation_required &&
        this.stepData.validator &&
        ent.type._id === this.stepData.validator._id
      ) {
        return true;
      } else {
        return false;
      }
    });
    this.isRevisionUser = this.userData.entities.find((ent) => {
      if (ent && ent.type && this.stepData.revision_user_type && ent.type._id === this.stepData.revision_user_type) {
        return true;
      } else {
        return false;
      }
    });
  }

  onAskForRevision() {
    // NEED DIALOG ASK FOR REVISION...... THIS IS COPY FORM V2** PLEASE REMOVE IF DONE
    // this._subs.sink = this.dialog
    //   .open(FormFillingRevisionDialogComponent, {
    //     minWidth: '800px',
    //     panelClass: 'no-padding',
    //     data: {
    //       formData: this.formDetail,
    //       stepId: this.stepData._id,
    //       existingMessages: this.stepData.revise_request_messages ? this.stepData.revise_request_messages : null,
    //     },
    //   })
    //   .afterClosed()
    //   .subscribe((resp) => {
    //     if (resp) {
    //       this.triggerRefresh.emit(this.formId);
    //       console.log(resp);
    //     }
    //   });
  }

  onCompleteRevision() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S5.TITLE'),
      text: this.translate.instant('UserForm_S5.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S5.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S5.CANCEL'),
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          if (confirmBtnRef && confirmBtnRef.innerText) {
            confirmBtnRef.innerText = this.translate.instant('UserForm_S5.CONFIRM') + ` (${timeDisabled})`;
          }
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          if (confirmBtnRef && confirmBtnRef.innerText) {
            confirmBtnRef.innerText = this.translate.instant('UserForm_S5.CONFIRM');
          }
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((resp) => {
      if (resp.value) {
        this.swalValidate();
      } else {
        return;
      }
    });
  }

  onDownload() {
    // window.open(fileUrl, '_blank');downloadDoc() {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${this.rawUrl}?download=true`.replace('/graphql', '');
    a.download = this.rawUrl;
    // a.href = this.documentOnPreviewUrl;
    // a.download = fileUrl;
    a.click();
    a.remove();
    this.userHasDownloaded = true;
  }

  onAccept() {
    this.swalValidate();
  }

  onSave() {
    this.isWaitingForResponse = true;
    const payload = {
      _id: this.stepData._id,
    };
    if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
      this._subs.sink = this.contractService.createUpdateFCContractProcessStepAndQuestion(payload).subscribe((resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        }
      });
    } else {
      this._subs.sink = this.contractService.createUpdateContractProcessStepAndQuestion(payload).subscribe((resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        }
      });
    }
  }

  swalValidate() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S17.TITLE'),
      html: this.translate.instant('UserForm_S17.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S17.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S17.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S17.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S17.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        this.isWaitingForResponse = true;
        if (this.formType && this.formType === 'fc_contract' && !this.formDetail.isPreview) {
          this.contractService.acceptFCContractProcessStep(this.formId, this.stepData._id).subscribe((resp) => {
            if (resp) {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((sres) => {
                this.triggerRefresh.emit(this.formId);
              });
            }
          });
        } else {
          this.contractService.acceptContractProcessStep(this.formId, this.stepData._id).subscribe((resp) => {
            if (resp) {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((sres) => {
                this.triggerRefresh.emit(this.formId);
              });
            }
          });
        }
      } else {
        return;
      }
    });
  }

  rejectAndStopProcess() {
    let timeDisabled = 10;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('StopProcess.TITLE'),
      html: this.translate.instant('StopProcess.TEXT'),
      confirmButtonText: this.translate.instant('StopProcess.CONFIRM'),
      cancelButtonText: this.translate.instant('StopProcess.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('StopProcess.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('StopProcess.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        this.isWaitingForResponse = true;
        if(this.formDetail.formType === 'teacher_contract'){
          this.contractService.RejectAndStopContractProcess(this.formId).subscribe((resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((ress) => {
              this.router.navigate(['/teacher-contract/contract-management']);
            });
          });
        } else if(this.formDetail.formType === 'fc_contract'){
          this.contractService.RejectAndStopFCContractProcess(this.formId).subscribe((resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((ress) => {
              this.router.navigate(['/contract-follow-up']);
            });
          });
        }
      } else {
        return;
      }
    });
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 500;
    return this.myInnerHeight;
  }
}
