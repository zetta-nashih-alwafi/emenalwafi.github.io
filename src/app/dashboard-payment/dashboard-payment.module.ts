import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetComponentModule } from '../widget-component/widget-component.module';
import { DashboardDetailComponent } from './dashboard-detail/dashboard-detail.component';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { DashboardGeneralComponent } from './dashboard-general/dashboard-general.component';
import { ChartBarDashboardComponent } from './chart-bar/chart-bar.component';
import { ChartWeeklyDashboardComponent } from './chart-weekly/chart-weekly.component';
import { ChartLevelDashboardComponent } from './chart-level/chart-level.component';
import { DashboardPaymentComponent } from './dashboard-payment/dashboard-payment.component';
import { DashboardPaymentRoutes } from './dashboard-payment.routing';
import { DetailComparatifComponent } from './detail-comparatif/detail-comparatif.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [
    DashboardPaymentComponent,
    DashboardDetailComponent,
    DashboardGeneralComponent,
    ChartBarDashboardComponent,
    ChartWeeklyDashboardComponent,
    ChartLevelDashboardComponent,
    DetailComparatifComponent,
  ],
  imports: [
    CommonModule,
    WidgetComponentModule,
    PerfectScrollbarModule,
    RouterModule.forChild(DashboardPaymentRoutes),
    MatFormFieldModule,
    SharedModule,
    NgSelectModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyD4y2luRxfM8Q8yKHSLdOOdNpkiilVhD9k',
    // }),,

    NgxMaterialTimepickerModule,
  ],
  providers: [
    DatePipe,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardPaymentModule {}
