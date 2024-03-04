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
  today: Date;
  private subs = new SubSink();

  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataMapping = [];
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
  }

  ngOnChanges() {
    this.getGeneralData();
  }
  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  ngAfterViewInit(): void {}

  getGeneralData() {
    const name = this.short_name ? this.short_name : '';
    this.subs.sink = this.admissionService.GetDataGeneralFinance('20-21').subscribe((resp) => {
      if (resp) {
        if (this.schoolData && this.schoolData.short_name) {
          const datas = resp.filter((data) => {
            return data.school === this.schoolData.short_name;
          });
          this.dataGeneral = datas.length ? datas[0] : null;
          // const dataArray = this.dataGeneral.levels.sort(function(a, b) {
          //   return this.schoolData.levels.indexOf(a) - this.schoolData.levels.indexOf(b);
          // });
          const dataArrays = [];
          if (this.schoolData && this.schoolData.levels && this.schoolData.levels.length) {
            this.schoolData.levels.forEach((element) => {
              if (this.dataGeneral) {
                const data = this.dataGeneral.levels
                  .filter((list) => list.name.toLowerCase() === element.name.toLowerCase())
                  .map((temp) => {
                    return {
                      name: element.name,
                      campuses: temp.campuses,
                    };
                  });
                dataArrays.push(...data);
              }
            });
          }
          if (dataArrays) {
            this.mappingDashboard(dataArrays);
          }
        }
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

  formatCurrency(data: number) {
    let num = '0';
    if (data) {
      num = data.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
      num = num.toString().slice(0, -3);
    }
    return num;
  }

  mappingDashboard(dataArrays) {
    this.dataMapping = [];
    dataArrays.forEach((school) => {
      const list = school.campuses.map((element) => {
        return {
          name: element.name.toLowerCase(),
          percentage: element.percentage,
          status: element.percentage <= 50 ? 'low' : element.percentage > 50 && element.percentage <= 80 ? 'medium' : 'high',
          total_registered: element.total_paid,
          total_target: element.total_target,
          levels: school.name,
        };
      });
      this.dataMapping.push(list);
    });
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
