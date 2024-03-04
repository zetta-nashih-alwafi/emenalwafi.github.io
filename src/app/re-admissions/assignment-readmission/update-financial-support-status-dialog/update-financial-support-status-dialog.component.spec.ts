import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFinancialSupportStatusDialogComponent } from './update-financial-support-status-dialog.component';

describe('UpdateFinancialSupportStatusDialogComponent', () => {
  let component: UpdateFinancialSupportStatusDialogComponent;
  let fixture: ComponentFixture<UpdateFinancialSupportStatusDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateFinancialSupportStatusDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFinancialSupportStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
