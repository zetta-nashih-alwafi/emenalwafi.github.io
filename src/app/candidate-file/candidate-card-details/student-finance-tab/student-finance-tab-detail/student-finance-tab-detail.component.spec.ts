import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFinanceTabDetailComponent } from './student-finance-tab-detail.component';

describe('StudentFinanceTabDetailComponent', () => {
  let component: StudentFinanceTabDetailComponent;
  let fixture: ComponentFixture<StudentFinanceTabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentFinanceTabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentFinanceTabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
