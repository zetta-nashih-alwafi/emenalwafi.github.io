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
  selector: 'ms-internship-whatsapp-dialog',
  templateUrl: './internship-whatsapp-dialog.component.html',
  styleUrls: ['./internship-whatsapp-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class InternshipWhatsappDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isStudentSelected = false;
  isParentSelected = false;
  isUncleSelected = false;
  userSelected: any;

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
    { value: 'Student', key: 'Student' },
    { value: 'Finance Support', key: 'Finance Support' },
  ];
  dataFinanceList = [];
  constructor(
    public dialogRef: MatDialogRef<InternshipWhatsappDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
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
    if (this.data && this.data.financial_supports && this.data.financial_supports.length) {
      this.dataFinanceList = this.data.financial_supports.map((list) => {
        return {
          civility: list.civility,
          email: list.email,
          last_name: list.family_name,
          first_name: list.name,
          relation: list.relation,
          status: false,
        };
      });
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
    const dataSelected = this.dataFinanceList.filter((list) => list.status === true);
    if (this.userSelected) {
      dataSelected.push(this.userSelected);
    }
    if (dataSelected && dataSelected.length) {
      dataSelected.forEach((element) => {
        const whatsAppUrl = 'https://api.whatsapp.com/send?phone=+6593722206&text=';
        const whatsAppText = this.translate.instant('whatsapp message internship', {
          name: element.first_name,
        });
        console.log('whatsAppText ', whatsAppText);
        window.open(whatsAppUrl + whatsAppText, '_blank');
      });
    }
    this.dialogRef.close(true);
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
    this.isStudentSelected = !this.isStudentSelected;
    this.userSelected = data;
  }

  selectedWhoCallParent(data, indexFinance) {
    this.dataFinanceList[indexFinance].status = !this.dataFinanceList[indexFinance].status;
    const selected = this.dataFinanceList.filter((list) => list.status === true);
    if (selected && selected.length) {
      this.isParentSelected = true;
    } else {
      this.isParentSelected = false;
    }
  }

  selectedWhoCallUncle(data) {
    this.isUncleSelected = !this.isUncleSelected;
  }
}
