import Swal from 'sweetalert2';
import { FinancesService } from 'app/service/finance/finance.service';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSliderModule } from '@angular/material/slider';
import { Observable, of } from 'rxjs';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { AddTimelineTemplateDialogComponent } from './add-timeline-template-dialog.component';

describe('AddTimelineTemplateDialogComponent', () => {
  let component: AddTimelineTemplateDialogComponent;
  let fixture: ComponentFixture<AddTimelineTemplateDialogComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddTimelineTemplateDialogComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatDatepickerModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatSliderModule,
        MatMomentDateModule
      ],

      providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AcademicJourneyService, useClass: AcademicJourneyServiceStub },
        { provide: FinancesService, useClass: FinanceServiceStub },

      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTimelineTemplateDialogComponent);
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
  it('form:template name', () => {
    component.addTimelineForm.get('template_name').patchValue('test')
    expect(component.addTimelineForm.get('template_name').value).toBe('test')
  });
  it('form:description', () => {
    component.addTimelineForm.get('description').patchValue('test')
    expect(component.addTimelineForm.get('description').value).toBe('test')
  });
  it('form:terms', () => {
    expect(component.addTimelineForm.get('terms').value).toBe(1)
  });
  it('form:percentage_by_term', () => {
    expect(component.addTimelineForm.get('percentage_by_term').get('0').get('percentage').value).toBe(100)
  });
  it('form:submit invalid', () => {
    spyOn(service,'CreateTimelineTemplate').and.callThrough()
    component.heandleSubmit()
    expect(Swal.getTitle().textContent).toEqual('FormSave_S1.TITLE')
    Swal.clickConfirm()
  });
  it('form:submit', () => {
    spyOn(service,'CreateTimelineTemplate').and.callThrough()
    component.addTimelineForm.patchValue({
      template_name:'test',
      description:'test'
    })
    component.heandleSubmit()
    expect(Swal.getTitle().textContent).toEqual('Bravo!')
    Swal.clickConfirm()
  });
});
class AcademicJourneyServiceStub extends AcademicJourneyService {
  getCurrency(): Observable<any[]> {
    return of([])
  }
}
class FinanceServiceStub extends FinancesService {
  CreateTimelineTemplate(timeline_template_input): Observable<any>{
    return of([])
  }
}

