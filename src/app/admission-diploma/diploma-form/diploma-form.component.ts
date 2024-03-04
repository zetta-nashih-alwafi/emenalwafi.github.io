import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionService } from 'app/service/admission/admission.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApplicationUrls } from 'app/shared/settings';
@Component({
  selector: 'ms-diploma-form',
  templateUrl: './diploma-form.component.html',
  styleUrls: ['./diploma-form.component.scss'],
})
export class DiplomaFormComponent implements OnInit, OnDestroy {
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  private subs = new SubSink();
  candidateData;
  isWaitingForResponse = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  form: UntypedFormGroup;

  intVal;
  timeOutVal;

  constructor(private admissionService: AdmissionService, private translate: TranslateService, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.getOneCandidate();
  }

  initForm() {
    this.form = this.fb.group({
      diploma_status: ['', Validators.required],
    });
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmissionDiploma(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        const response = resp;
        this.candidateData = response;
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

  async validateDiploma() {
    if (!(await this.checkFormValidity())) {
      return;
    }
    const payload = {
      diploma_status: this.form.get('diploma_status').value,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.UpdateCandidateDiploma(this.candidateId, payload).subscribe(
      (ressp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((res) => {
          if (res.value) {
            this.candidateData = ressp;
            this.admissionService.setStatusStepCampus(true);
            this.admissionService.setIndexStep(1);
          }
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
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
          })
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

  async checkFormValidity(): Promise<boolean> {
    let isValid = true;
    if (this.form.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      isValid = false;
    }
    return isValid;
  }

  createPayload(payload) {
    return payload;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
