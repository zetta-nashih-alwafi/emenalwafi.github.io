import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-history-reconciliation-dialog',
  templateUrl: './history-reconciliation-dialog.component.html',
  styleUrls: ['./history-reconciliation-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseUtcToLocalPipe],
})
export class HistoryReconciliationDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;

  selectedStudent;
  selectedPayer;

  isStudentFinanceSelected = false;
  isParentSelected = false;
  isParentFinanceSelected = false;
  isUncleSelected = false;

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
  mappingBilling = [];
  studentFilter = new UntypedFormControl(null);

  isLoading = false;

  private intVal: any;
  private timeOutVal: any;
  reconciliationImport: any;
  toFilterList = [
    { value: 'Student', key: 'Student' },
    { value: 'Finance Support', key: 'Finance Support' },
  ];
  constructor(
    public dialogRef: MatDialogRef<HistoryReconciliationDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private financeService: FinancesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });

    this.subs.sink = this.financeService.reconciliationImport.subscribe((val: any) => {
      if (val) {
        this.reconciliationImport = val;
      }
    });
    this.getDataStudent();
  }

  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    } else {
      return '';
    }
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      civility: [null, Validators.required],
      from: [null, Validators.required],
      to: [null, Validators.required],
      amount: [null],
      method: [null],
      currency: ['EUR'],
      date_of_birth: [null, Validators.required],
      reference: [null, Validators.required],
      note: [null, Validators.required],
    });
  }

  submitVerification() {
    if (this.selectedStudent) {
      this.data.student_id = this.selectedStudent;
      if (this.selectedStudent.candidate_id && this.selectedStudent.candidate_id._id) {
        this.data.candidate_id = this.selectedStudent.candidate_id._id;
      }
    }
    if (this.selectedPayer) {
      const civility = this.selectedPayer.civility !== 'neutral' ? this.selectedPayer.civility : '';
      this.data.payment_support = `${this.translate.instant(civility)} ${this.selectedPayer.name} ${this.selectedPayer.family_name}`;
      this.data.from = `${this.translate.instant(civility)} ${this.selectedPayer.name} ${this.selectedPayer.family_name}`;
    }
    this.data.letter = true;
    if (this.data.student_id) {
      this.isLoading = true;
      this.financeService.getAcountingNumber(this.data.student_id._id, this.data.totalStudentAssigned).subscribe(
        (resp) => {
          this.isLoading = false;
          this.data.accounting_document = resp;
          delete this.data.totalStudentAssigned;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('INTERNSHIP_S4.BUTTON'),
          }).then((resss) => this.dialogRef.close(this.data));
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
          }
        },
      );
    }
  }

  getDataStudent() {
    const filter = 'filter: { legal_entity: "' + (this.data.to ? this.data.to : '') + '"}';
    this.subs.sink = this.financeService.getAllBillingForReconciliation(filter).subscribe(
      (list) => {
        if (list && list.length) {
          this.mappingBilling = list.map((bill) => {
            return {
              candidate_id: bill.candidate_id,
              civility: bill.student_id.civility,
              email: bill.student_id.email,
              first_name: bill.student_id.first_name,
              last_name: bill.student_id.last_name,
              _id: bill.student_id._id,
              full_name:
                bill.student_id.last_name +
                ' ' +
                bill.student_id.first_name +
                ' ' +
                (bill.student_id.civility !== 'neutral' ? this.translate.instant(bill.student_id.civility) : ''),
            };
          });
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

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  selectedWhoCall(data) {
    // if (data === 'student') {
    //   this.isStudentSelected = true;
    //   this.isParentSelected = false;
    //   this.isUncleSelected = false;
    // } else if (data === 'parent') {
    //   this.isStudentSelected = false;
    //   this.isParentSelected = true;
    //   this.isUncleSelected = false;
    // } else if (data === 'uncle') {
    //   this.isStudentSelected = false;
    //   this.isParentSelected = false;
    //   this.isUncleSelected = true;
    // }
    this.studentFilter.setValue(null);
    this.selectedStudent = data;
  }

  selectStudentFromOption(data) {
    // if (data === 'student') {
    //   this.isStudentSelected = true;
    //   this.isParentSelected = false;
    //   this.isUncleSelected = false;
    // } else if (data === 'parent') {
    //   this.isStudentSelected = false;
    //   this.isParentSelected = true;
    //   this.isUncleSelected = false;
    // } else if (data === 'uncle') {
    //   this.isStudentSelected = false;
    //   this.isParentSelected = false;
    //   this.isUncleSelected = true;
    // }
    // this.selectedStudent = data;
    console.log(data);
    if (data) {
      const payload = {
        candidate_id: data.candidate_id,
        civility: data.civility,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        _id: data._id,
      };
      this.selectedStudent = payload;
      console.log(this.selectedStudent, payload);
    } else {
      this.selectedStudent = null;
    }
  }

  selectedWhoFinanceCall(data) {
    // if (data === 'student') {
    //   this.isStudentFinanceSelected = true;
    //   this.isParentFinanceSelected = false;
    // } else if (data === 'parent') {
    //   this.isStudentFinanceSelected = false;
    //   this.isParentFinanceSelected = true;
    // }
    this.selectedPayer = data;
  }
}
