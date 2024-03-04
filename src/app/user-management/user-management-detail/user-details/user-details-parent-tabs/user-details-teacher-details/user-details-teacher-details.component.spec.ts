import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsTeacherDetailsComponent } from './user-details-teacher-details.component';

describe('UserDetailsTeacherDetailsComponent', () => {
  let component: UserDetailsTeacherDetailsComponent;
  let fixture: ComponentFixture<UserDetailsTeacherDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDetailsTeacherDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsTeacherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
