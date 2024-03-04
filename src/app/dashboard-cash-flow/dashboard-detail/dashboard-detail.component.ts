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
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss'],
})
export class DashboardDetailComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() schoolData: any;
  @Input() short_name = '';
  @Input() panelColor = '';
  @Input() campusName = '';
  @Input() scholarId: string;
  today: Date;
  private subs = new SubSink();

  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataMapping = [];
  dataCampus = [];
  dataDetail = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  campusFilter = new UntypedFormControl(null);
  detailHeader = [
    'Sep 2020',
    'Oct 2020',
    'Nov 2020',
    'Dec 2020',
    'Jan 2021',
    'Feb 2021',
    'Mar 2021',
    'Apr 2021',
    'May 2021',
    'Jun 2021',
    'Jul 2021',
    'Aug 2021',
  ];
  detailData = [];
  detailDatas = [];
  detailDatass = [];
  detailDatasss = [];
  amountPerMonth = [];
  isWaitingForResponse = false;
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    // this.dataDetail = this.detailData;
    this.currentUser = this.userService.getLocalStorageUser();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
    // console.log('Data Detail', this.detailData);
  }

  ngOnChanges() {
    // this.getGeneralData();
    console.log(this.panelColor);
    if (this.schoolData && this.campusName) {
      this.campusFilter.setValue(this.campusName);
      this.getTableData();
    }
    // console.log('Color Panel', this.panelColor);
    const color = this.panelColor;
    // if (color === 'excellent') {
    //   this.dataDetail = this.detailData;
    // } else if (color === 'good') {
    //   this.dataDetail = this.detailDatas;
    // } else if (color === 'bad') {
    //   this.dataDetail = this.detailDatass;
    // } else if (color === 'doubtful') {
    //   this.dataDetail = this.detailDatasss;
    // } else if (color === 'litigation') {
    //   this.dataDetail = this.detailDatas;
    // }
  }

  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  ngAfterViewInit(): void {}

  formatCurrency(data: number) {
    let num = '0';
    if (data) {
      num = data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  getTableData() {
    this.dataDetail = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService
      .getCashInTableData(this.schoolData._id, this.campusFilter.value, this.panelColor, this.scholarId)
      .subscribe((resp) => {
        this.mappingAmoutPerMonth(resp);
        this.dataDetail = resp;
        if (this.dataDetail.length && this.dataDetail[0] && this.dataDetail[0].months && this.dataDetail[0].months.length) {
          this.detailHeader = [];
          this.dataDetail[0].months.forEach((month) => {
            this.detailHeader.push(this.getMonthYearName(month.month));
          });
        }
        // // console.log('getCashInTableData :: ', this.dataDetail, resp);
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

  getMonthYearName(month: string): string {
    moment.locale('fr');
    return moment(month, 'DD/MM/YYYY').format('MMM YYYY');
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

  mappingAmoutPerMonth(resp) {
    this.amountPerMonth = [];
    const months = [];
    if (resp && resp.length) {
      resp.forEach((element) => {
        months.push(...element.months);
      });
      const folders = _.chain(months)
        .groupBy('month')
        .map((value, key) => ({
          name: key,
          data: value,
        }))
        .value();
      // // console.log('Months', months, folders, resp, this.campusFilter.value);
      folders.forEach(element => {
        let amount = 0;
        element.data.forEach(data => {
          amount += data.amount;
        });
        const pay = {
          months: element.name,
          amount: amount
        }
        this.amountPerMonth.push(pay);
      });
      this.isWaitingForResponse = false;
    }
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
