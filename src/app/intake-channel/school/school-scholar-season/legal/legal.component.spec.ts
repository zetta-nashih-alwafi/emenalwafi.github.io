import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LegalComponent } from './legal.component';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCheckboxModule,
  MatCommonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSort,
  MatSortModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { UserManagementTableComponent } from 'app/user-management/user-management-table.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UsersService } from 'app/service/users/users.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SwalComponent, SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { SwalDefaults, swalDefaultsProvider } from '@sweetalert2/ngx-sweetalert2/di';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';

fdescribe('LegalComponent', () => {
  let component: LegalComponent;
  let fixture: ComponentFixture<LegalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LegalComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        CommonModule,
        MatCommonModule,
        MatInputModule,
        MatTableModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatTooltipModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatSortModule,
        OverlayModule,
        PortalModule,
        ScrollingModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ApolloTestingModule,
        SweetAlert2Module.forRoot(),
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({ loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }] }),
      ],
      providers: [
        { provide: PageTitleService, useClass: pageTitleServiceStub },
        { provide: FinancesService, useClass: financeServiceStub },
        { provide: AuthService, useClass: authServiceStub },
        { provide: IntakeChannelService, useClass: intakeChannelServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be displayed if the data is not empty', () => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.getAccountingData();
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBeGreaterThan(0);
    console.log('legal data ', component.dataSource.data);
  });

  it('Filter table : campus', fakeAsync(() => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.campusFilter.patchValue(['test']);
    tick();
    expect(component.campusFilter.value).toEqual(['test']);
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  }));

  it('Filter table : level', fakeAsync(() => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.levelFilter.patchValue(['test']);
    tick();
    expect(component.levelFilter.value).toEqual(['test']);
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  }));

  it('Filter table : sector', fakeAsync(() => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.sectorFilter.patchValue(['test']);
    tick();
    expect(component.sectorFilter.value).toEqual(['test']);
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  }));

  it('Filter table : speciality', fakeAsync(() => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.specialityFilter.patchValue(['test']);
    tick();
    expect(component.specialityFilter.value).toEqual(['test']);
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  }));

  it('Reset table', () => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.resetTable();
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  });

  it('sort table : campus', () => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.sortData({ active: 'campus', direction: 'asc' });
    expect(component.sortValue).toEqual({ campus: 'asc' });
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  });

  it('sort table : level', () => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.sortData({ active: 'level', direction: 'asc' });
    expect(component.sortValue).toEqual({ level: 'asc' });
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  });

  it('sort table : sector', () => {
    const service = TestBed.get(FinancesService);
    spyOn(service, 'GetAdmissionIntakeData').and.callThrough();
    component.getSchoolData();
    component.sortData({ active: 'sector', direction: 'asc' });
    expect(component.sortValue).toEqual({ sector: 'asc' });
    expect(service.GetAdmissionIntakeData).toHaveBeenCalled();
  });
});

class pageTitleServiceStub extends PageTitleService {}

class financeServiceStub extends FinancesService {
  GetAdmissionIntakeData(pagination: any, sortValue: any, filter: any): Observable<any[]> {
    return of([
      {
        _id: '619b6e8c7a26c8320c1fbbae',
        email: 'm.mugnier@yopmail.com',
        civility: 'MRS',
        first_name: 'Maeva',
        last_name: 'MUGNIER',
        position: null,
        office_phone: '',
        portable_phone: '',
        entities: [
          {
            school: null,
            school_type: null,
            campus: null,
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '6009066808ed8724f5a54836',
              name: 'operator_admin',
            },
            companies: [],
            entity_name: 'operator',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db9',
              name: 'Paris',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
            companies: [],
            entity_name: 'admission',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db9',
              name: 'Paris',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
            companies: [],
            entity_name: 'admission',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
            companies: [],
            entity_name: 'admission',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
            companies: [],
            entity_name: 'admission',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '6209f2dc74890f0ecad16670',
              name: 'Contract Manager',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '6209f2dc74890f0ecad16670',
              name: 'Contract Manager',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db9',
              name: 'Paris',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '6209f2dc74890f0ecad16670',
              name: 'Contract Manager',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db9',
              name: 'Paris',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '6209f2dc74890f0ecad16670',
              name: 'Contract Manager',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518812',
              name: 'Academic Director',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518812',
              name: 'Academic Director',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db9',
              name: 'Paris',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518812',
              name: 'Academic Director',
            },
            companies: [],
            entity_name: 'academic',
          },
          {
            school: {
              _id: '6218bb19b8d2b56cd4121411',
              short_name: 'ÉCOLE_TEST',
            },
            school_type: null,
            campus: {
              _id: '6166e899fd74d459cd965db9',
              name: 'Paris',
            },
            group_of_schools: [],
            group_of_school: null,
            assigned_rncp_title: null,
            type: {
              _id: '617f64ec5a48fe2228518812',
              name: 'Academic Director',
            },
            companies: [],
            entity_name: 'academic',
          },
        ],
        user_status: 'active',
        count_document: 137,
        campuses: [
          {
            _id: '6166e899fd74d459cd965db9',
            name: 'Paris',
          },
          {
            _id: '6166e899fd74d459cd965db3',
            name: 'Lyon',
          },
        ],
        schools: [
          {
            _id: '6218bb19b8d2b56cd4121411',
            short_name: 'ÉCOLE_TEST',
          },
        ],
        isOperator: true,
      },
    ]);
  }
}

class intakeChannelServiceStub extends IntakeChannelService {
  GetOneSchoolLegal(id: any, scholar_season_id: any): Observable<any> {
    return of({
      short_name: 'mugnier',
    });
  }
}

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

class authServiceStub {
  isConnectAsUserSource = new BehaviorSubject<boolean>(false);
  isConnectAsUser$ = this.isConnectAsUserSource.asObservable();

  isLoginAsOther = () => {};
  getPermission = () => ['permission_one', 'permission_two'];
  getLocalStorageUser = () => MOCKED_LOCAL_STORAGE_USER;
  handlerSessionExpired = () => {};
  getUserEntity = () => {};
  getCurrentUser = () => MOCKED_LOCAL_STORAGE_USER;
}
