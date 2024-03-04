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
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-add-profile-rate-dialog',
  templateUrl: './add-profile-rate-dialog.component.html',
  styleUrls: ['./add-profile-rate-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddProfileRateDialogComponent implements OnInit, OnDestroy {
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
  dummyData = [];
  constructor(
    public dialogRef: MatDialogRef<AddProfileRateDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    this.getDataPaymentMode();
    if (this.data && this.data._id) {
      this.identityForm.patchValue(this.data);
    }
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      name: [null],
      description: [null],
      payment_modes: [null],
    });
  }

  getDataPaymentMode() {
    this.subs.sink = this.financeService.getAllPaymentModesDropdown().subscribe(
      (students: any) => {
        if (students && students.length) {
          const dataPayment = _.cloneDeep(students);
          this.dummyData = dataPayment.map((list) => {
            return {
              _id: list._id,
              name: list.name,
              status: false,
            };
          });
          if (this.data && this.data._id) {
            this.populateDataProfileRate();
          }
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

  populateDataProfileRate() {
    console.log(this.data, this.dummyData);
    this.data.payment_modes.forEach((element) => {
      this.dummyData.forEach((dummy, index) => {
        if (dummy._id === element._id) {
          this.dummyData[index].status = true;
        }
      });
    });
  }

  submitVerification() {
    const payload = _.cloneDeep(this.identityForm.value);
    if (this.dummyData && this.dummyData.length) {
      const dataPayment = this.dummyData.filter((list) => list.status === true).map((temp) => temp._id);
      console.log(dataPayment);
      payload.payment_modes = dataPayment;
    }
    // console.log('this.identityForm', payload);
    if (this.data && this.data._id) {
      this.subs.sink = this.financeService.UpdateProfilRate(payload, this.data._id).subscribe(
        (resp) => {
          // console.log('Edit Payment Mode', resp);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close();
          });
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
    } else {
      this.subs.sink = this.financeService.CreateProfilRate(payload).subscribe(
        (resp) => {
          // console.log('Add Payment Mode', resp);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close();
          });
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
    this.dummyData[data].status = !this.dummyData[data].status;
  }
}
