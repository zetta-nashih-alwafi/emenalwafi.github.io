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
    // this.listFilter = this.listFilter ? this.listFilter.substring(3, this.listFilter.length) : '';
    // this.dataMapping = _.uniqBy(this.dataMapping, 'school._id');
    console.log('dataMap', this.dataMapping);
    this.generateChart();
  }

  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);
      if (this.dataMapping && this.dataMapping.length) {
        const chart = am4core.create('chartdiv', am4charts.XYChart);
        chart.padding(40, 40, 40, 40);

        const categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = 'network';
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.inversed = true;

        const valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;

        const series = chart.series.push(new am4charts.ColumnSeries());
        series.sequencedInterpolation = true;
        series.dataFields.categoryY = 'network';
        series.dataFields.valueX = 'MAU1';
        series.tooltipText = 'Obj. {categoryY.value} : [bold]{valueX.value}';
        series.columns.template.strokeOpacity = 0;
        series.clustered = false;
        series.columns.template.column.cornerRadiusBottomRight = 5;
        series.columns.template.column.cornerRadiusTopRight = 5;
        series.columns.template.column.fillOpacity = 0.6;

        const series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.sequencedInterpolation = true;
        series2.dataFields.categoryY = 'network';
        series2.dataFields.valueX = 'MAU';
        series2.tooltipText = 'Real. {categoryY.value} : [bold]{valueX.value}';
        series2.columns.template.strokeWidth = 2;
        // series2.columns.template.strokeOpacity = 0;
        series2.clustered = false;
        series2.columns.template.width = am4core.percent(50);
        // series2.columns.template.column.cornerRadiusBottomRight = 5;
        // series2.columns.template.column.cornerRadiusTopRight = 5;

        const labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.horizontalCenter = 'left';
        labelBullet.label.dx = 10;
        // labelBullet.label.text = '{values.valueX.workingValue.formatNumber("#.0as")}';
        labelBullet.locationX = 1;

        const labelBullet1 = series2.bullets.push(new am4charts.LabelBullet());
        labelBullet1.label.horizontalCenter = 'left';
        labelBullet1.label.dx = 10;
        // labelBullet1.label.text = '{values.valueX.workingValue.formatNumber("#.0as")}';
        labelBullet1.locationX = 1;

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        // series.columns.template.adapter.add('fill', function (fill, target) {
        //   return chart.colors.getIndex(target.dataItem.index);
        // });

        // on hover, make corner radiuses bigger
        const hoverState = series.columns.template.column.states.create('hover');
        series.columns.template.column.cornerRadiusBottomRight = 0;
        series.columns.template.column.cornerRadiusTopRight = 0;
        hoverState.properties.fillOpacity = 1;

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series2.columns.template.adapter.add('fill', function (fill, target) {
          return chart.colors.getIndex(target.dataItem.index);
        });

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.lineX.disabled = true;
        chart.cursor.lineY.disabled = true;
        // categoryAxis.sortBySeries = series;
        if (this.dataMapping && this.filterValue.school && this.filterValue.campus) {
          this.dataMapping = this.dataMapping.sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else {
          categoryAxis.sortBySeries = series;
        }
        chart.data = this.dataMapping.map((list) => {
          return {
            network: list.name,
            MAU: list.counter,
            MAU1: list.objective,
          };
        });

        const cellSize = 30;
        chart.events.on('datavalidated', function (ev) {
          // Get objects of interest
          const charts = ev.target;
          const categoryAxiss = charts.yAxes.getIndex(0);

          // Calculate how we need to adjust chart height
          const adjustHeight = charts.data.length * cellSize - categoryAxiss.pixelHeight;

          // get current chart height
          const targetHeight = charts.pixelHeight + adjustHeight;

          // Set it on chart's container
          charts.svgContainer.htmlElement.style.height = targetHeight + 'px';
        });
        this.chart = chart;
      }
    });
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
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
