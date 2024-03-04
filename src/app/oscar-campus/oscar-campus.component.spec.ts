import { CdkTableModule } from '@angular/cdk/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { Observable, of } from 'rxjs';
import { CandidatesService } from './../service/candidates/candidates.service';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from './../service/auth-service/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { OscarCampusComponent } from './oscar-campus.component';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { MatInputModule, MatFormFieldModule, MatCheckboxModule, MatIconModule, MatSort } from '@angular/material';
import { By } from '@angular/platform-browser';

describe('OscarCampusComponent', () => {
  let component: OscarCampusComponent;
  let fixture: ComponentFixture<OscarCampusComponent>;
  let service
  let resetEl
  let originalTimeout;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OscarCampusComponent],
      imports: [
        TranslateModule.forRoot(),
        NgxPermissionsModule.forRoot(),
        SweetAlert2Module.forRoot(),
        MatTableModule,
        MatTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSortModule,
        MatButtonModule,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: CandidatesService, useClass: MockCandidateService },
      ],
      // schemas: [
      //   CUSTOM_ELEMENTS_SCHEMA
      // ],

    })
      // .overrideComponent(OscarCampusComponent, {
      //   set: { changeDetection: ChangeDetectionStrategy.Default }
      // })
      .compileComponents();
  }));

  beforeEach((() => {
    fixture = TestBed.createComponent(OscarCampusComponent);
    component = fixture.componentInstance;
    service = TestBed.get(CandidatesService)
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;

    component.ngOnInit()
  }));
  afterEach(() => {
    fixture = null
    component = null
    service = null
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //check data in table
  it('table data should be empty', async(() => {
    spyOn(service, 'getAllOscarCampus').and.returnValue(of([]))
    // component.dataSource.data = []
    component.getOscarCampusData()
    fixture.whenStable().then(() => {
      expect(component.dataSource.data.length).toEqual(0)
    })
  }));
  it('table data should not be empty', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.getOscarCampusData()
    tick()
    expect(service.getAllOscarCampus).toHaveBeenCalled()
    expect(component.dataSource.data.length).toEqual(2)
  }));
  // sort table
  it('sort table:name', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'candidate', direction: 'desc' })
    expect(component.sortValue).toEqual({ candidate: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()

    console.log('oscar2', component.sortValue, component.dataLoaded)
  });
  it('sort table:source_oscar', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'source_oscar', direction: 'desc' })
    expect(component.sortValue).toEqual({ source_oscar: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  });
  it('sort table:date_added', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'date_added', direction: 'desc' })
    expect(component.sortValue).toEqual({ date_added: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  });
  it('sort table:telephone', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'telephone', direction: 'desc' })
    expect(component.sortValue).toEqual({ telephone: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  });
  it('sort table:email', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'email', direction: 'desc' })
    expect(component.sortValue).toEqual({ email: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  });
  it('sort table:program_desired', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'program_desired', direction: 'desc' })
    expect(component.sortValue).toEqual({ program_desired: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  });
  it('sort table:trial_date', () => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded = true
    component.sort.sortChange.emit({ active: 'trial_date', direction: 'desc' })
    expect(component.sortValue).toEqual({ trial_date: 'desc' })
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  });
  //filter table
  it('filter table : source', (() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.sourceFilterCtrl.patchValue("oscar")

    expect(component.source_type).toBe('oscar')
    expect(service.getAllOscarCampus).toHaveBeenCalled()

    console.log('oscar filterValue2', component.source_type)
    console.log('oscar filterValue', component.sourceFilterCtrl.value)
  }))
  it('filter table : date', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    const date = new Date('2022-05-19');
    component.dateFilter.patchValue(date)
    tick(4000)
    expect(component.filteredValues.date_added).toEqual("19/05/2022")
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  it('filter table : name', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.nameFilter.patchValue("oscar")
    tick(4000)
    expect(component.filteredValues.name).toEqual("oscar")
    expect(service.getAllOscarCampus).toHaveBeenCalled()

    console.log('oscar name filter', component.filteredValues.name)
  }))
  it('filter table : telephone', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.telFilter.patchValue("33666167914")
    tick(4000)
    expect(component.filteredValues.telephone).toEqual("33666167914")
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  it('filter table : email', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.emailFilter.patchValue("chiara.napolitano@yopmail.com")
    tick(4000)
    expect(component.filteredValues.email).toEqual("chiara.napolitano@yopmail.com")
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  it('filter table : program', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.programsFilterCtrl.patchValue("test")
    tick(4000)
    expect(component.filteredValues.program_desired).toEqual("test")
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  it('filter table : trial', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.trialDateCtrl.patchValue("test")
    tick(4000)
    expect(component.filteredValues.trial_date).toEqual("test")
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  //filter above table
  it('filter table : school above table', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.schoolsAboveFilter.patchValue(["edhefap"])
    tick(4000)
    expect(component.filteredValues.oscar_campus_tenant_key).toEqual(["edhefap"])
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  it('filter table : programsDesiredAboveFilter', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.programsDesiredAboveFilter.patchValue(["EFAP AIX-EN-PROVENCE - 3ème année Grande Ecole 2022"])
    tick(4000)
    expect(component.filteredValues.program_desired).toEqual(["EFAP AIX-EN-PROVENCE - 3ème année Grande Ecole 2022"])
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))
  it('filter table : trialDateSupAboveFilter', fakeAsync(() => {
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.trialDateSupAboveFilter.patchValue(["Mercredi 10 novembre 2021"])
    tick(4000)
    expect(component.filteredValues.trial_date).toEqual(["Mercredi 10 novembre 2021"])
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }))

  it('reset', (() => {
    // resetEl = fixture.debugElement.nativeElement.querySelectorAll(('.oscar-reset'))
    spyOn(service, 'getAllOscarCampus').and.callThrough()
    component.sourceFilterCtrl.patchValue("oscar")
    expect(component.source_type).toBe('oscar')
    component.resetFilter()
    expect(component.sourceFilterCtrl.value).toEqual('All')
    expect(service.getAllOscarCampus).toHaveBeenCalled()
  }));
})
export class AuthServiceStub {
  getPermission() {
    return ['operator_dir']
  }
  getLocalStorageUser() {
    return {
      _id: '5ffec5c2ce635b2fb6a81f2d',
      civility: 'MRS',
      first_name: 'Maeva',
      last_name: 'Mugnier',
      email: 'm.mugnier2@yopmail.com',
      position: null,
      student_id: null,
      office_phone: '',
      direct_line: '',
      portable_phone: '',
      profile_picture: 'POC-Maeva-Mugnier-2-2c010322-3bb7-43e8-81ca-f3133d78b3ac.png',
      is_password_set: true,
      is_registered: true,
      entities: [
        {
          school: null,
          campus: null,
          level: null,
          entity_name: 'operator',
          school_type: null,
          group_of_schools: [],
          group_of_school: null,
          assigned_rncp_title: null,
          class: null,
          type: {
            _id: '5fe98eeadb866c403defdc6b',
            name: 'operator_dir',
          },
        },
      ],
    };
  }
}
class MockCandidateService extends CandidatesService {
  getAllOscarCampus(pagination, sortValue, search, filterQuery, source_type): Observable<any[]> {
    return of(
      [
        {
          civility: "MRS",
          count_document: 698,
          date_added: "2022-05-18T14:20:28.080Z",
          email: "lea.pous99@yopmail.com",
          first_name: "Léa",
          hubspot_contact_id: "",
          hubspot_deal_id: "",
          last_name: "Pous",
          nationality: "france",
          oscar_campus_id: "543725",
          program_desired: "EFAP MONTPELLIER - MBA Spécialisé Communication & Marketing Stratégique Part-Time - 2022",
          region: "",
          telephone: "+33666167914",
          trial_date: "ENTRETIEN MBA",
          _id: "628500acd7a458771bae4460"
        },
        {
          civility: "MR",
          count_document: 698,
          date_added: "2022-05-18T14:20:28.080Z",
          email: "lea.pous99@yopmail.com",
          first_name: "Oscar",
          hubspot_contact_id: "",
          hubspot_deal_id: "",
          last_name: "testing",
          nationality: "france",
          oscar_campus_id: "543725",
          program_desired: "EFAP MONTPELLIER - MBA Spécialisé Communication & Marketing Stratégique Part-Time - 2022",
          region: "",
          telephone: "+33666167914",
          trial_date: "ENTRETIEN MBA",
          _id: "628500acd7a458771bae4460"
        },]
    )
  }
}