import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FormBuilderService } from '../form-builder.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-step-message-process',
  templateUrl: './step-message-process.component.html',
  styleUrls: ['./step-message-process.component.scss'],
})
export class StepMessageProcessDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  isWaitingForResponse = false;
  currentUser: any;
  method: any;
  dataMessage = null;
  validationStepList: any;
  isVideoLink = false;
  generateVideo = true;
  candidateSchool = [];
  buttonDisabled = true;
  public time = 125;
  countdownHabis = false;
  count = 5;
  timeout = setInterval(() => {
    if (this.count > 0) {
      this.count -= 1;
    } else {
      clearInterval(this.timeout);
    }
  }, 1000);

  constructor(
    public dialogRef: MatDialogRef<StepMessageProcessDialogComponent>,
    private formBuilderService: FormBuilderService,
    public userService: AuthService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    console.log('Candidate Selected is => ', this.data);
    this.GenerateStepMessage();
    this.currentUser = this.userService.getLocalStorageUser();
  }

  GenerateStepMessage() {
    const studentAdmissionProcessId = this.data.student_admission_process_id ? this.data.student_admission_process_id : null;
    this.subs.sink = this.formBuilderService
      .GenerateStepMessage(this.data.stepId, studentAdmissionProcessId, this.data.isPreview)
      .subscribe((resp) => {
        console.log('GenerateStepMessage', resp);
        if (resp) {
          this.dataMessage = resp;
        } else {
          this.closeEmpty();
        }
      }, (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
  }

  confirmValidation(type) {
    const data = {
      type: 'accept',
    };
    this.dialogRef.close(data);
  }

  closeDialog() {
    const data = {
      type: 'cancel',
    };
    this.dialogRef.close(data);
  }

  closeEmpty() {
    const data = {
      type: 'empty',
    };
    this.dialogRef.close(data);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
