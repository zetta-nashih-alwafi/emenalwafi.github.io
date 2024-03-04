import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentConventionTabDetailComponent } from './student-convention-tab-detail.component';

describe('StudentFinancementTabDetailComponent', () => {
  let component: StudentConventionTabDetailComponent;
  let fixture: ComponentFixture<StudentConventionTabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudentConventionTabDetailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentConventionTabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
