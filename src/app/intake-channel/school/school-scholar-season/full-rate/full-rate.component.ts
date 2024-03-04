import { Component, Input, OnInit, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { ImportFullRateDialogComponent } from 'app/internship-file/import-full-rate-dialog/import-full-rate-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-full-rate',
  templateUrl: './full-rate.component.html',
  styleUrls: ['./full-rate.component.scss'],
})
export class FullRateComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() scholarSeason: any;
  schoolData: any;
  short_name = '';
  today: Date;
  private subs = new SubSink();

  scholars = [];
  weeks = [{ name: 'Week 1' }];
  scholarFilter = new UntypedFormControl(null);
  scholarFilter1 = new UntypedFormControl('20-21');
  weekFilter = new UntypedFormControl('Week 1');
  schoolFilter = new UntypedFormControl(null);
  listCampus = [];
  fileType: any;
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataDownPayment = [];
  dataMapping = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  formAmount: UntypedFormGroup;
  formAmountTemp: UntypedFormGroup;
  dataSchoolOriginal;
  dataSchoolList;
  currentUser;
  editMode = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isWaitingForResponse = false;
  dataMappingForForm = [];
  filterAdmission = {
    school: '',
    scholar_season_id: '',
  };
  dataDp;
  depositMapData;
  depositBasedOnForm;
  exportName: 'Export';
  scholarSeasons: any;
  loadingAfterValidate = false;
  dataGeneration;
  formGenerated;
  schoolId;
  fullRate;
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private financeService: FinancesService,
    private permissionsService: NgxPermissionsService,
    private dialog: MatDialog,
    private exportCsvService: ExportCsvService,
    private fb: UntypedFormBuilder,
    private router: ActivatedRoute,
    private intakeService: IntakeChannelService,
    public permission: PermissionService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.editMode = false;
    if (this.scholarSeason && this.scholarSeason._id) {
      this.filterAdmission.scholar_season_id = this.scholarSeason._id;
      this.scholarFilter.setValue(this.scholarSeason._id);
    }
    if (this.scholarSeason && this.scholarSeason.scholar_season) {
      this.scholarSeasons = this.scholarSeason.scholar_season;
    } else {
      this.scholarSeasons = '';
    }
    this.subs.sink = this.router.paramMap.subscribe((param) => {
      this.schoolId = param.get('id');
    });
    if (this.schoolId) {
      this.getSchoolData();
    }
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
  }

  getSchoolData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetOneSchool(this.schoolId).subscribe(
      (resp) => {
        if (resp) {
          this.schoolData = _.cloneDeep(resp);
          this.short_name = resp.short_name;
          this.getDataScholarSeasons();
          this.initForm();
          this.initFormTemp();
          this.getDataSchool();
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  ngOnChanges() {
    this.getDataSchool();
  }

  getRate() {
    const schoolId = this.schoolFilter.value ? this.schoolFilter.value : '';
    const scholarId = this.scholarSeason._id ? this.scholarSeason._id : '';
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllFullRate(schoolId, scholarId).subscribe(
      (resp) => {
        this.fullRate = resp;
        this.getDataGeneration();
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getDataSchool() {
    const school = [this.short_name];
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.GetAllSchoolScholar(school, this.scholarSeason._id, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSchoolOriginal = resp;
          this.dataSchoolList = resp;
          if (!this.schoolFilter.value) {
            this.schoolData = this.dataSchoolOriginal[0];
            this.schoolFilter.setValue(this.dataSchoolOriginal[0]._id);
          } else {
            const data = this.dataSchoolOriginal.filter((ressp) => ressp._id === this.schoolFilter.value);
            this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
          }
          this.getRate();
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.isWaitingForResponse = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDataGeneration() {
    this.subs.sink = this.admissionService
      .GetSchoolCampusLevelSectorSpecialityForTable(this.schoolFilter.value, this.scholarSeason._id, null, null, this.currentUserTypeId)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataGeneration = resp.map((list) => {
              return {
                deposit_name: list.level
                  ? list.sector_id
                    ? list.speciality_id
                      ? list.level.name + ' - ' + list.sector_id.name + ' - ' + list.speciality_id.name
                      : list.level.name + ' - ' + list.sector_id.name
                    : list.level.name
                  : '',
                ...list,
              };
            });
            this.isWaitingForResponse = false;
            this.mapGlobalData();
          } else {
            this.isWaitingForResponse = false;
          }
        },
        (error) => {
          // Record error log
          this.userService.postErrorLog(error);
          this.isWaitingForResponse = false;
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
        },
      );
  }

  mapGlobalData() {
    const globalDepositList = [];
    if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
      this.schoolData.campuses.forEach((campus) => {
        if (this.dataGeneration && this.dataGeneration.length) {
          this.dataGeneration.forEach((level) => {
            const data = {
              school_id: this.schoolData._id ? this.schoolData._id : '',
              short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
              scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
              campus: campus ? campus.name : '',
              level: level.level ? level.level.name : '',
              deposit_name: level.level
                ? level.sector_id
                  ? level.speciality_id
                    ? level.level.name + ' - ' + level.sector_id.name + ' - ' + level.speciality_id.name
                    : level.level.name + ' - ' + level.sector_id.name
                  : level.level.name
                : '',
              campus_id: campus ? campus._id : '',
              level_id: level.level ? level.level._id : null,
              sector: level.sector_id ? level.sector_id._id : null,
              speciality: level.speciality_id ? level.speciality_id._id : null,
              is_from_deposit: false,
              amount_external: 0,
              is_internal_editable: level.is_internal_editable,
              is_external_editable: level.is_external_editable,
              amount_internal: 0,
              amount: 0,
              _id: null,
            };
            globalDepositList.push(data);
          });
        }
      });
      if (globalDepositList && globalDepositList.length) {
        globalDepositList.forEach((global, ind) => {
          const deposit = this.fullRate.find(
            (list) =>
              list.campus._id === global.campus_id &&
              list.level._id === global.level_id &&
              list.sector._id === global.sector &&
              (list.speciality ? list.speciality._id === global.speciality : list.speciality === global.speciality),
          );
          if (deposit) {
            const data = {
              school_id: this.schoolData._id ? this.schoolData._id : '',
              short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
              scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
              campus: deposit.campus ? deposit.campus.name : '',
              level: deposit.level ? deposit.level.name : '',
              deposit_name: global.deposit_name,
              campus_id: deposit.campus ? deposit.campus._id : '',
              level_id: deposit.level ? deposit.level._id : '',
              sector: deposit.sector ? deposit.sector._id : '',
              speciality: deposit.speciality ? deposit.speciality._id : '',
              is_from_deposit: true,
              is_internal_editable: deposit.is_internal_editable,
              is_external_editable: deposit.is_external_editable,
              amount_external: deposit.amount_external ? deposit.amount_external : 0,
              amount_internal: deposit.amount_internal ? deposit.amount_internal : 0,
              amount: deposit.amount ? deposit.amount : 0,
              _id: deposit._id,
            };
            globalDepositList[ind] = data;
          }
        });
      }
      this.depositMapData = _.cloneDeep(globalDepositList);
      this.getFullRate();
      this.generateFormAmount();
      //  console.log('this.depositMapData', this.depositMapData);
      //  console.log('mapGlobalData', globalDepositList);
    }
  }

  generateFormAmount() {
    this.filterAdmission.school = this.schoolData.short_name;
    // const name = this.cleanFilterDataAdmission();
    // this.subs.sink = this.admissionService.GetAllGeneralForDP(name).subscribe((resp) => {
    const resp = [];
    this.dataGeneration.forEach((level) => {
      this.schoolData.campuses.forEach((element) => {
        const data = {
          campus: element.name,
          school: this.schoolData.short_name,
          level: level.level ? level.level.name : '',
          campus_id: element ? element._id : '',
          level_id: level.level ? level.level._id : '',
          sector: level.sector_id ? level.sector_id._id : '',
          speciality: level.speciality_id ? level.speciality_id._id : '',
          is_internal_editable: level.is_internal_editable,
          is_external_editable: level.is_external_editable,
          deposit_name: level.level
            ? level.sector_id
              ? level.speciality_id
                ? level.level.name + ' - ' + level.sector_id.name + ' - ' + level.speciality_id.name
                : level.level.name + ' - ' + level.sector_id.name
              : level.level.name
            : '',
          is_from_deposit: false,
        };
        resp.push(data);
      });
    });
    const respCode = [];
    this.dataGeneration.forEach((level) => {
      this.schoolData.campuses.forEach((element) => {
        const data = {
          campus: element.name,
          school: this.schoolData.short_name,
          level: level.level ? level.level.name : '',
          campus_id: element ? element._id : '',
          level_id: level.level ? level.level._id : '',
          sector: level.sector_id ? level.sector_id._id : '',
          speciality: level.speciality_id ? level.speciality_id._id : '',
          is_internal_editable: level.is_internal_editable,
          is_external_editable: level.is_external_editable,
          deposit_name: level.level
            ? level.sector_id
              ? level.speciality_id
                ? level.level.name + ' - ' + level.sector_id.name + ' - ' + level.speciality_id.name
                : level.level.name + ' - ' + level.sector_id.name
              : level.level.name
            : '',
          is_from_deposit: false,
        };
        respCode.push(data);
      });
    });
    if (resp && resp.length) {
      resp.forEach((element) => {
        if (respCode && respCode.length) {
          respCode.forEach((eln, inx) => {
            if (
              element.campus.toUpperCase() === eln.campus.toUpperCase() &&
              element.level.toUpperCase() === eln.level.toUpperCase() &&
              element.sector.toUpperCase() === eln.sector.toUpperCase() &&
              element.speciality.toUpperCase() === eln.speciality.toUpperCase()
            ) {
              respCode[inx].is_from_deposit = true;
            }
          });
        }
      });
    }
    this.depositBasedOnForm = resp;
    //  console.log('resp', resp, respCode);
    if (respCode && respCode.length) {
      const folders = _.chain(respCode)
        .groupBy('deposit_name')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      this.formGenerated = folders;
      let dataArrays = [];
      if (this.formGenerated && this.formGenerated.length) {
        const data = folders.map((temp) => {
          return {
            name: temp.name,
            data: _.uniqBy(temp.data, 'campus'),
          };
        });
        dataArrays = _.orderBy(data, ['name'], ['asc']);
      }
      this.formGenerated = dataArrays;
    }
  }

  getFullRate() {
    const resp = _.cloneDeep(this.fullRate);
    if (resp && resp.length) {
      this.generateArray(resp);
      let dataDp = _.cloneDeep(resp);
      dataDp = dataDp.map((data) => {
        return {
          school_id: data.school_id ? data.school_id._id : '',
          scholar_season_id: data.scholar_season_id ? data.scholar_season_id._id : '',
          campus_id: data.campus ? data.campus._id : '',
          level_id: data.level ? data.level._id : '',
          campus: data.campus ? data.campus.name : '',
          level: data.level ? data.level.name : '',
          sector: data.sector ? data.sector._id : '',
          speciality: data.speciality ? data.speciality._id : '',
          is_internal_editable: data.is_internal_editable,
          is_external_editable: data.is_external_editable,
          deposit_name: data.level
            ? data.sector
              ? data.speciality
                ? data.level.name + ' - ' + data.sector.name + ' - ' + data.level.name
                : data.level.name + ' - ' + data.sector.name
              : data.level.name
            : '',
          amount_internal: data.amount_internal ? data.amount_internal : 0,
          amount_external: data.amount_external ? data.amount_external : 0,
          _id: data._id ? data._id : null,
        };
      });
      // if (dataDp && dataDp.length) {
      //   dataDp.forEach((element) => {
      //     if (this.depositMapData && this.depositMapData.length) {
      //       this.depositMapData.forEach((eln, inx) => {
      //         if (
      //           element.campus.toUpperCase() === eln.campus.toUpperCase() &&
      //           element.level.toUpperCase() === eln.level.toUpperCase() &&
      //           element.sector.toUpperCase() === eln.sector.toUpperCase() &&
      //           element.speciality.toUpperCase() === eln.speciality.toUpperCase()
      //         ) {
      //           this.depositMapData[inx].is_from_deposit = true;
      //           this.depositMapData[inx].amount_internal = element.amount_internal;
      //           this.depositMapData[inx].amount_external = element.amount_external;
      //           this.depositMapData[inx]._id = element._id;
      //         }
      //       });
      //     }
      //   });
      // }
      //  console.log('dataDp', dataDp, this.depositMapData);
      this.dataDp = dataDp;
      this.connectSpecialitySectorWithLevel(this.schoolData, this.dataDp);
      const folders = _.chain(this.depositMapData)
        .groupBy('deposit_name')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      let dataArrays = [];
      if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
        const data = folders.map((temp) => {
          return {
            name: temp.name,
            data: _.uniqBy(temp.data, 'campus'),
          };
        });
        dataArrays = _.orderBy(data, ['name'], ['asc']);
      }
      this.dataDownPayment = dataArrays;
      //  console.log('Data Down Payment', folders, dataArrays);
      if (dataArrays) {
        this.mappingDashboard(dataArrays);
      }
    } else {
      const folders = _.chain(this.depositMapData)
        .groupBy('deposit_name')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      let dataArrays = [];
      if (this.dataGeneration && this.dataGeneration.length) {
        const data = folders.map((temp) => {
          return {
            name: temp.name,
            data: _.uniqBy(temp.data, 'campus'),
          };
        });
        dataArrays = _.orderBy(data, ['name'], ['asc']);
      }
      this.dataDownPayment = dataArrays;
      //  console.log('Data Down Payment', folders, dataArrays);
      if (dataArrays) {
        this.mappingDashboard(dataArrays);
      }
    }
  }

  generateArray(resp) {
    if (this.schoolData) {
      this.initForm();
      let count = 0;
      if (resp && resp.length) {
        resp.forEach((element) => {
          this.addAmountForm();
          if (this.formAmount.get('down_payment_inputs').get(count.toString()).value) {
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('school_id').setValue(this.schoolData._id);
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('level').setValue(element.level._id);
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('_id').setValue(element._id);
            this.formAmount
              .get('down_payment_inputs')
              .get(count.toString())
              .get('speciality')
              .setValue(element.speciality ? element.speciality._id : null);
            this.formAmount
              .get('down_payment_inputs')
              .get(count.toString())
              .get('sector')
              .setValue(element.sector ? element.sector._id : null);
            this.formAmount
              .get('down_payment_inputs')
              .get(count.toString())
              .get('amount_external')
              .setValue(element.amount_external >= 0 ? element.amount_external : 0);
            this.formAmount
              .get('down_payment_inputs')
              .get(count.toString())
              .get('amount_internal')
              .setValue(element.amount_internal >= 0 ? element.amount_internal : 0);
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('campus').setValue(element.campus._id);
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('scholar_season_id').setValue(this.scholarSeason._id);
          }
          count++;
        });
      }
    }
  }

  mappingDashboards(dataArrays) {
    this.dataMappingForForm = [];
    dataArrays.forEach((school) => {
      const list = school.data.map((element) => {
        return {
          name: element.campus.toLowerCase(),
          levels: element.level,
          is_from_deposit: element.is_from_deposit,
        };
      });
      this.dataMappingForForm.push(list);
    });
    //  console.log('this.dataMappingForForm', this.dataMappingForForm);
  }

  mappingDashboard(dataArrays) {
    this.dataMapping = [];
    dataArrays.forEach((school) => {
      const list = school.data.map((element) => {
        return {
          name: element.campus.toLowerCase(),
          amount_internal: element.amount_internal,
          amount_external: element.amount_external,
          scholar_season_id: this.scholarSeason._id,
          school_id: element.school_id,
          is_internal_editable: element.is_internal_editable,
          is_external_editable: element.is_external_editable,
          levels: element.level,
          is_from_deposit: element.is_from_deposit,
          _id: element._id,
        };
      });
      this.dataMapping.push(list);
    });
    //  console.log('this.dataMapping ', this.dataMapping, this.dataMappingForForm);
  }
  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
          // this.scholarFilter.setValue(this.scholars[0]._id);
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  initForm() {
    this.formAmount = this.fb.group({
      down_payment_inputs: this.fb.array([]),
    });
  }

  initFormTemp() {
    this.formAmountTemp = this.fb.group({
      amount_internal: [0],
      amount_external: [0],
    });
  }

  initAmountForm() {
    return this.fb.group({
      _id: [null],
      school_id: [''],
      scholar_season_id: [''],
      campus: [''],
      indexS: [''],
      speciality: [''],
      sector: [''],
      level: [''],
      amount_internal: [0],
      amount_external: [0],
    });
  }

  get amountFormArray() {
    return this.formAmount.get('down_payment_inputs') as UntypedFormArray;
  }

  addAmountForm() {
    this.amountFormArray.push(this.initAmountForm());
  }

  keyupAmount(data, event: any) {
    //  console.log(data);
    if (this.depositMapData && this.depositMapData.length) {
      const formValue = _.cloneDeep(this.formAmount.get('down_payment_inputs').value);
      const indexFormAmount = formValue.findIndex((x) => x._id === data._id);
      const dp = formValue.filter((x) => x._id === data._id);
      if (indexFormAmount >= 0) {
        this.formAmount
          .get('down_payment_inputs')
          .get(indexFormAmount.toString())
          .get('amount_internal')
          .patchValue(Number(event?.target?.value || 0));
        //  console.log('indexFormAmount', indexFormAmount);
      }
    }
  }

  keyupAmountExternal(data, event: any) {
    //  console.log(data);
    if (this.depositMapData && this.depositMapData.length) {
      const formValue = _.cloneDeep(this.formAmount.get('down_payment_inputs').value);
      const indexFormAmount = formValue.findIndex((x) => x._id === data._id);
      const dp = formValue.filter((x) => x._id === data._id);
      if (indexFormAmount >= 0) {
        this.formAmount
          .get('down_payment_inputs')
          .get(indexFormAmount.toString())
          .get('amount_external')
          .patchValue(Number(event?.target?.value || 0));
        //  console.log('indexFormAmount', indexFormAmount);
      }
    }
  }

  csvTypeSelection() {
    const data = {
      delimeter: '',
      scholar_season: this.scholarSeason._id,
      school_id: this.schoolFilter.value,
    };
    this.openImportDialog(data);
  }

  openImportDialog(data) {
    // ImportDownPaymentDialogComponent
    //  console.log('Payload Import', data);
    this.subs.sink = this.dialog
      .open(ImportFullRateDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: data,
        panelClass: 'certification-rule-pop-up',
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getDataSchool();
        }
      });
  }

  downloadCSVTemplate() {
    this.financeService.downloadFullRateTemplateCSV(this.fileType, this.scholarSeason._id, this.schoolFilter.value);
  }

  connectSpecialitySectorWithLevel(schoolData, fullRateData) {
    schoolData.levels.forEach((level) => {
      const fullRateItemWithSameLevel = fullRateData.find(
        (rate) => rate && level && level._id && rate.level_id && rate.level_id === level._id,
      );
      if (fullRateItemWithSameLevel) {
        level.speciality = fullRateItemWithSameLevel.speciality;
        level.sector = fullRateItemWithSameLevel.sector;
      }
    });
  }

  selectSchool() {
    if (this.schoolFilter.value) {
      this.getDataGeneration();
      this.editMode = false;
      this.dataMapping = [];
      this.isWaitingForResponse = true;
      //  console.log(this.schoolFilter.value, this.dataSchoolOriginal);
      const data = this.dataSchoolOriginal.filter((resp) => resp._id === this.schoolFilter.value);
      this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
      this.getDataSchool();
    }
  }

  selectScholar() {
    if (this.scholarSeason._id) {
      this.dataMapping = [];
      this.isWaitingForResponse = true;
      this.getDataSchool();
    }
  }

  ngAfterViewInit(): void {}

  getNameLevel(name) {
    let levelName = name;
    if (parseInt(name)) {
      levelName = 'GE' + ' ' + name;
    } else {
      levelName = name;
    }
    return levelName;
  }

  isCorrectCampus(data) {}

  dashboardScroll(event) {
    if (event && event.target.scrollLeft !== this.scrollHorizontal) {
      this.scrollHorizontal = event.target.scrollLeft;
    }
    if (event && event.target.scrollTop !== this.scrollVertical) {
      this.scrollVertical = event.target.scrollTop;
    }
  }
  editModeOn() {
    this.editMode = true;
  }

  validateDownPayment() {
    this.loadingAfterValidate = true;
    let payload = this.formAmount.get('down_payment_inputs').value;
    payload = payload.map((list) => {
      return {
        amount_external: list.amount_external ? list.amount_external : 0,
        amount_internal: list.amount_internal ? list.amount_internal : 0,
        campus: list.campus && list.campus._id ? list.campus._id : list.campus ? list.campus : '',
        level: list.level && list.level._id ? list.level._id : list.level ? list.level : '',
        scholar_season_id: list.scholar_season_id ? list.scholar_season_id : '',
        speciality: list.speciality ? list.speciality : null,
        sector: list.sector ? list.sector : null,
        school_id: list.school_id ? list.school_id : '',
        _id: list._id ? list._id : null,
      };
    });
    //  console.log('payload', payload);
    this.subs.sink = this.financeService.UpdateManyFullRate(payload).subscribe(
      (resp) => {
        this.loadingAfterValidate = false;
        if (resp) {
          //  console.log('Validate Edit Mode', resp);
          if (resp && resp.message) {
            if (
              resp.message ===
              'The full rate is updated. However some programs couldn’t be updated because at least 1 term is already paid by students.' ||
              resp?.message?.includes('PAY_N1 already sent to student/FS of this program')
            ) {
              const program = resp.programs && resp.programs.length ? resp.programs.map((list) => list + '</br>') : '';
              Swal.fire({
                type: 'success',
                title: this.translate.instant('SCHOOL_S5.TITLE'),
                html: this.translate.instant('SCHOOL_S5.TEXT', { program: program }),
                confirmButtonText: this.translate.instant('SCHOOL_S5.BUTTON1'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              }).then(() => {
                this.editMode = false;
                this.getDataSchool();
              });
            } else if (
              resp.message ===
              'The full rate is updated. However some programs couldn’t be updated because there is term that already generated' ||
              resp?.message?.includes('PAY_N1 already sent to student/FS of this program')
            ) {
              const program = resp.programs && resp.programs.length ? resp.programs.map((list) => list + '</br>') : '';
              Swal.fire({
                type: 'success',
                title: this.translate.instant('SCHOOL_FR_S7.TITLE'),
                html: this.translate.instant('SCHOOL_FR_S7.TEXT', { program: program }),
                confirmButtonText: this.translate.instant('SCHOOL_FR_S7.BUTTON1'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              }).then(() => {
                this.editMode = false;
                this.getDataSchool();
              });
            } else if (
              resp.message ===
              'The full rate is updated. However some programs couldn’t be updated because there is financement already accepted'
            ) {
              const program = resp.programs && resp.programs.length ? resp.programs.map((list) => list + '</br>') : '';
              Swal.fire({
                type: 'success',
                title: this.translate.instant('SCHOOL_FR_S8.TITLE'),
                html: this.translate.instant('SCHOOL_FR_S8.TEXT', { program: program }),
                confirmButtonText: this.translate.instant('SCHOOL_FR_S8.BUTTON1'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              }).then(() => {
                this.editMode = false;
                this.getDataSchool();
              });
            } else if (resp.message === 'The full rate is updated') {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('SCHOOL_FR_S6.TITLE'),
                html: this.translate.instant('SCHOOL_FR_S6.TEXT'),
                confirmButtonText: this.translate.instant('SCHOOL_FR_S6.BUTTON1'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              }).then(() => {
                this.editMode = false;
                this.getDataSchool();
              });
            } else {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.editMode = false;
                this.getDataSchool();
              });
            }
          } else {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.editMode = false;
              this.getDataSchool();
            });
          }
        }
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        this.loadingAfterValidate = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
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
        } else if(err && err['message'] && err['message'].includes('GraphQL error: Atleast one student have financement equal to the actual full rate')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('Full Rate Validate'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else if(err && err['message'] && err['message'].includes('GraphQL error: Au moins un apprenant a déjà un financement égal au tarif plein actuel')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('Full Rate Validate'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else if(err && err['message'] && err['message'].includes('GraphQL error: Cannot edit full rate because there is financement already accepted')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('Cannot edit full rate because there is financement already accepted'),
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
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  cleanFilterDataAdmission() {
    const filterData = _.cloneDeep(this.filterAdmission);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  dataAmount(indexLevel, indexSchool, indexData, dataMap, school) {
    let amount = null;
    if (this.dataMapping && this.dataMapping.length && this.dataMapping[indexLevel]) {
      const mappData = this.dataMapping[indexLevel];
      if (mappData && mappData.length) {
        // && (mappData[indexData].name.toLowerCase() === school.name.toLowerCase())
        const dataAmount = mappData.find((x) => x.name.toLowerCase() === school.name.toLowerCase());
        if (dataAmount) {
          amount = dataAmount.amount_internal ? dataAmount.amount_internal : null;
        } else {
          amount = null;
        }
      } else {
        amount = null;
      }
    } else {
      amount = null;
    }
    return amount;
  }

  dataAmountExternal(indexLevel, indexSchool, indexData, dataMap, school) {
    let amount = null;
    if (this.dataMapping && this.dataMapping.length && this.dataMapping[indexLevel]) {
      const mappData = this.dataMapping[indexLevel];
      if (mappData && mappData.length) {
        // && (mappData[indexData].name.toLowerCase() === school.name.toLowerCase())
        const dataAmount = mappData.find((x) => x.name.toLowerCase() === school.name.toLowerCase());
        if (dataAmount) {
          amount = dataAmount.amount_external ? dataAmount.amount_external : null;
        } else {
          amount = null;
        }
      } else {
        amount = null;
      }
    } else {
      amount = null;
    }
    return amount;
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  exportData() {
    Swal.close();
    const data = [];
    this.isWaitingForResponse = true;
    if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
      let nexs = 0;
      const obj = [];
      obj[0] = 'Campus';
      for (const item of this.schoolData.campuses) {
        nexs++;
        obj[nexs] = item.name ? item.name : '';
        nexs++;
      }
      data.push(obj);
    }
    if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
      let nex = 0;
      const obj = [];
      obj[0] = this.translate.instant('Level');
      for (const item of this.schoolData.campuses) {
        nex++;
        obj[nex] = this.translate.instant('Internal');
        nex++;
        obj[nex] = this.translate.instant('External');
      }
      data.push(obj);
    }

    if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
      let nex = 0;
      for (const item of this.schoolData.levels) {
        let nexs = 0;
        const obj = [];
        obj[0] = item.name ? item.name : '';
        if (this.dataMapping && this.dataMapping.length && this.dataMapping[nex] && this.dataMapping[nex].length) {
          for (const school of this.schoolData.campuses) {
            for (const datas of this.dataMapping[nex]) {
              if (datas.name && school.name && datas.name.toLowerCase() === school.name.toLowerCase()) {
                // TODO: From the template get the data location and add the data
                nexs++;
                obj[nexs] = datas.amount_internal ? datas.amount_internal : '';
                nexs++;
                obj[nexs] = datas.amount_external ? datas.amount_external : '';
              }
            }
          }
          nex++;
          data.push(obj);
        }
      }
      this.isWaitingForResponse = false;
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const title = this.exportName + '_' + today;
      const sheetID = this.translate.currentLang === 'en' ? 0 : 1503494263;
      const sheetData = {
        spreadsheetId: '1jcAykr-CDLCIaYix2lT-HWSTLRavgmybCKBj-aYIUXM',
        sheetId: sheetID,
        range: 'A5',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
  }
  filterSchool() {
    const searchString = this.schoolFilter.value.toLowerCase().trim();
    this.dataSchoolList = this.dataSchoolOriginal.filter((school) => school.short_name.toLowerCase().trim().includes(searchString));
  }

  displaySchool(school): string {
    if (school) {
      const schools = this.dataSchoolOriginal.find((schl) => schl._id.toLowerCase().trim().includes(school));
      if (schools) {
        return schools.short_name;
      } else {
        return school;
      }
    } else {
      return school;
    }
  }

  downloadCSV() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };
    Swal.fire({
      type: 'question',
      title: this.translate.instant('EXPORT_DECISION.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            resolve('');
            Swal.enableConfirmButton();
          } else {
            Swal.disableConfirmButton();
            reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
          }
        });
      },
      onOpen: function () {
        Swal.disableConfirmButton();
        Swal.getContent().addEventListener('click', function (e) {
          Swal.enableConfirmButton();
        });
        const input = Swal.getInput();
        const inputValue = input.getAttribute('value');
        if (inputValue === ';') {
          Swal.enableConfirmButton();
        }
      },
    }).then((separator) => {
      if (separator.value) {
        const fileType = separator.value;
        this.openDownloadCsv(fileType);
      }
    });
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadFullRateData/`;
    let filter;
    filter = `scholar_season_id=` + this.scholarSeason._id + '&school_id=' + this.schoolId + '';
    // console.log(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    element.href = encodeURI(url + importStudentTemlate + fileType + '/' + lang + '?' + filter);
    // console.log(element.href);
    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  decimalFilter(event: any) {
    const reg = /^-?\d{0,6}$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
}
