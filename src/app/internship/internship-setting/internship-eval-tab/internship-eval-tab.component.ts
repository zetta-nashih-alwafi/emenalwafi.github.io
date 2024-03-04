import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
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
import { AssignDateAgreementDialogComponent } from '../assign-date-agreement/assign-date-agreement-dialog.component';

@Component({
  selector: 'ms-internship-eval-tab',
  templateUrl: './internship-eval-tab.component.html',
  styleUrls: ['./internship-eval-tab.component.scss'],
})
export class InternshipEvalTabComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() schoolData: any;
  @Input() short_name = '';
  today: Date;
  private subs = new SubSink();

  scholars = [];
  weeks = [{ name: 'Week 1' }];
  scholarFilter1 = new UntypedFormControl('20-21');
  weekFilter = new UntypedFormControl('Week 1');
  scholarFilter = new UntypedFormControl('6037096846d75f192bfba48b');
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
  dataMappingForForm = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  formAmount: UntypedFormGroup;
  formAmountTemp: UntypedFormGroup;
  dataSchoolOriginal;
  currentUser;
  editMode = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isWaitingForResponse = false;
  exportName: 'Export';
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private financeService: FinancesService,
    private permissionsService: NgxPermissionsService,
    private internshipService: InternshipService,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private exportCsvService: ExportCsvService,
  ) {}

  ngOnInit() {
    this.getDataScholarSeasons();
    this.initForm();
    this.initFormTemp();
    this.getDataSchool();
    // this.getDownPayment();
    this.currentUser = this.userService.getLocalStorageUser();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
  }

  ngOnChanges() {
    this.getDataSchool();
  }
  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }
  getDataSchool() {
    const school = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.internshipService.getJSON().subscribe(
      (resp) => {
        // this.subs.sink = this.admissionService.GetAllSchool(school).subscribe((resp) => {
        if (resp && resp.length) {
          this.dataSchoolOriginal = resp;
          if (!this.schoolFilter.value) {
            this.schoolData = this.dataSchoolOriginal[0];
            this.schoolFilter.setValue(this.dataSchoolOriginal[0]._id);
          } else {
            const data = this.dataSchoolOriginal.filter((ressp) => ressp._id === this.schoolFilter.value);
            this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
          }
          this.generateArray();
          this.generateFormAmount();
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }
  getDataScholarSeasons() {
    this.scholars = [
      {
        _id: '6037096846d75f192bfba48b',
        scholar_season: '20-21',
      },
    ];
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe(
      (resp) => {
        if (resp && resp.length) {
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

  initForm() {
    this.formAmount = this.fb.group({
      down_payment_inputs: this.fb.array([]),
    });
  }

  initFormTemp() {
    this.formAmountTemp = this.fb.group({
      amount_internal: [null],
      amount_external: [null],
    });
  }
  initAmountForm() {
    return this.fb.group({
      _id: [null],
      school_id: [''],
      scholar_season_id: [''],
      campus: [''],
      level: [''],
      indexS: [''],
      amount_internal: [null],
      amount_external: [null],
    });
  }

  get amountFormArray() {
    return this.formAmount.get('down_payment_inputs') as UntypedFormArray;
  }

  addAmountForm() {
    this.amountFormArray.push(this.initAmountForm());
  }

  inputKeyup(event, data, indexLevel, indexData, school, level) {
    if (this.dataMapping && this.dataMapping.length && this.dataMapping[indexLevel]) {
      const mappData = this.dataMapping[indexLevel];
      if (mappData && mappData.length) {
        // && (mappData[indexData].name.toLowerCase() === school.name.toLowerCase())
        const dataAmount = mappData.find((x) => x.name.toLowerCase() === school.name.toLowerCase());
        if (dataAmount) {
          const indexAmount = this.dataDp.findIndex((x) => x._id === dataAmount._id);
          if (indexAmount >= 0) {
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('level').setValue(dataAmount.levels);
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('school_id').setValue(this.schoolData._id);
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('campus').setValue(dataAmount.name);
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('_id').setValue(dataAmount._id);
            this.formAmount
              .get('down_payment_inputs')
              .get(indexAmount.toString())
              .get('scholar_season_id')
              .setValue(dataAmount.scholar_season_id);
            this.formAmount
              .get('down_payment_inputs')
              .get(indexAmount.toString())
              .get('amount_internal')
              .setValue(this.formAmountTemp.get('amount_internal').value);
            // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_internal').value, indexAmount, dataAmount);
          }
        } else {
          const indexAmount = this.formAmount.get('down_payment_inputs').value.findIndex((x) => x._id === null);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('level').setValue(level);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('school_id').setValue(this.schoolData._id);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('campus').setValue(school.name);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('_id').setValue(null);
          this.formAmount
            .get('down_payment_inputs')
            .get(indexAmount.toString())
            .get('scholar_season_id')
            .setValue(this.scholarFilter.value);
          this.formAmount
            .get('down_payment_inputs')
            .get(indexAmount.toString())
            .get('amount')
            .setValue(this.formAmountTemp.get('amount_internal').value);
          // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_internal').value, indexAmount, dataAmount);
        }
      }
    } else {
      const index = this.formAmount
        .get('down_payment_inputs')
        .value.findIndex(
          (x) =>
            x.indexS !== '' &&
            x.campus &&
            x.campus.toLowerCase() === school.name.toLowerCase() &&
            x.level &&
            x.level.toLowerCase() === level.toLowerCase(),
        );
      // console.log(index);
      if (index >= 0) {
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('level').setValue(level);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('school_id').setValue(this.schoolData._id);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('campus').setValue(school.name);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('_id').setValue(null);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('scholar_season_id').setValue(this.scholarFilter.value);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('indexS').setValue(index.toString());
        this.formAmount
          .get('down_payment_inputs')
          .get(index.toString())
          .get('amount_internal')
          .setValue(this.formAmountTemp.get('amount_internal').value);
        // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_internal').value, index);
      } else {
        const indexAmount = this.formAmount
          .get('down_payment_inputs')
          .value.findIndex((x) => x._id === null && x.amount_internal === null && x.indexS === '');
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('level').setValue(level);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('school_id').setValue(this.schoolData._id);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('campus').setValue(school.name);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('_id').setValue(null);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('scholar_season_id').setValue(this.scholarFilter.value);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('indexS').setValue(indexAmount.toString());
        this.formAmount
          .get('down_payment_inputs')
          .get(indexAmount.toString())
          .get('amount_internal')
          .setValue(this.formAmountTemp.get('amount_internal').value);
        // console.log(
        //   'Keyup Input',
        //   event,
        //   data,
        //   this.formAmountTemp.get('amount_internal').value,
        //   indexAmount,
        //   this.formAmount.get('down_payment_inputs').value,
        // );
      }
    }
  }

  inputKeyupExternal(event, data, indexLevel, indexData, school, level) {
    if (this.dataMapping && this.dataMapping.length && this.dataMapping[indexLevel]) {
      const mappData = this.dataMapping[indexLevel];
      if (mappData && mappData.length) {
        // && (mappData[indexData].name.toLowerCase() === school.name.toLowerCase())
        const dataAmount = mappData.find((x) => x.name.toLowerCase() === school.name.toLowerCase());
        if (dataAmount) {
          const indexAmount = this.dataDp.findIndex((x) => x._id === dataAmount._id);
          if (indexAmount >= 0) {
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('level').setValue(dataAmount.levels);
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('school_id').setValue(this.schoolData._id);
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('campus').setValue(dataAmount.name);
            this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('_id').setValue(dataAmount._id);
            this.formAmount
              .get('down_payment_inputs')
              .get(indexAmount.toString())
              .get('scholar_season_id')
              .setValue(dataAmount.scholar_season_id);
            this.formAmount
              .get('down_payment_inputs')
              .get(indexAmount.toString())
              .get('amount_external')
              .setValue(this.formAmountTemp.get('amount_external').value);
            // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_external').value, indexAmount, dataAmount);
          }
        } else {
          const indexAmount = this.formAmount.get('down_payment_inputs').value.findIndex((x) => x._id === null);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('level').setValue(level);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('school_id').setValue(this.schoolData._id);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('campus').setValue(school.name);
          this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('_id').setValue(null);
          this.formAmount
            .get('down_payment_inputs')
            .get(indexAmount.toString())
            .get('scholar_season_id')
            .setValue(this.scholarFilter.value);
          this.formAmount
            .get('down_payment_inputs')
            .get(indexAmount.toString())
            .get('amount_external')
            .setValue(this.formAmountTemp.get('amount_external').value);
          // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_external').value, indexAmount, dataAmount);
        }
      }
    } else {
      const index = this.formAmount
        .get('down_payment_inputs')
        .value.findIndex(
          (x) =>
            x.indexS !== '' &&
            x.campus &&
            x.campus.toLowerCase() === school.name.toLowerCase() &&
            x.level &&
            x.level.toLowerCase() === level.toLowerCase(),
        );
      if (index >= 0) {
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('level').setValue(level);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('school_id').setValue(this.schoolData._id);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('campus').setValue(school.name);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('_id').setValue(null);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('scholar_season_id').setValue(this.scholarFilter.value);
        this.formAmount.get('down_payment_inputs').get(index.toString()).get('indexS').setValue(index.toString());
        this.formAmount
          .get('down_payment_inputs')
          .get(index.toString())
          .get('amount_external')
          .setValue(this.formAmountTemp.get('amount_external').value);
        // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_external').value, index);
      } else {
        const indexAmount = this.formAmount
          .get('down_payment_inputs')
          .value.findIndex((x) => x._id === null && x.amount_external === null && x.indexS === '');
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('level').setValue(level);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('school_id').setValue(this.schoolData._id);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('campus').setValue(school.name);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('_id').setValue(null);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('scholar_season_id').setValue(this.scholarFilter.value);
        this.formAmount.get('down_payment_inputs').get(indexAmount.toString()).get('indexS').setValue(indexAmount.toString());
        this.formAmount
          .get('down_payment_inputs')
          .get(indexAmount.toString())
          .get('amount_external')
          .setValue(this.formAmountTemp.get('amount_external').value);
        // console.log('Keyup Input', event, data, this.formAmountTemp.get('amount_external').value, indexAmount);
      }
    }
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
    const schoolId = this.schoolFilter.value ? this.schoolFilter.value : '';
    const scholarId = this.scholarFilter.value ? this.scholarFilter.value : '';
    this.subs.sink = this.financeService.getAllDownPayment(schoolId, scholarId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          // this.initForm();
          // resp.forEach((element) => {
          //   this.addAmountForm();
          // });
          let dataDp = _.cloneDeep(resp);
          // let dataGrouping = _.cloneDeep(resp);
          // if (this.scholarFilter.value) {
          //   dataGrouping = dataGrouping.filter((list) => list.scholar_season_id._id === this.scholarFilter.value);
          // }
          dataDp = dataDp.map((data) => {
            return {
              school_id: data.school_id ? data.school_id._id : '',
              scholar_season_id: data.scholar_season_id ? data.scholar_season_id._id : '',
              campus: data.campus ? data.campus : '',
              level: data.level ? data.level : '',
              amount_internal: data.amount ? data.amount : null,
              amount_external: data.amount ? data.amount : null,
              _id: data._id ? data._id : '',
            };
          });
          this.dataDp = dataDp;
          this.formAmount.get('down_payment_inputs').patchValue(dataDp);
          // this.dataMapping = resp;
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
          this.dataDownPayment = dataArrays;
          // console.log('Data Down Payment', folders, dataArrays, this.dataDp);
          if (dataArrays) {
            this.mappingDashboard(dataArrays);
          }
        }
        // else {
        //   this.dataMapping = [];
        // }
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
      this.dataMapping = [];
      this.isWaitingForResponse = true;
      const data = this.dataSchoolOriginal.filter((resp) => resp._id === this.schoolFilter.value);
      this.schoolData = data && data.length ? data[0] : this.dataSchoolOriginal[0];
      this.getDataSchool();
    }
  }

  selectScholar() {
    if (this.scholarFilter.value) {
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
          amount_internal: element.amount,
          amount_external: element.amount,
          scholar_season_id: element.scholar_season_id ? element.scholar_season_id._id : '',
          school_id: element.school_id._id,
          levels: element.level,
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
  openAssignDateDialog() {
    // ImportDownPaymentDialogComponent
    this.subs.sink = this.dialog
      .open(AssignDateAgreementDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        this.getDataSchool();
      });
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
      if (dataArrays) {
        this.mappingDashboards(dataArrays);
      }
      this.getDownPayment();
    } else {
      this.isWaitingForResponse = false;
    }
    // });
  }
  mappingDashboards(dataArrays) {
    this.dataMappingForForm = [];
    dataArrays.forEach((school) => {
      const list = school.data.map((element) => {
        return {
          name: element.campus.toLowerCase(),
          levels: school.level,
        };
      });
      this.dataMappingForForm.push(list);
    });
  }
  dataAmount(indexLevel, indexSchool, indexData, dataMap, school) {
    let amount = null;
    if (this.dataMapping && this.dataMapping.length && this.dataMapping[indexLevel]) {
      const mappData = this.dataMapping[indexLevel];
      if (mappData && mappData.length) {
        // && (mappData[indexData].name.toLowerCase() === school.name.toLowerCase())
        const dataAmount = mappData.find((x) => x.name.toLowerCase() === school.name.toLowerCase());
        if (dataAmount) {
          amount = dataAmount.amount_internal;
        } else {
          amount = 0;
        }
      } else {
        amount = 0;
      }
    } else {
      amount = 0;
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
          amount = dataAmount.amount_external;
        } else {
          amount = 0;
        }
      } else {
        amount = 0;
      }
    } else {
      amount = 0;
    }
    return amount;
  }

  generateArray() {
    if (this.schoolData) {
      this.initForm();
      this.schoolData.campuses.forEach((element) => {
        element.levels.forEach((level) => {
          this.addAmountForm();
        });
      });
      const payload = this.formAmount.get('down_payment_inputs').value;
      // console.log(payload, this.formAmount.get('down_payment_inputs'));
    }
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
