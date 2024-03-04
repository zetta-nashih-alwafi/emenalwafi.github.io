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
  selector: 'ms-chart-level',
  templateUrl: './chart-level.component.html',
  styleUrls: ['./chart-level.component.scss'],
})
export class ChartLevelDashboardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private chart: am4charts.XYChart;
  @Input() schoolData: any;
  @Input() dataMapping: any;
  @Input() filterValue: any;
  @Input() shortName = '';
  @Input() dataObjective: any;
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
      const chart = am4core.create('chartlevel', am4charts.PieChart);
      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
      chart.data = this.dataMapping
        .filter((temp) => temp.total_count !== 0)
        .map((list) => {
          return {
            country: this.translate.instant(list.engagement_level),
            bottles: list.total_count,
          };
        });
      // chart.data = [
      //   {
      //     country: 'Register',
      //     litres: 200,
      //     bottles: 1000,
      //   },
      //   {
      //     country: 'High',
      //     litres: 501.9,
      //     bottles: 1500,
      //   },
      //   {
      //     country: 'Medium',
      //     litres: 301.9,
      //     bottles: 990,
      //   },
      //   {
      //     country: 'Low',
      //     litres: 201.1,
      //     bottles: 785,
      //   },
      //   {
      //     country: 'Lost',
      //     litres: 165.8,
      //     bottles: 255,
      //   },
      // ];
      chart.radius = am4core.percent(70);
      chart.innerRadius = am4core.percent(40);
      chart.startAngle = 180;
      chart.endAngle = 360;

      const series = chart.series.push(new am4charts.PieSeries());
      series.dataFields.value = 'bottles';
      series.dataFields.category = 'country';

      series.slices.template.cornerRadius = 10;
      series.slices.template.innerCornerRadius = 7;
      series.slices.template.draggable = true;
      series.slices.template.inert = true;
      series.alignLabels = false;

      series.hiddenState.properties.startAngle = 90;
      series.hiddenState.properties.endAngle = 90;

      // chart.legend = new am4charts.Legend();
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
