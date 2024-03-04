import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-type-intervention-teacher-dialog',
  templateUrl: './add-type-intervention-teacher-dialog.component.html',
  styleUrls: ['./add-type-intervention-teacher-dialog.component.scss'],
})
export class AddTypeInterventionTeacherDialogComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  interventionForm: UntypedFormGroup;

  scholarSeasonDropdown = [];
  legalEntityDropdown = [];
  typeOfInterventionDropdown = [
    { value: 'face_to_face', name: 'Face to Face' },
    { value: 'face_to_face_2', name: 'Face to Face 2' },
    { value: 'face_to_face_3', name: 'Face to Face 3' },
    { value: 'face_to_face_4', name: 'Face to Face 4' },
    { value: 'jury', name: 'Jury' },
    { value: 'coaching', name: 'Coaching' },
    { value: 'conference', name: 'Conference' },
    { value: 'correction_of_files', name: 'Correction of Files' },
    { value: 'correction_of_copies', name: 'Correction of Copies' },
    { value: 'making_subjects', name: 'Making Subjects' },
  ];
  typeOfContractDropdown = ['cddu', 'convention'];
  isWaitingForResponse = false;

  constructor(
    private dialogRef: MatDialogRef<AddTypeInterventionTeacherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private teacherService: TeacherManagementService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initInterventionForm();
    this.getAllScholarSeasons();

    if (this.data.type === 'edit') {
      this.populateData();
    }
  }

  initInterventionForm() {
    this.interventionForm = this.fb.group({
      user_id: this.data.userId,
      scholar_season_id: [null, Validators.required],
      legal_entity_id: [null, Validators.required],
      type_of_intervention: [null, Validators.required],
      hourly_rate: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
      type_of_contract: [null, Validators.required],
    });
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  selectedScholarSeason() {
    this.getAllLegalEntities();
    this.legalEntityDropdown = [];
    this.interventionForm.get('legal_entity_id').setValue(null);
    this.interventionForm.get('type_of_intervention').setValue(null);
    this.interventionForm.get('type_of_contract').setValue(null);
  }

  selectedLegalEntity() {
    this.interventionForm.get('type_of_intervention').setValue(null);
    this.interventionForm.get('type_of_contract').setValue(null);
  }

  getAllScholarSeasons() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.getAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
          resp.forEach((element) => {
            this.scholarSeasonDropdown.push(element);
          });
          this.scholarSeasonDropdown = _.uniqBy(this.scholarSeasonDropdown, '_id');
          this.scholarSeasonDropdown = _.sortBy(this.scholarSeasonDropdown, ['scholar_season']);
          if (this.data?.selectedScholarSeason && this.scholarSeasonDropdown?.length && this.data?.type !== 'edit') {
            const scholarSeason = this.scholarSeasonDropdown.find((scholar) => scholar?._id === this.data?.selectedScholarSeason);
            this.interventionForm?.get('scholar_season_id')?.patchValue(scholarSeason?._id);
            this.selectedScholarSeason()
          }
        } else {
          this.scholarSeasonDropdown = [];
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
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

  getAllLegalEntities() {
    const scholar_season_id = this.interventionForm.get('scholar_season_id').value;
    const filter = {
      scholar_season_id: scholar_season_id,
    };
    this.subs.sink = this.teacherService.getAllLegalEntities(filter).subscribe(
      (resp) => {
        if (resp && resp.length) {
          resp.forEach((element) => {
            this.legalEntityDropdown.push(element);
          });
          this.legalEntityDropdown = _.uniqBy(this.legalEntityDropdown, '_id');
          this.legalEntityDropdown = _.sortBy(this.legalEntityDropdown, ['legal_entity_name']);
        } else {
          this.legalEntityDropdown = [];
        }
      },
      (err) => {
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

  populateData() {
    const data = {
      scholar_season_id: this.data?.interventionData?.scholar_season_id?._id,
      legal_entity_id: this.data?.interventionData?.legal_entity_id?._id,
      type_of_intervention: this.data?.interventionData?.type_of_intervention,
      hourly_rate: this.data?.interventionData?.hourly_rate,
      type_of_contract: this.data?.interventionData?.type_of_contract,
    };
    this.interventionForm.patchValue(data);
    this.getAllLegalEntities();
  }

  validate() {
    if (this.interventionForm.invalid) {
      this.interventionForm.get('scholar_season_id').markAsTouched();
      this.interventionForm.get('legal_entity_id').markAsTouched();
      this.interventionForm.get('hourly_rate').markAsTouched();
      this.interventionForm.get('type_of_contract').markAsTouched();
      this.interventionForm.get('type_of_intervention').markAsTouched();
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
    } else {
      const payload = _.cloneDeep(this.interventionForm.value);
      if (this.data.type === 'add') {
        this.isWaitingForResponse = true;
        this.subs.sink = this.teacherService.createIntervention(payload).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(resp);
            });
          },
          (error) => {
            this.authService.postErrorLog(error);
            this.isWaitingForResponse = false;
            if (
              error.message &&
              error.message === 'GraphQL error: Cannot have different type of intervention  in same scholar season and legal entity'
            ) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Type_of_Intervention_S2.TITLE'),
                text: this.translate.instant('Type_of_Intervention_S2.TEXT'),
                confirmButtonText: this.translate.instant('Type_of_Intervention_S2.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (
              error.message &&
              error.message === 'GraphQL error: Cannot have different type of contract in same scholar season and legal entity'
            ) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Type_of_Intervention_S1.TITLE'),
                text: this.translate.instant('Type_of_Intervention_S1.TEXT'),
                confirmButtonText: this.translate.instant('Type_of_Intervention_S1.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            }
          },
        );
      }
      if (this.data.type === 'edit') {
        this.isWaitingForResponse = true;
        const interventionId = this.data.interventionData._id;
        this.subs.sink = this.teacherService.updateIntervention(interventionId, payload).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(resp);
            });
          },
          (error) => {
            this.authService.postErrorLog(error);
            this.isWaitingForResponse = false;
            if (
              error.message &&
              error.message === 'GraphQL error: Cannot have different type of intervention  in same scholar season and legal entity'
            ) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Type_of_Intervention_S2.TITLE'),
                text: this.translate.instant('Type_of_Intervention_S2.TEXT'),
                confirmButtonText: this.translate.instant('Type_of_Intervention_S2.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (
              error.message &&
              error.message === 'GraphQL error: Cannot have different type of contract in same scholar season and legal entity'
            ) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('Type_of_Intervention_S1.TITLE'),
                text: this.translate.instant('Type_of_Intervention_S1.TEXT'),
                confirmButtonText: this.translate.instant('Type_of_Intervention_S1.BUTTON'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            }
          },
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
