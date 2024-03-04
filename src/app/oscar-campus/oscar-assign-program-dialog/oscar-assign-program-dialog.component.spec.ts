import { of, Observable } from 'rxjs';
import { CandidatesService } from './../../service/candidates/candidates.service';
import Swal from 'sweetalert2';
import { AuthService } from './../../service/auth-service/auth.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { OscarAssignProgramDialogComponent } from './oscar-assign-program-dialog.component';

describe('OscarAssignProgramDialogComponent', () => {
  let component: OscarAssignProgramDialogComponent;
  let fixture: ComponentFixture<OscarAssignProgramDialogComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OscarAssignProgramDialogComponent],
      imports: [
        TranslateModule.forRoot(),
        NgxPermissionsModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatDialogModule,
        RouterTestingModule,
        MatAutocompleteModule
      ],

      providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: CandidatesService, useClass: CandidatesServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OscarAssignProgramDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.get(CandidatesService)
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
  it('form:scholar season', () => {
    spyOn(service, 'GetAllSchoolFilter').and.callThrough()
    component.getSchoolDropdown('23213823')
    fixture.detectChanges()
    expect(component.assignProgramForm.get('scholar_season').value).toEqual('23213823')
  });
  it('form:school', () => {
    spyOn(service, 'GetAllCampuses').and.callThrough()
    component.getCampusDropdown('23213823')
    expect(component.assignProgramForm.get('school').value).toEqual('23213823')
  });
  it('form:campus', () => {
    spyOn(service, 'GetAllLevels').and.callThrough()
    component.getLevelDropdown('23213823')
    expect(component.assignProgramForm.get('campus').value).toEqual('23213823')
  });
  it('form:level', () => {
    spyOn(service, 'GetAllSectorsDropdown').and.callThrough()
    component.getSectorDropdown('23213823')
    expect(component.assignProgramForm.get('level').value).toEqual('23213823')
  });
  it('form:sector', () => {
    spyOn(service, 'GetAllSpecializationsByScholar').and.callThrough()
    component.getSpecialityDropdown('23213823')
    expect(component.assignProgramForm.get('sector').value).toEqual('23213823')
  });
  it('form:speciality', () => {
    spyOn(service, 'getAllTypeOfInformationByScholar').and.callThrough()
    component.getTypeFormationDropdown('none')
    expect(component.assignProgramForm.get('speciality').value).toBeNull()
    component.getTypeFormationDropdown('23213823')
    expect(component.assignProgramForm.get('speciality').value).toEqual('23213823')
  });
  it('form:type_of_formation_id', () => {
    spyOn(service, 'getDevMemberDropdown').and.callThrough()
    component.getDevMemberDropdown('none')
    expect(component.assignProgramForm.get('type_of_formation_id').value).toBeNull()
    component.getDevMemberDropdown({
      description: "Formation continue - Contrat pro",
      type_of_formation: "continuous_contract_pro",
      type_of_information: "continuous_contract_pro",
      _id: "627e15c12338f207032ab4cb"
    })
    expect(component.assignProgramForm.get('type_of_formation_id').value).toEqual('627e15c12338f207032ab4cb')
  });
  it('isContinous', () => {
    spyOn(service, 'getDevMemberDropdown').and.callThrough()
    component.getDevMemberDropdown({
      description: "Formation continue - Contrat pro",
      type_of_formation: "continuous_contract_pro",
      type_of_information: "continuous_contract_pro",
      _id: "627e15c12338f207032ab4cb"
    })
    expect(component.isContinous).toBeTruthy()
  });
  it('form:continuous_formation_manager_id', () => {
    component.selectOptionContinousFormationManager({
      _id: "627e15c12338f207032ab4cb",
      civility: 'MR',
      fist_name: 'test',
      last_name: 'test'
    })
    expect(component.assignProgramForm.get('continuous_formation_manager_id').value).toEqual('627e15c12338f207032ab4cb')

  });
  it('filter form:continuous_formation_manager_id', () => {
    component.selectOptionContinousFormationManager({
      _id: "627e15c12338f207032ab4cb",
      civility: 'MR',
      first_name: 'test',
      last_name: 'test'
    })
    expect(component.filterFormCtrl.get('continuous_formation_manager_id').value).toEqual('MR test test')
  });
  it('form:dev_member', () => {
    component.selectDevMember("627e15c12338f207032ab4cb")
    expect(component.assignProgramForm.get('dev_member').value).toEqual('627e15c12338f207032ab4cb')
  });
  it('form invalid', () => {
    spyOn(Swal, 'fire')
    expect(component.assignProgramForm.invalid).toBeTruthy();
    expect(component.filterFormCtrl.invalid).toBeTruthy();
    component.submit()
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'warning',
      title: 'FormSave_S1.TITLE',
      html: 'FormSave_S1.TEXT',
      confirmButtonText: 'FormSave_S1.BUTTON',
    })
  });
  it('form valid and submit success', ((done) => {
    // spyOn(Swal,"fire")
    spyOn(service, 'AssignProgramToCandidate').and.callThrough()
    component.filterFormCtrl.setValue({
      scholarSeason: 'test',
      school: 'test',
      campus: 'test',
      level: 'test',
      sector: 'test',
      type_of_formation_id: '123',
      speciality: 'test',
      continuous_formation_manager_id: '123',
      devMember: 'test',
    })
    component.assignProgramForm.setValue({
      campus: "6166e899fd74d459cd965db9",
      continuous_formation_manager_id: "62862a2e0074823cdafe8a0c",
      dev_member: "619bbe037a26c8320c200c7d",
      level: "61aa4d3de682877d6381745b",
      scholar_season: "61792005de9a18612a52a5da",
      school: "6185229a8f64393a46e71103",
      sector: "61aa4d69e682877d638174d5",
      type_of_formation_id: "627e15c12338f207032ab4cb",
      speciality: 'test'
    })
    component.candidateId = [{
      _id: '1',
      first_name: 'A',
      last_name: 'B'
    }]
    fixture.detectChanges()
    expect(component.filterFormCtrl.valid).toBeTruthy();
    component.submit()
    expect(Swal.isVisible()).toBeTruthy();
    expect(Swal.getTitle().textContent).toEqual('Oscar_S1.Title')
    Swal.clickConfirm();
    setTimeout(() => {
      expect(Swal.isVisible()).toBeTruthy();
      expect(Swal.getTitle().textContent).toEqual('Bravo!')
      Swal.close()
      expect(service.AssignProgramToCandidate).toHaveBeenCalled()
      done()
    },10);
  }));
  it('should close dialog', () => {
    spyOn(component.dialogRef, 'close');
    component.closeDialog();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});
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
class CandidatesServiceStub extends CandidatesService {
  GetAllSchoolFilter(scholar_season_id, filter, user_type_id): Observable<any[]> {
    return of([])
  }
  GetAllCampuses(filter): Observable<any[]> {
    return of([])
  }
  GetAllLevels(filter): Observable<any[]> {
    return of([])
  }
  GetAllSectorsDropdown(filter): Observable<any[]> {
    return of([])
  }
  GetAllSpecializationsByScholar(filter): Observable<any[]> {
    return of([])
  }
  getAllTypeOfInformationByScholar(scholar_season_id): Observable<any[]> {
    return of([])
  }
  getDevMemberDropdown(candidate_campus, candidate_school, candidate_level): Observable<any[]> {
    return of([])
  }
  AssignProgramToCandidate(select_all, assign_program_to_candidate_input, filter?, searching?, candidate_ids?): Observable<any> {
    return of({})
  }

}