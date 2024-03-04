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

@Component({
  selector: 'ms-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
})
export class ChartBarDashboardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
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
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.generateChart();
    });
  }

  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);
      const chart = am4core.create('chartbar', am4charts.XYChart);
      chart.scrollbarX = new am4core.Scrollbar();
      this.dataMapping = this.dataMapping.sort((a, b) => {
        return moment(a.last_date_of_week, 'DD/MM/YYYY').diff(moment(b.last_date_of_week, 'DD/MM/YYYY'));
      });
      console.log('this.dataMapping', this.dataMapping);
      chart.data = this.dataMapping.map((list) => {
        return {
          country: moment(list.last_date_of_week, 'DD/MM/YYYY').format('DD/MM/YY'),
          visits: list.target_total_accumulated_by_end_of_week,
          real: list.registration_accumulated_up_today,
        };
      });
      // Add data
      // chart.data = [
      //   {
      //     country: 'Previous Week',
      //     visits: 3025,
      //   },
      //   {
      //     country: 'This Week',
      //     visits: 1882,
      //   },
      //   {
      //     country: 'Next Week',
      //     visits: 1809,
      //   },
      // ];

      // Create axes
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'country';
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 30;
      categoryAxis.tooltip.disabled = true;
      categoryAxis.renderer.minHeight = 110;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.minWidth = 50;

      // Create series
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.sequencedInterpolation = true;
      series.dataFields.valueY = 'visits';
      series.dataFields.categoryX = 'country';
      series.tooltipText = 'Obj. {categoryX.value} : [bold]{valueY.value}';
      series.columns.template.strokeOpacity = 0;
      series.columns.template.strokeWidth = 0;
      series.clustered = false;

      series.tooltip.pointerOrientation = 'vertical';

      const series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.sequencedInterpolation = true;
      series2.dataFields.valueY = 'real';
      series2.dataFields.categoryX = 'country';
      series2.tooltipText = 'Real. {categoryX.value} : [bold]{valueY.value}';
      series2.clustered = false;
      series2.columns.template.width = am4core.percent(50);
      series2.columns.template.strokeWidth = 2;

      series2.tooltip.pointerOrientation = 'vertical';

      series.columns.template.column.cornerRadiusTopLeft = 10;
      series.columns.template.column.cornerRadiusTopRight = 10;
      series.columns.template.column.fillOpacity = 0.6;

      // on hover, make corner radiuses bigger
      const hoverState = series.columns.template.column.states.create('hover');
      hoverState.properties.cornerRadiusTopLeft = 0;
      hoverState.properties.cornerRadiusTopRight = 0;
      hoverState.properties.fillOpacity = 1;

      // series.columns.template.adapter.add('fill', function (fill, target) {
      //   return chart.colors.getIndex(target.dataItem.index);
      // });

      series2.columns.template.adapter.add('fill', function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
      });

      // Cursor
      chart.cursor = new am4charts.XYCursor();
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
