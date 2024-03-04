import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFinancementTabDetailComponent } from './student-financement-tab-detail.component';

describe('StudentFinancementTabDetailComponent', () => {
  let component: StudentFinancementTabDetailComponent;
  let fixture: ComponentFixture<StudentFinancementTabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentFinancementTabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentFinancementTabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
