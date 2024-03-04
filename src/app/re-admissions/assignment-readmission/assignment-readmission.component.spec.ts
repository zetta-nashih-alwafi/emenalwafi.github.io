import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentReadmissionComponent } from './assignment-readmission.component';

describe('AssignmentReadmissionComponent', () => {
  let component: AssignmentReadmissionComponent;
  let fixture: ComponentFixture<AssignmentReadmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentReadmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentReadmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
