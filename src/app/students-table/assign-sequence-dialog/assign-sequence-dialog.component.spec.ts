import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSequenceDialogComponent } from './assign-sequence-dialog.component';

describe('AssignSequenceDialogComponent', () => {
  let component: AssignSequenceDialogComponent;
  let fixture: ComponentFixture<AssignSequenceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignSequenceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignSequenceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
