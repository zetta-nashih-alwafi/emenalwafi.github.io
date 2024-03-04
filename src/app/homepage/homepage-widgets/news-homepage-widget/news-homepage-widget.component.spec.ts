import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsHomepageWidgetComponent } from './news-homepage-widget.component';

describe('NewsHomepageWidgetComponent', () => {
  let component: NewsHomepageWidgetComponent;
  let fixture: ComponentFixture<NewsHomepageWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsHomepageWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsHomepageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
