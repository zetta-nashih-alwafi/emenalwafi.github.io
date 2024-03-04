import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import * as moment from 'moment';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import Swal from 'sweetalert2';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-assign-timeline-template-dialog',
  templateUrl: './assign-timeline-template-dialog.component.html',
  styleUrls: ['./assign-timeline-template-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AssignTimelineTemplateDialogComponent implements OnInit {
  private subs = new SubSink();
  currencyList = [];
  assignTimelineForm: UntypedFormGroup;

  isLoading: boolean = false;
  lastDate: string;
  timelineTemplateList: any[];
  showDetailTimeline: boolean = false;
  currentUser

  isWaitingForResponse = false;

  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<AssignTimelineTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.initAssignTimelineForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });

    this.getTimelineTemplateList();
    // this.populateAssignDialog();
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  populateAssignDialog(selectedData) {
    if (selectedData) {
      this.subs.sink = this.financeService.getOneTimelineTemplate(selectedData._id).subscribe(
        (data) => {
          if (data) {
            let value = {
              template_id: data._id,
              description: data.description,
              terms: data.terms,
              percentage_by_term: data.percentage_by_term,
            };
            if (value) {
              this.showDetailTimeline = true;
              const control = this.assignTimelineForm.get('percentage_by_term').value;
              const temp = _.cloneDeep(control);
              for (let i = temp.length - 1; i >= 0; i--) {
                this.payment.removeAt(i);
              }
              value.percentage_by_term.forEach((element) => {
                if (element.date) {
                  element.date = this.parseStringDatePipe.transform(element.date);
                }
                this.addPayment();
              });
              this.assignTimelineForm.patchValue(value);
            }
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    } else {
      this.showDetailTimeline = false;
    }
  }

  getTimelineTemplateList() {
    this.subs.sink = this.financeService.getAllTimelineName().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.timelineTemplateList = resp;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  initAssignTimelineForm() {
    this.assignTimelineForm = this.fb.group({
      template_id: [null, Validators.required],
      description: [null],
      terms: [0],
      percentage_by_term: this.fb.array([this.initPayment()]),
      // additional_cost: [0, [Validators.min(0)]],
      // currency: ['EUR'],
      // scholar_season_id: [null],
      // select_payment_method_available: [[]],
    });

    const yearNow = moment(new Date()).format('YYYY');
    this.lastDate = moment('30/09/' + yearNow, 'DD/MM/YYYY').format('DD/MM/YYYY');

    this.assignTimelineForm.get('percentage_by_term').get('0').get('percentage').patchValue(100);
    const firstDate = this.parseStringDatePipe.transformStringToDate(this.lastDate);
    this.assignTimelineForm.get('percentage_by_term').get('0').get('date').setValue(firstDate);

    // this.assignTimelineForm = this.fb.group({
    //   name: [null, Validators.required],
    //   terms: [1],
    //   percentage_by_term: this.fb.array([this.initPayment()]),
    //   additional_cost: [0, [Validators.min(0)]],
    //   currency: ['EUR'],
    //   scholar_season_id: [null],
    //   select_payment_method_available: [[]],
    // });

    // const yearNow = moment(new Date()).format('YYYY');
    // this.lastDate = moment('30/09/' + yearNow, 'DD/MM/YYYY').format('DD/MM/YYYY');

    // this.assignTimelineForm.get('percentage_by_term').get('0').get('percentage').patchValue(100);
    // const firstDate = this.parseStringDatePipe.transformStringToDate(this.lastDate);
    // this.assignTimelineForm.get('percentage_by_term').get('0').get('date').setValue(firstDate);
    // this.assignTimelineForm.get('additional_cost').patchValue(0);
    // this.assignTimelineForm.get('currency').patchValue('EUR');
  }

  initPayment(fromSlider?, nextDate?) {
    if (fromSlider) {
      return this.fb.group({
        date: [nextDate, Validators.required],
        amount: [null],
        percentage: ['', [Validators.required, Validators.min(0)]],
      });
    } else {
      return this.fb.group({
        date: ['', Validators.required],
        amount: [null],
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
    return this.assignTimelineForm.get('percentage_by_term') as UntypedFormArray;
  }

  changeSlider() {
    const control = this.assignTimelineForm.get('percentage_by_term').value;
    const termTotal = this.assignTimelineForm.get('terms').value;
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
      this.assignTimelineForm.get('percentage_by_term').patchValue(temp);
    }
    for (let i = 0; i < termTotal; i++) {
      if (!this.assignTimelineForm.get('percentage_by_term').get(i.toString()).get('date').value) {
        const lastDate = this.assignTimelineForm
          .get('percentage_by_term')
          .get((i - 1).toString())
          .get('date').value;
        updatedDate = moment(lastDate, 'DD/MM/YYYY').add(1, 'month').format('DD/MM/YYYY');
        nextDate = this.parseStringDatePipe.transformStringToDate(updatedDate);
        this.assignTimelineForm.get('percentage_by_term').get(i.toString()).get('date').patchValue(nextDate);
      }
    }
    this.calculatePercentage();
  }

  calculatePercentage() {
    const termTotal = _.cloneDeep(this.assignTimelineForm.get('terms').value);
    const control = _.cloneDeep(this.assignTimelineForm.get('percentage_by_term').value);
    let balance = (100 / termTotal).toString();
    balance = parseFloat(balance).toFixed(2);
    balance = Math.round(parseInt(balance)).toString();
    control.forEach((element, index) => {
      if (control.length - 1 === index) {
        const remainDisc = 100 - parseInt(balance) * (termTotal - 1);
        this.assignTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(remainDisc);
      } else {
        this.assignTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(balance));
      }
    });
  }

  recalculateDisc(ind) {
    const percentage = this.assignTimelineForm.get('percentage_by_term').get(ind.toString()).get('percentage').value;
    const remainingPercentage = 100 - percentage;
    const termTotal = _.cloneDeep(this.assignTimelineForm.get('terms').value);
    const control = _.cloneDeep(this.assignTimelineForm.get('percentage_by_term').value);
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
          this.assignTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(remainDisc);
        } else {
          this.assignTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(balance));
        }
      } else if (control.length - 1 === ind) {
        if (index !== ind) {
          if (index === ind - 1) {
            const discTotal = parseInt(balance) * (termTotal - 2);
            const remainingDisc = (100 - discTotal - percentage).toString();
            balance = (100 - (lastPercentages + percentage)).toString();
            this.assignTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(remainingDisc));
          } else {
            this.assignTimelineForm.get('percentage_by_term').get(index.toString()).get('percentage').setValue(parseInt(balance));
          }
        }
      }
    });
  }

  handleSubmit() {
    if (this.assignTimelineForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-formsave-s1');
        },
      });
      this.assignTimelineForm.markAllAsTouched();
      return true;
    } else {
      this.isWaitingForResponse = true;
      const termValue = this.assignTimelineForm.get('percentage_by_term').value;

      const _id = this.parentData._id;
      const filter = this.parentData.filter;
      const search = this.parentData.search;
      const select_all = this.parentData.select_all;
      const term_times = this.assignTimelineForm.get('terms').value;
      let terms = [];

      termValue.forEach((item) => {
        terms.push({
          term_payment: {
            date: moment(item.date).format('DD/MM/YYYY'),
            time: moment(item.date).format('HH:mm'),
          },
          term_percentage: item.percentage,
        });
      });
      this.currentUser = this.authService.getLocalStorageUser();
      const userTypesList = this.currentUser?.app_data ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.financeService.assignTimelineTemplateData(term_times, terms, select_all, filter, search, _id,userTypesList).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
          this.showSwalError(err);
        },
      );
    }
  }

  showSwalError(err) {
    if (err['message'] === 'GraphQL error: Some of the organizations already have terms, please unselect those organization') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Organization_S4.Title'),
        html: this.translate.instant('Organization_S4.Body'),
        confirmButtonText: this.translate.instant('Organization_S4.Button'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        onOpen: (modalEl) => {
          modalEl.setAttribute('data-cy', 'swal-organization-s4');
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
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      }).then(() => {
        this.dialogRef.close(true);
      });
    }
  }
}
