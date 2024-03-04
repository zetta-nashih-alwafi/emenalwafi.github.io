import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FormBuilderService } from 'app/service/form-builder/form-builder.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
export interface DynamicDialog {
  step_id: string;
  form_process_id: string;
  is_preview: boolean;
  dataPreview: {};
  triggerCondition;
}

@Component({
  selector: 'ms-step-dynamic-message-dialog',
  templateUrl: './step-dynamic-message-dialog.component.html',
  styleUrls: ['./step-dynamic-message-dialog.component.scss'],
})
export class StepDynamicMessageDialogComponent implements OnInit {
  private subs = new SubSink();
  isWaitingForResponse = false;
  currentUser: any;
  dataMessage: any;
  buttonDisabled = true;
  public time = 125;
  count = 5;
  timeout = setInterval(() => {
    if (this.count > 0) {
      this.count -= 1;
    } else {
      clearInterval(this.timeout);
    }
  }, 1000);
  bodyMessage: any;

  constructor(
    public dialogRef: MatDialogRef<StepDynamicMessageDialogComponent>,
    private formBuilderService: FormBuilderService,
    public userService: AuthService,
    public translate: TranslateService,
    public sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.getTaskMessage();
    this.currentUser = this.userService.getLocalStorageUser();
  }

  getTaskMessage() {
    this.isWaitingForResponse = true;
    if (this.data.step_id) {
      const type = this.data && this.data.triggerCondition ? this.data.triggerCondition : null;
      const dataPreview = this.data && this.data.dataPreview && this.data.dataPreview._id ? this.data.dataPreview._id : null;
      this.subs.sink = this.formBuilderService
        .generateFormBuilderStepMessage(this.data.step_id, this.data.form_process_id, this.data.is_preview, type, dataPreview)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            if (resp) {
              this.dataMessage = resp;
              this.bodyMessage = this.sanitizer.bypassSecurityTrustHtml(this.dataMessage?.body);
            } else {
              this.closeDialog('empty');
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            // Record error log
            this.userService.postErrorLog(err);
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('ContractPreview_S2.TITLE'),
              text:this.translate.instant('ContractPreview_S2.TEXT'),
              confirmButtonText: this.translate.instant('ContractPreview_S2.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(()=>{
              this.dialogRef.close('errorpreview');
            })
          },
        );
    }
  }

  closeDialog(type = 'cancel') {
    this.dialogRef.close({ type });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
