import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpReadmissionComponent } from './follow-up-readmission.component';

describe('FollowUpReadmissionComponent', () => {
  let component: FollowUpReadmissionComponent;
  let fixture: ComponentFixture<FollowUpReadmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowUpReadmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowUpReadmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
