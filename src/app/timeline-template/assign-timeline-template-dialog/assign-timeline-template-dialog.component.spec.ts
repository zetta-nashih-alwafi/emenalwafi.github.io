import { NgSelectModule } from '@ng-select/ng-select';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { FinancesService } from 'app/service/finance/finance.service';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSliderModule } from '@angular/material/slider';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssignTimelineTemplateDialogComponent } from './assign-timeline-template-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AssignTimelineTemplateDialogComponent', () => {
  let component: AssignTimelineTemplateDialogComponent;
  let fixture: ComponentFixture<AssignTimelineTemplateDialogComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignTimelineTemplateDialogComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatDatepickerModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatSliderModule,
        MatMomentDateModule,
        NgSelectModule
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
    fixture = TestBed.createComponent(AssignTimelineTemplateDialogComponent);
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
  it('form:template id', () => {
    component.assignTimelineForm.get('template_id').patchValue('1')
    expect(component.assignTimelineForm.get('template_id').value).toBe('1')
  });
  it('form:description', () => {
    component.assignTimelineForm.get('description').patchValue('test')
    expect(component.assignTimelineForm.get('description').value).toBe('test')
  });
  it('form:terms', () => {
    expect(component.assignTimelineForm.get('terms').value).toBe(0)
  });
  it('form:percentage_by_term', () => {
    expect(component.assignTimelineForm.get('percentage_by_term').get('0').get('percentage').value).toBe(100)
    const date = new Date('30-09-2022')
    component.assignTimelineForm.get('percentage_by_term').get('0').get('date').patchValue(date)
    expect(component.assignTimelineForm.get('percentage_by_term').get('0').get('date').value).toEqual(date)
    expect(component.assignTimelineForm.get('percentage_by_term').get('0').get('amount').value).toBeNull()
    component.assignTimelineForm.get('percentage_by_term').get('0').get('amount').patchValue('10')
    expect(component.assignTimelineForm.get('percentage_by_term').get('0').get('amount').value).toBe('10')
  });
  it('should populate form after select timeline template', () => {
    spyOn(service, 'getOneTimelineTemplate').and.callThrough()
    const data = {
      template_name: "3 écheances",
      _id: "6253e42925b9e8659574d175"
    }
    expect(component.showDetailTimeline).toBeFalsy()
    expect(component.payment.value.length).toBe(1)
    component.populateAssignDialog(data)
    expect(service.getOneTimelineTemplate).toHaveBeenCalled()
    expect(component.showDetailTimeline).toBeTruthy()
    expect(component.payment.value.length).toBe(3)
    expect(component.assignTimelineForm.get('template_id').value).toBe('6253e42925b9e8659574d175')
  });
  it('submit invalid', () => {
    component.handleSubmit()
    expect(Swal.getTitle().textContent).toEqual('FormSave_S1.TITLE')
    Swal.clickConfirm()
  });
  it('submit', () => {
    spyOn(service, 'assignTimelineTemplateData').and.callThrough()
    component.assignTimelineForm.patchValue({
      template_id: '1',
      description: 'test'
    })
    component.handleSubmit()
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
  assignTimelineTemplateData(term_times, terms, select_all, filter, search, finance_organization_ids): Observable<any> {
    return (of({}))
  }
  getAllTimelineName(filter = { template_name: '' }): Observable<any[]> {
    return (of([]))
  }
  getOneTimelineTemplate(id): Observable<any> {
    return of({
      count_document: null,
      description: null,
      percentage_by_term: [
        { date: 'Thu Dec 01 2022 00:00:00 GMT+0700 (Western Indonesia Time)', percentage: 33 },
        { date: 'Wed Mar 01 2023 00:00:00 GMT+0700 (Western Indonesia Time)', percentage: 33 },
        { date: 'Thu Jun 01 2023 00:00:00 GMT+0700 (Western Indonesia Time)', percentage: 34 },

      ],
      status: "active",
      template_name: "3 écheances",
      terms: 3,
      _id: "6253e42925b9e8659574d175"
    })
  }
}
