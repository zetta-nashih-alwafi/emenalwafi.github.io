import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TaskService } from 'app/service/task/task.service';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UserService } from 'app/service/user/user.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ApplicationUrls } from 'app/shared/settings';
import { DomSanitizer } from '@angular/platform-browser';
import { AdmissionService } from 'app/service/admission/admission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-method-payment-dialog',
  templateUrl: './method-payment-dialog.component.html',
  styleUrls: ['./method-payment-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class MethodPaymentDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  paymentPlanMethod: UntypedFormGroup;
  isTitleTrue = false;
  testData;
  studentCount;
  noUsers = false;
  backupTestData;
  specializationId: string;
  blockConditionId: string;
  correctorName = '';

  userTypes = [];
  userCorrectorList = [];
  userList = [];

  memberAssigned = [];

  isGroupTest = false;

  isWaitingForResponse = false;
  isWaitingForUserList = true;
  isMultipleSelected = false;
  isSingleSelected = true;
  dataMemberAssigned = [];
  totalCandidate: any;
  singleCandidate: any;
  depositAmount: any;
  candidateAssignedMember = [];

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  method: any;
  campus = 'PARIS';
  candidate = '';
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
  availablePaymentMethods: any;
  constructor(
    public dialogRef: MatDialogRef<MethodPaymentDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: AdmissionService,
    public userService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.paymentPlanMethod = this.fb.group({
      method: [''],
    });
    console.log('Candidate Selected is => ', this.data);
    this.method = this.data && this.data.data ? this.data.data : '';
    this.availablePaymentMethods =
      this.data.balance.select_payment_method_available && this.data.balance.select_payment_method_available.length
        ? this.data.balance.select_payment_method_available
        : [];
    const candidate = this.route.snapshot.queryParamMap.get('candidate');
    if (candidate) {
      this.candidate = candidate;
    } else {
      this.candidate = this.data.candidateId;
    }
    this.getCanididate();
  }

  getCanididate() {
    this.subs.sink = this.candidateService.getCandidatePayment(this.candidate).subscribe(
      (resp) => {
        this.singleCandidate = resp;
      },
      (err) => {
        swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  createPayload(payload) {
    if (payload) {
      delete payload.rate_amount;
      delete payload.deposit_amount;
      delete payload.payment_plan;
      delete payload.method_dp;
      delete payload.count_document;
      delete payload.user_id;
      delete payload.finance;
      delete payload.selected_payment_plan;
    }

    if (payload && payload._id) {
      delete payload._id;
    }
    if (payload && payload.campus) {
      payload.campus = payload.campus._id;
    }
    if (payload && payload.intake_channel) {
      payload.intake_channel = payload.intake_channel._id;
    }
    if (payload && payload.scholar_season) {
      payload.scholar_season = payload.scholar_season._id;
    }
    if (payload && payload.level) {
      payload.level = payload.level._id;
    }
    if (payload && payload.school) {
      payload.school = payload.school._id;
    }
    if (payload && payload.sector) {
      payload.sector = payload.sector._id;
    }
    if (payload && payload.speciality) {
      payload.speciality = payload.speciality._id;
    }
    if (payload && payload.registration_profile) {
      payload.registration_profile = payload.registration_profile._id;
    }
    if (payload && payload.admission_member_id) {
      payload.admission_member_id = payload.admission_member_id._id;
    }
    return payload;
  }

  radioChange() {
    this.buttonDisabled = false;
  }

  confirmPayment(type) {
    const payload = this.createPayload(_.cloneDeep(this.singleCandidate));
    payload.method_of_payment = this.paymentPlanMethod.get('method').value;
    // const dates = this.data.balance.payment_date.map((list) => {
    //   return {
    //     date: list.date,
    //     amount: parseFloat(list.amount.toFixed(2)),
    //   };
    // });
    // payload.selected_payment_plan = {
    //   name: this.data.balance.name,
    //   total_amount: parseFloat(this.data.balance.total_amount.toFixed(2)),
    //   times: this.data.balance.times,
    //   additional_expense: parseInt(this.data.balance.additional_expense),
    //   payment_date: dates && dates.length ? dates : [],
    // };
    if (this.paymentPlanMethod.get('method').value !== 'credit_card') {
      payload.iban = '';
      payload.bic = '';
      payload.autorization_account = false;
    }
    if (this.data && this.data.paymentPlan) {
      console.log('masuk ga sih disini')
      for (let key in this.data.paymentPlan) {
        payload[key] = this.data.paymentPlan[key];
      }
    }
    console.log('Date payload', payload);
    if (!this.data.fromFormFill) {
      this.subs.sink = this.candidateService.UpdateCandidateForm(this.data.candidateId, payload).subscribe(
        (resp) => {
          if (resp) {
            console.log('Candidate Updated!', resp);
            swal
              .fire({
                type: 'success',
                title: 'Bravo!',
                text: this.translate.instant('You confirmed your Payment'),
                allowOutsideClick: false,
                confirmButtonText: 'OK',
              })
              .then((val) => {
                const data = {
                  type: 'reset',
                  data: this.data.type,
                  method_of_payment: payload.method_of_payment,
                  payload: payload,
                };
                this.dialogRef.close(data);
              });
          }
        },
        (err) => {
          if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('LEGAL_S5.Title'),
              text: this.translate.instant('LEGAL_S5.Text'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            })
          } else if (err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit'
            || err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
              html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
              confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
            });
          } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('IBAN_S1.Title'),
              text: this.translate.instant('IBAN_S1.Text'),
              confirmButtonText: this.translate.instant('IBAN_S1.Button'),
            })
          } else {
            swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    } else {
      const data = {
        type: true,
        method_of_payment: payload.method_of_payment,
      };
      this.dialogRef.close(data);
    }
  }

  closeDialog() {
    const data = {
      type: 'cancel',
      data: this.data.type,
    };
    this.dialogRef.close(data);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
