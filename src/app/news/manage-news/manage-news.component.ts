import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { NewsService } from '../news.service';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-manage-news',
  templateUrl: './manage-news.component.html',
  styleUrls: ['./manage-news.component.scss'],
})
export class ManageNewsComponent implements OnInit, OnDestroy {
  isNewNews: boolean = false;
  resetForm: any;
  isAbleToLeave: boolean = true;
  private subs = new SubSink();

  constructor(private pageTitleService: PageTitleService, private translate: TranslateService, private _newsService: NewsService) {}

  ngOnInit(): void {
    this.pageTitleService.setTitle('Manage News');

    this.subs.sink = this._newsService.comparisonForm$.subscribe((data) => {
      this.isAbleToLeave = data;
    });
  }

  onResetForm(event) {
    this.resetForm = event;
  }

  onAddNews(isNewsAdded: boolean) {
    this.isNewNews = isNewsAdded;
  }

  // *************** Validation Can Deactivated Guard
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    let validation: Boolean;
    validation = false;
    if (!this.isAbleToLeave) {
      validation = true;
    }
    if (validation) {
      return new Promise((resolve, reject) => {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('TMTC_S01.TITLE'),
          text: this.translate.instant('TMTC_S01.TEXT'),
          confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
          showCancelButton: true,
          cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.value) {
            resolve(false);
          } else {
            this._newsService.setComparisonForm(true);
            resolve(true);
          }
        });
      });
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    this.pageTitleService.setTitle(null);
  }
}
