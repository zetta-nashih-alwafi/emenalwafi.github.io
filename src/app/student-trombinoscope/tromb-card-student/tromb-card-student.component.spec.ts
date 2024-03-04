import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrombCardStudentComponent } from './tromb-card-student.component';

describe('TrombCardStudentComponent', () => {
  let component: TrombCardStudentComponent;
  let fixture: ComponentFixture<TrombCardStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrombCardStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrombCardStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
