import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditJuryDecisionDialogComponent } from './edit-jury-decision-dialog.component';

describe('EditJuryDecisionDialogComponent', () => {
  let component: EditJuryDecisionDialogComponent;
  let fixture: ComponentFixture<EditJuryDecisionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditJuryDecisionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditJuryDecisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
