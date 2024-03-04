import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTaskHomepageWidgetComponent } from './pending-task-homepage-widget.component';

describe('PendingTaskHomepageWidgetComponent', () => {
  let component: PendingTaskHomepageWidgetComponent;
  let fixture: ComponentFixture<PendingTaskHomepageWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingTaskHomepageWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingTaskHomepageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
