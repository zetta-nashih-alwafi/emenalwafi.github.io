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
import { Router } from '@angular/router';

@Component({
  selector: 'ms-internship-call-dialog',
  templateUrl: './internship-call-dialog.component.html',
  styleUrls: ['./internship-call-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class InternshipCallDialogComponent implements OnInit, OnDestroy {
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

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  userSelected: any;

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
    public dialogRef: MatDialogRef<InternshipCallDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
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
    console.log(this.data);
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
    let dataSelected = [];
    if (this.isStudentSelected) {
      dataSelected.push(this.userSelected);
    } else {
      dataSelected = this.dataFinanceList.filter((list) => list.status === true);
    }

    Swal.fire({
      type: 'info',
      title: this.translate.instant('INTERNSHIP_S3.TITLE'),
      html: this.translate.instant('INTERNSHIP_S3.TEXT', {
        candidateName:
          (dataSelected[0].civility !== 'neutral' ? this.translate.instant(dataSelected[0].civility) + ' ' : '') +
          dataSelected[0].first_name +
          ' ' +
          dataSelected[0].last_name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('INTERNSHIP_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_S3.BUTTON_2'),
      onOpen: (modalEl) => {
        modalEl.setAttribute('data-cy', 'swal-internship-s3');
      },
    }).then((res) => {
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('INTERNSHIP_S4.MESSAGE'),
          html: this.translate.instant('INTERNSHIP_S4.TEXT', {
            candidateName:
              (dataSelected[0].civility !== 'neutral' ? this.translate.instant(dataSelected[0].civility) + ' ' : '') +
              dataSelected[0].first_name +
              ' ' +
              dataSelected[0].last_name,
          }),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('INTERNSHIP_S4.BUTTON'),
          onOpen: (modalEl) => {
            modalEl.setAttribute('data-cy', 'swal-internship-s3');
          },
        }).then((resss) => {
          this.dialogRef.close(true);
          const query = {
            selectedCandidate: this.data.candidate_id._id,
            candidate_name: this.data.candidate_id.last_name,
            tab: 'Commentaries',
          };
          const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
          window.open(url.toString(), '_blank');
        });
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  selectedWhoCall(data, indexFinance) {
    if (data === 'student') {
      this.isStudentSelected = true;
      this.isParentSelected = false;
      this.userSelected = indexFinance;
      if (this.dataFinanceList && this.dataFinanceList.length) {
        this.dataFinanceList.forEach((element) => {
          element.status = false;
        });
      }
    } else if (data === 'parent') {
      if (this.dataFinanceList && this.dataFinanceList.length) {
        this.dataFinanceList.forEach((element) => {
          element.status = false;
        });
      }
      this.dataFinanceList[indexFinance].status = !this.dataFinanceList[indexFinance].status;
      this.isStudentSelected = false;
      this.isParentSelected = true;
    }
  }
}
