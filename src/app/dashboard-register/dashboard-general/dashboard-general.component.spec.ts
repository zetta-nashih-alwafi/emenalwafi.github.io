import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCommonModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatTooltipModule,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { of } from 'rxjs';
import { ChartBarDashboardComponent } from '../chart-bar/chart-bar.component';
import { ChartDailyDashboardComponent } from '../chart-daily/chart-daily.component';
import { ChartLevelDashboardComponent } from '../chart-level/chart-level.component';
import { ChartNationalityDashboardComponent } from '../chart-nationality/chart-nationality.component';
import { ChartPieDashboardComponent } from '../chart-pie/chart-pie.component';
import { ChartWeeklyDashboardComponent } from '../chart-weekly/chart-weekly.component';

import { DashboardGeneralComponent } from './dashboard-general.component';

describe('DashboardGeneralComponent', () => {
  let component: DashboardGeneralComponent;
  let fixture: ComponentFixture<DashboardGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DashboardGeneralComponent,
        ChartDailyDashboardComponent,
        ChartWeeklyDashboardComponent,
        ChartBarDashboardComponent,
        ChartLevelDashboardComponent,
        ChartNationalityDashboardComponent,
        ChartPieDashboardComponent,
      ],
      imports: [
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatCommonModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [
        { provide: PageTitleService, useValue: {} },
        { provide: AuthService, useClass: AuthServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have permission populated', () => {
    component.ngOnInit();
    expect(component.isPermission).toBeDefined();
  });

  it('should have current user populated', () => {
    component.ngOnInit();
    expect(component.currentUser).toBeTruthy();
  });

  it('should have current user entity type id populated', () => {
    component.ngOnInit();
    expect(component.currentUserTypeId).toBe('type_id_testing');
  });

  it('should have isDirectorAdmission variable populated by truthy value if there is permission for director of admission', () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue({ name: 'user-random-name', validationFunction: () => {} });
    component.ngOnInit();
    expect(component.isDirectorAdmission).toBeTruthy();
  });

  it('should have isDirectorAdmission variable populated by falsy value if there is no permission for director of admission', () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue(null);
    component.ngOnInit();
    expect(component.isDirectorAdmission).toBeFalsy();
  });

  it('should have isMemberAdmission variable populated by truthy value if there is permission for member of admission', () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue({ name: 'user-random-name', validationFunction: () => {} });
    component.ngOnInit();
    expect(component.isMemberAdmission).toBeTruthy();
  });

  it('should have isMemberAdmission variable populated by falsy value if there is no permission for member of admission', () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue(null);
    component.ngOnInit();
    expect(component.isMemberAdmission).toBeFalsy();
  });

  it('should have today variable populated', () => {
    expect(component.today).toBeTruthy();
  });

  it('should translate correct date', () => {
    component.today = new Date('May 25, 2022 10:05:00');
    const result = component.translateDate();
    expect(result).toBe('25/05/2022');
  });

  it('should handle response from GetAllEngagementLevel', () => {
    const service = TestBed.get(AdmissionDashboardService);
    spyOn(service, 'GetAllEngagementLevel').and.returnValue(
      of([
        {
          _id: 'random-id',
          school: 'random-school',
          count: 1,
          percentage: 'random-percentage',
          total_objective: 'total-objective',
          candidate_admission_statuses: [
            {
              candidate_admission_status: 'admission_in_progress',
              count: 1,
            },
          ],
        },
      ]),
    );
    component.getDataLevelEngagement();
    expect(component.dataLevel).toBeDefined();
  });

  it('should handle response from GetCountCandidatePerNationality', () => {
    const service = TestBed.get(AdmissionDashboardService);
    spyOn(service, 'GetCountCandidatePerNationality').and.returnValue(
      of([
        {
          nationality: 'Indonesia',
          candidate_counter: 1,
        },
      ]),
    );
    component.getDataForNationalityChart();
    expect(component.dataNationality.length).toBeTruthy();
  });

  it('should handle response from GetTotalRegisteredCandidate', () => {
    const service = TestBed.get(AdmissionDashboardService);
    spyOn(service, 'getTotalRegisteredCandidate').and.returnValue(
      of([
        {
          name: 'name',
          counter: 1,
          objective: 'objective',
        },
      ]),
    );
    component.getDataForObjectiveChart();
    expect(component.dataObjective.length).toBeTruthy();
  });

  it('should handle response from GetRegisteredCandidatePerWeek', () => {
    const service = TestBed.get(AdmissionDashboardService);
    spyOn(service, 'getRegisteredCandidatePerWeek').and.returnValue(
      of([
        {
          start_date: 'May 25, 2022 10:00:00',
          percentage: 100,
          real_count: 1,
          objective: 'objective',
        },
      ]),
    );
    component.getDataForWeeklyChart();
    expect(component.dataWeekly.length).toBeTruthy();
  });

  it('should handle response from GetRegisteredCandidatePerDay', () => {
    const service = TestBed.get(AdmissionDashboardService);
    spyOn(service, 'GetRegisteredCandidatePerDay').and.returnValue(
      of([
        {
          date: 'May 25, 2022 10:00:00',
          candidate_counter: 1,
        },
      ]),
    );
    component.getRegisteredCandidatePerDay();
    expect(component.dataDaily.length).toBeTruthy();
  });
});

const MOCKED_LOCAL_STORAGE_USER = {
  _id: 'user-random-id',
  entities: [
    {
      type: {
        _id: 'type_id_testing',
        name: 'permission_one',
      },
    },
  ],
};

class AuthServiceStub {
  getPermission = () => ['permission_one', 'permission_two'];
  getLocalStorageUser = () => MOCKED_LOCAL_STORAGE_USER;
  handlerSessionExpired = () => {};
}
