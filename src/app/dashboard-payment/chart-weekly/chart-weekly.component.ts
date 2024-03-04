import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, Input, NgZone, OnChanges, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { forkJoin } from 'rxjs';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';

@Component({
  selector: 'ms-chart-weekly',
  templateUrl: './chart-weekly.component.html',
  styleUrls: ['./chart-weekly.component.scss'],
})
export class ChartWeeklyDashboardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private chart: am4charts.XYChart;
  @Input() schoolData: any;
  @Input() dataMapping: any;
  @Input() filterValue: any;
  @Input() shortName = '';
  today: Date;
  private subs = new SubSink();

  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;

  dataGeneral: any;
  dataGeneral1: any;
  dataGeneral2: any;
  dataPerWeek = [];

  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  listFilter: any;
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
    @Inject(PLATFORM_ID) private platformId,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
    this.getChartData();
    this.generateChart();
  }

  getChartData() {
    const forkParam = [];
    const filter = this.cleanFilterData1819();
    const filter1 = this.cleanFilterData1920();
    const filter2 = this.cleanFilterData2021();
    forkParam.push(this.admissionService.getEvolutionOverMonths(filter));
    forkParam.push(this.admissionService.getEvolutionOverMonths(filter1));
    forkParam.push(this.admissionService.getEvolutionOverMonths(filter2));

    this.subs.sink = forkJoin(forkParam).subscribe(
      (responses) => {
        console.log('responsesdataGeneral123 ', responses);
        this.dataGeneral = responses[0] ? responses[0] : [];
        this.dataGeneral1 = responses[1] ? responses[1] : [];
        this.dataGeneral2 = responses[2] ? responses[2] : [];
        this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
          this.generateChart();
        });
      },
      (err) => console.log('error happen', err),
    );
  }

  cleanFilterData1819() {
    let filter = '';
    if (
      this.filterValue ||
      this.filterValue.admission_member_id ||
      this.filterValue.school ||
      this.filterValue.campus ||
      this.filterValue.level ||
      this.filterValue.scholar_season
    ) {
      const filterData = _.cloneDeep(this.filterValue);
      let filterQuery = '';
      if (!this.filterValue.scholar_season) {
        filterQuery = filterQuery + ` scholar_season:"18-19"`;
      }
      Object.keys(filterData).forEach((key) => {
        // only add key that has value to the query. so it wont send filter with empty string
        if (filterData[key] || filterData[key] === false) {
          if (key === 'scholar_season') {
            filterQuery = filterQuery + ` ${key}:"18-19"`;
          } else {
            filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          }
        }
      });
      filter = 'filter: {' + filterQuery + '}';
    } else {
      filter = 'filter: {scholar_season: "18-19"}';
    }
    return filter;
  }

  cleanFilterData1920() {
    let filter = '';
    if (
      this.filterValue ||
      this.filterValue.admission_member_id ||
      this.filterValue.school ||
      this.filterValue.campus ||
      this.filterValue.level ||
      this.filterValue.scholar_season
    ) {
      const filterData = _.cloneDeep(this.filterValue);
      let filterQuery = '';
      if (!this.filterValue.scholar_season) {
        filterQuery = filterQuery + ` scholar_season:"19-20"`;
      }
      Object.keys(filterData).forEach((key) => {
        // only add key that has value to the query. so it wont send filter with empty string
        if (filterData[key] || filterData[key] === false) {
          if (key === 'scholar_season') {
            filterQuery = filterQuery + ` ${key}:"19-20"`;
          } else {
            filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          }
        }
      });
      filter = 'filter: {' + filterQuery + '}';
    } else {
      filter = 'filter: {scholar_season: "19-20"}';
    }
    return filter;
  }

  cleanFilterData2021() {
    let filter = '';
    if (
      this.filterValue ||
      this.filterValue.admission_member_id ||
      this.filterValue.school ||
      this.filterValue.campus ||
      this.filterValue.level ||
      this.filterValue.scholar_season
    ) {
      const filterData = _.cloneDeep(this.filterValue);
      let filterQuery = '';
      if (!this.filterValue.scholar_season) {
        filterQuery = filterQuery + ` scholar_season:"20-21"`;
      }
      Object.keys(filterData).forEach((key) => {
        // only add key that has value to the query. so it wont send filter with empty string
        if (filterData[key] || filterData[key] === false) {
          if (key === 'scholar_season') {
            filterQuery = filterQuery + ` ${key}:"20-21"`;
          } else {
            filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          }
        }
      });
      filter = 'filter: {' + filterQuery + '}';
    } else {
      filter = 'filter: {scholar_season: "20-21"}';
    }
    return filter;
  }

  getMonthStartFromSeptember(addition: number): string {
    moment.locale('fr');
    const month = moment().month('septembre').add(addition, 'M').format('MMM');
    return month;
  }

  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);
      const chart = am4core.create('chartweekly', am4charts.XYChart);

      chart.colors.step = 2;
      chart.data = [];
      let weeksCount = 0;
      if (this.dataGeneral && this.dataGeneral.length) {
        this.dataGeneral = this.dataGeneral.sort((a, b) => {
          return moment.utc(a.date).diff(moment.utc(b.date));
        });
        weeksCount = Math.max(weeksCount, this.dataGeneral.length);
      }
      if (this.dataGeneral1 && this.dataGeneral1.length) {
        this.dataGeneral1 = this.dataGeneral1.sort((a, b) => {
          return moment.utc(a.date).diff(moment.utc(b.date));
        });
        weeksCount = Math.max(weeksCount, this.dataGeneral1.length);
      }
      if (this.dataGeneral2 && this.dataGeneral2.length) {
        this.dataGeneral2 = this.dataGeneral2.sort((a, b) => {
          return moment.utc(a.date).diff(moment.utc(b.date));
        });
        weeksCount = Math.max(weeksCount, this.dataGeneral2.length);
      }
      // console.log('this.dataGeneral ', this.dataGeneral);
      // console.log('this.dataGeneral1 ', this.dataGeneral1);
      // console.log('this.dataGeneral2 ', this.dataGeneral2);
      // console.log('weeksCount ', weeksCount);

      for (let i = 0; i < weeksCount; i++) {
        // this.translate.instant('Month') + ` ${i + 1}`
        if (
          this.dataGeneral &&
          this.dataGeneral[i] &&
          this.dataGeneral1 &&
          this.dataGeneral1[i] &&
          this.dataGeneral2 &&
          this.dataGeneral2[i]
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            first: this.dataGeneral && this.dataGeneral[i] ? this.dataGeneral[i].amount : 0,
            second: this.dataGeneral1 && this.dataGeneral1[i] ? this.dataGeneral1[i].amount : 0,
            third: this.dataGeneral2 && this.dataGeneral2[i] ? this.dataGeneral2[i].amount : 0,
          });
        } else if (
          !(this.dataGeneral && this.dataGeneral[i]) &&
          this.dataGeneral1 &&
          this.dataGeneral1[i] &&
          this.dataGeneral2 &&
          this.dataGeneral2[i]
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            second: this.dataGeneral1 && this.dataGeneral1[i] ? this.dataGeneral1[i].amount : 0,
            third: this.dataGeneral2 && this.dataGeneral2[i] ? this.dataGeneral2[i].amount : 0,
          });
        } else if (
          this.dataGeneral &&
          this.dataGeneral[i] &&
          !(this.dataGeneral1 && this.dataGeneral1[i]) &&
          this.dataGeneral2 &&
          this.dataGeneral2[i]
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            first: this.dataGeneral && this.dataGeneral[i] ? this.dataGeneral[i].amount : 0,
            third: this.dataGeneral2 && this.dataGeneral2[i] ? this.dataGeneral2[i].amount : 0,
          });
        } else if (
          this.dataGeneral &&
          this.dataGeneral[i] &&
          this.dataGeneral1 &&
          this.dataGeneral1[i] &&
          !(this.dataGeneral2 && this.dataGeneral2[i])
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            first: this.dataGeneral && this.dataGeneral[i] ? this.dataGeneral[i].amount : 0,
            second: this.dataGeneral1 && this.dataGeneral1[i] ? this.dataGeneral1[i].amount : 0,
          });
        } else if (
          this.dataGeneral &&
          this.dataGeneral[i] &&
          !(this.dataGeneral1 && this.dataGeneral1[i]) &&
          !(this.dataGeneral2 && this.dataGeneral2[i])
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            first: this.dataGeneral && this.dataGeneral[i] ? this.dataGeneral[i].amount : 0,
          });
        } else if (
          !(this.dataGeneral && this.dataGeneral[i]) &&
          this.dataGeneral1 &&
          this.dataGeneral1[i] &&
          !(this.dataGeneral2 && this.dataGeneral2[i])
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            second: this.dataGeneral1 && this.dataGeneral1[i] ? this.dataGeneral1[i].amount : 0,
          });
        } else if (
          !(this.dataGeneral && this.dataGeneral[i]) &&
          !(this.dataGeneral1 && this.dataGeneral1[i]) &&
          this.dataGeneral2 &&
          this.dataGeneral2[i]
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
            third: this.dataGeneral2 && this.dataGeneral2[i] ? this.dataGeneral2[i].amount : 0,
          });
        } else if (
          !(this.dataGeneral && this.dataGeneral[i]) &&
          !(this.dataGeneral1 && this.dataGeneral1[i]) &&
          !(this.dataGeneral2 && this.dataGeneral2[i])
        ) {
          chart.data.push({
            date: this.getMonthStartFromSeptember(i),
          });
        }
      }
      console.log('chart.data :: ', chart.data);
      // Add data
      // chart.data = [
      //   {
      //     date: this.translate.instant('Week') + ' 1',
      //     first: 0,
      //     second: 0,
      //     third: 0,
      //   },
      //   {
      //     date: this.translate.instant('Week') + ' 2',
      //     first: 200,
      //     second: 246,
      //     third: 398,
      //   },
      //   {
      //     date: this.translate.instant('Week') + ' 3',
      //     first: 500,
      //     second: 411,
      //     third: 765,
      //   },
      //   {
      //     date: this.translate.instant('Week') + ' 4',
      //     first: 853,
      //     second: 974,
      //     third: 1310,
      //   },
      //   {
      //     date: this.translate.instant('Week') + ' 5',
      //     first: 1444,
      //     second: 1365,

      //   },
      //   {
      //     date: this.translate.instant('Week') + ' 6',
      //     first: 2000,

      //   },
      //   {
      //     date: this.translate.instant('Week') + ' 7',
      //     first: 2855,

      //   },
      // ];

      // Create axes
      const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      dateAxis.renderer.minGridDistance = 50;
      dateAxis.dataFields.category = 'date';
      // dateAxis.renderer.opposite = true;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      // valueAxis.renderer.inversed = true;
      // valueAxis.title.text = 'Payment received';
      valueAxis.renderer.minLabelPosition = 0.01;

      // Create series
      function createAxisAndSeries(field, name, opposite, bullet) {
        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = 'date';
        series.name = name;
        series.bullets.push(new am4charts.CircleBullet());
        series.tooltipText = '{name}: [bold]{valueY}[/]';
        series.legendSettings.valueText = '{valueY}';
      }

      createAxisAndSeries('first', '18-19', false, 'circle');
      createAxisAndSeries('second', '19-20', true, 'triangle');
      createAxisAndSeries('third', '20-21', true, 'rectangle');

      // Add legend
      chart.legend = new am4charts.Legend();

      // Add cursor
      chart.cursor = new am4charts.XYCursor();

      // generate some random data, quite different range
    });
  }

  ngOnChanges() {
    this.listFilter = '';
    if (this.filterValue.admission_member_id) {
      this.listFilter = this.listFilter
        ? this.listFilter + ' / ' + this.filterValue.admission_member_id
        : ' / ' + this.filterValue.admission_member_id;
    }
    if (this.filterValue.scholar_season) {
      this.listFilter = this.listFilter
        ? this.listFilter + ' / ' + this.filterValue.scholar_season
        : ' / ' + this.filterValue.scholar_season;
    }
    if (this.filterValue.school) {
      this.listFilter = this.listFilter ? this.listFilter + ' / ' + this.filterValue.school : ' / ' + this.filterValue.school;
    }
    if (this.filterValue.campus) {
      this.listFilter = this.listFilter ? this.listFilter + ' / ' + this.filterValue.campus : ' / ' + this.filterValue.campus;
    }
    if (this.filterValue.level) {
      this.listFilter = this.listFilter
        ? this.listFilter + (parseInt(this.filterValue.level) ? ' / GE ' + this.filterValue.level : ' / ' + this.filterValue.level)
        : parseInt(this.filterValue.level)
        ? 'GE ' + this.filterValue.level
        : ' / ' + this.filterValue.level;
    }
    this.getChartData();
    this.generateChart();
  }
  translateDate() {
    return moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit(): void {
    // if (this.dataMapping && this.dataMapping.length) {
    // Chart code goes in here
  }
  // }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
