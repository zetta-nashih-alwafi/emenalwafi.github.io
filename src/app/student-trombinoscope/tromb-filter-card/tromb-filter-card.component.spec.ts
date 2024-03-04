import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrombFilterCardComponent } from './tromb-filter-card.component';

describe('TrombFilterCardComponent', () => {
  let component: TrombFilterCardComponent;
  let fixture: ComponentFixture<TrombFilterCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrombFilterCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrombFilterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
