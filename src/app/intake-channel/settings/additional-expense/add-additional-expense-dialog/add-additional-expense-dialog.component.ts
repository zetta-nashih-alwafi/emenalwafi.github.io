import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { ActivatedRoute } from '@angular/router';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-additional-expense-dialog',
  templateUrl: './add-additional-expense-dialog.component.html',
  styleUrls: ['./add-additional-expense-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddAdditionalExpenseDialogComponent implements OnInit {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;

  listAdditionalCosts: any[];
  listAdditionalCostsCtrl = new UntypedFormControl(null);

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

  currencyFilter = new UntypedFormControl('', Validators.required);
  regions: string[][] = [];
  filteredRegions: string[][] = [];
  currencyList = [];
  currencyListOri = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  dummyData = [];
  listExistingCosts = [];
  scholarId: any;
  showForm = false;
  hideButton = false;
  showExisting = false;
  showPatchForm: boolean;
  isExistingData = false;
  firstForm: any;

  constructor(
    public dialogRef: MatDialogRef<AddAdditionalExpenseDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private acadJourneyService: AcademicJourneyService,
    private intakeChannelService: IntakeChannelService,
    private router: ActivatedRoute,
    private admissionService: AdmissionDashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.router.queryParams.subscribe((res) => {
      if (res && res.scholarSeasonId) {
        this.scholarId = res.scholarSeasonId;
      }
    });
    // this.getDataExisting();
    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = _.cloneDeep(list);
      this.currencyListOri = _.cloneDeep(list);
    });
    if (this.data && this.data._id) {
      this.showForm = true;
      this.hideButton = true;
      this.identityForm.patchValue(this.data);
      this.firstForm = _.cloneDeep(this.identityForm.value);
    }
    if (this.data && this.data.currency) {
      this.currencyFilter.setValue(this.data.currency);
    }
  }

  filterCurrency() {
    const searchString = this.currencyFilter.value.toLowerCase().trim();
    this.currencyList = this.currencyListOri.filter((country) => country.code.toLowerCase().trim().includes(searchString));
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      additional_cost: [null, Validators.required],
      description: [null],
      amount: [null, [Validators.required, Validators.min(0)]],
      currency: ['EUR', Validators.required],
      scholar_season_id: [this.scholarId],
    });
    this.currencyFilter.setValue('EUR');
  }

  populateDataProfileRate() {
    this.data.payment_modes.forEach((element) => {
      this.dummyData.forEach((dummy, index) => {
        if (dummy._id === element._id) {
          this.dummyData[index].status = true;
        }
      });
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
      if (this.currencyFilter.value === 'EUR') {
        this.identityForm.get('currency').setValue('EUR');
        return false;
      } else if (this.data && this.currencyFilter.value === this.data.currency) {
        this.identityForm.get('currency').setValue(this.data.currency);
        return false;
      } else if (this.currencyList && this.currencyList.length === 1) {
        this.identityForm.get('currency').setValue(this.currencyList[0].code);
        return false;
      } else {
        const curr = this.currencyList.filter((list) => list.code === this.currencyFilter.value);
        if (curr && curr.length === 1) {
          return false;
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('ADDITIONAL_S2.TITLE'),
            html: this.translate.instant('ADDITIONAL_S2.TEXT'),
            confirmButtonText: this.translate.instant('ADDITIONAL_S2.BUTTON'),
          });
          this.identityForm.markAllAsTouched();
          return true;
        }
      }
    }
  }

  submitVerification() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = _.cloneDeep(this.identityForm.value);
    payload.scholar_season_id = this.scholarId;
    if (this.showExisting) {
      payload.is_from_duplicate = true;
    } else {
      payload.is_from_duplicate = false;
    }
    if (this.dummyData && this.dummyData.length) {
      const dataPayment = this.dummyData.filter((list) => list.status === true).map((temp) => temp._id);
      payload.payment_modes = dataPayment;
    }
    payload.amount = parseFloat(payload.amount);

    if (this.data && this.data._id && !this.showExisting) {
      this.subs.sink = this.intakeChannelService.UpdateAdditionalCost(payload, this.data._id).subscribe(
        (resp) => {
          if (resp) {
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
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          if (
            err['message'] === 'GraphQL error: Name already exists!' ||
            err['message'] === 'GraphQL error: Name already Exists. Please pick another name' ||
            err['message'] === 'GraphQL error: Additional cost name already exists!'
          ) {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
            });
          } else if (err['message'] === 'GraphQL error: No data change!') {
            this.dialogRef.close();
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
      this.subs.sink = this.intakeChannelService.CreateAdditionalCost(payload).subscribe(
        (resp) => {
          if (resp) {
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
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
          if (
            err['message'] === 'GraphQL error: Name already exists!' ||
            err['message'] === 'GraphQL error: Name already Exists. Please pick another name' ||
            err['message'] === 'GraphQL error: Additional cost name already exists!'
          ) {
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
  currencySelected(event) {
    this.identityForm.get('currency').setValue(event);
  }

  openForm() {
    this.showForm = true;
    this.showExisting = false;
    this.identityForm.reset();
    this.showPatchForm = false;
    this.isExistingData = false;
    this.identityForm.get('currency').patchValue('EUR');
  }

  openSelectExisting() {
    this.showForm = false;
    this.showExisting = true;
    this.listAdditionalCostsCtrl.setValue(null);
  }

  getAllAdditionalCost() {
    this.subs.sink = this.listAdditionalCostsCtrl.valueChanges.subscribe((searchTxt: string[]) => {
      this.identityForm.reset();
    });
    this.listAdditionalCosts = [];
    this.subs.sink = this.intakeChannelService.GetAllAdditionalCostsDropdown().subscribe(
      (res) => {
        if (res) {
          this.listAdditionalCosts = res;
          // this.listAdditionalCosts = res.filter((resp) => {
          //   return !this.listExistingCosts.includes(resp.additional_cost);
          // });
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

  selectedAdditionalCost(selectedData) {
    if (selectedData) {
      this.data = selectedData;
      this.isExistingData = true;
      this.identityForm.patchValue(selectedData);
      this.showPatchForm = true;
    }
  }

  getDataExisting() {
    this.listExistingCosts = [];
    this.subs.sink = this.admissionService.getAllAdditionalCostsByScholar(this.scholarId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listExistingCosts = resp.map((list) => list.additional_cost);
        }
        this.getAllAdditionalCost();
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
          }).then(() => {
            this.getAllAdditionalCost();
          });
        }
      },
    );
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

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  selectedWhoCall(data) {
    this.dummyData[data].status = !this.dummyData[data].status;
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
}
