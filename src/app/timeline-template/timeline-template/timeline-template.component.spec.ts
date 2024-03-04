import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { of, Observable } from 'rxjs';
import { FinancesService } from 'app/service/finance/finance.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TimelineTemplateComponent } from './timeline-template.component';

describe('TimelineTemplateComponent', () => {
  let component: TimelineTemplateComponent;
  let fixture: ComponentFixture<TimelineTemplateComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineTemplateComponent],
      imports: [
        MatTableModule,
        TranslateModule.forRoot(),
        MatTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatDialogModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatPaginatorModule,
        MatSortModule,
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: FinancesService, useClass: FinanceServiceStub
        },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineTemplateComponent);
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
  it('table data should be empty', (() => {
    expect(component.dataSource.data.length).toEqual(0)
  }));
  it('table data should not be empty', (() => {
    spyOn(service, 'getAllTimelineTemplate').and.returnValue(of([{
      _id:'1',
      count_document:1
    }]))
    component.getTimelineTable()
    expect(component.dataSource.data.length).toEqual(1)
  }));
  it('sort table:name', () => {
    spyOn(service, 'getAllTimelineTemplate').and.callThrough()
    expect(component.sortValue).toBeNull()
    component.isLoading=false
    component.sort.sortChange.emit({ active: 'template_name', direction: 'desc' })
    expect(component.sortValue).toEqual({ template_name: 'desc' })
    expect(service.getAllTimelineTemplate).toHaveBeenCalled()
  });
  it('filter table : name', (() => {
    spyOn(service, 'getAllTimelineTemplate').and.callThrough()
    // component.sourceFilterCtrl.patchValue("oscar")
    component.templateNameSelected('oscar')
    expect(component.filteredValues.template_name).toBe('oscar')
    expect(service.getAllTimelineTemplate).toHaveBeenCalled()
  }))
  it('reset', (() => {
    spyOn(service, 'getAllTimelineTemplate').and.callThrough()
    component.templateNameSelected('oscar')
    expect(component.filteredValues.template_name).toBe('oscar')
    component.resetFilter()
    expect(component.filteredValues.template_name).toBeNull()
    expect(service.getAllTimelineTemplate).toHaveBeenCalled()
  }))
});
class FinanceServiceStub extends FinancesService {
  getAllTimelineName(filter = { template_name: '' }): Observable<any[]> {
    return (of([]))
  }
  getAllTimelineTemplate(filter, sorting, pagination): Observable<any> {
    return (of({}))
  }
}
