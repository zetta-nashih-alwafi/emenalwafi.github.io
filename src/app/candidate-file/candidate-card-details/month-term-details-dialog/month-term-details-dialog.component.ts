import * as _ from 'lodash';
import { ParseStringDatePipe } from './../../../shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from './../../../shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'ms-month-term-details-dialog',
  templateUrl: './month-term-details-dialog.component.html',
  styleUrls: ['./month-term-details-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class MonthTermDetailsDialogComponent implements OnInit {
  private sub = new SubSink();
  isWaitingForResponse = false;

  dataDisplay;

  constructor(
    public dialogRef: MatDialogRef<MonthTermDetailsDialogComponent>,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
  ) {}

  ngOnInit(): void {
    if (this.data?.terms?.length) {
      this.checkPartialTerm();
    }
  }

  checkPartialTerm() {
    this.dataDisplay = [];
    const terms = _.cloneDeep(this.data.terms);

    terms.forEach((term) => {
      let termIndex = term?.terms_index;
      if(this.data?.masterTransactionData?.length) {
        // *************** to check when there is difference term_index between in MasterTransactions and Billings, so need to follow the term_index in MasterTransactions
        const foundData = this.data.masterTransactionData?.find((transactionData) => term?.is_regulation && transactionData?.term_id === term?._id);
        termIndex = foundData?.term_index >= 0 ? foundData?.term_index + 1 : termIndex;
      }

      if (term?.term_status === 'partially_paid') {
        const paidAmount = 
          term?.term_amount_chargeback ? 
          term?.term_pay_amount - term?.term_amount_chargeback - term?.term_amount_not_authorised : 
          term?.term_pay_amount - term?.term_amount_not_authorised;
        const billedAmount =
          term?.term_amount -
          term?.term_pay_amount -
          term?.term_amount_not_authorised -
          term?.term_amount_pending;
        const paidTerm = {
          ...term,
          term_status: 'paid',
          term_amount: paidAmount,
          terms_index: termIndex,
        };

        const billedTerm = {
          ...term,
          term_amount: billedAmount,
          terms_index: termIndex,
        };

        let pendingTerms;
        if (term?.term_amount_pending) {
          pendingTerms = {
            ...term,
            term_amount: term?.term_amount_pending,
            term_status: 'pending',
            terms_index: termIndex,
          };
        }

        let chargebackTerm;
        if(term?.term_amount_chargeback) {
          chargebackTerm = {
            ...term,
            term_amount: term?.term_amount_chargeback,
            term_status: 'chargeback',
            terms_index: termIndex,
          }
        }

        if (billedTerm?.term_amount_chargeback && !billedAmount) {
          billedTerm.term_status = 'chargeback';
        } else if (billedTerm?.term_amount_not_authorised && !billedAmount) {
          billedTerm.term_status = 'not_authorised';
        } else {
          billedTerm.term_status = 'billed';
        }

        if (pendingTerms) {
          if(chargebackTerm) {
            this.dataDisplay.push(paidTerm, pendingTerms, billedTerm, chargebackTerm);
          } else {
            this.dataDisplay.push(paidTerm, pendingTerms, billedTerm);
          }
        } else {
          if(chargebackTerm) {
            this.dataDisplay.push(paidTerm, billedTerm, chargebackTerm);
          } else {
            this.dataDisplay.push(paidTerm, billedTerm);
          }
        }
      } else if (term?.term_status === 'chargeback' && term?.term_amount_chargeback) {
        this.dataDisplay.push({ ...term, term_status: 'chargeback', terms_index: termIndex });
      } else if (term?.term_status === 'billed' && term?.term_amount_not_authorised) {
        this.dataDisplay.push({ ...term, term_status: 'not_authorised', terms_index: termIndex });
      } else if (term?.term_status === 'billed' && term?.term_amount_pending) {
        this.dataDisplay.push({ ...term, term_status: 'pending', terms_index: termIndex });
      } else if (term?.term_status === 'billed' && (term?.term_amount - term?.term_pay_amount > 0 || term?.term_amount - term?.term_amount_chargeback > 0)) {
        this.dataDisplay.push({ ...term, term_status: 'billed', terms_index: termIndex });
        if(term?.term_amount_chargeback) {
          this.dataDisplay.push({ ...term, term_status: 'chargeback', terms_index: termIndex });
        }
      } else if (term?.term_status === 'paid' && term?.term_pay_amount) {
        this.dataDisplay.push({ ...term, term_status: 'paid', term_amount: term?.term_pay_amount - term?.term_amount_chargeback - term?.term_amount_not_authorised - term?.term_amount_pending, terms_index: termIndex });
        if(term?.term_amount_chargeback) {
          this.dataDisplay.push({ ...term, term_status: 'chargeback', terms_index: termIndex });
        }
      } else {
        this.dataDisplay.push({...term, terms_index: termIndex});
      }
    });

    console.log('DATA DISPLAY: ', this.dataDisplay);
  }

  translateDate(terms, timee) {
    let datesOri;
    let dateReturn = '';
    if (terms?.term_payment_deferment?.date) {
      datesOri = terms?.term_payment_deferment?.date
    } else {
      datesOri = terms?.term_payment?.date
    }
    const finalTime = timee ? timee : '15:59';
    if (datesOri) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datesOri, finalTime));
      dateReturn = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    }
    return dateReturn;
  }

  formatCurrency(data) {
    let num = '';
    if (data) {
      num = parseFloat(data)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$& ');
    }
    return num;
  }
}
