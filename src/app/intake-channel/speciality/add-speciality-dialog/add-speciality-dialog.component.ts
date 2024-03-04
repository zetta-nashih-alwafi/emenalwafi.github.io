import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-speciality-dialog',
  templateUrl: './add-speciality-dialog.component.html',
  styleUrls: ['./add-speciality-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddSpecialityDialogComponent implements OnInit, OnDestroy {
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
  intakeList = [];
  intakeOriList = [];
  sectorList: any;
  sectorOriList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  scholarSeasonId;

  showForm = false;
  hideButton = false;
  showExisting = false;
  showPatchForm = false;
  listSpecialization: any[];
  listSpecializationCtrl = new UntypedFormControl(null);
  isWaitingForResponse = false;
  firstForm: any;

  markAsEdit = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddSpecialityDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private intakeChannelService: IntakeChannelService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    // this.getSectorListData();
    if (this.data && this.data._id) {
      console.log('Data Edit', this.data);
      this.patchDataScholar();
    }
  }

  patchDataScholar() {
    const dataEdit = _.cloneDeep(this.data);
    console.log('dataEdit', dataEdit);

    this.identityForm.patchValue(dataEdit);
    this.firstForm = _.cloneDeep(this.identityForm.value);
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      name: [null, Validators.required],
      description: [null],
      sigli: [null, Validators.required],
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
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.identityForm.value);

    if (this.showExisting) {
      payload.is_from_duplicate = true;
    } else {
      payload.is_from_duplicate = false;
    }
    payload.scholar_season_id = this.scholarSeasonId;

    if (this.data && this.data._id) {
      this.subs.sink = this.intakeChannelService.UpdateSpecialization(payload, this.data._id).subscribe(
        () => {
          // console.log('Edit Payment Mode', resp);
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
          this.authService.postErrorLog(err)
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
            }).then(() => (this.isWaitingForResponse = false));
          } else if (err['message'] === 'GraphQL error: Program already connected to candidate') {
            Swal.fire({
              title: this.translate.instant('INTAKE_S7.Title'),
              html: this.translate.instant('INTAKE_S7.Text'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('INTAKE_S7.Button'),
            }).then(() => (this.isWaitingForResponse = false));
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
      this.subs.sink = this.intakeChannelService.CreateSpecialization(payload).subscribe(
        (resp) => {
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
          this.authService.postErrorLog(err)
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
            }).then(() => (this.isWaitingForResponse = false));
          } else if (err['message'] === 'GraphQL error: Program already connected to candidate') {
            Swal.fire({
              title: this.translate.instant('INTAKE_S7.Title'),
              html: this.translate.instant('INTAKE_S7.Text'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('INTAKE_S7.Button'),
            }).then(() => (this.isWaitingForResponse = false));
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

  translateDate(datee, timee) {
    const finalTime = timee ? timee : '15:59';
    if (datee) {
      const date = this.parseStringDatePipe.transformStringToDate(this.parseUTCToLocalPipe.transformDate(datee, finalTime));
      return moment(date, 'DD/MM/YYYY').format('DD/MM/YY');
    } else {
      return '';
    }
  }

  patchDataScholarFromExisting(data) {
    const dataEdit = _.cloneDeep(data);
    console.log('dataEdit', dataEdit, data);
    this.identityForm.patchValue(dataEdit);
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
}
