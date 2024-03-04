import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { NewsService } from 'app/news/news.service';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/internal/Subject';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from 'environments/environment';
import { UtilityService } from 'app/service/utility/utility.service';
import { FormControl, Validators } from '@angular/forms';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ms-all-news-detail',
  templateUrl: './all-news-detail.component.html',
  styleUrls: ['./all-news-detail.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class AllNewsDetailComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  @Input() _id:any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('commentInput') commentInput : ElementRef

  constructor(
    private sanitizer: DomSanitizer,
    private newsService:NewsService,
    private translate: TranslateService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private utilityService: UtilityService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.getDataFromGraph();
  }

  dataOneNews:any;
  datePipe;

  dataForNews:any;
  newsDiscussData: any;
  currentUser: any
  discussDataCount: number;
  isLoading:boolean = false
  isLoadingDiscussion: boolean = false
  isWaitingForResponse: boolean = false
  newsDiscussion = new FormControl('', Validators.required);

  ngOnInit(): void {
    // call when the API is ready
    this.currentUser = this.utilityService.getCurrentUser()

    this.subs.sink = this.translate.onLangChange.subscribe((data) => {
      if(this.dataOneNews) {
        this.dataOneNews.published_date.date = this.getTranslatedDate(this.dataOneNews?.published_date?.date);
      }

      if (this.newsDiscussData) {
        this.newsDiscussData.map((element) => {
          element.createdDate = this.getTranslatedDate(element?.created_at);
          return element?.createdDate;
        });
      }
    })
    
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator?.page
      .pipe(
        startWith(null),
        tap(() => {
          if(this._id || this.dataOneNews._id){
            this.getAllNewsDiscussion();
          }
        }),
      )
      .subscribe();
      this.commentInput.nativeElement.focus();
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
    }


  getDataFromGraph() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.newsService.getOneNews(this._id)
    .subscribe((dataOneNews) => {
      this.isLoading = false;
      this.isWaitingForResponse = false;
      this.dataOneNews = _.cloneDeep(dataOneNews);
      if(dataOneNews) {
        this.dataOneNews.published_date.date = this.parseUTCToLocalPipe.transformDate(this.dataOneNews?.published_date?.date, this.dataOneNews?.published_date?.time)
        const parsedDate = moment(this.dataOneNews?.published_date?.date, "DD/MM/YYYY");
        const formattedDate = parsedDate.format("MMMM, DD YYYY");
        this.dataOneNews.published_date.time = this.parseUTCToLocalPipe.transform(this.dataOneNews?.published_date?.time)
        this.dataOneNews.published_date.date = this.getTranslatedDate(formattedDate);
      } else {
        this.isWaitingForResponse = false
      }
      this.newsDiscussion.patchValue('')
      if(this.dataOneNews?._id){
        this.getAllNewsDiscussion()
      }
    }),
    (err) => {
      this.isWaitingForResponse = false;
    }
  }
  
  getTranslatedDate(dateRaw) {
    if (dateRaw) {
      this.datePipe = new DatePipe(this.translate.currentLang);
      if (this.datePipe && this.datePipe['locale']) {
        const dateTranslate = this.datePipe?.transform(dateRaw, 'MMMM, d y');
        return dateTranslate;
      }
      return '';
    }
    return '';
  }

  getAllNewsDiscussion(){
    const newsId = {
      news_id: this.dataOneNews?._id
    }
    
    const pagination = {
      limit: this.paginator?.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator?.pageIndex ? this.paginator.pageIndex : 0,
    }
    if(newsId?.news_id !== undefined){
      this.subs.sink = this.newsService.getAllNewsDiscussion(pagination, newsId).subscribe((resp) => {
        if (resp) {
          this.isLoading = false
          this.newsDiscussData = resp;   
          this.discussDataCount = resp[0]?.count_document || 0
  
          this.newsDiscussData.forEach(element => {
            element.userPhotoPath = element?.created_by?.profile_picture
              ? environment.apiUrl.replace('/graphql', '/fileuploads/') + element?.created_by?.profile_picture
              : element?.created_by?.civility == 'MR'
                ? '/assets/img/student_icon.png'
                : '/assets/img/student_icon_fem.png';
        
            const dateString = element?.created_at;
            const dateMoment = moment(dateString);
        
            // Format date and time
            const formattedDate = dateMoment.format("DD/MM/YYYY");
            const formattedTime = dateMoment.format("HH:mm");
  
            const pipeDate = this.parseUTCToLocalPipe.transformDateToStringFormat(formattedDate, formattedTime)
            
            console.log(formattedTime);
            const dateMomentPipe = moment(pipeDate)
            const formattedDateFromPipe = dateMomentPipe.format("MMMM, DD YYYY");
            console.log(dateMomentPipe);
        
            // Assign formatted values to the 'element'
            element.createdDate = this.getTranslatedDate(formattedDateFromPipe);
            element.createdTime = formattedTime;
          });
        }
      }); 
    }
  }

  sendDiscussion(valuefromEnter?) {  
    this.isLoadingDiscussion = true
    const NewsDiscussionInput = {
      comment: valuefromEnter ? valuefromEnter : this.newsDiscussion.value,
      created_by: this.currentUser._id,
      news_id: this.dataOneNews?._id,
    }

    if (this.newsDiscussion.value.trim() !== ''){
      this.subs.sink = this.newsService.createNewsDiscussion(NewsDiscussionInput).subscribe((resp) => {
        if(resp){
          this.getAllNewsDiscussion()
          this.newsDiscussion.reset()
        }
        this.isLoadingDiscussion = false
        this.newsDiscussion.enable()
      }, 
      (err) =>{
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
        this.isLoadingDiscussion = false
        this.newsDiscussion.enable()
      })
    } else {
      this.isLoadingDiscussion = false
      this.newsDiscussion.enable()
    }
  }

  get userPhotoPath() {
    return this.currentUser?.profile_picture
      ? environment.apiUrl.replace('/graphql', '/fileuploads/') + this.currentUser.profile_picture
      : this.currentUser.civility === 'MR'
      ? '/assets/img/student_icon.png'
      : '/assets/img/student_icon_fem.png';
  }

  likeDiscuss(){
    const isLiked = this.dataOneNews?.is_current_user_like_the_news;
    const newsId = this.dataOneNews?._id;   

    this.isLoading = true;
    if(isLiked){
      this.subs.sink = this.newsService.unLikeNews(newsId).subscribe((resp) => {
        this.getDataFromGraph()
      })
    } else {
      this.subs.sink = this.newsService.likeNews(newsId).subscribe((resp) => {
        this.getDataFromGraph()
      })
    }
  }

  scrollToCommentInput() {
    this.commentInput.nativeElement.focus();
  }

  onKeyPress(event) {
    const target = event.target as HTMLTextAreaElement;
    if (this.newsDiscussion.valid && this.newsDiscussion.value !== '') {
        if (event.key === 'Enter' && event.ctrlKey && event.shiftKey) {
            // Handle Ctrl + Shift + Enter
            // Do something specific if needed
        } else if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
            // Handle Enter without Ctrl or Shift
            if (this.newsDiscussion.value.trim() !== '') {
                this.isLoadingDiscussion = true;
                this.newsDiscussion.disable();
                let value = target.value.replace(/\n/g, '<br>');
                console.log(value);
                this.sendDiscussion(value);
                target.value = '';
                target.style.height = 'auto';
                this.isLoadingDiscussion = false;
            }
        } else if (event.key === '\n' && event.ctrlKey) {
            // Handle Ctrl + Enter
            target.value += '\n';
        }
    }

    target.style.height = '0';
    target.style.height = target.scrollHeight + 'px';
}


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
