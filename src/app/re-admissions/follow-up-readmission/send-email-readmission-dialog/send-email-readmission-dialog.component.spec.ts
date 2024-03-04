import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailReadmissionDialogComponent } from './send-email-readmission-dialog.component';

describe('SendEmailReadmissionDialogComponent', () => {
  let component: SendEmailReadmissionDialogComponent;
  let fixture: ComponentFixture<SendEmailReadmissionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendEmailReadmissionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailReadmissionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
