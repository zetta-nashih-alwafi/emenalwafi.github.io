import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TaskService } from 'app/service/task/task.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UserService } from 'app/service/user/user.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ApplicationUrls } from 'app/shared/settings';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ms-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class RegistrationDialogComponent implements OnInit, OnDestroy {
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
  campusList = [
    {
      campus: 'PARIS',
      dev_leader: {
        civility: 'MR',
        first_name: 'Rémi',
        last_name: 'Barrault',
      },
    },
    {
      campus: 'NEW YORK',
      dev_leader: {
        civility: 'MRS',
        first_name: 'Michel',
        last_name: 'Lemaître',
      },
    },
    {
      campus: 'Lyon',
      dev_leader: {
        civility: 'MR',
        first_name: 'Léon',
        last_name: 'Blanc',
      },
    },
  ];

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  currentUser: any;
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
  constructor(
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    public userService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.paymentPlanMethod = this.fb.group({
      method: [''],
    });
    console.log('Candidate Selected is => ', this.data);
    this.method = this.data && this.data.data ? this.data.data : '';
    const campus = this.route.snapshot.queryParamMap.get('campus');
    const candidate = this.route.snapshot.queryParamMap.get('candidate')
      ? this.route.snapshot.queryParamMap.get('candidate')
      : this.data && this.data.candidateId
      ? this.data.candidateId
      : '';
    if (campus) {
      this.campus = campus;
    }
    if (candidate) {
      this.candidate = candidate;
    }
    this.getCandidate();
    this.currentUser = this.userService.getLocalStorageUser();
  }

  getCandidate() {
    this.getDataValidation();
    if (this.data.type === 'confirmTwo') {
      console.log('Data Modify', this.data.modify);
      this.candidate = this.data.candidateId;
    }
    this.subs.sink = this.candidateService.getCandidateRegistration(this.candidate).subscribe(
      (resp) => {
        this.singleCandidate = resp;
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

  confirm(type) {
    let message = '';
    if (this.data.type === 'confirmTwo') {
      if (this.data.data === 'Transfer') {
        message = 'You confirmed payment by transfer';
      } else {
        message = 'You confirmed payment by credit card';
      }
    } else if (this.data.type === 'confirmTiga') {
      message = 'You confirmed your Payment';
    } else if (this.data.type === 'confirmOne') {
      message = 'You confirmed your Method of Payment';
    }
    if (this.data.type === 'confirmOne') {
      this.subs.sink = this.candidateService.SendRegistrationNotification(this.data.candidateId).subscribe(
        (resp) => {
          Swal.fire({
            type: 'success',
            title: 'Bravo !',
            text: this.translate.instant(message),
          }).then(() => {
            const data = {
              type: 'reset',
              data: this.data.type,
            };
            //  add call query GetAllStepValidationMessages when it clik button go to step
            if (this.data && this.data.type === 'stepValidation') {
              this.validationStepList = '';
              this.getDataValidation();
            }
            this.dialogRef.close(data);
          });
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then(() => {
            this.closeDialog();
          });
        },
      );
    } else {
      const payload = this.createPayload(_.cloneDeep(this.data.modify));
      delete payload._id;
      delete payload.candidate_name;
      delete payload.split;
      delete payload.relation_bank;
      delete payload.already_started;
      delete payload.rate_amount;
      delete payload.deposit_amount;
      delete payload.payment_plan;
      delete payload.method_dp;
      delete payload.count_document;
      delete payload.user_id;
      this.subs.sink = this.candidateService.UpdateCandidate(this.data.candidateId, payload).subscribe(
        (resp) => {
          if (resp) {
            console.log('Candidate Updated!', resp);
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              text: this.translate.instant(message),
              allowOutsideClick: false,
              confirmButtonText: 'OK',
            }).then(() => {
              const data = {
                type: 'reset',
                data: this.data.type,
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
            }).then(() => {
              this.closeDialog();
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
            }).then(() => {
              this.closeDialog();
            });
          } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('IBAN_S1.Title'),
              text: this.translate.instant('IBAN_S1.Text'),
              confirmButtonText: this.translate.instant('IBAN_S1.Button'),
            }).then(() => {
              this.closeDialog();
            });
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then(() => {
              this.closeDialog();
            });
          }
        },
      );
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

  confirmValidation(type) {
    console.log('Masuk Sini ', this.data.step);
    let step = this.data.step;
    if (step !== 3 && step !== 4 && step !== 5 && step !== 6) {
      console.log('Masuk Sini 2', this.data.step, step);
      this.candidateService.setIndexStep(step++);
      const data = {
        type: 'reset',
        data: this.data.type,
      };
      this.dialogRef.close(data);
    } else {
      const data = {
        type: 'reset',
        data: this.data.type,
      };
      this.dialogRef.close(data);
    }
  }

  radioChange(type, event) {
    console.log('radioChange $event', event);
    this.buttonDisabled = false;
  }

  confirmPayment(type) {
    const payload = this.createPayload(_.cloneDeep(this.data.data));
    payload.personal_information = 'done';
    payload.method_of_payment = this.paymentPlanMethod.get('method').value;
    const dates = this.data.balance.payment_date.map((list) => {
      return {
        date: list.date,
        amount: parseInt(list.amount.toFixed()),
      };
    });
    payload.selected_payment_plan = {
      name: this.data.balance.name,
      total_amount: this.data.balance.total_amount,
      times: this.data.balance.times,
      additional_expense: parseFloat(this.data.balance.additional_expense),
      down_payment: parseFloat(this.data.balance.down_payment),
      payment_date: dates && dates.length ? dates : [],
    };
    delete payload.rate_amount;
    delete payload.deposit_amount;
    delete payload.payment_plan;
    delete payload.method_dp;
    delete payload.count_document;
    delete payload.user_id;
    console.log('Date payload', payload);
    this.subs.sink = this.candidateService.UpdateCandidate(this.data.candidateId, payload).subscribe(
      (resp) => {
        if (resp) {
          console.log('Candidate Updated!', resp);
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            text: this.translate.instant('You confirmed your down Payment'),
            allowOutsideClick: false,
            confirmButtonText: 'OK',
          }).then((val) => {
            const data = {
              type: 'reset',
              data: this.data.type,
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
          }).then(() => {
            this.closeDialog();
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
          }).then(() => {
            this.closeDialog();
          });
        } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('IBAN_S1.Title'),
            text: this.translate.instant('IBAN_S1.Text'),
            confirmButtonText: this.translate.instant('IBAN_S1.Button'),
          }).then(() => {
            this.closeDialog();
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then(() => {
            this.closeDialog();
          });
        }
      },
    );
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

  sanitizeVideoUrl(url) {
    let text = url;
    let key = '';
    if (url && url.search('youtube.com/embed/') !== -1) {
      key = text.indexOf('embed/') + 6;
      const message = text.slice(key, text.length);
      text = url ? this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + message) : '';
    } else {
      if (url && url.search('youtube.com') !== -1) {
        key = text.indexOf('=') + 1;
        const message = text.slice(key, text.length);
        text = url ? this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + message) : '';
      } else {
        text = url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
      }
    }
    return text;
  }

  getDataValidation() {
    const school = this.data.data.school ? this.data.data.school.short_name : '';
    const campus = this.data.data.campus ? this.data.data.campus.name : '';
    this.subs.sink = this.candidateService.getAllStepValidationMessages(school, campus, this.data.step).subscribe(
      (resp) => {
        if (resp) {
          this.validationStepList = resp;
          if (this.validationStepList.video_link) {
            this.isVideoLink = true;
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

  messageDialog() {
    let message = '';
    message += this.translate.instant('CANDIDATE_POPUP_C6.CANDIDATE_TEXT', {
      candidateName: this.singleCandidate
        ? (this.singleCandidate.civility !== 'neutral' ? this.translate.instant(this.singleCandidate.civility) + ' ' : '') +
          this.singleCandidate.first_name +
          ' ' +
          this.singleCandidate.last_name
        : '',
    });

    return message;
  }
}
