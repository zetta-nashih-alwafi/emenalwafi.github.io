import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule, MatProgressSpinnerModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { DashboardDetailComponent } from './dashboard-detail.component';

describe('DashboardDetailComponent', () => {
  let component: DashboardDetailComponent;
  let fixture: ComponentFixture<DashboardDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardDetailComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        NgSelectModule,
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
      providers: [
        { provide: PageTitleService, useValue: {} },
        { provide: AuthService, useClass: AuthServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDetailComponent);
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

  it('should handle "jwt expired" error response from GetAllScholarSeasonsPublished', () => {
    const financesService = TestBed.get(FinancesService);
    const authService = TestBed.get(AuthService);

    spyOn(financesService, 'GetAllScholarSeasonsPublished').and.returnValue(throwError({ message: 'jwt expired' }));
    spyOn(authService, 'handlerSessionExpired');

    component.getDataScholarSeasons();

    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle "str & salt required" error response from GetAllScholarSeasonsPublished', () => {
    const financesService = TestBed.get(FinancesService);
    const authService = TestBed.get(AuthService);

    spyOn(financesService, 'GetAllScholarSeasonsPublished').and.returnValue(throwError({ message: 'str & salt required' }));
    spyOn(authService, 'handlerSessionExpired');

    component.getDataScholarSeasons();

    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle "Authorization header is missing" error response from GetAllScholarSeasonsPublished', () => {
    const financesService = TestBed.get(FinancesService);
    const authService = TestBed.get(AuthService);

    spyOn(financesService, 'GetAllScholarSeasonsPublished').and.returnValue(throwError({ message: 'Authorization header is missing' }));
    spyOn(authService, 'handlerSessionExpired');

    component.getDataScholarSeasons();

    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle unknown error response from GetAllScholarSeasonsPublished', () => {
    const financesService = TestBed.get(FinancesService);

    spyOn(financesService, 'GetAllScholarSeasonsPublished').and.returnValue(throwError({ message: 'unknown' }));
    spyOn(Swal, 'fire');

    component.getDataScholarSeasons();

    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should handle response from GetAllScholarSeasonsPublished', () => {
    const financesService = TestBed.get(FinancesService);

    spyOn(financesService, 'GetAllScholarSeasonsPublished').and.returnValue(of([{ scholar_season: '22-23' }]));
    spyOn(component, 'listenScholarSeasonFilter');

    component.getDataScholarSeasons();

    expect(component.listenScholarSeasonFilter).toHaveBeenCalled();
  });

  it('should handle "jwt expired" error response from GetTotalRegisteredPerProgram', () => {
    const admissionService = TestBed.get(AdmissionDashboardService);
    const authService = TestBed.get(AuthService);

    spyOn(admissionService, 'GetTotalRegisteredPerProgram').and.returnValue(throwError({ message: 'jwt expired' }));
    spyOn(authService, 'handlerSessionExpired');

    component.schoolData = { _id: 'random-school-id' };
    component.filterAdmission = {
      scholar_season: '22-23',
      level: '1',
      sector: 'Test',
      speciality: 'Test',
    };
    component.getTotalRegisteredPerProgram();

    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle "str & salt required" error response from GetTotalRegisteredPerProgram', () => {
    const admissionService = TestBed.get(AdmissionDashboardService);
    const authService = TestBed.get(AuthService);

    spyOn(admissionService, 'GetTotalRegisteredPerProgram').and.returnValue(throwError({ message: 'str & salt required' }));
    spyOn(authService, 'handlerSessionExpired');

    component.schoolData = { _id: 'random-school-id' };
    component.filterAdmission = {
      scholar_season: '22-23',
      level: '1',
      sector: 'Test',
      speciality: 'Test',
    };
    component.getTotalRegisteredPerProgram();

    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle "Authorization header is missing" error response from GetTotalRegisteredPerProgram', () => {
    const admissionService = TestBed.get(AdmissionDashboardService);
    const authService = TestBed.get(AuthService);

    spyOn(admissionService, 'GetTotalRegisteredPerProgram').and.returnValue(throwError({ message: 'Authorization header is missing' }));
    spyOn(authService, 'handlerSessionExpired');

    component.schoolData = { _id: 'random-school-id' };
    component.filterAdmission = {
      scholar_season: '22-23',
      level: '1',
      sector: 'Test',
      speciality: 'Test',
    };
    component.getTotalRegisteredPerProgram();

    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle unknown error response from GetTotalRegisteredPerProgram', () => {
    const admissionService = TestBed.get(AdmissionDashboardService);

    spyOn(admissionService, 'GetTotalRegisteredPerProgram').and.returnValue(throwError({ message: 'unknown' }));
    spyOn(Swal, 'fire');

    component.schoolData = { _id: 'random-school-id' };
    component.filterAdmission = {
      scholar_season: '22-23',
      level: '1',
      sector: 'Test',
      speciality: 'Test',
    };
    component.getTotalRegisteredPerProgram();

    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should handle response from GetTotalRegisteredPerProgram', () => {
    const admissionService = TestBed.get(AdmissionDashboardService);

    spyOn(admissionService, 'GetTotalRegisteredPerProgram').and.returnValue(of([{ scholar_season: '22-23' }]));
    spyOn(component, 'getSchoolCampusLevelSectorSpecialityForTable');

    component.schoolData = { _id: 'random-school-id' };
    component.filterAdmission = {
      scholar_season: '22-23',
      level: '1',
      sector: 'Test',
      speciality: 'Test',
    };
    component.getTotalRegisteredPerProgram();

    expect(component.getSchoolCampusLevelSectorSpecialityForTable).toHaveBeenCalled();
  });

  it('should handle response from GetSchoolCampusLevelSectorSpecialityForTable', () => {
    const admissionService = TestBed.get(AdmissionDashboardService);

    spyOn(admissionService, 'GetSchoolCampusLevelSectorSpecialityForTable').and.returnValue(of([{ scholar_season: '22-23' }]));
    spyOn(component, 'mapGlobalData');

    component.schoolData = { _id: 'random-school-id' };
    component.filterAdmission = {
      scholar_season: '22-23',
      level: '1',
      sector: 'Test',
      speciality: 'Test',
    };
    component.getSchoolCampusLevelSectorSpecialityForTable();

    expect(component.mapGlobalData).toHaveBeenCalled();
  });

  it('should have #mapGlobalData', () => {
    component.schoolData = {
      school_id: 'random-school-id',
      short_name: 'random-school-short-name',
      scholar_season_id: 'random-scholar-season-id',
      campuses: [
        {
          _id: 'random-campus-id',
          name: 'random-campus-name',
        },
      ],
    };
    component.dataGeneration = [
      {
        level: {
          _id: 'randon-level-id',
          name: 'random-level-name',
          sector_id: {
            _id: 'random-sector-id',
            name: 'random-sector-name',
          },
          speciality_id: {
            _id: 'random-speciality-id',
            sigli: 'random-speciality-sigli',
          },
        },
      },
    ];
    component.totalRegistered = [
      {
        campus: {
          _id: 'random-campus-id',
          name: 'random-campus-name',
        },
        level: {
          _id: 'random-level-id',
          name: 'random-level-name',
        },
        sector: {
          _id: 'random-sector-id',
        },
        speciality: {
          _id: 'random-speciality-id',
        },
      },
    ];

    spyOn(component, 'getDownPayment');
    spyOn(component, 'generateFormAmount');

    component.mapGlobalData();

    expect(component.registerMapData).toEqual([
      {
        school_id: '',
        short_name: 'random-school-short-name',
        scholar_season_id: 'random-scholar-season-id',
        campus: 'random-campus-name',
        level: 'random-level-name',
        progress: 'random-level-name',
        campus_id: 'random-campus-id',
        level_id: 'randon-level-id',
        sector: null,
        speciality: null,
        counter: 0,
        objective: 0,
        percentage: 0,
        is_from_registration: false,
      },
    ]);
    expect(component.getDownPayment).toHaveBeenCalled();
    expect(component.generateFormAmount).toHaveBeenCalled();
  });

  it('should have #getDataByLevel', () => {
    const financeService = TestBed.get(FinancesService);

    component.schoolData = {
      campuses: [{ _id: 'random-campus-id' }],
      levels: [{ _id: 'random-level-id' }],
    };

    spyOn(financeService, 'GetAllSectorsDropdown').and.returnValue(of([{}]));
    spyOn(component, 'getTotalRegisteredPerProgram');

    component.getDataByLevel({ name: '' });
  });

  it('should handle return correct name level when passed an object with `key` property', () => {
    const dummy = { key: 'random-key' };
    const result = component.getNameLevel(dummy);
    expect(result).toBe('random-key');
  });

  it('should handle return correct name level when passed an object with `key` property', () => {
    const dummy = { name: 'random-name' };
    const result = component.getNameLevel(dummy);
    expect(result).toBe('random-name');
  });

  it('should have #onClearLevel to clear sector and speciality', () => {
    component.onClearLevel();
    expect(component.sector.length).toBe(0);
    expect(component.speciality.length).toBe(0);
  });

  it('should have #onClearSector to clear speciality', () => {
    component.onClearSector();
    expect(component.speciality.length).toBe(0);
  });

  it('should have #reset to set filter admission level to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.filterAdmission.level).toBe(null);
  });

  it('should have #reset to set filter admission sector to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.filterAdmission.sector).toBe(null);
  });

  it('should have #reset to set filter admission speciality to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.filterAdmission.speciality).toBe(null);
  });

  it('should have #reset to set filter display level to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.filterDisplay.level).toBe(null);
  });

  it('should have #reset to set filter display sector to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.filterDisplay.sector).toBe(null);
  });

  it('should have #reset to set filter display speciality to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.filterDisplay.speciality).toBe(null);
  });

  it('should have #reset to set sector to an empty array', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.sector.length).toBe(0);
  });

  it('should have #reset to set speciality to an empty array', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.speciality.length).toBe(0);
  });

  it('should have #reset to set filter sector to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.sectorFilter.value).toBe(null);
  });

  it('should have #reset to set filter speciality to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.specialityFilter.value).toBe(null);
  });

  it('should have #reset to set filter level to `null`', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.levelFilter.value).toBe(null);
  });

  it('should have #reset to fetch the data again', () => {
    spyOn(component, 'getTotalRegisteredPerProgram');
    component.reset();
    expect(component.getTotalRegisteredPerProgram).toHaveBeenCalled();
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
