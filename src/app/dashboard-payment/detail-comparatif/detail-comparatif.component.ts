import {
  Component,
  Input,
  OnInit,
  ɵbypassSanitizationTrustStyle,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  NgZone,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { isPlatformBrowser } from '@angular/common';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-detail-comparatif',
  templateUrl: './detail-comparatif.component.html',
  styleUrls: ['./detail-comparatif.component.scss'],
})
export class DetailComparatifComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() schoolData: any;
  @Input() short_name = '';
  today: Date;
  private subs = new SubSink();

  // scholars = [{ name: '19-20' }, { name: '20-21' }];
  scholars = [];
  weeks = [{ name: 'septembre', value: 0 }];
  scholarFilter = new UntypedFormControl('19-20');
  scholarFilter1 = new UntypedFormControl('20-21');
  weekFilter = new UntypedFormControl(0);
  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;
  // dataGeneral: any;
  dataMapping = [];
  dataMapping1 = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isWaitingForResponse = false;
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
  }

  ngOnChanges() {
    this.getDataScholarSeasons();
    this.getGeneralData();
    this.getGeneralData1();
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasons().subscribe((resp) => {
      if (resp && resp.length) {
        console.log('Data', resp);
        this.scholars = resp;
      }
    }, (err) => {
      if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
      ) {
        this.userService.handlerSessionExpired();
        return;
      }
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  ngAfterViewInit(): void {}

  getGeneralData() {
    // const name = this.short_name ? this.short_name : '';
    console.log('this.scholarFilter.value :: ', this.scholarFilter.value, this.schoolData);
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.GetDataGeneralFinanceComparatif(this.scholarFilter.value).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (this.schoolData && this.schoolData.short_name) {
            const datas = resp.filter((data) => {
              return data.school === this.schoolData.short_name;
            });
            const dataGeneral = datas;
            console.log('dataGeneral :: ', dataGeneral);
            const dataArrays = [];
            if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
              this.schoolData.levels.forEach((level) => {
                const dataPerCampus = [];
                this.schoolData.campuses.forEach((campus) => {
                  const dataPerLevelPerCampus = dataGeneral.find((dt) => dt.level === level.name && dt.campus === campus.name);
                  dataPerCampus.push(dataPerLevelPerCampus ? dataPerLevelPerCampus : null);
                });
                dataArrays.push(dataPerCampus);
              });
            }
            this.dataMapping = dataArrays;
            console.log('dataArrays ', this.dataMapping);
            if (this.dataMapping[0] && this.dataMapping[0][0] && this.dataMapping[0][0].weekly_progresses) {
              const currentWeeks = [];
              this.dataMapping[0][0].weekly_progresses.forEach((week, weekIdx) => {
                currentWeeks.push({ name: this.getMonthStartFromSeptember(weekIdx), value: weekIdx });
              });
              this.weeks = this.weeks.length > currentWeeks.length ? this.weeks : currentWeeks;
            }
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getMonthStartFromSeptember(addition: number): string {
    moment.locale('fr');
    const month = moment().month('septembre').add(addition, 'M').format('MMMM');
    return month;
  }

  formatCurrency(data: number) {
    let num = '0';
    if (data) {
      num = data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  getGeneralData1() {
    // const name = this.short_name ? this.short_name : '';
    console.log('this.scholarFilter1.value :: ', this.scholarFilter1.value);
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.GetDataGeneralFinanceComparatif(this.scholarFilter1.value).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (this.schoolData && this.schoolData.short_name) {
            const datas = resp.filter((data) => {
              return data.school === this.schoolData.short_name;
            });
            const dataGeneral = datas;
            console.log('dataGeneral :: ', dataGeneral);
            const dataArrays = [];
            if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
              this.schoolData.levels.forEach((level) => {
                const dataPerCampus = [];
                this.schoolData.campuses.forEach((campus) => {
                  const dataPerLevelPerCampus = dataGeneral.find((dt) => dt.level === level.name && dt.campus === campus.name);
                  dataPerCampus.push(dataPerLevelPerCampus ? dataPerLevelPerCampus : null);
                });
                dataArrays.push(dataPerCampus);
              });
            }
            this.dataMapping1 = dataArrays;
            console.log('dataArrays1 ', this.dataMapping1);
            if (this.dataMapping1[0] && this.dataMapping1[0][0] && this.dataMapping1[0][0].weekly_progresses) {
              const currentWeeks = [];
              this.dataMapping1[0][0].weekly_progresses.forEach((week, weekIdx) => {
                currentWeeks.push({ name: this.getMonthStartFromSeptember(weekIdx), value: weekIdx });
              });
              this.weeks = this.weeks.length > currentWeeks.length ? this.weeks : currentWeeks;
            }
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      }
    );
  }

  mappingDashboard(dataArrays) {}

  getNameLevel(name) {
    let levelName = name;
    if (parseInt(name)) {
      levelName = 'GE' + ' ' + name;
    } else {
      levelName = name;
    }
    return levelName;
  }

  validateData(school, data, index: number, indexLevel: number, status: boolean, detailName, schoolName) {
    let result = 0;
    let display = true;
    const dataIn = data[index] ? data[index].name : '';
    if (dataIn) {
      result = school.findIndex((list, n) => {
        return list.name.toLowerCase() === dataIn.toLowerCase();
      });
      const results = school.find((list, n) => {
        return list.name.toLowerCase() === dataIn.toLowerCase();
      });
      if (school[result]) {
        display = false;
      }
    }
    return !data[result];
  }

  validateDatas(school, data, index: number) {
    let result = 0;
    let display = false;

    return display;
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
