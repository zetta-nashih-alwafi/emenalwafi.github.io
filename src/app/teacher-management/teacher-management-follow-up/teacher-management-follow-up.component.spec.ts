import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherManagementFollowUpComponent } from './teacher-management-follow-up.component';

describe('TeacherManagementFollowUpComponent', () => {
  let component: TeacherManagementFollowUpComponent;
  let fixture: ComponentFixture<TeacherManagementFollowUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherManagementFollowUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherManagementFollowUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
