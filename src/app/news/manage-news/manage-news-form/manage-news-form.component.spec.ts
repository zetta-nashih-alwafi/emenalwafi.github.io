import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNewsFormComponent } from './manage-news-form.component';

describe('ManageNewsFormComponent', () => {
  let component: ManageNewsFormComponent;
  let fixture: ComponentFixture<ManageNewsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNewsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNewsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
