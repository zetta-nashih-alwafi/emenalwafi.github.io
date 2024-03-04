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
import * as am4plugins from '@amcharts/amcharts4/plugins/sunburst';

@Component({
  selector: 'ms-chart-pie',
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.scss'],
})
export class ChartPieDashboardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private chart: am4charts.XYChart;
  @Input() schoolData: any;
  @Input() dataMapping: any;
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

  ngOnChanges() {}
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
    // Chart code goes in here
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      am4core.useTheme(am4themes_dark);
      const chart = am4core.create('chartpie', am4plugins.Sunburst);
      // Add multi-level data
      chart.data = [
        {
          name: 'First',
          children: [
            { name: 'A1', value: 100 },
            { name: 'A2', value: 60 },
          ],
        },
        {
          name: 'Second',
          children: [
            { name: 'B1', value: 135 },
            { name: 'B2', value: 98 },
          ],
        },
        {
          name: 'Third',
          children: [
            {
              name: 'C1',
              children: [
                { name: 'EE1', value: 130 },
                { name: 'EE2', value: 87 },
                { name: 'EE3', value: 55 },
              ],
            },
            { name: 'C2', value: 148 },
            {
              name: 'C3',
              children: [
                { name: 'CC1', value: 53 },
                { name: 'CC2', value: 30 },
              ],
            },
            { name: 'C4', value: 26 },
          ],
        },
        {
          name: 'Fourth',
          children: [
            { name: 'D1', value: 415 },
            { name: 'D2', value: 148 },
            { name: 'D3', value: 89 },
          ],
        },
        {
          name: 'Fifth',
          children: [
            {
              name: 'E1',
              children: [
                { name: 'EE1', value: 33 },
                { name: 'EE2', value: 40 },
                { name: 'EE3', value: 89 },
              ],
            },
            {
              name: 'E2',
              value: 148,
            },
          ],
        },
      ];

      // Define data fields
      chart.dataFields.value = 'value';
      chart.dataFields.name = 'name';
      chart.dataFields.children = 'children';
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
