import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import { FinancesService } from 'app/service/finance/finance.service';
import { InternshipService } from 'app/service/internship/internship.service';

@Component({
  selector: 'ms-add-scholar-dialog',
  templateUrl: './add-scholar-dialog.component.html',
  styleUrls: ['./add-scholar-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddScholarDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isWaitingForResponse = false;

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
  sliderDuplicate = new UntypedFormControl(null);
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];

  scholarSeasons: any;
  constructor(
    public dialogRef: MatDialogRef<AddScholarDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private financeService: FinancesService,
    private acadJourneyService: AcademicJourneyService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private internshipService: InternshipService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    if (this.data && this.data._id) {
      console.log('Data Edit', this.data);
      this.patchDataScholar();
    }
    this.initScholarSeason();
  }

  initScholarSeason(filter?) {
    this.subs.sink = this.internshipService.getAllScholarSeasons(filter).subscribe(
      (res) => {
        // console.log('_schol', res);
        if (res) {
          this.scholarSeasons = res;
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  patchDataScholar() {
    const dataEdit = _.cloneDeep(this.data);
    if (dataEdit.from && dataEdit.from.date_utc && dataEdit.to.date_utc) {
      const startTime = dataEdit.from.time_utc ? dataEdit.from.time_utc : '15:59';
      const endTime = dataEdit.to.time_utc ? dataEdit.to.time_utc : '15:59';
      dataEdit.from = {
        date_utc: this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(dataEdit.from.date_utc, startTime)),
        time_utc: this.parseUTCToLocalPipe.transform(startTime)
          ? this.parseUTCToLocalPipe.transform(startTime)
          : this.parseUTCToLocalPipe.transform('15:59'),
      };
      dataEdit.to = {
        date_utc: this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(dataEdit.to.date_utc, endTime)),
        time_utc: this.parseUTCToLocalPipe.transform(endTime)
          ? this.parseUTCToLocalPipe.transform(endTime)
          : this.parseUTCToLocalPipe.transform('15:59'),
      };
    } else {
      dataEdit.from = {
        date_utc: null,
        time_utc: this.parseUTCToLocalPipe.transform('15:59'),
      };
      dataEdit.to = {
        date_utc: null,
        time_utc: this.parseUTCToLocalPipe.transform('15:59'),
      };
    }
    // this.identityForm.get('from').get('date_utc').setValue(dataEdit.from.date_utc);
    // this.identityForm.get('to').get('date_utc').setValue(dataEdit.to.date_utc);
    // this.identityForm.get('from').get('time_utc').setValue(dataEdit.from.time_utc);
    // this.identityForm.get('to').get('time_utc').setValue(dataEdit.to.time_utc);
    console.log('dataEdit', dataEdit);
    this.identityForm.patchValue(dataEdit);
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      scholar_season: [null],
      from: this.fb.group({
        date_utc: [null, Validators.required],
        time_utc: ['15:59'],
      }),
      to: this.fb.group({
        date_utc: [null, Validators.required],
        time_utc: ['15:59'],
      }),
      description: [null],
      duplicate_content_from: [null],
    });
  }

  duplicateSlider(event) {
    console.log('duplicateSlider', event);
    if (this.sliderDuplicate.value) {
      this.identityForm.get('duplicate_content_from').setValidators([Validators.required]);
      this.identityForm.get('duplicate_content_from').updateValueAndValidity();
    } else {
      this.identityForm.get('duplicate_content_from').setValue(null);
      this.identityForm.get('duplicate_content_from').clearValidators();
      this.identityForm.get('duplicate_content_from').updateValueAndValidity();
    }
  }

  submitVerification() {
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.identityForm.value);
    const currentTime = moment(this.today).format('HH:mm');
    let dateFrom = this.identityForm.get('from').get('date_utc').value
      ? this.identityForm.get('from').get('date_utc').value
      : moment(this.today).format('DD/MM/YYYY');
    dateFrom = moment(dateFrom).format('DD/MM/YYYY');
    let dateTo = this.identityForm.get('to').get('date_utc').value
      ? this.identityForm.get('to').get('date_utc').value
      : moment(this.today).format('DD/MM/YYYY');

    dateTo = moment(dateTo).format('DD/MM/YYYY');
    payload.from.date_utc = this.parseLocalToUTCPipe.transformDate(dateFrom, currentTime);
    payload.to.date_utc = this.parseLocalToUTCPipe.transformDate(dateTo, currentTime);
    payload.from.time_utc = this.parseLocalToUTCPipe.transform(currentTime);
    payload.to.time_utc = this.parseLocalToUTCPipe.transform(currentTime);
    // console.log('this.identityForm', payload);
    if (this.data && this.data._id) {
      this.subs.sink = this.financeService.UpdateScholarSeason(payload, this.data._id).subscribe(
        (resp) => {
          // console.log('Edit Payment Mode', resp);
          this.isWaitingForResponse = false;
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
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.subs.sink = this.financeService.CreateScholarSeason(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          console.log('Add Payment Mode', resp);
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
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: scholar season name already exist') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('scholar season name already exist'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
            });
          } else if (err['message'] === 'GraphQL error: scholar season name contain invalid character') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('scholar season name contain invalid character'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
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

  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    } else {
      return '';
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
