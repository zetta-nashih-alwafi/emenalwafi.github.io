import { Observable, of } from 'rxjs';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import Swal from 'sweetalert2';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ImportObjectiveDialogComponent } from './import-objective-dialog.component';

describe('ImportObjectiveDialogComponent', () => {
  let component: ImportObjectiveDialogComponent;
  let fixture: ComponentFixture<ImportObjectiveDialogComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportObjectiveDialogComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatDatepickerModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatMomentDateModule
      ],

      providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: CandidatesService, useClass: candidateServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportObjectiveDialogComponent);
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
  it('invalid form', () => {
    expect(component.importForm.invalid).toBeTruthy()
    component.downloadFile()
    Swal.clickConfirm()
    expect(Swal.getTitle().textContent).toEqual('Invalid_Form_Warning.TITLE')
  });
  it('form valid', () => {
    const date = new Date('2022-05-24');
    component.importForm.patchValue({
      opening: new Date('2022-05-24'),
      closing: new Date('2022-05-25')
    })
    expect(component.importForm.valid).toBeTruthy()
  });
  it('import objective validate', (done) => {
    spyOn(service, 'GetFirstDateOfRegisteredCandidate').and.callThrough()
    component.importForm.patchValue({
      opening: new Date('2022-05-24'),
      closing: new Date('2022-05-25')
    })
    component.data = {
      scholarSeasons: null,
      campuses: ['6166e899fd74d459cd965dab'],
      levels: ['6166e899fd74d459cd965da5'],
      schools: ['5fe998070719bc42c65d30e4'],
      specialities: null,
      sectors: ['61892abf67e6e4135fe901b1']
    }
    fixture.detectChanges()
    component.downloadFile()
    expect(component.isWaitingForResponse).toBeTruthy()
    expect(service.GetFirstDateOfRegisteredCandidate).toHaveBeenCalled()
    expect(Swal.isVisible()).toBeTruthy();
    expect(Swal.getTitle().textContent).toEqual('IMPORT_OBJ_S4.Title');
    spyOn(service,'downloadTemplateCSV').and.callThrough()
    Swal.clickConfirm();
    setTimeout(() => {
      expect(component.isWaitingForResponse).toBeFalsy()
      done();
    });
  });
  it('should close dialog', () => {
    spyOn(component.dialogRef, 'close');
    component.closeDialog();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});

class candidateServiceStub extends CandidatesService {
  GetFirstDateOfRegisteredCandidate(
    scholar_season_id,
    school_ids,
    campus_ids,
    level_ids,
    sector_ids,
    speciality_ids,
    start_date,
  ): Observable<any> {
    return (of({
      name: 'testing'
    }))
  }
  downloadTemplateCSV(openingDate, closingDate, delimiter, scholarSeasons, schools, campuses, levels, sectors, specialities) {
  }
}
