import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTypeInterventionTeacherDialogComponent } from './add-type-intervention-teacher-dialog.component';

describe('AddTypeInterventionTeacherDialogComponent', () => {
  let component: AddTypeInterventionTeacherDialogComponent;
  let fixture: ComponentFixture<AddTypeInterventionTeacherDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTypeInterventionTeacherDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTypeInterventionTeacherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
