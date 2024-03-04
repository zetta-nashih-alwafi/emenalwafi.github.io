import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssignTeacherDialogComponent } from './add-assign-teacher-dialog.component';

describe('AddAssignTeacherDialogComponent', () => {
  let component: AddAssignTeacherDialogComponent;
  let fixture: ComponentFixture<AddAssignTeacherDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAssignTeacherDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAssignTeacherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
