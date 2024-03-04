import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProgramDesiredDialogComponent } from './edit-program-desired-dialog.component';

describe('EditProgramDesiredDialogComponent', () => {
  let component: EditProgramDesiredDialogComponent;
  let fixture: ComponentFixture<EditProgramDesiredDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProgramDesiredDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProgramDesiredDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
