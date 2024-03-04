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
  EventEmitter,
  Output,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { SubSink } from 'subsink';
import { PageTitleService } from '../../core/page-title/page-title.service';
import * as _ from 'lodash';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { isPlatformBrowser } from '@angular/common';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import { CoreService } from 'app/service/core/core.service';
import { MatDatepicker } from '@angular/material/datepicker';
import * as moment from 'moment';

@Component({
  selector: 'ms-chart-daily',
  templateUrl: './chart-daily.component.html',
  styleUrls: ['./chart-daily.component.scss'],
})
export class ChartDailyDashboardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private chart: am4charts.XYChart;
  @Input() schoolData: any;
  @Input() dataMapping: any;
  @Input() filterValue: any;
  @Input() shortName = '';
  @Output() reloadDaily = new EventEmitter(false);
  today: Date;
  private subs = new SubSink();

  startPeriode = new UntypedFormControl(new Date(moment().subtract(4, 'M').format('MM/DD/YYYY')));
  endPeriode = new UntypedFormControl(new Date());
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
  listFilter: any;
  date = moment();
  dataValue = 100;
  end: string = '';
  start: string = '';

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
      const chart = am4core.create('chartdaily', am4charts.XYChart);
      chart.scrollbarX = new am4core.Scrollbar();
      if (this.coreService.chartDummyData) {
        // Add data by generate from dummy
        chart.data = this.generateDatas(365);
      } else {
        chart.data = this.dataMapping.map((list) => {
          return {
            date: list.date,
            value: list.candidate_counter,
          };
        });
      }
      // Add data by generate from dummy

      // Create axes
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'date';
      // categoryAxis.renderer.grid.template.location = 0;
      // categoryAxis.renderer.minGridDistance = 30;
      // categoryAxis.tooltip.disabled = true;
      // categoryAxis.renderer.minHeight = 110;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.minWidth = 50;

      // Create series
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = 'value';
      series.dataFields.categoryX = 'date';
      series.tooltipText = 'Real {categoryX.value} : [bold]{valueY.value}';
      series.columns.template.strokeOpacity = 0;
      series.columns.template.strokeWidth = 0;

      series.columns.template.column.cornerRadiusTopLeft = 10;
      series.columns.template.column.cornerRadiusTopRight = 10;
      series.columns.template.column.fillOpacity = 0.6;

      // on hover, make corner radiuses bigger
      const hoverState = series.columns.template.column.states.create('hover');
      hoverState.properties.cornerRadiusTopLeft = 0;
      hoverState.properties.cornerRadiusTopRight = 0;
      hoverState.properties.fillOpacity = 1;

      // Cursor
      chart.cursor = new am4charts.XYCursor();
    });
  }

  generateData() {
    this.dataValue = Math.round(Math.random() * 10 - 5 + this.dataValue);
    this.date = moment(this.date, 'DD-MM-YYYY').add(1, 'days');
    const dateNew1 = this.date.format('DD-MM-YYYY');
    return {
      date: dateNew1,
      value: this.dataValue,
    };
  }
  generateDatas(count) {
    const datas = [];
    for (let i = 0; i < count; ++i) {
      datas.push(this.generateData());
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
      if (input) {
        const date = moment(input, 'DD/MM/YYYY').format('DD/MM/YYYY');
        console.log('!!Start Date', date);
        this.minDate = input;
        if (date) {
          this.start = date;
          this.reloadDaily.emit(true);
        }
      }
    });

    this.subs.sink = this.endPeriode.valueChanges.subscribe((input) => {
      if (input) {
        const date = moment(input, 'DD/MM/YYYY').format('DD/MM/YYYY');
        console.log('!!End Date', date);
        if (date) {
          this.end = date;
          this.reloadDaily.emit(true);
        }
      }
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
