import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrombinoscopePdfDialogComponent } from './trombinoscope-pdf-dialog.component';

describe('TrombinoscopePdfDialogComponent', () => {
  let component: TrombinoscopePdfDialogComponent;
  let fixture: ComponentFixture<TrombinoscopePdfDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrombinoscopePdfDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrombinoscopePdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
