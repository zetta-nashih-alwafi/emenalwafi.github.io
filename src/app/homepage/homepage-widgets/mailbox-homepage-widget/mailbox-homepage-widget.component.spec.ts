import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailboxHomepageWidgetComponent } from './mailbox-homepage-widget.component';

describe('MailboxHomepageWidgetComponent', () => {
  let component: MailboxHomepageWidgetComponent;
  let fixture: ComponentFixture<MailboxHomepageWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailboxHomepageWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MailboxHomepageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
