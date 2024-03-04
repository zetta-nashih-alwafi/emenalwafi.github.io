import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseStringDatePipe } from './../../../shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from './../../../shared/pipes/parse-utc-to-local.pipe';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'ms-dp-regulation-dialog',
  templateUrl: './dp-regulation-dialog.component.html',
  styleUrls: ['./dp-regulation-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class DpRegulationDialogComponent implements OnInit {
  subs = new SubSink();
  dpHistory: any;
  isWaitingForResponse = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DpRegulationDialogComponent>,
    private translate: TranslateService,
    private financeService: FinancesService,
    private parseUTC: ParseUtcToLocalPipe,
    private parseString: ParseStringDatePipe,
  ) {}

  ngOnInit(): void {
    this.getDPHistories();
  }

  getDPHistories() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getOneBillingDPRegulation(this.data.billing_id).subscribe(
      (DP) => {
        if (DP) {
          this.dpHistory = _.cloneDeep(DP);
          this.dpHistory.dp_histories = this.dpHistory.dp_histories.sort((a, b) => {
            const dateB: any = b?.date_inserted?.date;
            const dateA: any = a?.date_inserted?.date;
            if (moment(dateB).isAfter(moment(dateA))) {
              return -1;
            } else if (moment(dateA).isAfter(moment(dateB))) {
              return -1;
            } else if (moment(dateA).isSame(moment(dateB))) {
              return 0;
            }
          });
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }

  translateDate(datee, timee) {
    let dates = '';
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseString.transformStringToDate(this.parseUTC.transformDate(datee, finalTime));
      dates = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    }
    return dates;
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  close() {
    this.dialogRef.close();
  }
}
