import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';

@Component({
  selector: 'ms-detail-transaction-master-dialog',
  templateUrl: './detail-transaction-master-dialog.component.html',
  styleUrls: ['./detail-transaction-master-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class DetailTransactionMasterDialogComponent implements OnInit {
  private sub = new SubSink();
  isWaitingForResponse = false;

  dataDisplay;

  constructor(
    public dialogRef: MatDialogRef<DetailTransactionMasterDialogComponent>,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
  ) {}

  ngOnInit(): void {
    this.dataDisplay = this.data;

    if (this.data?.transaction_id?.psp_reference) {
      this.dataDisplay['display_reference'] = this.data.transaction_id.psp_reference;
    } else {
      this.dataDisplay['display_reference'] = this.data?.reference;
    }
  }

  displayTransactionType(data) {
    if (data) {
      return this.translate.instant('master_transaction.' + data);
    } else {
      return '-';
    }
  }

  parseDateToLocal(createdAt) {
    const date = createdAt.date;
    const time = createdAt.time;

    if (date && time) {
      const parsed = this.parseUtcToLocalPipe.transformDate(date, time);
      return parsed;
    } else {
      return '';
    }
  }

  displayOperationName(data, from?, index?) {
    let indexParse = Number(index) + 1;
    if (data) {
      if (data?.includes('avoir_scholarship_fees')) {
        return data?.replace('avoir_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_scholarship_fees'));
      } else if (data?.includes('avoir_of_scholarship_fees')) {
        return data?.replace('avoir_of_scholarship_fees', this.translate.instant('OPERATION_NAME.avoir_of_scholarship_fees'));
      } else if (data?.includes('scholarship_fees')) {
        return data?.replace('scholarship_fees', this.translate.instant('OPERATION_NAME.scholarship_fees'));
      } else if (data?.toLowerCase() === 'billing of down payment') {
        return this.translate.instant('Billing of down payment');
      } else if (data?.includes('Billing Term')) {
        return data?.replace('Billing Term', this.translate.instant('Billing Term'));
      } else if (data?.includes('billing_of_term')) {
        return this.translate.instant('OPERATION_NAME.billing_of_term');
      } else if (data === 'payment_of_dp' && from === 'classic') {
        return this.translate.instant('OPERATION_NAME.down_payment');
      } else if (data === 'regulation_payment') {
        return `${
          this.translate.instant('OPERATION_NAME.payment_of_term') +
          ' ' +
          indexParse +
          ' - ' +
          this.translate.instant('OPERATION_NAME.Regulation')
        }`;
      } else if (data === 'payment_of_term') {
        return `${this.translate.instant('OPERATION_NAME.payment_of_term') + ' ' + index}`;
      } else {
        return this.translate.instant('OPERATION_NAME.' + data);
      }
    } else {
      return '-';
    }
  }

  parseTermIndexToNumber(data) {
    if (data || data === 0) {
      return Number(data) + 1;
    }
  }
}
