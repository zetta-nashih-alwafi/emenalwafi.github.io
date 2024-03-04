import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherManagementAssignTableComponent } from './teacher-management-assign-table.component';

describe('TeacherManagementAssignTableComponent', () => {
  let component: TeacherManagementAssignTableComponent;
  let fixture: ComponentFixture<TeacherManagementAssignTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherManagementAssignTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherManagementAssignTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
