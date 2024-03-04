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
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { isPlatformBrowser } from '@angular/common';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import { CoreService } from 'app/service/core/core.service';

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

  startPeriode = new UntypedFormControl(null);
  endPeriode = new UntypedFormControl(null);
  minDate: any;
  listCampus = [];
  scrollVertical = 0;
  scrollHorizontal = 0;
  dataGeneral: any;
  dataCampus = [];
  dataCampusIsNull = [];
  campusList: any[][] = [];
  fullDataUser;
  campusConnected;
  currentUser;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  displayFilterPeriode = false;
  listFilter: any;
  date = moment();
  dataValue = 100;
  dataReal = 100;

  subDataWeekly = {
    total_target: null,
    percentage: null,
    last_date_of_week: '',
    registration_this_week: null,
    title: null,
  };
  constructor(
    private pageTitleService: PageTitleService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private userService: AuthService,
    private permissionsService: NgxPermissionsService,
    private coreService: CoreService,
    @Inject(PLATFORM_ID) private platformId,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.today = new Date();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.generateChart();
    });
    this.initDateFilter();
  }

  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);
      if (this.dataMapping && this.dataMapping.length) {
        const chart = am4core.create('chartweekly', am4charts.XYChart);
        chart.scrollbarX = new am4core.Scrollbar();
        if (this.coreService.chartDummyData) {
          // Add data by generate from dummy
          chart.data = this.generateDatas(365);
        } else {
          const finalData = [];
          this.dataMapping.forEach((element, ind) => {
            const dataWeekly = {
              last_date_of_week: element.start_date,
              total_target: element.objective,
              registration_this_week: element.real_count,
              percentage: element.percentage,
              title: this.translate.instant('Week') + ' ' + (ind + 1),
            };
            finalData.push(dataWeekly);
          });
          console.log(finalData);
          chart.data = finalData.map((list) => {
            return {
              country: list.last_date_of_week,
              visits: list.percentage,
              real: list.registration_this_week,
              title: list.title,
            };
          });
        }

        // Create axes
        const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = 'title';
        // categoryAxis.renderer.grid.template.location = 0;
        // categoryAxis.renderer.minGridDistance = 30;
        // categoryAxis.tooltip.disabled = true;
        // categoryAxis.renderer.minHeight = 110;

        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.minWidth = 50;

        // Create series
        const series = chart.series.push(new am4charts.ColumnSeries());
        series.sequencedInterpolation = true;
        series.dataFields.valueY = 'real';
        series.dataFields.categoryX = 'title';
        series.tooltipText = 'Obj. {categoryX.value} : [bold]{visits}%';
        series.columns.template.strokeOpacity = 0;
        series.columns.template.strokeWidth = 0;
        series.clustered = false;

        series.tooltip.pointerOrientation = 'vertical';

        const series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.sequencedInterpolation = true;
        series2.dataFields.valueY = 'real';
        series2.dataFields.categoryX = 'title';
        series2.tooltipText = 'Real. {categoryX.value} : [bold]{valueY.value}';
        series2.clustered = false;
        series2.columns.template.width = am4core.percent(50);
        series2.columns.template.strokeWidth = 2;

        series2.tooltip.pointerOrientation = 'vertical';

        series.columns.template.column.cornerRadiusTopLeft = 10;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.column.fillOpacity = 0;

        // on hover, make corner radiuses bigger
        // const hoverState = series.columns.template.column.states.create('hover');
        // hoverState.properties.cornerRadiusTopLeft = 0;
        // hoverState.properties.cornerRadiusTopRight = 0;
        // hoverState.properties.fillOpacity = 1;

        // series.columns.template.adapter.add('fill', function (fill, target) {
        //   return chart.colors.getIndex(target.dataItem.index);
        // });

        series2.columns.template.adapter.add('fill', function (fill, target) {
          return chart.colors.getIndex(target.dataItem.index);
        });

        // Cursor
        chart.cursor = new am4charts.XYCursor();
      }
    });
  }

  generateData(index?) {
    this.dataValue = Math.round(Math.random() * 10 - 5 + this.dataValue);
    this.dataReal = Math.round(Math.random() * 10 - 5 + this.dataReal);
    this.date = moment(this.date, 'DD-MM-YYYY').add(1, 'days');
    const dateNew1 = this.date.format('DD-MM-YYYY');
    return {
      country: dateNew1,
      visits: this.dataValue,
      real: this.dataReal,
      title: 'Week ' + (index + 1),
    };
  }

  generateDatas(count) {
    const datas = [];
    for (let i = 0; i < count; ++i) {
      datas.push(this.generateData(i));
    }
    return datas;
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
        ? this.listFilter + (parseInt(this.filterValue.level) ? ' / ' + this.filterValue.level : ' / ' + this.filterValue.level)
        : parseInt(this.filterValue.level)
        ? this.filterValue.level
        : ' / ' + this.filterValue.level;
    }
    if (this.filterValue.sector) {
      this.listFilter = this.listFilter ? this.listFilter + ' / ' + this.filterValue.sector : ' / ' + this.filterValue.sector;
    }
    if (this.filterValue.speciality) {
      this.listFilter = this.listFilter ? this.listFilter + ' / ' + this.filterValue.speciality : ' / ' + this.filterValue.speciality;
    }
    this.generateChart();
    console.log('!! data weekly', this.dataMapping);
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

  initDateFilter() {
    this.subs.sink = this.startPeriode.valueChanges.subscribe((input) => {
      const date = moment(input, 'DD/MM/YYYY').format('DD/MM/YYYY');
      console.log('!!Start Date', date);
      this.minDate = input;
    });

    this.subs.sink = this.endPeriode.valueChanges.subscribe((input) => {
      const date = moment(input, 'DD/MM/YYYY').format('DD/MM/YYYY');
      console.log('!!End Date', date);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
