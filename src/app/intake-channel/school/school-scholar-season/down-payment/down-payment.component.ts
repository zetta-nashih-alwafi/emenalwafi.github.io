import { Component, Input, OnInit, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { ImportDownPaymentDialogComponent } from 'app/internship-file/import-down-payment-dialog/import-down-payment-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-down-payment',
  templateUrl: './down-payment.component.html',
  styleUrls: ['./down-payment.component.scss'],
})
export class DownPaymentComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() scholarSeason: any;
  schoolData: any;
  short_name = '';
  today: Date;
  private subs = new SubSink();

  scholars = [];
  weeks = [{ name: 'Week 1' }];
  scholarFilter1 = new UntypedFormControl('20-21');
  weekFilter = new UntypedFormControl('Week 1');
  scholarFilter = new UntypedFormControl(null);
  schoolFilter = new UntypedFormControl(null);
  listCampus = [];
  fileType: any;
  filterAdmission = {
    school: '',
    scholar_season_id: '',
  };
  dataDp;
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataDownPayment = [];
  dataMapping = [];
  dataMappingForForm = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  formAmount: UntypedFormGroup;
  formAmountTemp: UntypedFormGroup;
  dataSchoolOriginal;
  dataGeneration;
  dataSchoolList;
  currentUser;
  editMode = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isWaitingForResponse = false;
  exportName: 'Export';
  scholarSeasons: any;

  loadingAfterValidate = false;
  downPaymentInputList = [];
  depositMapData;
  payloadDeposit;
  formGenerated;
  fromDP;
  fullDP;
  schoolId;
  isPermission: string[];
  currentUserTypeId: any;
  constructor(
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private financeService: FinancesService,
    private permissionsService: NgxPermissionsService,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private intakeService: IntakeChannelService,
    private exportCsvService: ExportCsvService,
    private router: ActivatedRoute,
    private translateService: TranslateService,
    public permission: PermissionService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.editMode = false;
    //  console.log('_res', res);
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


  onWheel(event: Event) {
    event?.preventDefault();
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
        this.isWaitingForResponse = false;
        // Record error log
        this.userService.postErrorLog(err);
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

  getDP() {
    const schoolId = this.schoolFilter.value ? this.schoolFilter.value : '';
    const scholarId = this.scholarSeason._id ? this.scholarSeason._id : '';
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getAllDownPayment(schoolId, scholarId).subscribe(
      (resp) => {
        this.fullDP = resp;
        //  console.log('fullDP', this.fullDP);
        this.getDataGeneration();
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.userService.postErrorLog(err);
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
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
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
          this.getDP();
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
            confirmButtonText: this.translateService.instant('OK'),
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
              confirmButtonText: this.translateService.instant('OK'),
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
              external: 0,
              is_internal_editable: level.is_internal_editable,
              is_external_editable: level.is_external_editable,
              internal: 0,
              amount: 0,
              _id: null,
            };
            globalDepositList.push(data);
          });
        }
      });
      // console.log('globalDepositList', globalDepositList);
      // console.log('DP', this.fullDP);
      if (globalDepositList && globalDepositList.length) {
        globalDepositList.forEach((global, ind) => {
          // const deposit = this.fullDP.find((list) => list.deposit_name === global.deposit_name);
          const deposit = this.fullDP.find(
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
              external: deposit.external ? deposit.external : 0,
              internal: deposit.internal ? deposit.internal : 0,
              is_internal_editable: deposit.is_internal_editable,
              is_external_editable: deposit.is_external_editable,
              amount: deposit.amount ? deposit.amount : 0,
              _id: deposit._id,
            };
            globalDepositList[ind] = data;
          }
        });
      }
      this.depositMapData = _.cloneDeep(globalDepositList);
      this.getDownPayment();
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
    //  console.log('resp', respCode);
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
  getDownPayment() {
    const resp = _.cloneDeep(this.fullDP);
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
          internal: data.internal ? data.internal : 0,
          external: data.external ? data.external : 0,
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
      //           this.depositMapData[inx].internal = element.internal;
      //           this.depositMapData[inx].external = element.external;
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
      //  console.log('Data Down Payment', folders, dataArrays, this.dataDp);
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
              .get('external')
              .setValue(element.external >= 0 ? element.external : 0);
            this.formAmount
              .get('down_payment_inputs')
              .get(count.toString())
              .get('internal')
              .setValue(element.internal >= 0 ? element.internal : 0);
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('campus').setValue(element.campus._id);
            this.formAmount.get('down_payment_inputs').get(count.toString()).get('scholar_season_id').setValue(this.scholarSeason._id);
          }
          count++;
        });
      }
      const payload = this.formAmount.get('down_payment_inputs').value;
      //  console.log(payload, this.formAmount.get('down_payment_inputs'));
    }
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
            confirmButtonText: this.translateService.instant('OK'),
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
      internal: [0],
      external: [0],
    });
  }
  initAmountForm() {
    return this.fb.group({
      _id: [null],
      school_id: [''],
      scholar_season_id: [''],
      campus: [''],
      level: [''],
      speciality: [''],
      sector: [''],
      indexS: [''],
      internal: [0],
      external: [0],
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
          .get('internal')
          .patchValue(Number(event?.target?.value || 0));
      }
      //  console.log('indexFormAmount', indexFormAmount);
    }
  }

  keyupAmountExternal(data, event: any) {
    //  console.log(data);
    if (this.depositMapData && this.depositMapData.length) {
      const formValue = _.cloneDeep(this.formAmount.get('down_payment_inputs').value);
      const indexFormAmount = formValue.findIndex((x) => x._id === data._id);
      if (indexFormAmount >= 0) {
        this.formAmount
          .get('down_payment_inputs')
          .get(indexFormAmount.toString())
          .get('external')
          .patchValue(Number(event?.target?.value || 0));
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
      .open(ImportDownPaymentDialogComponent, {
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
    this.financeService.downloadDownPaymentTemplateCSV(this.fileType, this.scholarSeason._id, this.schoolFilter.value);
  }

  connectSpecialitySectorWithLevel(schoolData, downPaymentData) {
    schoolData.levels.forEach((level) => {
      const fullRateItemWithSameLevel = downPaymentData.find(
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
      this.dataMapping = [];
      this.editMode = false;
      this.isWaitingForResponse = true;
      this.getDataGeneration();
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

  mappingDashboard(dataArrays) {
    this.dataMapping = [];
    dataArrays.forEach((school) => {
      const list = school.data.map((element) => {
        return {
          name: element.campus.toLowerCase(),
          internal: element.internal,
          external: element.external,
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
    // console.log('this.dataMapping ', this.dataMapping, this.dataMappingForForm);
  }

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
        internal: list.internal ? list.internal : 0,
        external: list.external ? list.external : 0,
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
    this.subs.sink = this.financeService.UpdateManyDownPayment(payload).subscribe(
      (resp) => {
        if (resp) {
          //  console.log('Validate Edit Mode', resp);
          this.loadingAfterValidate = false;
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
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('OK'),
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
          amount = dataAmount.internal ? dataAmount.internal : null;
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
          amount = dataAmount.external ? dataAmount.external : null;
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
                obj[nexs] = datas.internal ? datas.internal : '';
                nexs++;
                obj[nexs] = datas.external ? datas.external : '';
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
      const sheetID = this.translate.currentLang === 'en' ? 0 : 1810114757;
      const sheetData = {
        spreadsheetId: '1KPNthvpoOBu6BOoaDnccDA3zmLf5AU6cztkwQZgRK48',
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
    const importStudentTemlate = `downloadDownPaymentData/`;
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
