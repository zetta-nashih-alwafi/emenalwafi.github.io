import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailValidatorReadmissionDialogComponent } from './mail-validator-readmission-dialog.component';

describe('MailValidatorReadmissionDialogComponent', () => {
  let component: MailValidatorReadmissionDialogComponent;
  let fixture: ComponentFixture<MailValidatorReadmissionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailValidatorReadmissionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailValidatorReadmissionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
