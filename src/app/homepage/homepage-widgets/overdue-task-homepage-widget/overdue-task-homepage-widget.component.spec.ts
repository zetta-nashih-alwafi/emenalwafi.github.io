import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueTaskHomepageWidgetComponent } from './overdue-task-homepage-widget.component';

describe('OverdueTaskHomepageWidgetComponent', () => {
  let component: OverdueTaskHomepageWidgetComponent;
  let fixture: ComponentFixture<OverdueTaskHomepageWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverdueTaskHomepageWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverdueTaskHomepageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
