import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ImportDownPaymentDialogComponent } from 'app/internship-file/import-down-payment-dialog/import-down-payment-dialog.component';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { InternshipService } from 'app/service/internship/internship.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';

@Component({
  selector: 'ms-internship-condition-table-tab',
  templateUrl: './internship-condition-table-tab.component.html',
  styleUrls: ['./internship-condition-table-tab.component.scss'],
})
export class InternshipConditionTableTabComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() schoolData: any;
  @Input() short_name = '';
  @Output() disableSecondTab: EventEmitter<boolean> = new EventEmitter();
  today: Date;
  private subs = new SubSink();

  scholars = [];
  weeks = [{ name: 'Week 1' }];
  // scholarFilter1 = new UntypedFormControl('20-21');
  weekFilter = new UntypedFormControl('Week 1');
  scholarFilter = new UntypedFormControl('');
  schoolFilter = new UntypedFormControl(null);
  listCampus = [];
  fileType: any;
  filterAdmission = {
    school: '',
    scholar_season: '',
  };
  dataDp;
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataDownPayment = [];
  dataMapping = [];
  dataMappingNonValue = [];
  dataMappingForForm = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  formAmount: UntypedFormGroup;
  formAmountTemp: UntypedFormGroup;
  dataSchoolOriginal;
  schoolList;
  currentUser;
  editMode = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isWaitingForResponse = false;
  setupDisabled = false;
  exportName: 'Export';
  isPermission: any;
  entityList: any;
  campusEntityList: any;
  levelEntityList: any;
  schoolLoginList: any;
  isDirectorCompany = false;
  isMemberCompany = false;
  currentUserTypeId: any;
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private financeService: FinancesService,
    private permissionsService: NgxPermissionsService,
    private internshipService: InternshipService,
    private candidateService: CandidatesService,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private exportCsvService: ExportCsvService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.isDirectorCompany = !!this.permissionsService.getPermission('Company Relation Director');
    this.isMemberCompany = !!this.permissionsService.getPermission('Company Relation Member');
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.subs.sink = this.candidateService.GetOneUserCRM(this.currentUser._id).subscribe(
          (res) => {
            // console.log(res);
            if (res) {
              this.entityList = res.entities.filter((resp) => resp.type && resp.type.name === this.isPermission[0]);
              this.campusEntityList = this.entityList;
              this.levelEntityList = this.entityList;
              this.entityList = _.uniqBy(this.entityList, 'school._id');
              this.campusEntityList = _.uniqBy(this.campusEntityList, 'campus._id');
              this.levelEntityList = _.uniqBy(this.levelEntityList, 'level._id');
              if (this.isDirectorCompany || this.isMemberCompany) {
                if (this.entityList && this.entityList.length) {
                  this.schoolLoginList = this.entityList.map((list) => list.school);
                }
              }
              // console.log('entityList', this.entityList);
              this.getSchoolSelected();
              this.getDataScholarSeasons();
              this.getDataSchool();
              // this.getDownPayment();
              this.today = new Date();
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
    }
  }

  getOneUser(id) {}
  goToSetUp() {
    this.internshipService.setIndexStep(1);
    this.internshipService.pushSelectedSchool(this.schoolData);
  }

  ngOnChanges() {
    this.getDataSchool();
  }
  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }
  getDataSchool() {
    const school = [];
    this.schoolList = [];
    this.isWaitingForResponse = true;
    if (this.isDirectorCompany || this.isMemberCompany) {
      if (this.schoolLoginList && this.schoolLoginList.length) {
        this.subs.sink = this.admissionService
          .GetAllSchoolScholar(this.schoolLoginList, this.scholarFilter.value, this.currentUserTypeId)
          .subscribe(
            (resp) => {
              if (resp && resp.length) {
                this.schoolList = resp;
                this.dataSchoolOriginal = resp;
                // console.log('this.data', this.dataSchoolOriginal);
                // console.log('filter value', this.schoolFilter.value);
                if (!this.schoolFilter.value) {
                  // console.log('masuk sini dia');
                  this.disableSecondTab.emit(false);
                  this.schoolData = this.dataSchoolOriginal[0];
                  this.schoolFilter.setValue(this.dataSchoolOriginal[0]._id);
                } else {
                  const data = this.dataSchoolOriginal.filter((ressp) => ressp._id === this.schoolFilter.value);
                  this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
                }
                const selectedSchool = this.schoolData;
                selectedSchool['scholar_season_id'] = this.scholarFilter.value;
                this.internshipService.pushSelectedSchool(selectedSchool);
                this.generateFormAmount();
              } else {
                this.isWaitingForResponse = false;
                this.schoolFilter.setValue(null);
              }
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
        this.isWaitingForResponse = false;
        this.schoolFilter.setValue(null);
      }
    } else {
      this.subs.sink = this.admissionService.GetAllSchoolSchoolarDropdown(this.scholarFilter.value, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.schoolList = resp;
            this.dataSchoolOriginal = resp;
            // console.log('this.data', this.dataSchoolOriginal);
            // console.log('filter value', this.schoolFilter.value);
            if (!this.schoolFilter.value) {
              // console.log('masuk sini dia');
              this.disableSecondTab.emit(false);
              this.schoolData = this.dataSchoolOriginal[0];
              this.schoolFilter.setValue(this.dataSchoolOriginal[0]._id);
            } else {
              const data = this.dataSchoolOriginal.filter((ressp) => ressp._id === this.schoolFilter.value);
              this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
            }
            const selectedSchool = this.schoolData;
            selectedSchool['scholar_season_id'] = this.scholarFilter.value;
            this.internshipService.pushSelectedSchool(selectedSchool);
            this.generateFormAmount();
          } else {
            this.isWaitingForResponse = false;
            this.schoolFilter.setValue(null);
          }
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
    }
    // this.subs.sink = this.internshipService.getJSON().subscribe((resp) => {
  }
  getDataScholarSeasons() {
    // this.scholars = [{
    //   _id: '6037096846d75f192bfba48b',
    //   scholar_season: '20-21'
    // }];
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
          // console.log('rsp', resp);
          this.scholars = resp;
          this.scholarFilter.setValue(this.scholars[0]._id);
          // this.scholars = resp;
          // this.scholarFilter.setValue(this.scholars[0]._id);
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
  getSchoolSelected() {
    this.subs.sink = this.internshipService.schoolData.subscribe(
      (resp) => {
        if (resp) {
          this.schoolData = resp;
          this.schoolFilter.setValue(resp._id);
        } else {
          this.schoolData = [];
          return;
        }
      },
      (err) => this.getDataSchool(),
    );
  }

  csvTypeSelection() {
    const data = {
      delimeter: '',
      scholar_season: this.scholarFilter.value,
      school_id: this.schoolFilter.value,
    };
    this.openImportDialog(data);
  }

  openImportDialog(data) {
    // ImportDownPaymentDialogComponent
    // console.log('Payload Import', data);
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
        this.getDataSchool();
      });
  }

  downloadCSVTemplate() {
    this.financeService.downloadDownPaymentTemplateCSV(this.fileType, this.scholarFilter.value, this.schoolFilter.value);
  }

  getDownPayment() {
    // this.dataMapping = [];
    this.isWaitingForResponse = true;
    const schools = [];
    if (this.schoolFilter.value) {
      schools.push(this.schoolFilter.value);
    }
    const filter = {
      schools_id: schools,
      scholar_season_id: this.scholarFilter.value,
    };
    this.subs.sink = this.internshipService.getAllAgreementConditionsTable(filter).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          // console.log('getAllAgreementConditionsTable', resp);
          const agreementConditions = [];
          const agreementList = [];
          const dataDp = _.cloneDeep(resp);

          if (this.isDirectorCompany || this.isMemberCompany) {
            if (this.entityList && this.entityList.length) {
              this.campusEntityList.forEach((campus) => {
                this.levelEntityList.forEach((level) => {
                  const data = {
                    school_id: this.schoolData._id ? this.schoolData._id : '',
                    short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
                    scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
                    campus: campus && campus.campus ? campus.campus.name : '',
                    level: level && level.level ? level.level.name : '',
                    condition_agreement: null,
                    _id: null,
                  };
                  agreementList.push(data);
                });
              });
            }
          } else {
            if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
              this.schoolData.campuses.forEach((campus) => {
                if (campus && campus.levels && campus.levels.length) {
                  campus.levels.forEach((level) => {
                    const data = {
                      school_id: this.schoolData._id ? this.schoolData._id : '',
                      short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
                      scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
                      campus: campus ? campus.name : '',
                      level: level ? level.name : '',
                      condition_agreement: null,
                      _id: null,
                    };
                    agreementList.push(data);
                  });
                }
              });
            }
          }
          dataDp.forEach((element) => {
            if (element && element.campuses && element.campuses.length) {
              element.campuses.forEach((campus) => {
                if (element && element.levels && element.levels.length) {
                  element.levels.forEach((level) => {
                    const data = {
                      school_id: element.schools_id && element.schools_id.length ? element.schools_id[0]._id : '',
                      short_name: element.schools_id && element.schools_id.length ? element.schools_id[0].short_name : '',
                      scholar_season_id: element.scholar_season_id ? element.scholar_season_id._id : '',
                      campus: campus ? campus : '',
                      level: level ? level : '',
                      condition_agreement: element.condition_agreement ? element.condition_agreement : null,
                      _id: element._id ? element._id : '',
                    };
                    agreementConditions.push(data);
                  });
                }
              });
            }
          });
          if (agreementConditions && agreementConditions.length) {
            agreementConditions.forEach((element) => {
              if (agreementList && agreementList.length) {
                agreementList.forEach((eln, inx) => {
                  if (element.campus === eln.campus && element.level === eln.level) {
                    agreementList[inx].condition_agreement = element.condition_agreement;
                    agreementList[inx]._id = element._id;
                  }
                });
              }
            });
          }
          this.dataMapping = _.cloneDeep(agreementList);
          // console.log('List Condition', this.dataMapping, this.schoolData);
        } else {
          const agreementList = [];
          if (this.schoolData && this.schoolData.campuses && this.schoolData.campuses.length) {
            this.schoolData.campuses.forEach((campus) => {
              if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
                this.schoolData.levels.forEach((level) => {
                  const data = {
                    school_id: this.schoolData._id ? this.schoolData._id : '',
                    short_name: this.schoolData.short_name ? this.schoolData.short_name : '',
                    scholar_season_id: this.schoolData.scholar_season_id ? this.schoolData.scholar_season_id : '',
                    campus: campus ? campus.name : '',
                    level: level ? level.name : '',
                    condition_agreement: null,
                    _id: null,
                  };
                  agreementList.push(data);
                });
              }
            });
            this.dataMapping = _.cloneDeep(agreementList);
          }
        }
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
  }

  selectSchool() {
    if (this.schoolFilter.value) {
      this.disableSecondTab.emit(false);
      this.setupDisabled = false;
      this.dataMapping = [];
      this.isWaitingForResponse = true;
      const data = this.dataSchoolOriginal.filter((resp) => resp._id === this.schoolFilter.value);
      this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
      this.getDataSchool();
    }
  }

  clearSchool() {
    this.schoolFilter.setValue(null);
    this.dataMapping = [];
    this.dataSchoolOriginal = [];
    this.setupDisabled = true;
    this.disableSecondTab.emit(true);
    this.internshipService.pushSelectedSchool(null);
  }

  selectScholar() {
    if (this.scholarFilter.value) {
      this.dataMapping = [];
      this.dataSchoolOriginal = [];
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
  generateFormAmount() {
    this.isWaitingForResponse = true;
    this.filterAdmission.school = this.schoolData.short_name;
    // const name = this.cleanFilterDataAdmission();
    // this.subs.sink = this.admissionService.GetAllGeneralForDP(name).subscribe((resp) => {
    const resp = [];
    this.schoolData.campuses.forEach((element) => {
      element.levels.forEach((level) => {
        const data = {
          campus: element.name,
          school: this.schoolData.short_name,
          level: level.name,
        };
        resp.push(data);
      });
    });
    if (resp && resp.length) {
      const folders = _.chain(resp)
        .groupBy('level')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();

      const dataArrays = [];
      if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
        this.schoolData.levels.forEach((element) => {
          const data = folders
            .filter((list) => list.name.toLowerCase() === element.name.toLowerCase())
            .map((temp) => {
              return {
                name: element.name,
                data: temp.data,
              };
            });
          dataArrays.push(...data);
        });
      }
      this.getDownPayment();
    } else {
      this.getDownPayment();
      this.isWaitingForResponse = false;
    }
    // });
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
      const sheetID = this.translate.currentLang === 'en' ? 0 : 1810114757;
      const sheetData = {
        spreadsheetId: '1KPNthvpoOBu6BOoaDnccDA3zmLf5AU6cztkwQZgRK48',
        sheetId: sheetID,
        range: 'A5',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
  }
}
