import { AuthService } from './../../service/auth-service/auth.service';
import { cloneDeep } from 'lodash';
import { FinancesService } from 'app/service/finance/finance.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { CurrencyPipe } from '@angular/common';
import { ApplicationUrls } from 'app/shared/settings';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { Component, OnInit, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { AdmissionService } from 'app/service/admission/admission.service';
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import * as moment from 'moment';
@Component({
  selector: 'ms-contract-amendment-form',
  templateUrl: './contract-amendment-form.component.html',
  styleUrls: ['./contract-amendment-form.component.scss'],
  providers: [ParseUtcToLocalPipe, CurrencyPipe],
})
export class ContractAmendmentFormComponent implements OnInit {
  isWaitingForResponse = false;
  @Input() candidateData;
  @Input() candidateId;
  @Input() formId;
  @Input() schoolLogo;
  billingData = [];
  rateAmount: any;
  amendmentData: any;
  discount: any;
  discountCalculted: any;
  registrationFee: any;
  totalCost: any;
  payAmount: any;
  additionalCost: any;
  documentOnPreviewUrl: any;
  signature = new UntypedFormControl(null);
  form: UntypedFormGroup;
  today:Date;
  allTermsPaid: boolean = false;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  private subs = new SubSink();

  constructor(
    private translate: TranslateService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private currency: CurrencyPipe,
    private financeService: FinancesService,
    private admissionService: AdmissionService,
    private fb: UntypedFormBuilder,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (
      this.candidateData &&
      this.candidateData.intake_channel &&
      this.candidateData.intake_channel.admission_document &&
      this.candidateData.intake_channel.admission_document.s3_file_name
    ) {
      this.setPreviewUrl(this.candidateData.intake_channel.admission_document.s3_file_name);
    }
    this.initForm();
    this.getOneCandidateAfterAmendement();
    this.getAllBilling();
    this.today = new Date();
  }
  initForm() {
    this.form = this.fb.group({
      form_status: [null, Validators.requiredTrue],
    });
  }
  getAllBilling() {
    const filter = {
      candidate_id: this.candidateId,
    };

    // *************** sorting to preview student and financial support same as preview from PDF BE
    const sorting = {
      candidate_last_name: 'asc'
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllBillingContract(filter, sorting).subscribe(
      (resp) => {
        if (resp?.length) {
          const temp = cloneDeep(resp);
          temp.forEach((element) => {
            if (element?.terms?.length) {
              element.terms.forEach((term) => {
                term['termDate'] = term?.term_payment ? this.translateDate(term?.term_payment) : '';
              });
            }
          });
          this.billingData = temp;
          this.allTermsPaids();
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        if (err) {
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

  allTermsPaids(): boolean {  
    this.billingData.forEach(data => {
      if (data.terms) {
        const termsPaid = data.terms.every(term => term?.term_status === 'paid');
        this.allTermsPaid = this.allTermsPaid && termsPaid;
      }
    });
  
    return this.allTermsPaid;
  }
  

  payerName(element) {
    if (element.is_financial_support) {
      return (
        element?.financial_support_info?.family_name?.toUpperCase() +
        ' ' +
        element?.financial_support_info?.name +
        ' ' +
        (element?.financial_support_info?.civility && element?.financial_support_info?.civility !== 'neutral'
          ? this.translate.instant(element?.financial_support_info?.civility)
          : '')
      );
    } else {
      return (
        element?.candidate_id?.last_name?.toUpperCase() +
        ' ' +
        element?.candidate_id?.first_name +
        ' ' +
        (element?.candidate_id?.civility && element?.candidate_id?.civility !== 'neutral'
          ? this.translate.instant(element?.candidate_id?.civility)
          : '')
      );
    }
  }
  ammountPaid(element) {
    return element?.amount_paid && element?.amount_paid !== '0' && element?.amount_paid !== '0.00' ? element.amount_paid : '';
  }
  remainingDue(element) {
    return element?.remaining_billed && element?.remaining_billed !== '0' && element?.remaining_billed !== '0.00'
      ? element.remaining_billed
      : '';
  }
  ammount(element) {
    return element?.total_amount && element?.total_amount !== '0' && element?.total_amount !== '0.00' ? element.total_amount : '';
  }
  // Form
  translateTime(timeRaw) {
    if(timeRaw) {
      const time = this.parseUTCToLocalPipe.transform(timeRaw);
      return time;
    } else {      
      const currentTime = moment(this.today).format('HH:mm');      
      return currentTime;
    }
  }

  translateDate(datee) {
    if (datee?.date) {
      const date = this.parseUTCToLocalPipe.transformDate(datee.date, datee.time);
      return date;
    } else {
      const today = moment().format('DD/MM/YYYY');
      return today;
    }
  }

  getLevelSchool(data) {
    let message = '';
    if (data) {
      if (data.includes('RD') || data.includes('EN')) {
        message = data;
      } else {
        if (parseInt(data)) {
          if (data === '1') {
            message = data + this.translate.instant('st') + ' ' + this.translate.instant('years');
          } else if (data === '2') {
            message = data + this.translate.instant('nd') + ' ' + this.translate.instant('years');
          } else if (data === '3') {
            message = data + this.translate.instant('rd') + ' ' + this.translate.instant('years');
          } else {
            message = data + this.translate.instant('th') + ' ' + this.translate.instant('years');
          }
        } else {
          message = data;
        }
      }
    }
    return message;
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
  getSplitTerms(supports, data) {
    let message = '';
    const supportName = supports.name + ' ' + supports.family_name;
    if (data && data.payment_splits && data.payment_splits.length) {
      const temp = data.payment_splits.find((percent) => {
        if (percent.payer_name.includes(supportName)) {
          return percent;
        }
      });
      if (temp) {
        const totalAmount = data.selected_payment_plan.total_amount ? data.selected_payment_plan.total_amount : 0;
        const percentage = temp.percentage;
        const splitValue = totalAmount ? (percentage / 100) * totalAmount : 0;
        const finalValue = this.currency.transform(splitValue, 'EURO', '', '0.2');
        message = percentage + '%' + ' ' + this.translate.instant('or') + ' ' + finalValue + ' €';
        return message;
      }
    }
  }
  validationData() {
    this.isWaitingForResponse = true;
    if (this.form?.valid) {
      this.saveContractAmendementPDF();
    } else {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FINAL_VALIDATION_ADMISSION.TITLE'),
        html: this.translate.instant('FINAL_VALIDATION_ADMISSION.TEXT'),
        confirmButtonText: this.translate.instant('FINAL_VALIDATION_ADMISSION.BUTTON'),
      });
    }
  }
  saveContractAmendementPDF() {
    this.subs.sink = this.admissionService.AcceptSchoolContractAmendment(this.formId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            this.getOneCandidateAfterAmendement();
          });
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err) {
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
  getOneCandidateAfterAmendement() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getOneCandidateAfterAmendement(this.candidateId).subscribe(
      (resp) => {
        if (resp) {
          this.amendmentData = _.cloneDeep(resp);
          if (resp?.current_school_contract_amendment_form?.form_status === 'done') {
            this.form.get('form_status').setValue(true);
          }
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err) {
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
  setPreviewUrl(url) {
    const result = this.serverimgPath + url + '#view=fitH';
    this.documentOnPreviewUrl = this.cleanUrlFormat(result);
  }
  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  exportPDFAmendement() {
    if (this.amendmentData?.current_school_contract_amendment_form?.school_amendment_form_link) {
      this.viewPDF(this.amendmentData?.current_school_contract_amendment_form?.school_amendment_form_link);
    } else {
      this.isWaitingForResponse = true;
      const isDontSavePdfToStudent = true;
      this.subs.sink = this.admissionService.GeneratePDFSchoolContractAmendement(this.candidateId, isDontSavePdfToStudent).subscribe(
        (data) => {
          this.isWaitingForResponse = false;
          const link = document.createElement('a');
          link.setAttribute('type', 'hidden');
          link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
          link.target = '_blank';
          link.click();
          link.remove();
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
  }
  viewPDF(link) {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${link}`;
    a.download = link;
    a.click();
    a.remove();
  }
}
