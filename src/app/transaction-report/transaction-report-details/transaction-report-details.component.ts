import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import { TransactionReportService } from '../transaction-report.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-transaction-report-details',
  templateUrl: './transaction-report-details.component.html',
  styleUrls: ['./transaction-report-details.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class TransactionReportDetailsComponent implements OnInit, OnDestroy {
  isWaitingForResponse: boolean = false;
  private subs = new SubSink();
  transactionId: any;
  transactionData: any;
  sepaLogo = '../../../../../assets/img/sepa-wt-logo.png';

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionReportService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.transactionId = this.activatedRoute.snapshot.queryParams.id;
    if (this.transactionId) {
      this.getTransactionDetail(this.transactionId);
    }

    this.subs.sink = this.translate.onLangChange.pipe().subscribe((resp) => {
      if (resp && this.transactionId) {
        this.getTransactionDetail(this.transactionId);
      }
    });
  }

  getTransactionDetail(transactionId: string) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.transactionService.getOneTransaction(transactionId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        console.log(resp);
        const temp = _.cloneDeep(resp);

        // *************** Formatting Date and Timeline Date
        if (temp && temp.created_at && temp.created_at.date && temp.created_at.time) {
          temp.created_at.date = this.parseUTCToLocalPipe.transformDate(temp.created_at.date, temp.created_at.time);
          temp.created_at.time = this.parseUTCToLocalPipe.transform(temp.created_at.time);
        }
        if (temp && temp.timelines) {
          temp.timelines.forEach((timeline) => {
            if (timeline.date && timeline.time) {
              timeline.date = this.parseUTCToLocalPipe.transformDate(timeline.date, timeline.time);
              timeline.time = this.parseUTCToLocalPipe.transform(timeline.time);
              timeline['displayDate'] = this.transactionData = this.translateDate(timeline.date, timeline.time);
            }
          });
        }
        // *************** End of Date Formatting
        this.transactionData = temp;
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

  translateDate(date, time) {
    let result = '';
    if (date && time) {
      return moment(date + time, 'DD/MM/YYYYHH:mm').toDate();
    }

    // Localization with localeString
    // if (date && time) {
    //   const dateResult = moment(date + time, 'DD/MM/YYYYHH:mm').toDate();
    //   const locale = this.translate.currentLang === 'en' ? 'en-US' : 'fr-FR';
    //   return dateResult.toLocaleString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit',  minute: '2-digit', timeZoneName: 'short'});
    // }

    return result;
  }

  translateTotal(total: any): String {
    let result = '';
    if (total) {
      if (this.translate.currentLang === 'fr') {
        result = parseFloat(total)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      } else {
        result = parseFloat(total)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      }
    }
    return result;
  }

  translateFeeAndNet(number: any): String {
    let result = '';
    if (number) {
      if (this.translate.currentLang === 'fr') {
        result = parseFloat(number)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$& ');
      } else {
        result = parseFloat(number)
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,');
      }
    }
    return result;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  getFourLast(iban) {
    let data = '';
    if (iban) {
      data = iban.substr(iban.length - 4);
    }
    return data;
  }
}
