import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
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

import { DashboardRoutes } from './dashboard.routing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetComponentModule } from '../widget-component/widget-component.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SchoolDashboardComponent } from './dashboard/school-dashboard/school-dashboard.component';
import { HistogramComponent } from './histogram/histogram.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [DashboardComponent, SchoolDashboardComponent, HistogramComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSelectModule,
    FlexLayoutModule,
    WidgetComponentModule,
    MatPaginatorModule,
    MatChipsModule,
    TranslateModule,
    PerfectScrollbarModule,
    RouterModule.forChild(DashboardRoutes),
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatMenuModule,
    MatListModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyD4y2luRxfM8Q8yKHSLdOOdNpkiilVhD9k',
    // }),
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardModule {}
