import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, ElementRef, Output } from '@angular/core';
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
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { STYLE } from 'app/title-rncp/conditions/class-condition/score/second-step-score/condition-score-preview/pdf-styles';
import { environment } from 'environments/environment';
import { TranscriptBuilderService } from 'app/service/transcript-builder/transcript-builder.service';
import { ApplicationUrls } from 'app/shared/settings';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'ms-condition-form',
  templateUrl: './condition-form.component.html',
  styleUrls: ['./condition-form.component.scss'],
})
export class ConditionFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  private subs = new SubSink();
  candidateData: any;
  isWaitingForResponse = false;
  downloadCondition = true;
  agreeCondition = true;
  scrollDone = false;
  documentOnPreviewUrl: any;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  rawUrl: string;
  myInnerHeight = 600;
  conditionAgrement =
    '<p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>';

  legalRepresentativeId: any;
  isForLegalRepresentative = false;

  // Service
  constructor(
    private transcriptBuilderService: TranscriptBuilderService,
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private fb: UntypedFormBuilder,
  ) {}

  ngOnInit() {
    this.legalRepresentativeId = this.route.snapshot.queryParamMap.get('legal_representative');
  }

  ngOnChanges() {
    if (this.selectedIndex === 3) {
      console.log('Current Step ', this.selectedIndex);
      this.getOneCandidate();
    }
  }

  setPreviewUrl(url) {
    this.rawUrl = url;
    const result = this.serverimgPath + url + '#view=fitH';
    if (url) {
      this.documentOnPreviewUrl = this.cleanUrlFormat(result);
    }
  }

  cleanUrlFormat(url) {
    if (url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  scrollComponentAgrement(event) {
    if (event) {
      const element = event.target;
      if (element.scrollHeight - element.scrollTop <= element.clientHeight) {
        if (!this.scrollDone) {
          this.scrollDone = true;
          this.downloadCondition = false;
        }
      }
    }
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = _.cloneDeep(resp);

        if (
          resp.personal_information === 'legal_representative' && 
          (this.legalRepresentativeId !== resp.legal_representative.unique_id) && 
          this.selectedIndex === 3
        ) {
          this.isForLegalRepresentative = true;
          this.showSwalLegalRepresentativeS1();
        }

        if (
          this.candidateData &&
          this.candidateData.intake_channel &&
          this.candidateData.intake_channel.admission_document &&
          this.candidateData.intake_channel.admission_document.s3_file_name
        ) {
          this.setPreviewUrl(this.candidateData.intake_channel.admission_document.s3_file_name);
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

  // get height of page based on resolution screen
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 359;
    return this.myInnerHeight;
  }

  downloadConditionPDF() {
    this.agreeCondition = false;
    this.downloadCondition = true;
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${environment.apiUrl}/fileuploads/${this.rawUrl}?download=true`.replace('/graphql', '');
    a.download = this.rawUrl;
    a.click();
    a.remove();
  }

  aggreeTheCondition() {
    this.agreeCondition = false;
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
        console.log('Masuk Sini Harus 2', resp);
        if (resp.type === 'cancel') {
          this.admissionService.setStatusStepThree(true);
        } else {
          console.log('Masuk Sini Harus 2');
          this.admissionService.setStatusStepThree(true);
          this.admissionService.setIndexStep(4);
        }
      });
  }

  exportPdf() {
    this.isWaitingForResponse = true;
    const html = STYLE + this.getPdfHtml();
    const filename = `General Conditions of the School` + this.candidateData.school;
    this.transcriptBuilderService.generatePdf(html, filename).subscribe(
      (res: any) => {
        this.isWaitingForResponse = false;
        const link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.download = res.filename;
        link.href = environment.PDF_SERVER_URL + res.filePath;
        link.target = '_blank';
        document.body.appendChild(link);
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
        }).then((res) => {
          if (res.value) {
            const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err
            if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
              const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
              this.moveToTab.emit(tabValid);
              console.log(tabValid);
            }
          }
        });
      },
    );
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

  getPdfHtml() {
    const fileDoc = document.getElementById('pdf-condition').innerHTML;
    const html = fileDoc;
    return html;
  }

  secondSave() {
    this.isWaitingForResponse = true;
    const payload = {
      is_admitted: true
    }
    this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.admissionService.setStatusStepTwo(true);
        this.candidateData = resp;
        this.admissionService.setDataCandidate(resp);
        this.openPopUpValidation(4, 'stepValidation');
      },
      (err) => {
        this.isWaitingForResponse = false;
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
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            if (res.value) {
              const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err
              if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
                this.moveToTab.emit(tabValid);
                console.log(tabValid);
              }
            }
          });
        }
      },
    );
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
