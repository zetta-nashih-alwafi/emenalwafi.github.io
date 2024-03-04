import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTrombinoscopeParentComponent } from './student-trombinoscope-parent.component';

describe('StudentTrombinoscopeParentComponent', () => {
  let component: StudentTrombinoscopeParentComponent;
  let fixture: ComponentFixture<StudentTrombinoscopeParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentTrombinoscopeParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentTrombinoscopeParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
