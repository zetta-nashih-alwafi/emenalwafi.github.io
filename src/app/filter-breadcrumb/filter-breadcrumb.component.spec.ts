import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBreadcrumbComponent } from './filter-breadcrumb.component';

describe('FilterBreadcrumbComponent', () => {
  let component: FilterBreadcrumbComponent;
  let fixture: ComponentFixture<FilterBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterBreadcrumbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
