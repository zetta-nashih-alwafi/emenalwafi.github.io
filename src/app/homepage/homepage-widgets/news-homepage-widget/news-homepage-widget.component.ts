import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { NewsService } from 'app/news/news.service';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from 'app/shared/shared.module';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-news-homepage-widget',
  templateUrl: './news-homepage-widget.component.html',
  styleUrls: ['./news-homepage-widget.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule],
  providers: [ParseUtcToLocalPipe]
})
export class NewsHomepageWidgetComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  constructor(
    private newsService:NewsService,
    private apollo:Apollo,
    private router:Router,
    private translate:TranslateService,
    private crd:ChangeDetectorRef,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe
  ) { }

  dataAllNews:any;
  datePipe;

  isWaitingForResponse:Boolean = false;

  ngOnInit(): void {
    this.getDataFromGraph();

    this.subs.sink = this.translate.onLangChange.subscribe((date) => {
      if(this.dataAllNews?.length) {
        this.dataAllNews.map((el:any)=> {
            return el.published_date.date = this.getTranslatedDate(el?.published_date?.date);
        })
      }
    })
  }

  getDataFromGraph() {
    const pagination = {
      limit: 5,
      page: 0
    }

    const filter = {
      is_published: true
    }

    filter['offset'] = moment().utcOffset();

    const sort = {
      published_date: 'desc'
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.newsService.getAllNews(pagination, filter, sort)
    .subscribe((dataAllNews) => {
      this.isWaitingForResponse = false;
      this.dataAllNews = _.cloneDeep(dataAllNews);
      if(dataAllNews) {
        this.dataAllNews.forEach((el) => {
          const parsedDate = moment(el?.published_date?.date, "DD/MM/YYYY");
          const formattedDate = parsedDate.format("MMMM, DD YYYY");
          el.published_date.time = this.parseUTCToLocalPipe.transform(el.published_date?.time);
          el.published_date.date = this.getTranslatedDate(formattedDate);
        })

      }
    })
  }

  getTranslatedDate(dateRaw) {
    if (dateRaw) {
      this.datePipe = new DatePipe(this.translate.currentLang);
      if (this.datePipe && this.datePipe['locale']) {
        const dateTranslate = this.datePipe.transform(dateRaw, 'MMMM, d y');
        return dateTranslate;
      }
      return '';
    }
    return '';
  }

  openNews(id:any) {
    const queryParams = {
      queryParams: { id: id }
    };
    this.router.navigate(['news/all-news'], queryParams);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
