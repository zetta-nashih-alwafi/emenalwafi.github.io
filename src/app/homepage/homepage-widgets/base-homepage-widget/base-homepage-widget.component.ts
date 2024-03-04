import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { THomePageWidget } from 'app/homepage/homepage.declaration';
import { HomepageService } from 'app/homepage/homepage.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ms-base-homepage-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
  templateUrl: './base-homepage-widget.component.html',
  styleUrls: ['./base-homepage-widget.component.scss'],
})
export class BaseHomepageWidgetComponent implements OnInit {
  private _homepageService = inject(HomepageService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  @Input() widget: THomePageWidget;

  get widgetLocalizationKey() {
    return `WIDGET_NAME.${this.widget.widget_name}`;
  }

  constructor() {}

  ngOnInit(): void {}

  toggleSize() {
    this.widget.size = this.widget.size === 'full' ? 'half' : 'full';
    this._homepageService.triggerWidgetUpdateManually();
  }

  viewMoreResult() {
    if (this.widget.widget_name === 'email') {
      this._router.navigate(['/mailbox/inbox']);
    } else if (this.widget.widget_name === 'pending_task') {
      this._router.navigate(['/task'], { relativeTo: this._route });
    } else if (this.widget.widget_name === 'overdue_task') {
      this._router.navigate(['/task'], { relativeTo: this._route });
    } else if (this.widget.widget_name === 'news') {
      this._router.navigate(['/news/all-news'], { relativeTo: this._route })
    }
  }

  remove() {
    this._homepageService.removeWidget(this.widget.widget_name);
    this._homepageService.triggerWidgetUpdateManually();
  }
}
