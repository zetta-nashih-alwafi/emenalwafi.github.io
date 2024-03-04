import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-connect-legal-entity-dialog',
  templateUrl: './connect-legal-entity-dialog.component.html',
  styleUrls: ['./connect-legal-entity-dialog.component.scss'],
})
export class ConnectLegalEntityDialogComponent implements OnInit, OnDestroy {
  volumeHoursForm: UntypedFormGroup;
  levels: any[];
  campusList: any[];
  legalList: any[];
  isCampusOn: boolean;
  listObjective: any = [];
  listOfLegalEntity: any = [];
  realCampusList: any = [];
  private subs = new SubSink();
  school: any;
  scholarSeasonId: any;
  currentUser: any;
  isPermission: any;
  schoolData: any;
  currentUserTypeId: any;
  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private admissionService: AdmissionDashboardService,
    public dialogRef: MatDialogRef<ConnectLegalEntityDialogComponent>,
    private router: ActivatedRoute,
    private financeService: FinancesService,
    private userService: AuthService,
    private translateService: TranslateService,
    private intakeChannelService: IntakeChannelService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    // console.log('_res', this.data);
    if (this.data && this.data.scholar && this.data.scholar._id) {
      this.scholarSeasonId = this.data.scholar._id;
    }
    if (this.data && this.data.school && this.data.school._id) {
      this.schoolData = this.data.school;
      this.listObjective = [this.data.school];
      this.school = this.listObjective;
      this.initVolumeHoursForm();
      this.getDataCampus();
    } else {
      this.initVolumeHoursForm();
      this.getDataForList();
    }
    this.getLegalEntityForDropdown();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getDataForList() {
    this.subs.sink = this.intakeChannelService.GetOneCandidateSchool(this.schoolData._id, this.scholarSeasonId).subscribe(
      (resp) => {
        if (resp) {
          this.listObjective = [resp];
          this.school = this.listObjective;
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  getLegalEntityForDropdown() {
    this.subs.sink = this.financeService.getAllLegalEntityPublishByScholar(this.scholarSeasonId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listOfLegalEntity = resp;
        } else {
          this.listOfLegalEntity = [];
        }
      },
      (error) => {
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  initVolumeHoursForm() {
    const school = this.schoolData && this.schoolData._id ? this.schoolData._id : null;
    this.volumeHoursForm = this.fb.group({
      school_id: [school],
      campus: [null],
      level: [null],
      legal_entity_ids: [null, Validators.required],
      scholar_season_id: [this.scholarSeasonId],
    });
  }

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.realCampusList = [];
    this.volumeHoursForm.get('campus').setValue(null);
    this.volumeHoursForm.get('level').setValue(null);
    this.isCampusOn = true;
    const school = this.volumeHoursForm.get('school_id').value;
    const scampusList = this.listObjective.filter((list) => {
      return school.includes(list._id);
    });
    const optionAll = {
      _id: 'ALL',
      name: this.translate.instant('ALL'),
    };
    this.campusList.push(optionAll);
    scampusList.filter((campus, n) => {
      if (campus.campuses && campus.campuses.length) {
        campus.campuses.filter((campuses, nex) => {
          this.campusList.push(campuses);
          this.realCampusList.push(campuses);
        });
      }
    });
    this.campusList = _.uniqBy(this.campusList, '_id');
    this.realCampusList = _.uniqBy(this.realCampusList, '_id');
    // console.log('Campus Option ', scampusList, this.campusList);
  }

  getDataLevel() {
    this.levels = [];
    this.volumeHoursForm.get('level').setValue(null);
    let sCampus = _.cloneDeep(this.volumeHoursForm.get('campus').value);
    sCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (sCampus && sCampus.length && (sCampus[0] === 'ALL' || sCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.realCampusList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataCampus.push(element._id);
      });
      this.volumeHoursForm.get('campus').patchValue(dataCampus);
      const sLevelList = dataTemp;
      const optionAll = {
        _id: 'ALL',
        name: this.translate.instant('ALL'),
      };
      this.levels.push(optionAll);
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
      this.levels = _.uniqBy(this.levels, '_id');
      // console.log('Data Levels ', this.levels, sLevelList);
    } else {
      sCampus = _.cloneDeep(this.volumeHoursForm.get('campus').value);
      const sLevelList = this.realCampusList.filter((list) => {
        return sCampus.includes(list._id);
      });
      const optionAll = {
        _id: 'ALL',
        name: this.translate.instant('ALL'),
      };
      this.levels.push(optionAll);
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
      this.levels = _.uniqBy(this.levels, '_id');
      // console.log('Data Levels ', this.levels, sLevelList, this.campusList, sCampus);
    }
  }

  levelSelected() {
    let sLevel = _.cloneDeep(this.volumeHoursForm.get('level').value);
    sLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
    if (sLevel && sLevel.length && (sLevel[0] === 'ALL' || sLevel[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element._id);
      });
      this.volumeHoursForm.get('level').patchValue(dataLevel);
    }
    // console.log(this.volumeHoursForm.controls);
  }

  checkFormValidity(): boolean {
    if (this.volumeHoursForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.volumeHoursForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  onValidate() {
    if (this.checkFormValidity()) {
      return;
    }
    // console.log(this.volumeHoursForm.value);
    const payload = this.createPayload();
    const id = this.volumeHoursForm.get('legal_entity_ids').value[0];
    const is_publish = false;

    this.subs.sink = this.admissionService.UpdateLegalEntityPublish(id, payload, is_publish).subscribe(
      (res) => {
        if (res) {
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
        this.userService.postErrorLog(err);
        if (err['message'] === 'GraphQL error: Some program already assigned to candidate!') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Account_s2.Title'),
            text: this.translate.instant('Account_s2.Text'),
            confirmButtonText: this.translate.instant('Account_s2.Button'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
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

  createPayload() {
    let campus = [];
    let level = [];
    let speciality = [];
    const campusSelected = [];
    const levelSelected = [];
    let isNoSpeciality = false;

    if (this.data && this.data.selected && this.data.selected.length) {
      campus = this.data.selected.map((list) => list.campus);
      level = this.data.selected.map((list) => list.level);
      speciality = this.data.selected.map((list) => list?.speciality_id?._id)?.filter((list) => list);
    }
    campus = _.uniqBy(campus);
    level = _.uniqBy(level);
    if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
      this.schoolData.campuses.forEach((element, idx) => {
        if (campus.includes(element.name)) {
          campusSelected.push(element._id);
        }
      });
    }
    if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
      this.schoolData.levels.forEach((element, idx) => {
        if (level.includes(element.name)) {
          levelSelected.push(element._id);
        }
      });
    }
    if (this.data?.selected?.length) {
      this.data?.selected?.forEach((data) => {
        if (!data?.speciality_id?._id) {
          isNoSpeciality = true;
        }
      })
    }
    let payload = {
      school_id: this.schoolData && this.schoolData._id ? this.schoolData._id : null,
      campus: campusSelected,
      level: levelSelected,
      speciality_ids: speciality,
      is_no_speciality: isNoSpeciality,
      scholar_season_id: this.scholarSeasonId ? this.scholarSeasonId : '',
    };

    if (!payload?.speciality_ids?.length) {
      delete payload?.speciality_ids
    }
    return payload;
  }

  clearLevel() {
    this.getDataCampus();
  }

  clearCampus() {
    this.campusList = [];
    this.realCampusList = [];
  }

  handleRemoveSchool() {
    const school = this.volumeHoursForm.get('school_id').value;
    // console.log('_sch', school);
    if (school.length === 0) {
      this.clearCampus();
    }
  }

  handleRemoveCampus() {
    const campus = this.volumeHoursForm.get('campus').value;
    // console.log('_cam', campus);
    if (campus.length === 0) {
      this.clearLevel();
    }
  }
}
