import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import * as moment from 'moment';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-timeline-template-dialog',
  templateUrl: './add-timeline-template-dialog.component.html',
  styleUrls: ['./add-timeline-template-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddTimelineTemplateDialogComponent implements OnInit {
  private subs = new SubSink();
  currencyList = [];
  addTimelineForm: UntypedFormGroup;

  isLoading: boolean = false;
  lastDate: string;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddTimelineTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private acadJourneyService: AcademicJourneyService,
    private parseStringDatePipe: ParseStringDatePipe,
    private translate: TranslateService,
    private financeService: FinancesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initAddTimelineForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
    if (this.parentData && this.parentData.source && this.parentData.source.terms && this.parentData.source.terms > 0) {
      this.addTimelineForm.get('terms').setValue(0);
      const control = this.addTimelineForm.get('percentage_by_term').value;
      const temp = _.cloneDeep(control);
      for (let i = temp.length - 1; i >= 0; i--) {
        this.payment.removeAt(i);
      }
      this.parentData.source.percentage_by_term.forEach((element) => {
        if (element.date) {
          element.date = this.parseStringDatePipe.transform(element.date);
        }
        this.addPayment();
      });
      this.addTimelineForm.patchValue(this.parentData.source);
    }
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  initAddTimelineForm() {
    this.addTimelineForm = this.fb.group({
      template_name: [null, Validators.required],
      description: [null],
      terms: [1],
      percentage_by_term: this.fb.array([this.initPayment()]),
      // additional_cost: [0, [Validators.min(0)]],
      // currency: ['EUR'],
      // scholar_season_id: [null],
      // select_payment_method_available: [[]],
    });

    const yearNow = moment(new Date()).format('YYYY');
    this.lastDate = moment('30/09/' + yearNow, 'DD/MM/YYYY').format('DD/MM/YYYY');

    this.addTimelineForm.get('percentage_by_term').get('0').get('percentage').patchValue(100);
    const firstDate = this.parseStringDatePipe.transformStringToDate(this.lastDate);
    this.addTimelineForm.get('percentage_by_term').get('0').get('date').setValue(firstDate);
    // this.addTimelineForm.get('additional_cost').patchValue(0);
    // this.addTimelineForm.get('currency').patchValue('EUR');
  }

  populateDialog() {
    if (this.parentData && this.parentData.comps && this.parentData.comps.isEdit) {
      this.addTimelineForm.patchValue(this.parentData.source);
      // this.changeSlider();
    }
  }

  initPayment(fromSlider?, nextDate?) {
    if (fromSlider) {
      return this.fb.group({
        date: [nextDate, Validators.required],
        // amount: [null],
        percentage: ['', [Validators.required, Validators.min(0)]],
      });
    } else {
      return this.fb.group({
        date: ['', Validators.required],
        // amount: [null],
        percentage: ['', [Validators.required, Validators.min(0)]],
      });
    }
  }

  addPayment(fromSlider?, date?) {
    this.payment.push(this.initPayment(fromSlider, date));
  }
  removePayment(parentIndex: number) {
    this.payment.removeAt(parentIndex);
  }
  get payment() {
    return this.addTimelineForm.get('percentage_by_term') as UntypedFormArray;
  }
  // get selectedPaymentMethods() {
  //   return this.identityForm.get('select_payment_method_available');
  // }
  changeSlider() {
    const control = _.cloneDeep(this.addTimelineForm.get('percentage_by_term').value);
    const termTotal = this.addTimelineForm.get('terms').value;
    const temp = _.cloneDeep(control);
    let updatedDate;
    let nextDate;

    for (let i = control.length - 1; i >= 0; i--) {
      this.payment.removeAt(i);
    }
    for (let i = 0; i < termTotal; i++) {
      this.addPayment();
    }
    if (temp && temp.length) {
      temp.forEach((element) => {
        if (element.date) {
          element.date = this.parseStringDatePipe.transform(element.date);
        }
      });
      this.addTimelineForm.get('percentage_by_term').patchValue(temp);
    }
    for (let i = 0; i < termTotal; i++) {
      if (!this.addTimelineForm.get('percentage_by_term').get(i.toString()).get('date').value) {
        const lastDate = this.addTimelineForm
          .get('percentage_by_term')
          .get((i - 1).toString())
          .get('date').value;
        updatedDate = moment(lastDate, 'DD/MM/YYYY').add(1, 'month').format('DD/MM/YYYY');
        nextDate = this.parseStringDatePipe.transformStringToDate(updatedDate);
        this.addTimelineForm.get('percentage_by_term').get(i.toString()).get('date').patchValue(nextDate);
      }
    }
    this.calculatePercentage();
  }

  calculatePercentage() {
    const termTotal = _.cloneDeep(this.addTimelineForm.get('terms').value);
    const control = _.cloneDeep(this.addTimelineForm.get('percentage_by_term').value);
    let balance = (100 / termTotal).toString();
    balance = parseFloat(balance).toFixed(2);
    balance = Math.round(parseInt(balance)).toString();
    control.forEach((element, index) => {
      if (control.length - 1 === index) {
        const remainDisc = 100 - parseInt(balance) * (termTotal - 1);
        console.log('remainDisc', remainDisc);
        this.addTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(remainDisc);
      } else {
        this.addTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(balance));
      }
    });
  }

  recalculateDisc(ind) {
    const percentage = this.addTimelineForm.get('percentage_by_term').get(ind.toString()).get('percentage').value;
    const remainingPercentage = 100 - percentage;
    const termTotal = _.cloneDeep(this.addTimelineForm.get('terms').value);
    const control = _.cloneDeep(this.addTimelineForm.get('percentage_by_term').value);
    let balance = (remainingPercentage / (termTotal - 1)).toString();
    balance = parseFloat(balance).toFixed(2);
    balance = Math.round(parseInt(balance)).toString();
    let lastPercentage = 0;
    control.forEach((elements, indexs) => {
      if (indexs <= ind) {
        lastPercentage += elements.percentage;
      }
    });
    let lastPercentages = 0;
    control.forEach((elements, indexs) => {
      if (indexs < ind - 1) {
        lastPercentages += elements.percentage;
      }
    });
    control.forEach((element, index) => {
      if (index > ind) {
        balance = ((100 - lastPercentage) / (termTotal - (ind + 1))).toString();
        if (control.length - 1 === index) {
          let remainDisc = 0;
          if (termTotal - (ind + 1) !== 1 && ind !== 0) {
            if (termTotal - (ind + 1) !== 1) {
              const discTotal = parseInt(balance) * (termTotal - (ind + 2));
              remainDisc = 100 - (lastPercentage + discTotal);
            } else {
              remainDisc = 100 - lastPercentage;
            }
          } else if (ind === 0) {
            const discTotal = parseInt(balance) * (termTotal - 2);
            remainDisc = 100 - discTotal - percentage;
          } else {
            remainDisc = 100 - lastPercentage;
          }
          console.log('remainDisc', remainDisc, lastPercentage, balance, percentage, termTotal);
          this.addTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(remainDisc);
        } else {
          this.addTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(balance));
        }
      } else if (control.length - 1 === ind) {
        if (index !== ind) {
          if (index === ind - 1) {
            const discTotal = parseInt(balance) * (termTotal - 2);
            const remainingDisc = (100 - discTotal - percentage).toString();
            balance = (100 - (lastPercentages + percentage)).toString();
            this.addTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(remainingDisc));
          } else {
            this.addTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(balance));
          }
        }
      }
    });
  }

  heandleSubmit() {
    const payload = this.addTimelineForm.value;
    payload.percentage_by_term.forEach((element) => {
      element.date = moment(element.date).format('MM/DD/YYYY');
    });
    if (this.addTimelineForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-formsave-s1');
        },
      });
      this.addTimelineForm.markAllAsTouched();
      return true;
    } else {
      if (this.parentData && this.parentData.comps && this.parentData.comps.isEdit) {
        this.financeService.UpdateTimelineTemplate(this.parentData.source._id, payload).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: Timeline template name already in use') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Finance_Error2.TITLE'),
                text: this.translate.instant('Finance_Error2.TEXT'),
                confirmButtonText: this.translate.instant('Finance_Error2.BUTTON_1'),
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-finance-error2');
                },
              }).then(() => {
                this.dialogRef.close(true);
              });
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('BAD_CONNECTION.Title'),
                html: this.translate.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: 'OK',
              }).then(() => {
                this.dialogRef.close(true);
              });
            }
          },
        );
      } else {
        this.financeService.CreateTimelineTemplate(payload).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: (modalEl) => {
                modalEl.setAttribute('data-cy', 'swal-bravo');
              },
            }).then(() => {
              this.dialogRef.close(true);
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            if (err['message'] === 'GraphQL error: Timeline template name already in use') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Finance_Error2.TITLE'),
                text: this.translate.instant('Finance_Error2.TEXT'),
                confirmButtonText: this.translate.instant('Finance_Error2.BUTTON_1'),
                onOpen: (modalEl) => {
                  modalEl.setAttribute('data-cy', 'swal-finance-error2');
                },
              }).then(() => {
                this.dialogRef.close(true);
              });
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('BAD_CONNECTION.Title'),
                html: this.translate.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: 'OK',
              }).then(() => {
                this.dialogRef.close(true);
              });
            }
          },
        );
      }
    }
  }

  checkComma(event) {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }
}
