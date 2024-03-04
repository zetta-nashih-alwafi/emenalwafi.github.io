import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseHomepageWidgetComponent } from './base-homepage-widget.component';

describe('BaseHomepageWidgetComponent', () => {
  let component: BaseHomepageWidgetComponent;
  let fixture: ComponentFixture<BaseHomepageWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseHomepageWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseHomepageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
