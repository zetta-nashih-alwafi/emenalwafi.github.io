import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpRegulationDialogComponent } from './dp-regulation-dialog.component';

describe('DpRegulationDialogComponent', () => {
  let component: DpRegulationDialogComponent;
  let fixture: ComponentFixture<DpRegulationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DpRegulationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DpRegulationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
