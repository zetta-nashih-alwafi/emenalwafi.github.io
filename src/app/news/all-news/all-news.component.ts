import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { NewsService } from 'app/news/news.service';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { MatPaginator } from '@angular/material/paginator';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-all-news',
  templateUrl: './all-news.component.html',
  styleUrls: ['./all-news.component.scss'],
  providers: [ParseUtcToLocalPipe]
})
export class AllNewsComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private translate: TranslateService,
    private apollo:Apollo,
    private newsService:NewsService,
    private route:ActivatedRoute,
    private pageTitleService: PageTitleService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe
  ) { }

  _id:any;
  noData: any;
  currentId;
  selectedID;
  dataAllNews;
  dataCount = 0;
  _idParams:any;
  selectedIndex:number | null = 0;
  datePipe;

  isFrance:Boolean = false;
  isWaitingForResponse: Boolean = false;

  ngOnInit(): void {
    this.pageTitleService.setTitle('All News');
    this.currentLang === 'en' ? this.isFrance = false : this.isFrance = true;
    this.getDataFromGraph();

    // checking when there's params id
    this.subs.sink = this.route.queryParams.subscribe((dataIdOptional) => {
      this._idParams = dataIdOptional['id'];

      if(this._idParams) {
        this._id = this._idParams;
      }

    })

    this.subs.sink = this.translate.onLangChange.subscribe((date) => {
      this.checkLang();
      
      this.currentLang === 'en' ? this.isFrance = false : this.isFrance = true;
      // this.getDataFromGraph();
        if(this.dataAllNews) {
          this.dataAllNews.forEach((el) => {
            el.published_date.date = this.getTranslatedDate(el?.published_date?.date)
          });
        }
    })
  }

  get currentLang(): string {
    return this.translate.currentLang.toLowerCase();
  }

  checkLang() {
    this.subs.sink = this.translate.onLangChange.subscribe((date) => {
      if ( date?.lang === 'fr') {
        this.isFrance = true;
      } else {
        this.isFrance = false;
      }
    })
  }


  // AfterViewInit
  ngAfterViewInit() {
    this.subs.sink = this.paginator?.page
      .pipe(
        startWith(null),
        tap(() => {
            this.currentId = this._id;
            this.getDataFromGraph();
        }),
      )
      .subscribe();
  }

  getDataFromGraph() {
    const pagination = {
      limit: this.paginator?.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator?.pageIndex ? this.paginator.pageIndex : 0,
    }

    const filter = {
      is_published: true
    }

    filter['offset'] = moment().utcOffset();
    this.isWaitingForResponse = true;

    const sort = {
      published_date: 'desc'
    }

    this.subs.sink = this.newsService.getAllNews(pagination, filter, sort)
    .subscribe((dataAllNews) => {
      this.isWaitingForResponse = false;
      this.dataAllNews = _.cloneDeep(dataAllNews);
      if(!this.currentId) {
        this._id = this._idParams ? this._idParams : dataAllNews[0]?._id;
      } else {
        this._id = this.currentId;
      }

      this.dataCount = dataAllNews[0]?.count_document;
      if(dataAllNews) {
        this.dataAllNews.forEach((el) => {
          el.published_date.date = this.parseUTCToLocalPipe.transformDate(el?.published_date?.date, el?.published_date?.time)
          el.published_date.date = moment(el.published_date.date, "DD/MM/YYYY").format("MMM DD, YYYY")
          el.published_date.time = this.parseUTCToLocalPipe.transform(el?.published_date?.time);
          el.published_date.date = this.getTranslatedDate(el?.published_date?.date); 
        })
        

        if(this._idParams) {
            const index = this.dataAllNews.findIndex((el) => el._id === this._idParams);
            this.selectedIndex = index;
        }
      }
    })
  }

  onNewsClick(index:any) {
    this._id = this.dataAllNews[index]._id;
    this.selectedIndex = index;
  }

  getTranslatedDate(dateRaw) {
    if (dateRaw) {
      this.datePipe = new DatePipe(this.translate?.currentLang);
      if (this.datePipe && this.datePipe['locale']) {
        const dateTranslate = this.isFrance ? this.datePipe?.transform(dateRaw, 'MMM d y') : this.datePipe?.transform(dateRaw, 'MMM, d y');
        return dateTranslate;
      }
      return '';
    }
    return '';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

}
