import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNewsTableComponent } from './manage-news-table.component';

describe('ManageNewsTableComponent', () => {
  let component: ManageNewsTableComponent;
  let fixture: ComponentFixture<ManageNewsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNewsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNewsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
