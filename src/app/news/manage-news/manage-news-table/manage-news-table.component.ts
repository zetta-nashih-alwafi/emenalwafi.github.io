import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { NewsService } from 'app/news/news.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-manage-news-table',
  templateUrl: './manage-news-table.component.html',
  styleUrls: ['./manage-news-table.component.scss'],
})
export class ManageNewsTableComponent implements OnInit, OnDestroy {
  @Output() addNewNews: EventEmitter<boolean> = new EventEmitter();
  @Output() editNewsId: EventEmitter<any> = new EventEmitter();

  @Input() tableData: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource = new MatTableDataSource([]);
  isWaitingForResponse: boolean = false;
  noData: any;
  private subs = new SubSink();
  sortValue = null;
  filteredValues = {
    title: null,
    created_by: null,
    is_published: null,
  };
  dataCount: number;

  displayedColumns: string[] = ['newsTitle', 'createdBy', 'status', 'action'];
  filterColumns: string[] = ['newsTitleFilter', 'createdByFilter', 'statusFilter', 'actionFilter'];

  dataLoaded: Boolean = false;

  statusList: any[] = [
    {
      is_published: true,
      statusKey: 'FORM_BUILDER.Published',
    },
    {
      is_published: false,
      statusKey: 'FORM_BUILDER.Not Published',
    },
  ];

  newsTitleFilter = new UntypedFormControl(null);
  createdByFilter = new UntypedFormControl(null);
  statusFilter = new UntypedFormControl('All');
  isPublishedForm = new UntypedFormControl(null);

  isReset: boolean = false;
  openAddNews: boolean = false;
  isFormSame = true;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  newNewsItem: any;

  constructor(private _newsService: NewsService, private _translate: TranslateService) {}

  ngOnInit(): void {
    this.getAllNews();
    this.initFilter();

    this.subs.sink = this._newsService.userNewsDataConfig$.subscribe((resp) => {
      // Update data
      this.resetFilter();
      this.openAddNews = false;
    });

    this.subs.sink = this._newsService.userNewsConfig$.subscribe((data: any) => {
      if (this.openAddNews) {
        this.tableData[0] = {
          _id: data?._id,
          title: data?.title,
          description: '',
          created_by: {
            first_name: '',
            last_name: '',
            civility: '',
          },
          is_published: data?.is_published ? data?.is_published : null,
        };
        this.dataSource.data = this.tableData;
      } else {
        if (this.tableData && this.tableData?.length && !this.isFormSame) {
          const foubdIndex = this.tableData.findIndex((dt) => dt?._id === data?._id);
          if (foubdIndex > 0 || foubdIndex === 0) {
            this.tableData[foubdIndex].title = data?.title;
          }
        }
      }
    });

    this.subs.sink = this._newsService.comparisonForm$.subscribe((data: any) => {
      this.isFormSame = data;
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getAllNews();
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getAllNews(source?: string) {
    const pagination = {
      limit: this.paginator?.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator?.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.isWaitingForResponse = true;
    this.subs.sink = this._newsService.getAllNews(pagination, this.filteredValues, this.sortValue).subscribe((resp) => {
      this.tableData = _.cloneDeep(resp);
      this.dataSource.data = this.tableData;
      this.dataCount = this.tableData[0]?.count_document;
      this.isWaitingForResponse = false;
      this.isReset = false;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));

      if (source === 'reset' && !this._newsService.getCurrentIdSubject()) {
        this.addNews(source);
      }
    });
  }

  addNews(from?) {
    if (this.openAddNews) {
      const isFormSame = this._newsService.getCurrentFormStatus();
      if (!isFormSame) {
        Swal.fire({
          type: 'warning',
          title: this._translate.instant('News_S5.TITLE'),
          html: this._translate.instant('News_S5.TEXT'),
          confirmButtonText: this._translate.instant('News_S5.BUTTON 1'),
          cancelButtonText: this._translate.instant('News_S5.BUTTON 2'),
          showCancelButton: true,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          footer: '<span class="tw-w-full tw-text-end">News_S5</span>',
        }).then((result) => {
          if (result.value) {
            this.getAllNews();
            this._newsService.triggerFormReset(true);
          } else {
            this._newsService.triggerFormReset(false);
          }
        });
      }
    } else {
      if (from === 'reset'){
        const newsData = this._newsService.userNewsConfigSubject.value
        this.newNewsItem = {
          _id: '',
          title: newsData?.title,
          description: newsData?.description,
          created_by: {
            first_name: '',
            last_name: '',
            civility: '',
          },
          is_published: null,
        };
      } else {
        this.newNewsItem = {
          _id: '',
          title: '',
          description: '',
          created_by: {
            first_name: '',
            last_name: '',
            civility: '',
          },
          is_published: null,
        };
      }

      if (this.tableData[0]?._id === null) {
        if (this.tableData[0]?.title || this.tableData[0]?.description) {
          this.tableData.shift();
          this.dataCount = this.tableData[0]?.count_document;
        } else {
          this._newsService.userNewsConfig$.subscribe((data: any) => {
            if (data) {
              this.tableData.unshift(this.newNewsItem);
            }
            this.dataCount = this.tableData[1]?.count_document;
            this.dataSource.data = this.tableData;
          });
        }
      } else {
        this.tableData.unshift(this.newNewsItem);
        this.dataCount = this.tableData[1]?.count_document + 1;
        this.dataSource.data = this.tableData;
      }
      this.openAddNews = true;
    }

    if (!from) this._newsService.updateNewsId('');
    else if (from && from === 'reset') this._newsService.setComparisonForm(true);
    this.addNewNews.emit(this.openAddNews);
  }

  initFilter() {
    this.subs.sink = this.newsTitleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.title = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllNews();
        } else if (statusSearch === '') {
          this.newsTitleFilter.setValue('');
          this.filteredValues.title = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllNews();
          }
        }
      } else {
        this.newsTitleFilter.setValue('');
        this.filteredValues.title = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllNews();
        }
      }
    });

    this.subs.sink = this.createdByFilter.valueChanges.pipe(debounceTime(400)).subscribe((createdBySearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!createdBySearch.match(symbol) && !createdBySearch.match(symbol1)) {
        this.filteredValues.created_by = createdBySearch ? createdBySearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllNews();
        } else if (createdBySearch === '') {
          this.newsTitleFilter.setValue('');
          this.filteredValues.created_by = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getAllNews();
          }
        }
      } else {
        this.createdByFilter.setValue('');
        this.filteredValues.created_by = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getAllNews();
        }
      }
    });

    this.subs.sink = this.statusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.is_published = statusSearch === 'All' ? null : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllNews();
      }
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active && sort.direction ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllNews();
      }
    }
  }

  resetFilter() {
    this.isReset = true;
    this.statusFilter.patchValue('All', { emitEvent: false });
    this.createdByFilter.patchValue('', { emitEvent: false });
    this.newsTitleFilter.patchValue('', { emitEvent: false });
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: '', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';

    this.sortValue = {};

    this.filteredValues = {
      title: null,
      created_by: null,
      is_published: null,
    };

    this.openAddNews = false;
    this.getAllNews('reset');
  }

  publishNews(event: any, data: any) {
    if (data && !data.is_published) {
      Swal.fire({
        type: 'warning',
        title: this._translate.instant('News_S1.TITLE'),
        html: this._translate.instant('News_S1.TEXT'),
        confirmButtonText: this._translate.instant('News_S1.BUTTON 1'),
        cancelButtonText: this._translate.instant('News_S1.BUTTON 2'),
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        footer: '<span class="tw-w-full tw-text-end">News_S1</span>',
      }).then((result) => {
        if (result.value) {
          this.publishNewsCallAPI(data?._id);
        } else {
          if (event && event?.source) {
            event.source.checked = data?.is_published;
          }
        }
      });
    } else {
      Swal.fire({
        type: 'warning',
        title: this._translate.instant('News_S3.TITLE'),
        html: this._translate.instant('News_S3.TEXT'),
        confirmButtonText: this._translate.instant('News_S3.BUTTON 1'),
        cancelButtonText: this._translate.instant('News_S3.BUTTON 2'),
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        footer: '<span class="tw-w-full tw-text-end">News_S3</span>',
      }).then((result) => {
        if (result.value) {
          this.unPublishNewsCallAPI(data?._id);
        } else {
          if (event && event?.source) {
            event.source.checked = data?.is_published;
          }
        }
      });
    }
  }

  publishNewsCallAPI(id) {
    const deletedId = id;
    this.subs.sink = this._newsService.publishNews(id).subscribe((resp) => {
      Swal.fire({
        type: 'success',
        title: this._translate.instant('Bravo'),
        confirmButtonText: this._translate.instant('OK'),
        allowOutsideClick: false,
        allowEscapeKey: false,
        footer: '<span class="tw-w-full tw-text-end">Bravo_S1</span>',
      }).then((result) => {
        if (this._newsService.getCurrentIdSubject() === deletedId) {
          this._newsService.updateNewsId(id);
        }
        this.getAllNews();
      });
    });
  }

  unPublishNewsCallAPI(id) {
    const deletedId = id;
    this.subs.sink = this._newsService.unPublishNews(id).subscribe((resp) => {
      Swal.fire({
        type: 'success',
        title: this._translate.instant('Bravo'),
        confirmButtonText: this._translate.instant('OK'),
        allowOutsideClick: false,
        allowEscapeKey: false,
        footer: '<span class="tw-w-full tw-text-end">Bravo_S1</span>',
      }).then((result) => {
        if (this._newsService.getCurrentIdSubject() === deletedId) {
          this._newsService.updateNewsId(id);
        }
        this.getAllNews();
      });
    });
  }

  editNews(newsData, index) {
    this.addNewNews.emit(true);
    if (this.openAddNews) {
      if (index > 0) {
        if (!this.isFormSame) {
          Swal.fire({
            type: 'warning',
            title: this._translate.instant('News_S5.TITLE'),
            html: this._translate.instant('News_S5.TEXT'),
            confirmButtonText: this._translate.instant('News_S5.BUTTON 1'),
            cancelButtonText: this._translate.instant('News_S5.BUTTON 2'),
            showCancelButton: true,
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            footer: '<span class="tw-w-full tw-text-end">News_S5</span>',
          }).then((result) => {
            if (result.value) {
              this._newsService.triggerFormReset(true);
              this._newsService.setComparisonForm(true);
            } else {
              this.tableData.shift();
              this.dataSource.data = this.tableData;
              this.openAddNews = false;
              this.dataCount = this.tableData[0]?.count_document;
              this._newsService.updateNewsId(newsData?._id);
              this._newsService.setComparisonForm(true);
            }
          });
        } else {
          this.tableData.shift();
          this.dataSource.data = this.tableData;
          this.openAddNews = false;
          this.dataCount = this.tableData[0]?.count_document;
          this._newsService.updateNewsId(newsData?._id);
          this._newsService.setComparisonForm(true);
        }
      }
    } else {
      if (!this.isFormSame) {
        Swal.fire({
          type: 'warning',
          title: this._translate.instant('News_S5.TITLE'),
          html: this._translate.instant('News_S5.TEXT'),
          confirmButtonText: this._translate.instant('News_S5.BUTTON 1'),
          cancelButtonText: this._translate.instant('News_S5.BUTTON 2'),
          showCancelButton: true,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          footer: '<span class="tw-w-full tw-text-end">News_S5</span>',
        }).then((result) => {
          if (result.value) {
            let formReset = true;
            this.getAllNews();
            this._newsService.triggerFormReset(formReset);
            this._newsService.setComparisonForm(true);
          } else {
            this._newsService.updateNewsId(newsData._id);
            this.getAllNews();
            this._newsService.setComparisonForm(true);
          }
        });
      } else {
        this._newsService.updateNewsId(newsData._id);
        this._newsService.setComparisonForm(true);
      }
    }
  }

  deleteNews(data) {
    if (data.is_published) {
      Swal.fire({
        type: 'warning',
        title: this._translate.instant('News_S2.TITLE'),
        html: this._translate.instant('News_S2.TEXT'),
        confirmButtonText: this._translate.instant('News_S2.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        footer: '<span class="tw-w-full tw-text-end">News_S2</span>',
      });
      return;
    }

    Swal.fire({
      type: 'warning',
      title: this._translate.instant('News_S4.TITLE'),
      html: this._translate.instant('News_S4.TEXT'),
      confirmButtonText: this._translate.instant('News_S4.BUTTON 1'),
      cancelButtonText: this._translate.instant('News_S4.BUTTON 2'),
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      footer: '<span class="tw-w-full tw-text-end">News_S4</span>',
    }).then((res) => {
      if (res.value) {
        const deletedData = data;
        this.subs.sink = this._newsService.deleteNews(data._id).subscribe((resp) => {
          Swal.fire({
            type: 'success',
            title: this._translate.instant('Bravo'),
            confirmButtonText: this._translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
            footer: '<span class="tw-w-full tw-text-end">Bravo_S1</span>',
          }).then((result) => {
            if (this._newsService.getCurrentIdSubject() === deletedData._id) {
              this._newsService.updateNewsId('');
              this.addNewNews.emit(false);
            }
            this.getAllNews();
          });
        });
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
