import { PageTitleService } from './../../../core/page-title/page-title.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

const ELEMENT_DATA = [
  { organization: { id: 1, name: 'OPCO' }, rate_hour: 12, hours: 150, total: '1800', document: 'document', action: 'action' },
  { organization: { id: 1, name: 'Pole Emploi' }, rate_hour: 10, hours: 100, total: 'total', document: 'document', action: 'action' },
];

@Component({
  selector: 'ms-student-convention-tab-detail',
  templateUrl: './student-convention-tab-detail.component.html',
  styleUrls: ['./student-convention-tab-detail.component.scss'],
})
export class StudentConventionTabDetailComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() userData: any;
  @Input() candidateId: any;
  @Input() scholarSeasonData: any;

  private subs = new SubSink();

  noData: any;
  dataCount = 0;
  isLoading: Boolean;

  isWaitingForResponse = false;

  // this static for thumb up validation berfore get userId from ULR for dinamic userId
  thumbsValidator: any;

  displayedColumns: string[] = ['type', 'organization', 'rate_hour', 'hours', 'total', 'document', 'status', 'action'];
  dataSource = new MatTableDataSource([]);
  currentUser: any;
  candidateData: any;
  timeOutVal: NodeJS.Timeout;
  isOperator: boolean;
  constructor(
    public dialog: MatDialog,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private authService: AuthService,
    private pageTitleService:PageTitleService
  ) {}

  ngOnInit() {
    this.updatePageTitle()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getOneCandidate();
  }
  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Contract/Convention'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Contract/Convention'));
    });
  }

  getOneCandidate() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.candidateId).subscribe(
      (res) => {
        if (res) {
          console.log('_ini dia', res);

          this.candidateData = res;
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
}
