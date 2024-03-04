import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { FormFillingRevisionDialogComponent } from '../form-filling-revision-dialog/form-filling-revision-dialog.component';
import { FormFillingService } from '../form-filling.service';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';
import { StepDynamicMessageDialogComponent } from 'app/shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { FormBuilderService } from 'app/service/form-builder/form-builder.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { map } from 'rxjs/operators';
import { AdmissionService } from 'app/service/admission/admission.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'ms-form-fill-dynamic-summary',
  templateUrl: './form-fill-dynamic-summary.component.html',
  styleUrls: ['./form-fill-dynamic-summary.component.scss'],
})
export class FormFillDynamicSummaryComponent implements OnInit, OnDestroy {
  _stepData;
  isUsingStepMessage: boolean = false;
  messageDialogRef: MatDialogRef<StepDynamicMessageDialogComponent>;
  @Input() currentStepIndex;
  @Input() formDetail: any;
  // @Input() userData;
  @Input() stepData: any;
  candidateDataFullRate: any;
  totalCost: any;
  payAmount: any;
  readmissionStatus: any;
  @Input() set userData(value: any) {
    this._userData = value;
    if (value) {
      if (this.formDetail.formId) {
        this.getStudentAdmissionData();
      }
    }
  }
  @Input() isReceiver;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  displayedColumns: string[] = ['type', 'organization', 'rate_hour', 'hours', 'total', 'status'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  private subs = new SubSink();
  private _userData: any;

  get userData() {
    return this._userData;
  }

  isValidator: boolean;
  isRevisionUser: any;
  isWaitingForResponse = false;
  isLoading = false;
  timeOutVal: any;
  noData: any;
  templateSummaryForm: UntypedFormGroup;
  templateStep = [];
  dataSource = new MatTableDataSource([]);

  documentExpectedDisplays: { stepIndex: number; selectedDocumentUrl: any }[] = [];
  formData: any;
  formattedSignatureDate: string;
  signature = false;
  hasValidatorValidated: boolean = false;
  isAccepted = false;
  fullRate: any;
  volumeOfHours: any;
  total: number;
  dividen: any;
  additionalCost: any;
  discountCalculted: any;
  candidateData: any;
  rateAmount: any;
  discount: any;
  modalityFee: any;
  dataCount = 0;

  constructor(
    public sanitizer: DomSanitizer,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private formFillingService: FormFillingService,
    private formBuilderService: FormBuilderService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private admissionService: AdmissionService,
  ) {}

  ngOnInit() {
    this.checkStepNotificationOrMessage();
    if (this.formDetail.isPreview === true && this.formDetail.templateId) {
      this.getRandomStudentAdmissionData();
    }
    this.translate.onLangChange.subscribe((resp) => {
      moment.locale(resp.lang);
      this.checkSignature();
    });

    this.initTemplateSummaryForm();
    if (this.formDetail.formId) {
      this.getStudentAdmissionData();
    }
    console.log('isFinalRevision', this.formDetail);
    console.log('userData_', this.userData);
    console.log('stepData_', this.stepData);
    console.log('isReceiver_', this.isReceiver);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  checkStepNotificationOrMessage() {
    console.log('FORM DETAIL', this.formDetail);
    console.log('STEP DATA', this.stepData);
    if (
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const formBuilderID = this.formDetail.templateId;
      const formBuilderStepID = this.stepData.form_builder_step._id;
      const pagination = { limit: 20, page: 0 };

      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.getAllStepNotificationsAndMessages(formBuilderID, formBuilderStepID, pagination).subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response && response.length) {
            this.isUsingStepMessage = !!response.find((item) => item && item.type && item.type === 'message');
          } // default value of isUsingStepMessage is false so no need an else block
        },
        (error) => {
          this.isWaitingForResponse = false;
          console.error(error);
        },
      );
    }
  }

  initTemplateSummaryForm() {
    this.templateSummaryForm = this.fb.group({
      signature: [null, Validators.required],
    });
  }

  getStudentAdmissionData() {
    this.formData = [];
    this.templateStep = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneFormProcess(this.formDetail.formId).subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        this.formData = _.cloneDeep(resp);
        this.documentExpectedDisplays = [];
        const templateSteps = [];
        this.formData.steps.forEach((step, stepIndex) => {
          if (step && step.length !== 0) {
            // push to documentExpectedDetails all the document expected steps detail
            if (
              step.step_type &&
              step.step_type === 'document_expected' &&
              step.segments &&
              step.segments.length &&
              step.segments[0].questions[0]
            ) {
              this.documentExpectedDisplays.push({
                stepIndex,
                selectedDocumentUrl: this.setPreviewUrl(step.segments[0].questions[0].answer) || null,
              });
            }
            templateSteps.push(step);
          }
        });
        this.templateStep = templateSteps;
        console.log('TEMPLATESTEP', this.templateStep);
        this.getFinancementTable();
        if (this.formDetail.formType !== 'teacher_contract' && this.formDetail.isPreview !== true) {
          this.getOneCandidate();
          this.getOneCandidateData();
        }
        this.checkDisableForm();
        this.checkFormAccept();
        this.checkSignature();
        this.hasValidatorValidated = this.checkIfValidatorHasValidated(resp);
      }
    });
  }

  getRandomStudentAdmissionData() {
    this.formData = [];
    this.templateStep = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneRandomFormProcess(this.formDetail.templateId).subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        this.formData = resp;
        resp.steps.forEach((step) => {
          if (step && step.length !== 0) {
            this.templateStep.push(step);
          }
        });
      }
    });
  }

  checkDisableForm() {
    if (this.userData && this.userData.entities && this.userData.entities.length) {
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
    }
    console.log('141 isValidator', this.isValidator);
  }

  checkFormAccept() {
    if (this.formDetail.formType === 'student_admission' || this.formDetail.formType === 'teacher_contract') {
      if (this.formData && this.formData.admission_status === 'submitted') {
        this.isAccepted = true;
      } else if (this.formData && this.formData.admission_status === 'signing_process') {
        this.isAccepted = true;
      }
    } else {
      if (this.formData && this.formData.contract_status === 'submitted') {
        this.isAccepted = true;
      } else if (this.formData && this.formData.contract_status === 'sent_not_signed') {
        this.isAccepted = true;
      }
    }
  }

  checkSignature() {
    if (this.formData && this.formData.signature_date && this.formData.signature_date.date) {
      this.signature = true;
      this.formattedSignatureDate = this.formatSignatureDate();
    } else {
      this.signature = false;
    }
  }

  formatSignatureDate() {
    moment.locale(this.translate.currentLang);
    const duration = moment.duration({ hours: environment.timezoneDiff });
    const acceptance_date = moment(this.formData.signature_date.date + this.formData.signature_date.time, 'DD/MM/YYYYHH:mm')
      .add(duration)
      .format();
    return moment(acceptance_date).format('DD MMMM YYYY - HH:mm');
  }

  checkIfValidatorHasValidated(payload): boolean {
    if (!this.isValidator) {
      return false;
    }
    return this.getAllValidatorsWhoValidated(payload).includes(this.formDetail.userId);
  }

  getAllValidatorsWhoValidated(payload): any[] {
    return payload && payload.final_validator_statuses && payload.final_validator_statuses.length
      ? payload.final_validator_statuses
          .filter((status) => status && status.user_id && status.user_id._id && status.is_already_sign)
          .map((status) => status.user_id._id)
      : [];
  }

  downloadPDF() {
    this.isLoading = true;
    const lang = this.translate.currentLang.toLowerCase();
    this.subs.sink = this.formFillingService.generatePDFStep(this.formDetail.candidateId, this.stepData._id, lang).subscribe(
      (data) => {
        const link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
        link.target = '_blank';
        link.click();
        link.remove();
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('Network error: Http failure response for') ||
            err['message'].includes('PDF is still being generated at the moment'))
        ) {
          Swal.fire({
            title: this.translate.instant('GENERATE_PDF_12.Title'),
            text: this.translate.instant('GENERATE_PDF_12.Text'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('GENERATE_PDF_12.Button'),
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

  getDocumentSelectedUrl(index: number) {
    return this.documentExpectedDisplays.find((doc) => doc.stepIndex === index).selectedDocumentUrl || null;
  }

  setDocumentDisplayed(stepIndex: number, docUrl: string) {
    const docIndex = this.documentExpectedDisplays.findIndex((doc) => doc.stepIndex === stepIndex);
    if (docIndex >= 0) {
      this.documentExpectedDisplays[docIndex].selectedDocumentUrl = this.setPreviewUrl(docUrl);
    }
  }

  setPreviewUrl(url) {
    if (!url) {
      return null;
    }
    const result = this.serverimgPath + url + '#view=fitH';
    const previewURL = this.cleanUrlFormat(result);
    return previewURL;
  }

  getFinancementTable() {
    // this.isLoading = true;
    const pagination = {
      limit: 50,
      page: 0,
    };
    const filter = {
      candidate_id: this.formDetail.candidateId,
      admission_process_id: this.formDetail.formId,
    };
    // const filter = null;
    this.subs.sink = this.formBuilderService.getAllAdmissionFinancements(filter, pagination).subscribe(
      (res) => {
        if (res && res.length > 0) {
          // this.isLoading = false;
          this.dataSource.data = res;
          this.dividen = this.calculateTotal(res);
        } else {
          this.dataSource.data = [];
          this.dataCount = 0;
          this.dividen = 0;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          // this.isLoading = false;
        }
      },
      (err) => {
        this.dataSource.data = [];
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        // this.isLoading = false;
        this.dividen = 0;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.formDetail.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = resp;
        this.readmissionStatus = resp?.readmission_status;
        if (
          this.candidateData &&
          this.candidateData.intake_channel &&
          this.candidateData.intake_channel.admission_document &&
          this.candidateData.intake_channel.admission_document.s3_file_name
        ) {
          this.setPreviewUrl(this.candidateData.intake_channel.admission_document.s3_file_name);
        }
        if (this.candidateData && this.candidateData.school) {
          this.getFullRateCandidate();
        }
        if (this.candidateData.registration_profile.payment_modes) {
          this.getModalityFee(this.candidateData.registration_profile.payment_modes);
        }
        if (this.candidateData.registration_profile.additional_cost_ids) {
          this.calculateAdditionalCost(this.candidateData.registration_profile.additional_cost_ids);
        }
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

  getModalityFee(data) {
    const modalityFee = data.find((element) => element.term === this.candidateData.selected_payment_plan.times);
    this.modalityFee = modalityFee ? modalityFee.additional_cost : 0;
  }

  getOneCandidateData() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.volumeOfHours = res.volume_hour;
          this.candidateDataFullRate = res;

          if (this.candidateDataFullRate) {
            const school = this.candidateDataFullRate.school ? this.candidateDataFullRate.school._id : null;
            const scholar = this.candidateDataFullRate.scholar_season ? this.candidateDataFullRate.scholar_season._id : null;
            const campus = this.candidateDataFullRate.campus ? this.candidateDataFullRate.campus._id : null;
            const level = this.candidateDataFullRate.level ? this.candidateDataFullRate.level._id : null;
            const sector = this.candidateDataFullRate.sector ? this.candidateDataFullRate.sector._id : null;
            const speciality = this.candidateDataFullRate.speciality ? this.candidateDataFullRate.speciality._id : null;
            this.getFullRate(scholar, school, campus, level, sector, speciality, res);
          }
        } else {
          this.volumeOfHours = 0;
          this.fullRate = 0;
          this.total = 0;
        }
      },
      (err) => {
        this.volumeOfHours = 0;
        this.fullRate = 0;
        this.total = 0;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getFullRateCandidate() {
    // *************** UAT_863 12/05/2023 Update the way to get full rate of student, get from selected payment of student
    if (this.candidateData?.selected_payment_plan?.total_amount) {
      this.rateAmount =
        this.candidateData?.selected_payment_plan?.total_amount +
        this.candidateData?.selected_payment_plan?.down_payment -
        this.candidateData?.selected_payment_plan?.additional_expense;
      const discountPercent =
        this.candidateData && this.candidateData.registration_profile && this.candidateData.registration_profile.discount_on_full_rate
          ? this.candidateData.registration_profile.discount_on_full_rate
          : 0;
      this.discount = discountPercent;
      this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
      // *************** call query getonefullrate when there is no total_amount on candidate
    } else {
      this.getFullRateWhenNoTotalAmount();
    }
  }

  getFullRateWhenNoTotalAmount() {
    const school = this.candidateData?.school ? this.candidateData.school?._id : null;
    const scholar = this.candidateData?.scholar_season ? this.candidateData.scholar_season?._id : null;
    const campus = this.candidateData?.campus ? this.candidateData.campus?._id : null;
    const level = this.candidateData?.level ? this.candidateData.level?._id : null;
    const sector = this.candidateData?.sector ? this.candidateData.sector?._id : null;
    const speciality = this.candidateData?.speciality ? this.candidateData.speciality?._id : null;

    this.subs.sink = this.admissionService.GetOneFullRate(scholar, school, campus, level, sector, speciality).subscribe(
      (lists) => {
        if (lists) {
          const discountPercent =
            this.candidateData && this.candidateData.registration_profile && this.candidateData.registration_profile.discount_on_full_rate
              ? this.candidateData.registration_profile.discount_on_full_rate
              : 0;
          this.discount = discountPercent;
          if (this.candidateData?.registration_profile_type) {
            if (this.candidateData?.registration_profile_type === 'internal') {
              this.rateAmount = lists?.amount_internal;
              this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
            } else {
              this.rateAmount = lists?.amount_external;
              this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
            }
          } else {
            this.rateAmount = lists?.amount_external;
            this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
          }
        }
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

  getFullRate(scholar, school, campus, level, sector, speciality, resp) {
    this.subs.sink = this.admissionService.GetOneFullRateFC(scholar, school, campus, level, sector, speciality).subscribe(
      (res) => {
        if (res) {
          // console.log('_res', res);
          const fullRate = this.candidateDataFullRate.registration_profile_type === 'external' ? res.amount_external : res.amount_internal;
          let additionalCost = 0;
          if (
            this.candidateDataFullRate &&
            this.candidateDataFullRate.registration_profile &&
            this.candidateDataFullRate.registration_profile.additional_cost_ids &&
            this.candidateDataFullRate.registration_profile.additional_cost_ids.length
          ) {
            this.candidateDataFullRate.registration_profile.additional_cost_ids.forEach((element) => {
              if (element.amount) {
                additionalCost += element.amount;
              }
            });
          }
          const addtional =
            this.candidateDataFullRate.selected_payment_plan && this.candidateDataFullRate.selected_payment_plan.additional_expense
              ? this.candidateDataFullRate.selected_payment_plan.additional_expense
              : additionalCost;

          // Updated on 02/06/2022 ERP_044 when checking in selected payment already include the addtional expanse from registration profile (if any)

          // let addtionalRegistrationProfile = 0;
          // if (
          //   this.candidateData &&
          //   this.candidateData.registration_profile &&
          //   this.candidateData.registration_profile.additional_cost_ids &&
          //   this.candidateData.registration_profile.additional_cost_ids.length > 0
          // ) {
          //   this.candidateData.registration_profile.additional_cost_ids.forEach((res) => {
          //     addtionalRegistrationProfile += res.amount;
          //   });
          // } else {
          //   addtionalRegistrationProfile = 0;
          // }
          const discount =
            this.candidateDataFullRate.registration_profile && this.candidateDataFullRate.registration_profile.discount_on_full_rate
              ? this.candidateDataFullRate.registration_profile.discount_on_full_rate
              : 0;
          const fullRateDisc = fullRate * (discount / 100);
          if (discount > 0) {
            this.fullRate = fullRate - fullRateDisc + addtional;
          } else {
            this.fullRate = fullRate + addtional;
          }
          const depositPayed =
            this.candidateDataFullRate && this.candidateDataFullRate.billing_id && this.candidateDataFullRate.billing_id.deposit_pay_amount
              ? this.candidateDataFullRate.billing_id.deposit_pay_amount
              : 0;
          this.total = this.fullRate - this.dividen - depositPayed;
          if (isNaN(this.total)) {
            this.total = 0;
          }
        } else {
          this.fullRate = 0;
          this.total = 0;
        }
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

  calculateTotal(resp) {
    let total = 0;
    resp.forEach((element) => {
      if (element.actual_status === 'accepted') {
        total += element.total;
      }
    });
    return total;
  }

  calculateAdditionalCost(datas) {
    // console.log(datas);
    let fees = 0;
    if (datas && datas.length) {
      datas.forEach((fee) => {
        fees = fees + fee.amount;
      });
      this.additionalCost = fees;
      this.calcTotal();
    }
  }

  calcTotal() {
    if (this.candidateData && this.candidateData.selected_payment_plan.total_amount) {
      const dp = this.candidateData.selected_payment_plan.down_payment ? this.candidateData.selected_payment_plan.down_payment : 0;
      this.totalCost = this.candidateData.selected_payment_plan.total_amount + dp;
      return this.totalCost ? this.totalCost : 0;
    } else {
      // *************** old code (only get total from registration fee)
      // const amount = this.registrationFee ? this.registrationFee : 0;
      // return amount;
      // *************** new code (get total from registration fee and additional cost)
      let amount = 0;
      if (this.additionalCost) {
        amount = amount + this.additionalCost;
      }
      if (this.modalityFee) {
        amount = amount + this.modalityFee;
      }
      return amount;
    }
  }
  calcTotalToPay() {
    if (this.candidateData && this.candidateData.selected_payment_plan) {
      this.payAmount = this.candidateData.selected_payment_plan.total_amount;
      return this.payAmount;
    }
  }

  formatDecimal(value) {
    if (value) {
      return parseFloat(value).toFixed(2);
    } else {
      return 0;
    }
  }

  renderTooltip(element) {
    if (element.organization_id) {
      return this.translate.instant(element.organization_id.organization_type);
    } else if (element.company_branch_id) {
      return this.translate.instant('Company');
    } else {
      return `${
        element.organization_type && element.organization_type === 'Company'
          ? this.translate.instant('Company')
          : this.translate.instant(element.organization_type)
      } - ${this.translate.instant('other')}`;
    }
  }

  renderTooltipOrganizationName(element) {
    if (element.organization_id) {
      return element.organization_id.name;
    } else if (element.company_branch_id) {
      return element.company_branch_id.company_name;
    } else {
      return element.organization_name;
    }
  }
  generateIban(iban) {
    let data = '';
    if (iban) {
      iban = iban.replaceAll(/\s/g, '');
      for (let i = 0; i < iban.length; i++) {
        data += '*';
      }
      data += ' ' + iban.substr(iban.length - 4);
    }
    return data;
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onAskForRevision() {
    this.subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          stepId: this.stepData.is_final_step ? null : this.stepData._id,
          existingMessages: this.formDetail.revise_request_messages ? this.formDetail.revise_request_messages : null,
          formBuilderStepId: this.stepData.form_builder_step._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
      });
  }

  onCompleteRevision() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
          err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
        ) {
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

  validateForm() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S10.TITLE'),
      html: this.translate.instant('UserForm_S10.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S10.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S10.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
          (res) => {
            if (res) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((res) => {
                this.triggerRefresh.emit(this.formDetail.formId);
              });
            }
          },
          (err) => {
            if (
              err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
              err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (
              err['message'] ===
                'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
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
        return;
      }
    });
  }

  submitForm(message?, condition?) {
    this.isWaitingForResponse = true;
    this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (message) {
            this.subs.sink = this.dialog
              .open(StepDynamicMessageDialogComponent, {
                width: '600px',
                minHeight: '100px',
                panelClass: 'certification-rule-pop-up',
                disableClose: true,
                data: {
                  step_id: this.stepData.form_builder_step._id,
                  form_process_id: this.formDetail.formId,
                  is_preview: typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false,
                  dataPreview: null,
                  triggerCondition: condition,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                if (result.type == 'cancel') {
                  return;
                }
                this.isWaitingForResponse = true;
                this.triggerRefresh.emit(this.formDetail.formId);
              });
          } else {
            if (
              this.formData &&
              this.formData.final_validators &&
              this.formData.final_validators.length &&
              this.formData.is_final_validator_active
            ) {
              // with validator
              Swal.fire({
                type: 'success',
                title: this.translate.instant('UserForm_S7.TITLE'),
                text: this.translate.instant('UserForm_S7.TEXT'),
                confirmButtonText: this.translate.instant('UserForm_S7.CONFIRM'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.triggerRefresh.emit(this.formDetail.formId);
                // this.router.navigate(['/']);
              });
            } else {
              // without validator
              Swal.fire({
                type: 'success',
                title: this.translate.instant('UserForm_S8.TITLE'),
                text: this.translate.instant('UserForm_S8.TEXT'),
                confirmButtonText: this.translate.instant('UserForm_S8.CONFIRM'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.triggerRefresh.emit(this.formDetail.formId);
                // this.router.navigate(['/']);
              });
            }
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
          err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
        ) {
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

  checkQuestionChildType(data) {
    if (data && data.answer_number && data.answer_type === 'numeric') {
      return data.answer_number;
    } else if (data && data.answer_date && data.answer_date.date && data.answer_type === 'date') {
      return data.answer_date.date;
    } else {
      return data.answer;
    }
  }

  nextStepMessage(type) {
    if (this.templateSummaryForm.invalid || !this.signature /*  || this.isPhotoMandatory */) {
      this.templateSummaryForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    let stepId = null;
    if (this.stepData && this.stepData._id) {
      stepId = this.stepData._id;
    }
    if (
      this.isUsingStepMessage &&
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const stepID = this.stepData.form_builder_step._id;
      const formProcessID = this.formDetail.formId;
      const isPreview = typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false;
      const trigerCondition = type === 'waiting_for_validation' ? (this.stepData.is_validation_required ? type : 'validated') : type;
      this.subs.sink = this.formBuilderService.generateFormBuilderStepMessage(stepID, formProcessID, isPreview, type).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            this.submitForm(resp, trigerCondition);
          } else {
            this.isWaitingForResponse = false;
            this.submitForm();
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          this.submitForm();
          console.error(error);
        },
      );
    } else {
      this.submitForm();
    }
  }
  checkSegment(segment,stepType?) {
    let display = true;
    if (segment?.questions?.length && stepType === 'question_and_field') {
      const otherQuestion = segment?.questions?.filter(
        (question) =>
          question?.field_type !== 'student_college_name' &&
          question?.field_type !== 'student_college_city' &&
          question?.field_type !== 'student_college_zipcode' &&
          question?.field_type !== 'student_college_country',
      );
      if (!otherQuestion || otherQuestion?.length<=0) {
        display = false
      }
    }
    return display;
  }
}
