import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-payment-modes-dialog',
  templateUrl: './add-payment-modes-dialog.component.html',
  styleUrls: ['./add-payment-modes-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddPaymentModesDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  countryList;
  filteredCountry: any[][] = [];

  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];

  regions: string[][] = [];
  filteredRegions: string[][] = [];
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  paymentMethods = ['check', 'credit_card', 'transfer', 'sepa', 'cash'];

  showForm = false;
  hideButton = false;
  showExisting = false;
  showPatchForm = false;
  allPaymentModeList: any[];
  listPaymentModeCtrl = new UntypedFormControl(null);
  scholarSeasonId: any;
  scholarId;
  firstForm: any;
  lastDate: any;

  selectedPaymentMethods: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPaymentModesDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const yearNow = moment(new Date()).format('YYYY');
    this.lastDate = moment('30/09/' + yearNow, 'DD/MM/YYYY').format('DD/MM/YYYY');
    this.dialogRef.updateSize('750px');
    this.today = new Date();
    this.iniVerificationForm();
    this.getAllPaymentModes();
    this.openForm();
    if (this.data && this.data.term && this.data.term > 0) {
      this.identityForm.get('term').setValue(0);
      const control = this.identityForm.get('payment_date').value;
      const temp = _.cloneDeep(control);
      for (let i = temp.length - 1; i >= 0; i--) {
        this.payment.removeAt(i);
      }
      this.data.payment_date.forEach((element) => {
        if (element.date) {
          element.date = this.parseStringDatePipe.transform(element.date);
        }
        this.addPayment();
      });
    }
    if (this.data.scholarSeasonId) {
      this.scholarSeasonId = this.data.scholarSeasonId;
      this.identityForm.get('scholar_season_id').setValue(this.data.scholarSeasonId);
    }
    if (this.data && this.data._id) {
      this.hideButton = true;
      this.showForm = true;
      let selectedData = [];
      if (this.data && this.data.select_payment_method_available && this.data.select_payment_method_available.length > 0) {
        selectedData = _.cloneDeep(this.data.select_payment_method_available);
      }
      this.selectedPaymentMethods = _.cloneDeep(selectedData);
      this.identityForm.patchValue(this.data);
      this.dialogRef.updateSize('1320px');
      this.firstForm = _.cloneDeep(this.identityForm.value);
    }
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      name: [null, Validators.required],
      description: [null],
      term: [1],
      payment_date: this.fb.array([this.initPayment()]),
      additional_cost: [0, [Validators.min(0)]],
      currency: ['EUR'],
      scholar_season_id: [null],
      select_payment_method_available: [[], [Validators.required]],
    });
    this.addPayment();
    this.identityForm.get('payment_date').get('0').get('percentage').setValue(100);
  }

  initPayment(fromSlider?, nextDate?) {
    if (fromSlider) {
      return this.fb.group({
        date: [nextDate, Validators.required],
        amount: [null],
        percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      });
    } else {
      return this.fb.group({
        date: ['', Validators.required],
        amount: [null],
        percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      });
    }
  }

  addPayment(fromSlider?, date?) {
    this.payment.push(this.initPayment(fromSlider, date));
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  removePayment(parentIndex: number) {
    this.payment.removeAt(parentIndex);
  }

  get payment() {
    return this.identityForm.get('payment_date') as UntypedFormArray;
  }
  // get selectedPaymentMethods() {
  //   return this.identityForm.get('select_payment_method_available');
  // }
  changeSlider() {
    const control = this.identityForm.get('payment_date').value;
    const termTotal = this.identityForm.get('term').value;
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
      this.identityForm.get('payment_date').patchValue(temp);
    }
    for (let i = 0; i < termTotal; i++) {
      if (!this.identityForm.get('payment_date').get(i.toString()).get('date').value) {
        const lastDate = this.identityForm
          .get('payment_date')
          .get((i - 1).toString())
          .get('date').value;
        updatedDate = moment(lastDate, 'DD/MM/YYYY').add(1, 'month').format('DD/MM/YYYY');
        nextDate = this.parseStringDatePipe.transformStringToDate(updatedDate);
        this.identityForm.get('payment_date').get(i.toString()).get('date').patchValue(nextDate);
      }
    }
    this.calculatePercentage();
  }

  calculatePercentage() {
    const termTotal = _.cloneDeep(this.identityForm.get('term').value);
    const control = _.cloneDeep(this.identityForm.get('payment_date').value);
    let balance = (100 / termTotal).toString();
    balance = parseFloat(balance).toFixed(2);
    balance = Math.round(parseInt(balance)).toString();
    control.forEach((element, index) => {
      if (control.length - 1 === index) {
        const remainDisc = 100 - parseInt(balance) * (termTotal - 1);
        this.identityForm.get('payment_date').get(index.toString()).get('percentage').setValue(remainDisc);
      } else {
        this.identityForm.get('payment_date').get(index.toString()).get('percentage').setValue(parseInt(balance));
      }
    });
  }

  recalculateDisc(ind) {
    const percentage = this.identityForm.get('payment_date').get(ind.toString()).get('percentage').value;
    const remainingPercentage = 100 - percentage;
    const termTotal = _.cloneDeep(this.identityForm.get('term').value);
    const control = _.cloneDeep(this.identityForm.get('payment_date').value);
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
          this.identityForm.get('payment_date').get(index.toString()).get('percentage').setValue(remainDisc);
        } else {
          this.identityForm.get('payment_date').get(index.toString()).get('percentage').setValue(parseInt(balance));
        }
      } else if (control.length - 1 === ind) {
        if (index !== ind) {
          if (index === ind - 1) {
            const discTotal = parseInt(balance) * (termTotal - 2);
            const remainingDisc = (100 - discTotal - percentage).toString();
            balance = (100 - (lastPercentages + percentage)).toString();
            this.identityForm.get('payment_date').get(index.toString()).get('percentage').setValue(parseInt(remainingDisc));
          } else {
            this.identityForm.get('payment_date').get(index.toString()).get('percentage').setValue(parseInt(balance));
          }
        }
      }
    });
  }

  checkFormValidity(): boolean {
    if (this.identityForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.identityForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submitVerification() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = _.cloneDeep(this.identityForm.value);
    payload.payment_date.forEach((element) => {
      element.date = moment(element.date).format('MM/DD/YYYY');
    });
    if (this.showExisting) {
      payload.is_from_duplicate = true;
    } else {
      payload.is_from_duplicate = false;
    }
    payload.additional_cost = parseFloat(payload.additional_cost);
    if (this.data && this.data._id && !this.showExisting) {
      this.subs.sink = this.financeService.UpdatePaymentMode(payload, this.data._id).subscribe(
        (resp) => {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
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
            });
          }
        },
      );
    } else {
      this.subs.sink = this.financeService.CreatePaymentMode(payload).subscribe(
        (resp) => {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
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
            });
          }
        },
      );
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openForm() {
    this.showForm = true;
    this.showExisting = false;
    this.identityForm.reset();
    this.showPatchForm = false;
    this.dialogRef.updateSize('1320px');
    this.resetFormArray();
    this.listPaymentModeCtrl.setValue(null);
    this.identityForm.get('term').patchValue(1);
    this.addPayment();
    this.identityForm.get('payment_date').get('0').get('percentage').patchValue(100);
    const firstDate = this.parseStringDatePipe.transformStringToDate(this.lastDate);
    this.identityForm.get('payment_date').get('0').get('date').setValue(firstDate);
    this.identityForm.get('additional_cost').patchValue(0);
    this.identityForm.get('currency').patchValue('EUR');
  }

  resetFormArray() {
    for (let i = this.payment.length - 1; i >= 0; i--) {
      this.removePayment(i);
    }
  }

  openSelectExisting() {
    if (!this.showExisting) {
      this.dialogRef.updateSize('750px');
    }
    this.showForm = false;
    this.showExisting = true;
  }

  getAllPaymentModes() {
    this.subs.sink = this.listPaymentModeCtrl.valueChanges.subscribe((searchTxt: string[]) => {
      this.identityForm.reset();
      this.resetFormArray();
    });

    this.subs.sink = this.financeService.getAllPaymentModesDropdown().subscribe(
      (res) => {
        if (res) {
          this.allPaymentModeList = res;
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

  selectedPaymentMode(selectedData) {
    if (selectedData) {
      this.data = selectedData;
      this.data.term = selectedData.payment_date.length;
      this.checkHasPaymentDate();
      this.identityForm.patchValue(this.data);
      this.showPatchForm = true;
      this.dialogRef.updateSize('1320px');
    }
  }

  checkHasPaymentDate() {
    if (this.data && this.data.term && this.data.term > 0) {
      this.data.payment_date.forEach((element) => {
        if (element.date) {
          element.date = this.parseStringDatePipe.transform(element.date);
        }
        this.addPayment();
      });
    }
  }

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.identityForm.value);
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  onSelectPaymentMethod(checked: boolean, index: number) {
    const methodIndex = this.selectedPaymentMethods ? this.selectedPaymentMethods.indexOf(this.paymentMethods[index]) : null;
    if (methodIndex >= 0) {
      // this.selectedPaymentMethods.patchValue(this.selectedPaymentMethods.value.filter((method) => method !== this.paymentMethods[index]));
      this.selectedPaymentMethods = this.selectedPaymentMethods.filter((method) => method !== this.paymentMethods[index]);
      this.identityForm.controls['select_payment_method_available'].patchValue(
        this.selectedPaymentMethods.filter((method) => method !== this.paymentMethods[index]),
      );
    } else {
      // this.selectedPaymentMethods.push(this.paymentMethods[index]);
      this.selectedPaymentMethods.push(this.paymentMethods[index]);
      this.identityForm.controls['select_payment_method_available'].patchValue(this.selectedPaymentMethods);
    }
    this.identityForm.updateValueAndValidity();
  }

  decimalFilter(event: any) {
    const reg = /^-?\d{0,6}$/;
    const regEx = /^-?\d*[.,]?\d{0,2}$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (input.includes('.')) {
      if (!regEx.test(input)) {
        event.preventDefault();
      }
    } else {
      if (!reg.test(input)) {
        event.preventDefault();
      }
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
