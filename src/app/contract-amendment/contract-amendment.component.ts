import { AuthService } from './../service/auth-service/auth.service';
import { ApplicationUrls } from 'app/shared/settings';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
@Component({
  selector: 'ms-contract-amendment',
  templateUrl: './contract-amendment.component.html',
  styleUrls: ['./contract-amendment.component.scss'],
})
export class ContractAmendmentComponent implements OnInit {
  schoolLogo;
  isWaitingForResponse = false;
  candidateId;
  formId;
  candidateData;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  private subs = new SubSink();

  constructor(
    private route: ActivatedRoute,
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((resp: any) => {
      if (resp?.params) {
        if (resp.params.candidate) {
          this.candidateId = resp.params.candidate;
          this.getOneCandidate();
        }
        if (resp?.params?.form_id) {
          this.formId = resp.params.form_id;
        }
      }
    });
  }
  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        if (resp) {
          const res = _.cloneDeep(resp);
          this.candidateData = resp;
          if (res && res.school && res.school.school_logo) {
            this.schoolLogo = res.school.school_logo;
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
}
