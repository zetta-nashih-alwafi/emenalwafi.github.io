import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { CustomValidators } from 'ng2-validation';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';

@Component({
  selector: 'ms-internship-lettrage-dialog',
  templateUrl: './internship-lettrage-dialog.component.html',
  styleUrls: ['./internship-lettrage-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseStringDatePipe],
})
export class InternshipLettrageDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isStudentSelected = false;
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
  private intVal: any;
  private timeOutVal: any;

  termSelected = false;
  isDepositSelected = false;
  termSelecteds = '';

  toFilterList = [
    { value: 'Student', key: 'Student' },
    { value: 'Finance Support', key: 'Finance Support' },
  ];
  constructor(
    public dialogRef: MatDialogRef<InternshipLettrageDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    // console.log('data :: ', this.data);
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe(
      (list: any[]) => {
        this.currencyList = list;
      },
      (err) => {
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
    this.patchData();
  }

  patchData() {
    let tooltip = '';
    let count = 0;
    if (
      this.data &&
      this.data.student_id &&
      this.data.student_id.billing_id &&
      this.data.student_id.billing_id.terms &&
      this.data.student_id.billing_id.terms.length
    ) {
      this.data.student_id.billing_id.terms.map((element) => {
        return {
          is_term_paid: element.is_term_paid,
          term_amount: element.term_amount,
          term_pay_amount: element.term_pay_amount,
          term_payment: element.term_payment,
          _id: element._id,
          term_index: null,
          status: element.status ? element.status : false,
        };
      });
    }
    if (this.data && this.data.transaction && this.data.transaction === 'deposit') {
      this.data.transaction = 'deposit';
      this.isDepositSelected = true;
    }
    if (
      this.data &&
      this.data.student_id &&
      this.data.student_id.billing_id &&
      this.data.student_id.billing_id.terms &&
      this.data.student_id.billing_id.terms.length
    ) {
      const selected = this.data.student_id.billing_id.terms.filter((list) => list.status === true);
      if (selected && selected.length) {
        for (const entity of selected) {
          count++;
          if (count > 1) {
            if (entity) {
              tooltip = tooltip + ', ';
              tooltip =
                tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
            }
          } else {
            if (this.isDepositSelected) {
              if (entity) {
                tooltip = tooltip + ', ';
                tooltip =
                  tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
              }
            } else {
              if (entity) {
                tooltip =
                  tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
              }
            }
          }
        }
        this.termSelecteds = tooltip;
      } else {
        if (this.isDepositSelected) {
          tooltip = this.translate.instant('Deposit');
        } else {
          tooltip = '';
        }
        this.termSelecteds = tooltip;
      }
    } else {
      if (this.isDepositSelected) {
        tooltip = this.translate.instant('Deposit');
      } else {
        tooltip = '';
      }
      this.termSelecteds = tooltip;
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
    this.data.letter = true;
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('INTERNSHIP_S4.BUTTON'),
    }).then((resss) => this.dialogRef.close(this.data));
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  selectedDeposit() {
    let tooltip = '';
    let count = 0;
    this.data.term_index = null;
    this.data.transaction = 'deposit';
    this.isDepositSelected = !this.isDepositSelected;
    if (this.isDepositSelected) {
      tooltip = tooltip + this.translate.instant('Deposit');
    }
    if (
      this.data &&
      this.data.student_id &&
      this.data.student_id.billing_id &&
      this.data.student_id.billing_id.terms &&
      this.data.student_id.billing_id.terms.length
    ) {
      const selected = this.data.student_id.billing_id.terms.filter((list) => list.status === true);
      if (selected && selected.length) {
        for (const entity of selected) {
          count++;
          if (count > 1) {
            if (entity) {
              tooltip = tooltip + ', ';
              tooltip =
                tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
            }
          } else {
            if (this.isDepositSelected) {
              if (entity) {
                tooltip = tooltip + ', ';
                tooltip =
                  tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
              }
            } else {
              if (entity) {
                tooltip =
                  tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
              }
            }
          }
        }
        this.termSelecteds = tooltip;
      } else {
        if (this.isDepositSelected) {
          tooltip = this.translate.instant('Deposit');
        } else {
          tooltip = '';
        }
        this.termSelecteds = tooltip;
      }
    } else {
      if (this.isDepositSelected) {
        tooltip = this.translate.instant('Deposit');
      } else {
        tooltip = '';
      }
      this.termSelecteds = tooltip;
    }
  }

  selectedTerm(data, termIndex: number) {
    let tooltip = '';
    let count = 0;
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
    if (this.isDepositSelected) {
      tooltip = tooltip + this.translate.instant('Deposit');
    }
    this.data.student_id.billing_id.terms[termIndex].status = !this.data.student_id.billing_id.terms[termIndex].status;
    this.data.student_id.billing_id.terms[termIndex].term_index = termIndex;
    const selected = this.data.student_id.billing_id.terms.filter((list) => list.status === true);
    if (selected && selected.length) {
      this.termSelected = true;
      for (const entity of selected) {
        count++;
        if (count > 1) {
          if (entity) {
            tooltip = tooltip + ', ';
            tooltip =
              tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
          }
        } else {
          if (this.isDepositSelected) {
            if (entity) {
              tooltip = tooltip + ', ';
              tooltip =
                tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
            }
          } else {
            if (entity) {
              tooltip =
                tooltip + (this.translate.instant('Term') + ' ' + entity.term_index + '/' + this.data.student_id.billing_id.terms.length);
            }
          }
        }
      }
      this.termSelecteds = tooltip;
    } else {
      this.termSelected = false;
      if (this.isDepositSelected) {
        tooltip = this.translate.instant('Deposit');
      } else {
        tooltip = '';
      }
      this.termSelecteds = tooltip;
    }
  }

  selectedWhoFinanceCall(data) {
    if (data === 'student') {
      this.isStudentFinanceSelected = true;
      this.isParentFinanceSelected = false;
    } else if (data === 'parent') {
      this.isStudentFinanceSelected = false;
      this.isParentFinanceSelected = true;
    }
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
}
