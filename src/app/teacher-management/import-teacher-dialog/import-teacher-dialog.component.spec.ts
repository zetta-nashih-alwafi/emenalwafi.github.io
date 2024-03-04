import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTeacherDialogComponent } from './import-teacher-dialog.component';

describe('ImportTeacherDialogComponent', () => {
  let component: ImportTeacherDialogComponent;
  let fixture: ComponentFixture<ImportTeacherDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportTeacherDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportTeacherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
