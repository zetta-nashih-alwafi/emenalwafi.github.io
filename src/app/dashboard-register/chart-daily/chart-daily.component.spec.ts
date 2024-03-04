import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as moment from 'moment';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

import { ChartDailyDashboardComponent } from './chart-daily.component';

describe('ChartDailyComponent', () => {
  let component: ChartDailyDashboardComponent;
  let fixture: ComponentFixture<ChartDailyDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChartDailyDashboardComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        ApolloTestingModule,
        HttpClientTestingModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [{ provide: PageTitleService, useValue: {} }],
    }).compileComponents();
  }));

  afterEach(() => {
    fixture = null;
    component = null;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDailyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current user populated', () => {
    const service = TestBed.get(AuthService);
    spyOn(service, 'getLocalStorageUser').and.returnValue({ _id: 'user-random-id' });
    component.ngOnInit();
    expect(component.currentUser).toBeTruthy();
  });

  it('should have isDirectorAdmission variable populated by truthy value', () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue({ name: 'user-random-name', validationFunction: () => {} });
    component.ngOnInit();
    expect(component.isDirectorAdmission).toBeTruthy();
  });

  it('should have isDirectorAdmission variable populated by falsy value', () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue(null);
    component.ngOnInit();
    expect(component.isDirectorAdmission).toBeFalsy();
  });

  it('should have today variable populated', () => {
    expect(component.today).toBeTruthy();
  });

  it('should translate correct date', () => {
    component.today = new Date('May 24, 2022 09:05:00');
    const result = component.translateDate();
    expect(result).toBe('24/05/2022');
  });

  it('should generate chart only in browser', () => {
    spyOn(component, 'browserOnly');
    component.generateChart();
    expect(component.browserOnly).toHaveBeenCalled();
  });

  it('should generate data', () => {
    component.date = moment('May 24, 2022 09:05:00');
    component.dataValue = 100;
    const result = component.generateData();
    expect(result).toBeDefined();
  });

  it('should generate multiple data', () => {
    component.date = moment('May 24, 2022 09:05:00');
    component.dataValue = 100;
    const result = component.generateDatas(3);
    expect(result.length).toBe(3);
  });

  it('should init the date filter', () => {
    spyOn(component, 'initDateFilter');
    component.ngOnInit();
    expect(component.initDateFilter).toHaveBeenCalled();
  });

  it('should have start date filter works', () => {
    component.startPeriode.setValue('24/05/2022');
    fixture.detectChanges();
    expect(component.start).toBe('24/05/2022');
  });

  it('should have end date filter works', () => {
    component.endPeriode.setValue('24/05/2022');
    fixture.detectChanges();
    expect(component.end).toBe('24/05/2022');
  });
});
