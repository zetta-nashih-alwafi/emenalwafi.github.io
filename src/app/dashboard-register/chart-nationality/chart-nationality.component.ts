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
  selector: 'ms-chart-nationality',
  templateUrl: './chart-nationality.component.html',
  styleUrls: ['./chart-nationality.component.scss'],
})
export class ChartNationalityDashboardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private chart: am4charts.XYChart;
  @Input() schoolData: any;
  @Input() filterValue: any;
  @Input() dataMapping: any;
  @Input() shortName = '';
  today: Date;
  private subs = new SubSink();

  listCampus = [];
  dataForCart = [];
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
      this.listFilter = '';
      this.dataForCart = this.dataMapping.map((resp) => {
        return {
          country: this.translate.instant('NATIONALITY.' + resp.nationality),
          litres: resp.candidate_counter,
        };
      });
      // this.dataForCart = [
      //   {
      //     country: this.translate.instant('France'),
      //     litres: 52,
      //   },
      //   {
      //     country: this.translate.instant('North Africa'),
      //     litres: 18,
      //   },
      //   {
      //     country: this.translate.instant('South Africa'),
      //     litres: 15,
      //   },
      //   {
      //     country: this.translate.instant('Asia'),
      //     litres: 10,
      //   },
      //   {
      //     country: this.translate.instant('North America'),
      //     litres: 5,
      //   },
      // ];
      this.generateChart();
    });
  }

  generateChart() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);
      if (this.dataForCart && this.dataForCart.length) {
        const chart = am4core.create('chartnationality', am4charts.PieChart);
        chart.data = [];
        // Add data
        chart.data = this.dataForCart;

        // Add and configure Series
        const pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = 'litres';
        pieSeries.dataFields.category = 'country';
        pieSeries.slices.template.stroke = am4core.color('#fff');
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;

        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;
        chart.numberFormatter.numberFormat = '#.';
      }
    });
  }

  ngOnChanges() {
    console.log('filterValue', this.filterValue);
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
    this.dataForCart = this.dataMapping.map((resp) => {
      return {
        country: this.translate.instant('NATIONALITY.' + resp.nationality),
        litres: resp.candidate_counter,
      };
    });
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
    if (this.dataMapping && this.dataMapping.length) {
      this.dataForCart = this.dataMapping.map((resp) => {
        return {
          country: this.translate.instant(resp.nationality),
          litres: resp.candidate_counter,
        };
      });
    }
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
