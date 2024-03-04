import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDocumentTabComponent } from './teacher-document-tab.component';

describe('TeacherDocumentTabComponent', () => {
  let component: TeacherDocumentTabComponent;
  let fixture: ComponentFixture<TeacherDocumentTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherDocumentTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherDocumentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
