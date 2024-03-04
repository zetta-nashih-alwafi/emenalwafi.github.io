import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { AuthService } from './../service/auth-service/auth.service';
import { CandidatesService } from './../service/candidates/candidates.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatFormFieldModule, MatCheckboxModule, MatIconModule } from '@angular/material';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HubspotCrmComponent } from './hubspot-crm.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { Apollo } from 'apollo-angular';
import { HttpClient } from '@angular/common/http';

describe('HubspotCrmComponent', () => {
  let component: HubspotCrmComponent;
  let fixture: ComponentFixture<HubspotCrmComponent>;
  let service
  let originalTimeout;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HubspotCrmComponent],
      imports: [
        TranslateModule.forRoot(),
        NgxPermissionsModule.forRoot(),
        SweetAlert2Module.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        NgSelectModule,
        MatTooltipModule,
        MatTableModule,
        MatDatepickerModule,

        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatMomentDateModule,
        MatSortModule
      ],
      providers: [
        { provide: CandidatesService, useClass: MockCandidateService },
        { provide: AuthService, useClass: AuthServiceStub },
        // CandidatesService
      ],
      // schemas: [
      //   CUSTOM_ELEMENTS_SCHEMA
      // ],
    })
      .compileComponents()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HubspotCrmComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    service = TestBed.get(CandidatesService)
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    component.ngOnInit()
  });
  afterEach(() => {
    fixture = null
    component = null
    service = null
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should create', () => {
    expect(component).toBeTruthy()
  });
  it('table data should be empty',async( () => {
    spyOn(service, 'getAllHubspotCampus').and.returnValue(of([]))
    // component.dataSource.data = []
    component.getHubspotCampusData()
    fixture.whenStable().then(() => {
      expect(component.dataSource.data.length).toEqual(0)
    })
  }));
  it('table data should not be empty', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.getHubspotCampusData()
    tick()
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
    const data = component.dataSource.data
    expect(data.length).toEqual(2)
    console.log('hubspot', data)
  }));
  // sort table
  it('sort table:name', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'candidate',direction:'desc'})
    expect(component.sortValue).toEqual({ candidate: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:source_oscar', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'source_oscar',direction:'desc'})
    expect(component.sortValue).toEqual({ source_oscar: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:date_added', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'date_added',direction:'desc'})
    expect(component.sortValue).toEqual({ date_added: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:telephone', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'telephone',direction:'desc'})
    expect(component.sortValue).toEqual({ telephone: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:email', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'email',direction:'desc'})
    expect(component.sortValue).toEqual({ email: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:previous_school', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'previous_school',direction:'desc'})
    expect(component.sortValue).toEqual({ previous_school: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:previous_campus', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'previous_campus',direction:'desc'})
    expect(component.sortValue).toEqual({ previous_campus: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:previous_level', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'previous_level',direction:'desc'})
    expect(component.sortValue).toEqual({ previous_level: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:program_desired', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'program_desired',direction:'desc'})
    expect(component.sortValue).toEqual({ program_desired: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  it('sort table:trial_date', () => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.dataLoaded=true
    component.sort.sortChange.emit({active:'trial_date',direction:'desc'})
    expect(component.sortValue).toEqual({ trial_date: 'desc' })
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  });
  //filter table
  it('filter table:level', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.levelFilter.patchValue("1")
    tick(4000)
    expect(component.previous_level).toEqual('1')
    expect(service.getAllHubspotCampus).toHaveBeenCalled()

    console.log('hubspot filterValue2', component.previous_level)
    console.log('hubspot filterValue', component.levelFilter.value)

  }))
  it('filter table : date', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    const date = new Date('2022-05-19');
    component.dateFilter.patchValue(date)
    tick(4000)
    expect(component.filteredValues.date_added).toEqual("19/05/2022")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : name', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.nameFilter.patchValue("oscar")
    tick(4000)
    expect(component.filteredValues.name).toEqual("oscar")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()

    console.log('oscar name filter', component.filteredValues.name)
  }))
  it('filter table : telephone', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.telFilter.patchValue("33666167914")
    tick(4000)
    expect(component.filteredValues.telephone).toEqual("33666167914")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : email', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.emailFilter.patchValue("chiara.napolitano@yopmail.com")
    tick(4000)
    expect(component.filteredValues.email).toEqual("chiara.napolitano@yopmail.com")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : school', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.schoolsFilter.patchValue("test")
    tick(4000)
    expect(component.previous_school).toEqual("test")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : campus', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.campusFilter.patchValue("test")
    tick(4000)
    expect(component.previous_campus).toEqual("test")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : program', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.programsFilterCtrl.patchValue("test")
    tick(4000)
    expect(component.filteredValues.program_desired).toEqual("test")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : trial', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.trialDateCtrl.patchValue("test")
    tick(4000)
    expect(component.filteredValues.trial_date).toEqual("test")
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  //filter above table
  it('filter table : school above table', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.schoolsAboveFilter.patchValue(["edhefap"])
    tick(4000)
    expect(component.previous_school).toEqual(["edhefap"])
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : campusabove', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.campusAboveFilter.patchValue(["EFAP AIX-EN-PROVENCE - 3ème année Grande Ecole 2022"])
    tick(4000)
    expect(component.previous_campus).toEqual(["EFAP AIX-EN-PROVENCE - 3ème année Grande Ecole 2022"])
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))
  it('filter table : levelabove', fakeAsync(() => {
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.levelAboveFilter.patchValue(["1"])
    tick(4000)
    expect(component.previous_level).toEqual(["1"])
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }))

  it('reset', (() => {
    // resetEl = fixture.debugElement.nativeElement.querySelectorAll(('.oscar-reset'))
    spyOn(service, 'getAllHubspotCampus').and.callThrough()
    component.sourceFilterCtrl.patchValue("oscar")
    component.resetFilter()
    expect(component.sourceFilterCtrl.value).toEqual('hubspot')
    expect(service.getAllHubspotCampus).toHaveBeenCalled()
  }));

});


export class MockCandidateService extends CandidatesService {
  getAllHubspotCampus(pagination,
    sortValue,
    search,
    oscar_campus_tenant_key,
    source_type,
    previous_school,
    previous_campus,
    previous_level): Observable<any[]> {
    return of(
      [
        {
          civility: "neutral",
          count_document: 102,
          date_added: "2022-05-17T22:01:59.541Z",
          email: "cquentin2000@yopmail.com",
          first_name: "Quentin",
          hubspot_contact_id: "33325201",
          hubspot_deal_id: "8851503676",
          last_name: "CARREL",
          nationality: "France",
          oscar_campus_id: "",
          previous_campus: "Tours",
          previous_level: "",
          previous_school: "Brassart",
          program_desired: "Classe préparatoire arts appliqués",
          region: "",
          telephone: "+33666964252",
          trial_date: "2022-05-16",
          _id: "62841b57d7a458771ba9cb3f"
        },
        {
          civility: "neutral",
          count_document: 102,
          date_added: "2022-05-17T22:01:59.541Z",
          email: "cquentin2000@yopmail.com",
          first_name: "TEST",
          hubspot_contact_id: "33325201",
          hubspot_deal_id: "8851503676",
          last_name: "HUBSPOT",
          nationality: "France",
          oscar_campus_id: "",
          previous_campus: "Tours",
          previous_level: "",
          previous_school: "Brassart",
          program_desired: "Classe préparatoire arts appliqués",
          region: "",
          telephone: "+33666964252",
          trial_date: "2022-05-16",
          _id: "62841b57d7a458771ba9cb3g"
        }
      ]
    )
  }
  GetDataForImportObjectives(short_name, user_type_id): Observable<any[]> {
    return of(
      [
        {
          long_name: "L'École des nouveaux métiers de la communication",
          short_name: "EFAP",
          _id: "5fe998070719bc42c65d30e4",
          schoolar_season_id: [{
            rncp_titles: null,
            scholar_season: "22-23",
            _id: "61792005de9a18612a52a5da",
          }],
          campuses: [
            {
              name: "Bordeaux",
              _id: "6166e899fd74d459cd965dab",
              levels: [{
                name: "2",
                specialities: [],
                _id: "6166e899fd74d459cd965da3"
              }],
              schoolar_season_id: [{
                rncp_titles: null,
                scholar_season: "22-23",
                _id: "61792005de9a18612a52a5da",
              }]
            }
          ]
        }
      ]
    )
  }
}
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