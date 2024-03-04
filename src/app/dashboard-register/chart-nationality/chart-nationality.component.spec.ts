import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

import { ChartNationalityDashboardComponent } from './chart-nationality.component';

describe('ChartNationalityDashboardComponent', () => {
  let component: ChartNationalityDashboardComponent;
  let fixture: ComponentFixture<ChartNationalityDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChartNationalityDashboardComponent],
      imports: [
        CommonModule,
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

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartNationalityDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
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

  it('should have correct data for cart mapped', () => {
    component.dataMapping = [
      { nationality: 'Indonesia', candidate_counter: 10 },
      { nationality: 'France', candidate_counter: 10 },
    ];
    component.ngAfterViewInit();
    expect(component.dataForCart).toEqual([
      { country: 'Indonesia', litres: 10 },
      { country: 'France', litres: 10 },
    ]);
  });
});
