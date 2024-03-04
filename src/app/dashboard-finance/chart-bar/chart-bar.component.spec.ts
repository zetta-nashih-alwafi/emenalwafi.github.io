import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

import { ChartBarDashboardComponent } from './chart-bar.component';

describe('ChartBarDashboardComponent', () => {
  let component: ChartBarDashboardComponent;
  let fixture: ComponentFixture<ChartBarDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChartBarDashboardComponent],
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
    fixture = TestBed.createComponent(ChartBarDashboardComponent);
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

  it('should have current user populated', async () => {
    const service = TestBed.get(AuthService);
    spyOn(service, 'getLocalStorageUser').and.returnValue({ _id: 'user-random-id' });
    component.ngOnInit();
    expect(component.currentUser).toBeTruthy();
  });

  it('should have isDirectorAdmission variable populated by truthy value', async () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue({ name: 'user-random-name', validationFunction: () => {} });
    component.ngOnInit();
    expect(component.isDirectorAdmission).toBeTruthy();
  });

  it('should have isDirectorAdmission variable populated by falsy value', async () => {
    const service = TestBed.get(NgxPermissionsService);
    spyOn(service, 'getPermission').and.returnValue(null);
    component.ngOnInit();
    expect(component.isDirectorAdmission).toBeFalsy();
  });

  it('should have today variable populated', () => {
    expect(component.today).toBeTruthy();
  });

  it('should translate correct date', async () => {
    component.today = new Date('May 24, 2022 09:05:00');
    const result = component.translateDate();
    expect(result).toBe('24/05/2022');
  });
});
