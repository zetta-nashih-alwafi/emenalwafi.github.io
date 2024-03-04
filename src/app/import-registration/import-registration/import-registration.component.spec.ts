import Swal from 'sweetalert2';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { of, Observable } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AuthService } from 'app/service/auth-service/auth.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ImportRegistrationComponent } from './import-registration.component';
import { MatInputModule, MatFormFieldModule, MatSelect, MatSelectModule } from '@angular/material';
import { FinancesService } from 'app/service/finance/finance.service';
import { By } from '@angular/platform-browser';

describe('ImportRegistrationComponent', () => {
  let component: ImportRegistrationComponent;
  let fixture: ComponentFixture<ImportRegistrationComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportRegistrationComponent],
      imports: [
        TranslateModule.forRoot(),
        NgxPermissionsModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        NgSelectModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: PageTitleService, useClass: pageTitleServiceStub },
        { provide: FinancesService, useClass: financeServiceStub },
        { provide: CandidatesService, useClass: candidateServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportRegistrationComponent);
    component = fixture.componentInstance;
    service = TestBed.get(FinancesService)
    fixture.detectChanges();
  });
  afterEach(() => {
    fixture = null
    component = null
    service = null
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //form
  it('form invalid', () => {
    expect(component.importForm.invalid).toBeTruthy()
  });
  it('form:scholar seasons', () => {
    component.importForm.get('scholarSeasons').patchValue('1')
    expect(component.importForm.get('scholarSeasons').value).toBe('1')
  });
  it('form:schools', () => {
    component.importForm.get('schools').patchValue('1')
    expect(component.importForm.get('schools').value).toBe('1')
  });
  it('form:campuses', () => {
    component.importForm.get('campuses').patchValue('1')
    expect(component.importForm.get('campuses').value).toBe('1')
  });
  it('form:levels', () => {
    component.importForm.get('levels').patchValue('1')
    expect(component.importForm.get('levels').value).toBe('1')
  });
  it('form:sectors', () => {
    component.importForm.get('sectors').patchValue('1')
    expect(component.importForm.get('sectors').value).toBe('1')
  });
  it('form:specialities', () => {
    component.importForm.get('specialities').patchValue('1')
    expect(component.importForm.get('specialities').value).toBe('1')
  });
  it('form:delimiter', () => {
    expect(component.importForm.get('delimiter').value).toBe(';')
  });
  //dropdown
  it('data school is not empty', () => {
    component.listObjective = [{
      scholar_season_id: [{
        _id: '1'
      },
      {
        _id: '2'
      }]
    }]
    component.importForm.get('scholarSeasons').patchValue('1')
    component.getDataSchool()
    expect(component.school.length).toBe(2)
  });
  it('data school is empty', () => {
    component.importForm.get('scholarSeasons').patchValue('1')
    component.getDataSchool()
    expect(component.school.length).toBe(0)
  });
  it('clear data school', () => {
    component.listObjective = [{
      scholar_season_id: [{
        _id: '1'
      },
      {
        _id: '2'
      }]
    }]
    component.importForm.get('scholarSeasons').patchValue('1')
    component.getDataSchool()
    expect(component.school.length).toBe(2)
    component.clearSchool()
    expect(component.school.length).toBe(0)
  });
  //button
  it('download template with empty form', () => {
    component.csvTypeSelection()
    expect(Swal.getTitle().textContent).toEqual('Invalid_Form_Warning.TITLE')
    Swal.clickConfirm()
  });
  it('import objectives is disabled', () => {
    const button=fixture.debugElement.query(By.css('.import-objectives-testing'))
    expect(button.nativeElement.disabled).toBeTruthy()
  });
  it('import objectives is not disabled', () => {
    const button=fixture.debugElement.query(By.css('.import-objectives-testing'))
    component.importForm.patchValue({
      campuses: ['6166e899fd74d459cd965dcf', '6166e89afd74d459cd965de6'],
      delimiter: ";",
      levels: ['6166e899fd74d459cd965da3'],
      scholarSeasons: "61792005de9a18612a52a5da",
      schools: ['5fe998070719bc42c65d30e4'],
      sectors: ['61892abf67e6e4135fe901b1'],
      specialities: null
    })
    component.templateDonwloaded=true
    component.isWaitingForResponse=false
    fixture.detectChanges()
    expect(button.nativeElement.disabled).toBeFalsy()
  });
  it('submit import invalid', () => {
    component.submitImport()
    expect(Swal.getTitle().textContent).toEqual('Invalid_Form_Warning.TITLE')
    Swal.clickConfirm()
  });
  it('should return swal success when click submit import', () => {
    component.importForm.patchValue({
      campuses: ['6166e899fd74d459cd965dcf', '6166e89afd74d459cd965de6'],
      delimiter: ";",
      levels: ['6166e899fd74d459cd965da3'],
      scholarSeasons: "61792005de9a18612a52a5da",
      schools: ['5fe998070719bc42c65d30e4'],
      sectors: ['61892abf67e6e4135fe901b1'],
      specialities: null
    })
    component.file = new File([''], "name");
    component.submitImport()
    expect(Swal.getTitle().textContent).toEqual('IMPORT_OBJ_S2.Title')
    Swal.clickConfirm()
  });
  it('reset import', () => {
    const candidateService = TestBed.get(CandidatesService)
    spyOn(service,'GetAllScholarSeasonsPublished').and.callThrough()
    spyOn(candidateService,'GetDataForImportObjectives').and.callThrough()
    component.importForm.patchValue({
      campuses: ['6166e899fd74d459cd965dcf', '6166e89afd74d459cd965de6'],
      delimiter: ";",
      levels: ['6166e899fd74d459cd965da3'],
      scholarSeasons: "61792005de9a18612a52a5da",
      schools: ['5fe998070719bc42c65d30e4'],
      sectors: ['61892abf67e6e4135fe901b1'],
      specialities: null
    })
    expect(component.importForm.valid).toBeTruthy()
    component.resetImport()
    expect(component.importForm.valid).toBeFalsy()
    expect(service.GetAllScholarSeasonsPublished).toHaveBeenCalled()
    expect(candidateService.GetDataForImportObjectives).toHaveBeenCalled()
  });

});
class financeServiceStub extends FinancesService {
  GetAllScholarSeasonsPublished(sortValue?, pagination?, filter?): Observable<any[]> {
    return (of([{
      name: 'testing'
    }]))
  }
  GetAllSectorsDropdownWithoutFilter(): Observable<any[]> {
    return (of([]))
  }
}
class candidateServiceStub extends CandidatesService {
  GetDataForImportObjectives(short_name, user_type_id): Observable<any[]> {
    return (of([]))
  }
  ImportGeneralDashboardAdmission(import_general_admission_dashboard_input, file): Observable<any> {
    return (of({}))
  }
}
class AuthServiceStub {
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
class pageTitleServiceStub {
  setTitle(value: string) {
  }

  setIcon(value: string) {
  }
}