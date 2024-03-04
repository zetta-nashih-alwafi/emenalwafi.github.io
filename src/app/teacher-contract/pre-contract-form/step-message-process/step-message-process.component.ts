import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-step-message-process',
  templateUrl: './step-message-process.component.html',
  styleUrls: ['./step-message-process.component.scss'],
})
export class StepMessageProcessContractDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  isWaitingForResponse = false;
  currentUser: any;
  method: any;
  dataMessage: any;
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
    public dialogRef: MatDialogRef<StepMessageProcessContractDialogComponent>,
    private contractService: TeacherContractService,
    public userService: AuthService,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    console.log('Candidate Selected is => ', this.data);
    if (this.data.is_contract) {
      this.dataMessage = {
        subject: '',
        body: this.translate.instant('Thank you for submitting the contract'),
        first_button: 'Go Back',
        second_button: 'I disconnect'
      }
    } else {
      this.GenerateStepMessage();
    }
    this.currentUser = this.userService.getLocalStorageUser();
  }

  GenerateStepMessage() {
    this.subs.sink = this.contractService
      .GenerateStepMessage(this.data.pre_contract_template_step_id, this.data.contract_process_id, this.data.is_preview)
      .subscribe((resp) => {
        if (resp) {
          this.dataMessage = resp;
        } else {
          this.closeDialog();
        }
      }, (err) => {
        this.closeDialog();
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
  }

  confirmValidation(type) {
    this.dialogRef.close(type);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
