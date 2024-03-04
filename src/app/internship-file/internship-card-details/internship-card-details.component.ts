import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { ApplicationUrls } from 'app/shared/settings';
import { UrgentMessageDialogComponent } from 'app/urgent-message/urgent-message-dialog.component';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AddPaymentDialogComponent } from '../add-payment-dialog/add-payment-dialog.component';
import { BlockStudentsDialogComponent } from '../block-students-dialog/block-students-dialog.component';
import { InternshipCallDialogComponent } from '../internship-call-dialog/internship-call-dialog.component';
import { InternshipEmailDialogComponent } from '../internship-email-dialog/internship-email-dialog.component';
import { InternshipWhatsappDialogComponent } from '../internship-whatsapp-dialog/internship-whatsapp-dialog.component';
import { TermsAmountDialogComponent } from '../tems-amount-dialog/tems-amount-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'ms-internship-card-details',
  templateUrl: './internship-card-details.component.html',
  styleUrls: ['./internship-card-details.component.scss'],
})
export class InternshipCardDetailsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() candidateId = {};
  @Input() tab;
  @ViewChild('candidateMatGroup', { static: false }) candidateMatGroup: MatTabGroup;
  candidate: any = {};
  isWaitingForResponse: Boolean = false;
  private subs = new SubSink();
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'profile-tab': 'Candidature Profile',
    'respondant-tab': 'Frais de scolarite',
  };

  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  selectedIndex = 0;
  urgentMessageDialogComponent: MatDialogRef<UrgentMessageDialogComponent>;
  urgentMessageConfig: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  constructor(
    private candidateService: CandidatesService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private financeService: FinancesService,
  ) {}
  ngOnInit() {
    this.moveToTab(this.tab);
  }
  ngAfterViewInit() {
    this.moveToTab(this.tab);
  }
  ngOnChanges() {
    this.isWaitingForResponse = true;
    console.log(this.candidateId);
    this.getDataCandidate();
  }
  getDataCandidate() {
    this.subs.sink = this.candidateService.getCandidateDetails(this.candidateId).subscribe((candidateData) => {
      this.mappingTermDats(candidateData);
      console.log('candidate data is:', candidateData);
      this.isWaitingForResponse = false;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  mappingTermDats(data) {
    if (data && data.hasOwnProperty('billing_id') && data.billing_id && data.billing_id.terms && data.billing_id.terms.length) {
      data.billing_id.terms.forEach((terms) => {
        if (this.checkMomentIsBetween(terms, '01/10/2020', '31/10/2020')) {
          data.terms_1 = terms;
          terms.terms_index = 0;
        }
        if (this.checkMomentIsBetween(terms, '01/11/2020', '30/11/2020')) {
          data.terms_2 = terms;
          terms.terms_index = 1;
        }
        if (this.checkMomentIsBetween(terms, '01/12/2020', '31/12/2020')) {
          data.terms_3 = terms;
          terms.terms_index = 2;
        }
        if (this.checkMomentIsBetween(terms, '01/01/2021', '31/01/2021')) {
          data.terms_4 = terms;
          terms.terms_index = 3;
        }
        if (this.checkMomentIsBetween(terms, '01/02/2021', '28/02/2021')) {
          data.terms_5 = terms;
          terms.terms_index = 4;
        }
        if (this.checkMomentIsBetween(terms, '01/03/2021', '31/03/2021')) {
          data.terms_6 = terms;
          terms.terms_index = 5;
        }
        if (this.checkMomentIsBetween(terms, '01/04/2021', '30/04/2021')) {
          data.terms_7 = terms;
          terms.terms_index = 6;
        }
        if (this.checkMomentIsBetween(terms, '01/05/2021', '31/05/2021')) {
          data.terms_8 = terms;
          terms.terms_index = 7;
        }
      });
    }
    console.log('data', data);
    this.candidate = data;
  }

  checkMomentIsBetween(data, range1, range2) {
    const found =
      moment(data.term_payment.date).isBetween(moment(range1, 'DD/MM/YYYY'), moment(range2, 'DD/MM/YYYY')) ||
      data.term_payment.date === range2;
    return found;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'history-tab':
          this.selectedIndex = 0;
          break;
        case 'note-tab':
          this.selectedIndex = 1;
          break;
        case 'profile-tab':
          this.selectedIndex = 2;
          break;
        case 'respondant-tab':
          this.selectedIndex = 3;
          break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  internshipCallDialog() {
    const data = { candidate_id: this.candidate };
    this.subs.sink = this.dialog
      .open(InternshipCallDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  internshipMailDialog() {
    const data = { candidate_id: this.candidate };
    this.subs.sink = this.dialog
      .open(InternshipEmailDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  internshipWhatsappDialog() {
    const data = { candidate_id: this.candidate };
    this.subs.sink = this.dialog
      .open(InternshipWhatsappDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  addPaymentDialog() {
    const data = { candidate_id: this.candidate };
    let width = '620px';
    if (this.candidate.billing_id.terms.length === 6) {
      width = '660px';
    } else if (this.candidate.billing_id.terms.length === 7) {
      width = '740px';
    } else if (this.candidate.billing_id.terms.length === 8) {
      width = '805px';
    }
    this.subs.sink = this.dialog
      .open(AddPaymentDialogComponent, {
        width: width,
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getDataCandidate();
      });
  }

  termAmountDialog(data) {
    const termData = _.cloneDeep(this.candidate.billing_id);
    this.subs.sink = this.dialog
      .open(TermsAmountDialogComponent, {
        width: '1050px',
        minHeight: '100px',
        disableClose: true,
        data: termData,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getDataCandidate();
      });
  }

  blockStudentsDialog() {
    if (!this.candidate.billing_id.is_student_blocked) {
      const data = { candidate_id: this.candidate };
      this.subs.sink = this.dialog
        .open(BlockStudentsDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: data,
        })
        .afterClosed()
        .subscribe((resp) => {
          this.getDataCandidate();
        });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('PAYMENT_FOLLOW_S4.TITLE'),
        html: this.translate.instant('PAYMENT_FOLLOW_S4.TEXT', {
          candidateName:
            (this.candidate.civility !== 'neutral' ? this.translate.instant(this.candidate.civility) + ' ' : '') +
            this.candidate.first_name +
            ' ' +
            this.candidate.last_name,
        }),
        showCancelButton: true,
        allowEscapeKey: true,
        allowOutsideClick: false,
        reverseButtons: true,
        confirmButtonText: this.translate.instant('PAYMENT_FOLLOW_S4.BUTTON_1'),
        cancelButtonText: this.translate.instant('PAYMENT_FOLLOW_S4.BUTTON_2'),
      }).then((res) => {
        if (res.value) {
          const payload = {
            is_student_blocked: false,
          };
          this.subs.sink = this.financeService.UpdateBilling(payload, this.candidate.billing_id._id).subscribe((list) => {
            console.log('Data Updated', list);
            this.getDataCandidate();
            Swal.fire({
              type: 'success',
              title: this.translate.instant('PAYMENT_FOLLOW_S5.TITLE'),
              html: this.translate.instant('PAYMENT_FOLLOW_S5.TEXT', {
                candidateName:
                  (this.candidate.civility !== 'neutral' ? this.translate.instant(this.candidate.civility) + ' ' : '') +
                  this.candidate.first_name +
                  ' ' +
                  this.candidate.last_name,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('PAYMENT_FOLLOW_S5.BUTTON'),
            }).then((resss) => {
              this.getDataCandidate();
            });
          }, (err) => {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          });
        }
      });
    }
  }
  sendUrgentMessage() {
    this.urgentMessageDialogComponent = this.dialog.open(UrgentMessageDialogComponent, this.urgentMessageConfig);
  }
}
