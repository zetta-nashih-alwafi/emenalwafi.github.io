import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssingStartingDateDialogComponent } from './assign-starting-date-dialog.component';

describe('AssingStartingDateDialogComponent', () => {
  let component: AssingStartingDateDialogComponent;
  let fixture: ComponentFixture<AssingStartingDateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssingStartingDateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssingStartingDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
