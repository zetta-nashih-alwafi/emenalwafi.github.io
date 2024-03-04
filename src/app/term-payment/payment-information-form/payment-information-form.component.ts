import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { TermPaymentService } from '../term-payment.service';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { CandidateHistoryTabComponent } from 'app/candidate-file/candidate-history-tab/candidate-history-tab.component';
import { CandidatesHistoryService } from 'app/service/candidates-history/candidates-history.service';

@Component({
  selector: 'ms-payment-information-form',
  templateUrl: './payment-information-form.component.html',
  styleUrls: ['./payment-information-form.component.scss'],
})
export class PaymentInformationFormComponent implements OnInit, OnDestroy {
  informationForm: UntypedFormGroup;
  isWaitingForResponse = false;
  isLoading = false;
  processFinish = false;
  billingHistory;

  @Input() candidateId = '';
  @Input() paymentSupportId = '';
  private subs = new SubSink();
  candidateData: any;
  parentData: any;
  paymentSupportData = [];
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  initialCostCoverage;
  invalidCost = false;
  currSelectedCandidateId: any;
  totalAmountCostStudentFC: number = 0;
  billingHistoryCandidate = [];
  collectAmount = [];
  fcCollectStudent = [];
  billingHistoryCandidateLength = 0;
  isValidCostCoverageAfterRecalculate: boolean = true;
  isValidCostCoverageForUserInput: boolean = true;

  constructor(
    private fb: UntypedFormBuilder,
    private TermPaymentService: TermPaymentService,
    private translate: TranslateService,
    private candidatesHistoryService: CandidatesHistoryService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getOneCandidate();
  }
  onWheel(event: Event) {
    event?.preventDefault();
  }
  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.TermPaymentService.getCandidatesParentData(this.candidateId).subscribe(
      (res: any) => {
        if (res) {
          this.candidateData = res;
          let parent = _.cloneDeep(this.candidateData.parents);
          parent = parent.filter((res) => res._id === this.paymentSupportId).pop();
          if (parent) {
            this.parentData = parent;
            this.informationForm.patchValue(this.parentData);
          } else {
            let financial = _.cloneDeep(this.candidateData.payment_supports);
            financial = financial.filter((res) => res._id === this.paymentSupportId && res.financial_support_status === 'pending').pop();
            if (financial) {
              this.parentData = financial;
              this.informationForm.patchValue(this.parentData);
            } else {
              this.processFinish = true;
            }
          }
          this.paymentSupportData = _.cloneDeep(this.candidateData.payment_supports);
          if (this.paymentSupportData) {
            this.paymentSupportData = this.paymentSupportData.filter((res) => res.financial_support_status === 'validated');
          }
          this.isWaitingForResponse = false;
        }
        this.getCandidateHistory();
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  initForm() {
    this.informationForm = this.fb.group({
      account_holder_name: [null, Validators.required],
      iban: [null, Validators.required],
      bic: [null, Validators.required],
      cost: [null, [Validators.required, Validators.min(20)]],
    });
  }

  createPayload(formData) {
    let payload = { ...formData, candidate_id: this.candidateId, parent_id: this.paymentSupportId };
    return payload;
  }

  validate() {
    this.informationForm.markAllAsTouched();
    if (this.informationForm.invalid || this.invalidCost || !this.isValidCostCoverageAfterRecalculate || !this.isValidCostCoverageForUserInput) {
      let errorMessage = '';
      if (
        this.informationForm.get('cost').hasError('min') &&
        (this.informationForm.get('cost').dirty || this.informationForm.get('cost').touched)
      ) {
        errorMessage = 'minimum value 20';
      } else if (this.invalidCost && (this.informationForm.get('cost').dirty || this.informationForm.get('cost').touched)) {
        errorMessage = 'Cannot exceed the student cost coverage';
      } else if(!this.isValidCostCoverageForUserInput) {
        errorMessage = 'minimum value 20';
      } else if(!this.isValidCostCoverageAfterRecalculate) {
        errorMessage = 'minimum value 20 for student';
      } else {
        errorMessage = 'Invalid_Form_Warning.TEXT';
      }

      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant(errorMessage),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });

    } else {
      this.isLoading = true;
      const payload = this.createPayload(this.informationForm.value);
      this.subs.sink = this.TermPaymentService.ValidateCandidateFinancialSupport(payload, true).subscribe(
        (resp) => {
          this.isLoading = false;
          this.isWaitingForResponse = true;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo !',
            }).then(() => {
              this.processFinish = true;
              this.isWaitingForResponse = false;
            });
          }
        },
        (err) => {
          this.isLoading = false;
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('LEGAL_S5.Title'),
              text: this.translate.instant('LEGAL_S5.Text'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            });
          } else if (
            err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
            err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
          ) {
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
            });
          } else if (
            err['message'] === 'GraphQL error: contact is removed as financial support' ||
            err['message'] === 'GraphQL error: contact data of student is not found'
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Not a financial support'),
              text: this.translate.instant('You are not longer as a financial support'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            }).then((res) => {
              this.processFinish = true;
            });
          } else if (
            err['message'] === 'FI: some terms already paid/partially paid' ||
            err['message'] === 'GraphQL error: FC: some terms already billed' ||
            err['message'] === 'GraphQL error: FC: some terms already paid/partially paid'
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('VALIDATION_BILLING_S1.TITLE'),
              text: this.translate.instant('VALIDATION_BILLING_S1.TEXT'),
              confirmButtonText: this.translate.instant('VALIDATION_BILLING_S1.BUTTON'),
            }).then((res) => {
              this.processFinish = true;
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

  getCostCoverage() {
    let costCoverage = this.initialCostCoverage;
    let financial = this.informationForm.get('cost').value;

    if (financial) {
      costCoverage = costCoverage - financial;
      if (costCoverage < 0) {
        this.invalidCost = true;
      } else {
        this.invalidCost = false;
      }
    } else {
      this.invalidCost = false;
    }
    if (this.billingHistoryCandidate[0]?.student_type?.type_of_formation !== 'classic') {
      if (costCoverage >= 0) {
        this.fcCollectStudent.forEach((res, index) => {
          if (!res?.is_financial_support) {
            this.fcCollectStudent[index].totalAmount = costCoverage;
            if(costCoverage < 20) {
              this.isValidCostCoverageAfterRecalculate = false;
            } else {
              this.isValidCostCoverageAfterRecalculate = true;
            }
          }
        });
      }
    } else if (this.billingHistoryCandidate[0]?.student_type?.type_of_formation === 'classic') {
      if (costCoverage >= 0) {
        this.candidateData.cost_coverage_student = costCoverage;
        if(costCoverage < 20) {
          this.isValidCostCoverageAfterRecalculate = false;
        } else {
          this.isValidCostCoverageAfterRecalculate = true;
        }
      }
    }
  }

  checkControlValidity(name: string) {
    const control = this.informationForm.get(name);
    return control.hasError('required') && (control.dirty || control.touched);
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  getCandidateHistory() {
    const filter = {
      candidate_id: this.candidateData?._id,
      intake_channel: this.candidateData?.intake_channel ? this.candidateData?.intake_channel?._id : '',
    };

    this.subs.sink = this.candidatesHistoryService.getAllBilling(filter).subscribe(
      (students: any) => {
        this.billingHistoryCandidate = _.cloneDeep(students);
        if (this.billingHistoryCandidate[0]?.student_type?.type_of_formation !== 'classic') {
          this.billingHistoryCandidateLength = this.billingHistoryCandidate.length;
          students.forEach((res) => {
            this.totalAmountCostStudentFC = 0;
            res?.terms.forEach((resp) => {
              if (resp?.term_status === 'not_billed') {
                this.totalAmountCostStudentFC = this.totalAmountCostStudentFC + resp?.term_amount;
              }
            });
            const mapFinancial = {
              candidate_id: res?.candidate_id,
              financial_support_info: res?.financial_support_info,
              totalAmount: this.totalAmountCostStudentFC,
              is_financial_support: res?.is_financial_support,
            };
            this.initialCostCoverage = mapFinancial?.totalAmount ? mapFinancial?.totalAmount : 0;
            this.fcCollectStudent.push(mapFinancial);
          });
        }
        //*************** term count candidate student
        let costCoverageStudent = 0;
        this.billingHistoryCandidate.forEach((item) => {
          if (!item?.financial_support_info?.name && !item?.financial_support_info?.civility) {
            item.terms.forEach((term) => {
              costCoverageStudent = costCoverageStudent + (term?.term_amount - term?.term_pay_amount);
            });
          }
        });
        this.candidateData = {
          ...this.candidateData,
          cost_coverage_student: costCoverageStudent,
        };
        this.initialCostCoverage = this.candidateData?.cost_coverage_student ? this.candidateData?.cost_coverage_student : 0;

        //*************** term count financial support
        this.paymentSupportData.forEach((fs, index) => {
          let costCoverageFinancialSupport = 0;
          this.billingHistoryCandidate.forEach((item) => {
            if (
              item?.financial_support_info?.name &&
              item?.financial_support_info?.civility &&
              item?.financial_support_info?._id === fs?._id
            ) {
              item.terms.forEach((term) => {
                costCoverageFinancialSupport = costCoverageFinancialSupport + (term?.term_amount - term?.term_pay_amount);
              });
            }
            this.paymentSupportData[index] = {
              ...this.paymentSupportData[index],
              cost_coverage_financial_support: costCoverageFinancialSupport,
            };
          });
        });

        // let initCoverageFc = this.fcCollectStudent.find((bill) => !bill?.is_financial_support);
        // if(this.billingHistoryCandidate[0]?.student_type?.type_of_formation !== 'classic') {
        //   this.initialCostCoverage = initCoverageFc?.totalAmount;
        // }
        // students.term.forEach((res)=>{
        //   if(res.term_status === 'not_billed'){
        //     this.totalAmountCostStudentFC += res.term_amount
        //   }
        // })
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
