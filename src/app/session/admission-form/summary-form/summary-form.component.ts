import { Component, OnInit, OnDestroy, Input, OnChanges, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import { JOBSTYLES } from 'app/school/school-student-cards/card-detail/job-description/job-description-pdf/job-pdf-style';
import { STYLE } from 'app/title-rncp/conditions/class-condition/score/second-step-score/condition-score-preview/pdf-styles';
import { environment } from 'environments/environment';
import { TranscriptBuilderService } from 'app/service/transcript-builder/transcript-builder.service';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { CurrencyPipe } from '@angular/common';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'ms-summary-form',
  templateUrl: './summary-form.component.html',
  styleUrls: ['./summary-form.component.scss'],
  providers: [ParseUtcToLocalPipe, CurrencyPipe],
})
export class SummaryFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  private subs = new SubSink();
  candidateData: any;
  isWaitingForResponse = false;
  isLoading = false;
  signature = new UntypedFormControl(null);
  documentOnPreviewUrl: any;
  rawUrl: string;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  conditionAgrement =
    '<p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>';

  schoolLogo: any;
  rateAmount: any;
  discount: any;
  discountCalculted: any;
  additionalCost: any;
  totalCost: any;
  payAmount: any;
  modalityFee: any;

  legalRepresentativeId: any;
  isForLegalRepresentative = false;

  // Service
  constructor(
    private transcriptBuilderService: TranscriptBuilderService,
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private sanitizer: DomSanitizer,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private currency: CurrencyPipe,
  ) { }

  ngOnInit() {
    this.signature = new UntypedFormControl(null);
    this.legalRepresentativeId = this.route.snapshot.queryParamMap.get('legal_representative');
  }

  ngOnChanges() {
    if (this.selectedIndex === 4) {
      console.log('Current Step ', this.selectedIndex);
      this.signature = new UntypedFormControl(null);
      this.getOneCandidate();
    }
  }

  savePDF() {
    const payload = {
      signature: 'done',
      candidate_admission_status: 'engaged',
    };
    this.isLoading = true;
    this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload).subscribe(
      (resp) => {
        this.isLoading = false;
        this.openPopUpValidation(5, 'stepValidation');
      },
      (err) => {
        this.isLoading = false;
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          });
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
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            if (res.value) {
              const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
              if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
                this.moveToTab.emit(tabValid);
                console.log(tabValid);
              }
            }
          });
        }
        // this.openPopUpValidation(5, 'stepValidation');
      },
    );
  }

  setPreviewUrl(url) {
    this.rawUrl = url;
    const result = this.serverimgPath + url + '#view=fitH';
    this.documentOnPreviewUrl = this.cleanUrlFormat(result);
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openPopUpValidation(data, type) {
    this.subs.sink = this.dialog
      .open(RegistrationDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: type,
          data: this.candidateData,
          step: data,
          candidateId: this.candidateData._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        this.admissionService.setStatusStepFour(true);
        if (resp.type === 'reset') {
          console.log('Masuk Sini Harus 3');
          this.admissionService.setIndexStep(5);
        } else if (resp.type === 'cancel') {
          this.admissionService.setIndexStep(4);
        }
      });
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = resp;

        if (
          resp.personal_information === 'legal_representative' && 
          (this.legalRepresentativeId !== resp.legal_representative.unique_id) && 
          this.selectedIndex === 4
        ) {
          this.isForLegalRepresentative = true;
          this.showSwalLegalRepresentativeS1();
        }

        if (resp.school && resp.school.school_logo) {
          this.schoolLogo = resp.school.school_logo;
        }
        if (resp && resp.signature === 'done') {
          this.signature.setValue(true);
        }
        if (
          this.candidateData &&
          this.candidateData.intake_channel &&
          this.candidateData.intake_channel.admission_document &&
          this.candidateData.intake_channel.admission_document.s3_file_name
        ) {
          this.setPreviewUrl(this.candidateData.intake_channel.admission_document.s3_file_name);
        }
        if (this.candidateData.school) {
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

  getFullRateCandidate() {
    // *************** UAT_863 12/05/2023 Update the way to get full rate of student, get from selected payment of student
    if(this.candidateData?.selected_payment_plan?.total_amount) {
      this.rateAmount = 
        (this.candidateData?.selected_payment_plan?.total_amount + 
        this.candidateData?.selected_payment_plan?.down_payment) - 
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
 
  downloadConditionPDF() {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${this.candidateData.school_contract_pdf_link}?download=true`.replace('/graphql', '');
    a.download = this.candidateData.school_contract_pdf_link;
    a.click();
    a.remove();
  }

  generateFromBE() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.GeneratePDFSchoolContract(this.candidateData._id).subscribe(
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

  exportPDF() {
    if (this.candidateData.candidate_admission_status === 'engaged' || this.candidateData.candidate_admission_status === 'registered') {
      if (this.candidateData.school_contract_pdf_link) {
        this.downloadConditionPDF();
      } else {
        this.generateFromBE();
      }
    } else {
      this.generateFromBE();
    }
  }

  createPayload(payload) {
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

  getModalityFee(data) {
    const modalityFee = data.find((element) => element.term === this.candidateData.selected_payment_plan.times);
    this.modalityFee = modalityFee ? modalityFee.additional_cost : 0;
  }

  calculateAdditionalCost(datas) {
    console.log(datas);
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
      // ****************** before getting data from registration fee and additional cost
      // return 0;
      // ****************** after getting data from registration fee and additional cost
      let amount = 0;
      if(this.additionalCost) {
        amount = amount + this.additionalCost;
      }
      if(this.modalityFee) {
        amount = amount + this.modalityFee
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

  translateTime(timeRaw) {
    const time = this.parseUTCToLocalPipe.transform(timeRaw);
    return time;
  }

  translateDate(datee) {
    if (datee) {
      const date = this.parseUTCToLocalPipe.transformDate(datee.date, datee.time);
      return date;
    }
  }

  // generate level format
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

  finalValidationData() {
    let isValidationCorrect = true;
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateFinalValidation(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (
          !resp.civility ||
          !resp.first_name ||
          !resp.last_name ||
          !resp.address ||
          !resp.country ||
          !resp.post_code ||
          !resp.city ||
          !resp.first_name_used ||
          !resp.last_name_used ||
          !resp.email ||
          !resp.telephone ||
          !resp.date_of_birth ||
          !resp.country_of_birth ||
          !resp.post_code_of_birth ||
          !resp.city_of_birth ||
          !resp.photo ||
          !resp.finance ||
          !resp.method_of_payment ||
          !resp.is_admitted ||
          !resp.signature ||
          !resp.program_confirmed ||
          !resp.selected_payment_plan ||
          !resp.personal_information ||
          !resp.nationality
        ) {
          isValidationCorrect = false;
        } else if (resp.finance && resp.registration_profile && resp.registration_profile.discount_on_full_rate === 100) {
          isValidationCorrect = true;
        } else if (resp.selected_payment_plan) {
          if (!resp.selected_payment_plan.name) {
            isValidationCorrect = false;
          }
        } else if (resp.finance === 'family') {
          if (resp.payment_supports && resp.payment_supports.length < 1) {
            isValidationCorrect = false;
          } else {
            if (!resp.payment_supports[0] || !resp.payment_supports[0].email) {
              isValidationCorrect = false;
            }
          }
        } else if (resp.method_of_payment === 'sepa' || resp.method_of_payment === 'credit_card') {
          if (resp.finance === 'family') {
            if (resp.payment_supports && resp.payment_supports.length < 1) {
              isValidationCorrect = false;
            } else {
              if (!resp.payment_supports[0] || !resp.payment_supports[0].iban) {
                isValidationCorrect = false;
              }
            }
          } else {
            if (!resp.iban) {
              isValidationCorrect = false;
            }
          }
        }

        if (isValidationCorrect) {
          this.savePDF();
        } else {
          console.log('data resp', resp);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('FINAL_VALIDATION_ADMISSION.TITLE'),
            html: this.translate.instant('FINAL_VALIDATION_ADMISSION.TEXT'),
            confirmButtonText: this.translate.instant('FINAL_VALIDATION_ADMISSION.BUTTON'),
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (isValidationCorrect) {
          this.savePDF();
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('FINAL_VALIDATION_ADMISSION.TITLE'),
            html: this.translate.instant('FINAL_VALIDATION_ADMISSION.TEXT'),
            confirmButtonText: this.translate.instant('FINAL_VALIDATION_ADMISSION.BUTTON'),
          });
        }
      },
    );
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

  showSwalLegalRepresentativeS1() {
    const relations = ['father', 'grandfather', 'uncle'];
    const parentalLink = this.candidateData.legal_representative.parental_link;
    const civility = parentalLink === 'other' ? '' : relations.includes(parentalLink) ? 'MR' : 'MRS';
    
    Swal.fire({
      type: 'warning',
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      title: this.translate.instant('LegalRepresentative_S1.TITLE'),
      text: this.translate.instant('LegalRepresentative_S1.TEXT', {
        civility: civility ? this.translate.instant(civility) : '', 
        first_name: this.candidateData.legal_representative.first_name, 
        last_name: this.candidateData.legal_representative.last_name
      }),
      confirmButtonText: this.translate.instant('LegalRepresentative_S1.BUTTON 1'),
    }).then(() => { });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
