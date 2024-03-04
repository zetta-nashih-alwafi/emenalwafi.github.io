import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllNewsDetailComponent } from './all-news-detail.component';

describe('AllNewsDetailComponent', () => {
  let component: AllNewsDetailComponent;
  let fixture: ComponentFixture<AllNewsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllNewsDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllNewsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
