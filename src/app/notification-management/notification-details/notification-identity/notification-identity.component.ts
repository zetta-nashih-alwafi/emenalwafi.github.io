import { Router, ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup } from '@angular/material/tabs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { NotificationDetail, NotificationManagementService, Templates } from 'app/notification-management/notification-management.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AddTemplateDialogComponent } from './add-template-dialog/add-template-dialog.component';
import { EditNotificationDetailsDialogComponent } from './edit-notification-details-dialog/edit-notification-details-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { Observable, of } from 'rxjs';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
@Component({
  selector: 'ms-notification-identity',
  templateUrl: './notification-identity.component.html',
  styleUrls: ['./notification-identity.component.scss'],
})
export class NotificationIdentityComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTabGroup, { static: false }) tabGroup: MatTabGroup;
  isReset = false;
  dataLoaded = false;
  timeOutVal: NodeJS.Timeout;
  sortValue: { [x: string]: 'asc' | 'desc' };
  selectedScholarSeason: any;
  @Input() notification_id: string;
  @Output() notifyTabChange: EventEmitter<any> = new EventEmitter();
  detailDataSource: MatTableDataSource<any>;
  templateListDataSource = new MatTableDataSource([]);
  isWaitingForResponse = false;
  isLoading = false;
  noData: any;
  dataCount: number;
  private subs = new SubSink();
  hasDefaultTemplate = false;

  dataColumns = ['when', 'notification_reference', 'context', 'signatory', 'recipient_to', 'recipient_cc', 'triggered', 'related_task'];
  // the keys of the data

  labels = ['When', 'Notification Ref', 'Context', 'Signatory', 'Recipient', 'CC', 'Triggered', 'Related Task'];

  data: NotificationDetail[];

  // for certification detail table
  displayedDetailColumns: string[] = [];

  // for template list table
  displayedColumns: string[] = ['name', 'season', 'program', 'status', 'action'];
  filterColumns: string[] = ['nameFilter', 'seasonFilter', 'programFilter', 'statusFilter', 'actionFilter'];
  statusFilterList = ['AllM', 'Published', 'Unpublished'];
  statusFilter = new UntypedFormControl('AllM');
  filteredValue = {
    is_publish: null,
    scholar_seasons: null,
    programs: null,
  };

  seasonList = [];
  originalSeasonList = [];
  programList = [];
  originalProgramList = [];

  scholarSeasonFilter = new UntypedFormControl(null);
  programFilter = new UntypedFormControl(null);

  filteredScholarSeason: Observable<any[]>;
  filteredProgram: Observable<any[]>;

  @Input() set notificationDetail(value: NotificationDetail) {
    if (value) {
      this.data = [value];
      this.setUpNotificationDetailsTable();
    }
  }
  @Input() set templates(value: Templates[]) {
    if (value) {
      this.getTemplateList(this.notification_id);
    }
  }
  constructor(
    public dialog: MatDialog,
    private notificationService: NotificationManagementService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private financeService: FinancesService,
    public permission: PermissionService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (this.data && this.data?.length) {
      this.setUpNotificationDetailsTable();
    }
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log('IS Change Lang?');
      this.setUpNotificationDetailsTable();
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (this.dataLoaded && this.notification_id) {
            this.getTemplateList(this.notification_id);
          }
        }),
      )
      .subscribe();
  }

  triggerDataRefresh() {
    this.notificationService.triggerRefresh();
  }

  /**************** NOTIFICATION DETAIL RELATED *****************************************/

  setUpNotificationDetailsTable() {
    this.transpose();
    this.fillLabels();
  }

  // transpose the data switching the row to column and vice versa
  transpose() {
    const data: any[] = [...this.data];
    console.log([...this.data]);
    console.log('the data is:', data);

    /* Map the array of user types and make it so that it joins and display into a string [{user1}, {user2}] => user1, user2 ****/
    if (data && data.length && data[0].recipient_to && data[0].recipient_to.length) {
      data[0] = {
        ...data[0],
        recipient_to: data[0].recipient_to.map((recipient) => this.translate.instant('USER_TYPES.' + recipient.name)).join(', '),
      };
      if (data && data.length && data[0].notification_reference === 'Chargeback_DP_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant(
            'Admission member (if student admission) or Academic member (if student readmission) link to student',
          ),
          when: this.translate.instant('When there is chargeback on Payment of DP (only for DP)'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'TRANSFER_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('New dev member'),
        };
        console.log('data TRANSFER_N3', data);
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'TRANSFER_N1bis' || data[0].notification_reference === 'TRANSFER_N1BIS')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('New FC manager'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'ImportContract_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Contract manager who do the import'),
        };
      }
      if (
        (data && data.length && data[0].notification_reference === 'UserForm_N8') ||
        (data && data.length && data[0].notification_reference === 'UserForm_N4')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who complete the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N5') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Validator of that step'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N4') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('All users involved in this form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who asked for the revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User/student involved in the message box of Ask revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who responsible to revise the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N6') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who complete the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User/student involved in the message box of Ask revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who asked for the revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N5') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Validator of that step'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student who is completing the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'Contract_Conven_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('1st signatory'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'Contract_Conven_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('All users involved in this form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'Contract_Conven_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Signatory in turn to Sign the Contract'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'IMPORT_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the import'),
        };
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'Unbalanced_Balance_N1' ||
          data[0].notification_reference === 'Unbalance_Account_N1' ||
          data[0].notification_reference === 'REG_N11' ||
          data[0].notification_reference === 'READ_REG_N9')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student'),
        };
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'Unbalanced_Balance_N2' || data[0].notification_reference === 'Unbalance_Account_N2')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student'),
        };
      }
      if (data && data.length && (data[0].notification_reference === 'Export_N1' || data[0].notification_reference === 'EXPORT_N1')) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the export'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'TrombinoscopePDF_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the PDF export'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N6A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who complete the form'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N5A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Validator of that step'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N3A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who asked for the revision'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N2A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User/student involved in the message box of Ask revision'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeFormCont_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('All users involved in this form'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeFormCont_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant(
            'All Signatory that involve in the contract signatory based on Signatory in the One Time Form Template',
          ),
        };
      }
    } else {
      if (data && data.length && data[0].notification_reference === 'Chargeback_DP_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant(
            'Admission member (if student admission) or Academic member (if student readmission) link to student',
          ),
          when: this.translate.instant('When there is chargeback on Payment of DP (only for DP)'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'PAY_N1_TRANSFER') {
        data[0] = {
          ...data[0],
          when: this.translate.instant('When today date is 5 days before the due date for Term with method payment Transfer'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'EXPORT_STUD_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the export'),
        };
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'IMPORT_COMP_N1' || data[0].notification_reference === 'IMPORT_COMP_N2')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the import'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('InterCont_Recipient.N1'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('InterCont_Recipient.N2'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('InterCont_Recipient.N3'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N4') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('InterCont_Recipient.N4'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N5') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('InterCont_Recipient.N5'),
        };
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'PAY_N1' ||
          data[0].notification_reference === 'PAY_N2' ||
          data[0].notification_reference === 'PAY_N9' ||
          data[0].notification_reference === 'PAY_N7' ||
          data[0].notification_reference === 'PAY_N1_TRANSFER')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student and Financial support'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'PAY_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('The new Financial support'),
        };
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'PAY_N4' ||
          data[0].notification_reference === 'PAY_N5' ||
          data[0].notification_reference === 'PAY_N6')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who pay (student or financial support)'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'PAY_N8') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student and Financial support who already have terms'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'TRANSFER_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('New dev member'),
        };
      }
      if (
        data &&
        data.length &&
        (data[0].notification_reference === 'TRANSFER_N1bis' || data[0].notification_reference === 'TRANSFER_N1BIS')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('New FC manager'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'ImportContract_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Contract manager who do the import'),
        };
      }
      if (
        (data && data.length && data[0].notification_reference === 'UserForm_N8') ||
        (data && data.length && data[0].notification_reference === 'UserForm_N4')
      ) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who complete the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N5') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Validator of that step'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'InterCont_N4') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('All users involved in this form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who asked for the revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User/student involved in the message box of Ask revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'UserForm_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who responsible to revise the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N6') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who complete the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User/student involved in the message box of Ask revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who asked for the revision'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N5') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Validator of that step'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'FC_UserForm_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student who is completing the form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'Contract_Conven_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('1st signatory'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'Contract_Conven_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('All users involved in this form'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'Contract_Conven_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Signatory in turn to Sign the Contract'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'IMPORT_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the import'),
        };
      }
      if (data && data.length && (data[0].notification_reference === 'Export_N1' || data[0].notification_reference === 'EXPORT_N1')) {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the export'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'TrombinoscopePDF_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who do the PDF export'),
        };
      }
      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N6A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who complete the form'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N5A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Validator of that step'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N3A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who asked for the revision'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeForm_N2A') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User/student involved in the message box of Ask revision'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeFormCont_N2') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('All users involved in this form'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'OneTimeFormCont_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant(
            'All Signatory that involve in the contract signatory based on Signatory in the One Time Form Template',
          ),
        };
      }

      if (data && data.length && data[0].notification_reference === 'UPDATE_FINANCE_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User selected (FS or student)'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'AUTODEBIT_REPORT_N1') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('comptaecole@groupe-edh.com'),
        };
      }

      if (data && data.length && data[0].notification_reference === 'Minor_Student_N3') {
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Legal Representative of student'),
        }
      }
      if(data && data?.length && (data[0]?.notification_reference === 'STUDENT_VISA_N1' ||
          data[0]?.notification_reference === 'STUDENT_VISA_N2' ||
          data[0]?.notification_reference === 'STUDENT_VISA_N3' ||
          data[0]?.notification_reference === 'STUDENT_VISA_N4' ||
          data[0]?.notification_reference === 'STUDENT_VISA_N5' ||
          data[0]?.notification_reference === 'STUDENT_VISA_N6' ||
          data[0]?.notification_reference === 'STUDENT_VISA_N7')
      ){
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('Student'),
        };
      }

      if(data && data?.length && data[0]?.notification_reference === 'STUDENT_VISA_N8'){
        data[0] = {
          ...data[0],
          recipient_to: this.translate.instant('User who click on the Ask for visa document button'),
        };
      }
    }
    if (data && data.length && data[0].recipient_cc) {
      data[0] = {
        ...data[0],
        recipient_cc: data[0].recipient_cc.map((recipient) => this.translate.instant('USER_TYPES.' + recipient.name)).join(', '),
      };
    }
    if (
      data &&
      data.length &&
      !data[0].recipient_cc &&
      (data[0].notification_reference === 'Unbalanced_Balance_N1' ||
        data[0].notification_reference === 'Unbalance_Account_N1' ||
        (data[0].notification_reference !== 'AUTODEBIT_REPORT_N1' &&
          data[0].notification_reference !== 'Chargeback_DP_N1' &&
          data[0].notification_reference !== 'REG_N11' &&
          data[0].notification_reference !== 'READ_REG_N9' &&
          data[0]?.notification_reference !== 'TEACH_MANAG_N1_CDDU' &&
          data[0]?.notification_reference !== 'TEACH_MANAG_N1_CONVENTION' &&
          data[0]?.notification_reference !== 'TEACH_MANAG_N2' &&
          data[0]?.notification_reference !== 'PAY_N1_TRANSFER' &&
          data[0]?.notification_reference !== 'Minor_Student_N1' && 
          data[0]?.notification_reference !== 'Minor_Student_N2' &&
          data[0]?.notification_reference !== 'Minor_Student_N3' &&
          data[0]?.notification_reference !== 'Minor_Student_N4' &&
          data[0]?.notification_reference !== 'PAY_N1_TRANSFER' && 
          data[0]?.notification_reference !== 'STUDENT_VISA_N1' && 
          data[0]?.notification_reference !== 'STUDENT_VISA_N2' &&
          data[0]?.notification_reference !== 'STUDENT_VISA_N3' &&
          data[0]?.notification_reference !== 'STUDENT_VISA_N4' &&
          data[0]?.notification_reference !== 'STUDENT_VISA_N5' &&
          data[0]?.notification_reference !== 'STUDENT_VISA_N6' &&
          data[0]?.notification_reference !== 'STUDENT_VISA_N7' &&
          data[0]?.notification_reference !== 'STUDENT_VISA_N8' &&
          data[0]?.notification_reference !== 'STUD_REG_N1'))
    ) {
      data[0] = {
        ...data[0],
        recipient_cc: this.translate.instant('Financial Support'),
      };
    }
    if (
      data &&
      data.length &&
      !data[0].recipient_cc &&
      (data[0].notification_reference === 'Unbalanced_Balance_N2' 
        || data[0].notification_reference === 'Unbalance_Account_N2'
      )
    ) {
      data[0] = {
        ...data[0],
        recipient_cc: this.translate.instant('Financial Support'),
      };
    }
    if (
      data &&
      data.length &&
      !data[0].recipient_cc &&
      data[0].notification_reference !== 'AUTODEBIT_REPORT_N1' &&
      data[0].notification_reference !== 'Chargeback_DP_N1' &&
      data[0]?.notification_reference !== 'TEACH_MANAG_N1_CDDU' &&
      data[0]?.notification_reference !== 'TEACH_MANAG_N1_CONVENTION' &&
      data[0]?.notification_reference !== 'TEACH_MANAG_N2' && 
      data[0]?.notification_reference !== 'Minor_Student_N3' &&
      data[0]?.notification_reference !== 'PAY_N1_TRANSFER' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N1' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N2' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N3' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N4' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N5' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N6' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N7' &&
      data[0]?.notification_reference !== 'STUDENT_VISA_N8') {
      data[0] = { ...data[0], recipient_cc: 'No CC' };
    }

    if (data && data.length && !data[0].recipient_cc && data[0].notification_reference === 'AUTODEBIT_REPORT_N1') {
      data[0] = { ...data[0], recipient_cc: 'comptaecole-brassart-mopa@brassart.fr, s.abad@esec.edu' };
    }

    if (data && data.length && !data[0].recipient_cc && data[0].notification_reference === 'Minor_Student_N3') {
      data[0] = { ...data[0], recipient_cc: 'Student' };
    }
    if (data && data.length && data[0].signatory) {
      data[0] = {
        ...data[0],
        signatory: data[0].signatory.name,
      };
    } else if (data && data.length && data[0].notification_reference === 'ADM_DOC_N3') {
      data[0] = {
        ...data[0],
        signatory: 'School direction',
      };
    } else {
      // Signatory will be School Direction if notif is ADM_DOC_N3 if signatory is empty
      if (data && data.length && data[0].notification_reference === 'ADM_DOC_N3') {
        data[0] = {
          ...data[0],
          signatory: 'School direction',
        };
      } else if (
        data[0].notification_reference === 'InterCont_N1' ||
        data[0].notification_reference === 'InterCont_N2' ||
        data[0].notification_reference === 'InterCont_N3' ||
        data[0].notification_reference === 'InterCont_N4'
      ) {
        data[0] = { ...data[0], signatory: this.translate.instant('EDH Platform') };
      } else if (data[0].notification_reference === 'REG_N11') {
        data[0] = { ...data[0], signatory: this.translate.instant('Admission Member') };
      } else if (data[0].notification_reference === 'READ_REG_N9') {
        data[0] = { ...data[0], signatory: this.translate.instant('Academic Member') };
      } else if (
        data[0]?.notification_reference === 'TEACH_MANAG_N1_CDDU' ||
        data[0]?.notification_reference === 'TEACH_MANAG_N1_CONVENTION'
      ) {
        data[0] = { ...data[0], signatory: this.translate.instant('User who click on the ask required document button') };
      } else if (data[0]?.notification_reference === 'TEACH_MANAG_N2' || data[0]?.notification_reference === 'STUDENT_VISA_N2') {
        data[0] = { ...data[0], signatory: this.translate.instant('User who click on the send reminder button') };
      } else if (data[0]?.notification_reference === 'Minor_Student_N3') {
        data[0] = { ...data[0], signatory: this.translate.instant('Dev Member of Student') };
      } else if (data[0]?.notification_reference === 'STUDENT_VISA_N1') {
        data[0] = { ...data[0], signatory: this.translate.instant('User who click on the Ask for visa document button') };
      } else if (data[0]?.notification_reference === 'STUDENT_VISA_N4') {
        data[0] = { ...data[0], signatory: this.translate.instant('User who click on the reject the document button in student card - Visa document tab') };
      } else if (data[0]?.notification_reference === 'STUDENT_VISA_N5') {
        data[0] = { ...data[0], signatory: this.translate.instant('User who click on the Accept the document button in student card - Visa document tab') };
      } else {
        data[0] = { ...data[0], signatory: this.translate.instant('EDH Platform') };
      }
    }
    if (data && data.length && !data[0].related_task) {
      data[0] = { ...data[0], related_task: 'No Task' };
    }
    if (data && data.length && data[0].context && data[0].notification_reference === 'InterCont_N4') {
      data[0] = { ...data[0], context: 'When the last user signed and submit InterCont_N4' };
    }
    /**************************************************************************************** *****/
    const transposedData = [];
    for (let column = 0; column < this.dataColumns.length; column++) {
      transposedData[column] = {
        label: this.labels[column],
      };
      for (let row = 0; row < data.length; row++) {
        transposedData[column][`column${row}`] = data[row][this.dataColumns[column]];
      }
    }
    // console.log('_ident', transposedData);
    this.detailDataSource = new MatTableDataSource(transposedData);
  }

  fillLabels() {
    this.displayedDetailColumns = ['label'];
    for (let i = 0; i < this.data.length; i++) {
      this.displayedDetailColumns.push('column' + i);
    }
  }

  onEditNotificationDetail() {
    this.dialog
      .open(EditNotificationDetailsDialogComponent, {
        data: this.data[0],
        minWidth: '650px',
        panelClass: 'no-padding-pop-up',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerDataRefresh();
        }
      });
  }

  /*************** TEMPLATE LIST RELATED **************************************************** */

  setUpTemplateListTable(templates: Templates[]) {
    // get dropdown scholar season
    // console.log('_filter', this.scholarSeasonFilter.value, this.programFilter.value);

    if (this.scholarSeasonFilter.value === 'Default' || this.programFilter.value === 'Default') {
      this.seasonList = [];
      this.filteredScholarSeason = of(this.seasonList);

      this.programList = [];
      this.filteredProgram = of(this.programList);
    } else {
      this.getPrograms();
      this.getScholarSeasons();
    }
    this.initFilter();

    if (templates && templates.length) {
      // check if any of the template is default template
      this.hasDefaultTemplate = templates.some((template) => template.is_default_template);
      this.notificationService.setHasDefaultTemplate(this.hasDefaultTemplate);
      this.flattenAndSetSeasonsAndPrograms(templates);
    }
    // console.log('after format each value is:', templates);
    this.templateListDataSource.data = templates;
    this.dataCount = templates.length ? templates[0].count_document : 0;
    // console.log(templates[0].count_document);
    this.noData = this.templateListDataSource.connect().pipe(map((dataa) => dataa.length === 0));
    this.dataLoaded = true;
    this.isReset = false;
  }

  onStatusFilter(status: string) {
    this.filteredValue.is_publish = status === 'AllM' || !status ? null : status === 'Published' ? true : false;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getTemplateList(this.notification_id);
    }
  }

  // this function get all the seasons and programs from the different arrays of program_seasons and flatten it
  // we do this so we can display all the seasons and programs from the different scholar seasons
  flattenAndSetSeasonsAndPrograms(templates) {
    for (const template of templates) {
      if (template.program_seasons && template.program_seasons.length) {
        const programList = template.program_seasons.map((programSeason) => programSeason.programs);
        const seasonList = template.program_seasons.map((programSeason) => programSeason.scholar_season);
        template.programs = [].concat.apply([], programList).sort((a: any, b: any) => a.program.localeCompare(b.program));
        template.seasons = [].concat.apply([], seasonList);
      }
    }
  }

  getTemplateList(notificationId: string) {
    const filter = {
      notification_reference_id: notificationId,
      is_publish: this.filteredValue?.is_publish,
      scholar_seasons: this.filteredValue?.scholar_seasons ? this.filteredValue.scholar_seasons : null,
      programs: this.filteredValue?.programs ? this.filteredValue.programs : null,
    };
    const pagination = {
      limit: this.paginator && this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator && this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.isWaitingForResponse = true;
    return this.notificationService.getAllNotificationTemplates(filter, pagination, this.sortValue).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.setUpTemplateListTable(resp);
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
        return;
      },
    );
  }

  generateMultipleTooltip(element: any[]) {
    if (!element || !element.length) {
      return;
    }
    const types = ['program', 'scholar_season'];
    return element
      .map((item) => {
        const key = types.find((type) => element[0] && element[0].hasOwnProperty(type));
        return key ? item[key] : '';
      })
      .join(', ');
  }

  onAddTemplate() {
    this.subs.sink = this.dialog
      .open(AddTemplateDialogComponent, {
        data: {
          notification_id: this.notification_id,
          notification_reference: this.data[0].notification_reference,
          hasDefaultTemplate: this.hasDefaultTemplate,
          existingData: null,
        },
        minWidth: '650px',
        maxWidth: '650px',
        panelClass: 'no-padding-pop-up',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerDataRefresh();
        }
      });
  }

  onEditTemplate(element: Templates) {
    // console.log('notifid', this.notification_id);
    // console.log('elment', element);
    this.subs.sink = this.dialog
      .open(AddTemplateDialogComponent, {
        data: {
          notification_id: this.notification_id,
          notification_reference: this.data[0].notification_reference,
          hasDefaultTemplate: this.hasDefaultTemplate,
          existingData: element,
        },
        minWidth: '650px',
        maxWidth: '650px',
        panelClass: 'no-padding-pop-up',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerDataRefresh();
        }
      });
  }

  // stop user from removing template if status is published
  warnTemplateAlreadyPublished() {
    return Swal.fire({
      title: this.translate.instant('Notif_S19.TITLE'),
      html: this.translate.instant('Notif_S19.TEXT'),
      type: 'warning',
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('Notif_S19.BUTTON1'),
      allowOutsideClick: true,
      allowEnterKey: true,
    });
  }

  // ask user for confirmation to delete template
  confirmBeforeDeletion(element, timeDisabled) {
    return Swal.fire({
      title: this.translate.instant('Notif_S9.TITLE', { templateName: element.template_name }),
      html: this.translate.instant('Notif_S9.TEXT', { templateName: element.template_name }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Notif_S9.BUTTON1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Notif_S9.BUTTON2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Notif_S9.BUTTON1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Notif_S9.BUTTON1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    });
  }

  // mainly to show swal warnings
  async onDeleteTemplate(element) {
    if (element?.is_publish) {
      await this.warnTemplateAlreadyPublished(); // if template already published, stop user with SWAL
      return;
    }
    const timeDisabled = 3;
    const confirm = await this.confirmBeforeDeletion(element, timeDisabled); // get user confirmation for deletion
    clearTimeout(this.timeOutVal);
    if (confirm.value) {
      this.deleteTemplate(element);
    }
  }

  // call api to delete the template
  deleteTemplate(element: Templates) {
    this.subs.sink = this.notificationService.deleteNotificationTemplate(element?._id).subscribe(
      (resp) => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          text: this.translate.instant('Notif_S10.TEXT', { templateName: element?.template_name }),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.triggerDataRefresh();
        });
      },
      (error) => {
        this.authService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  goToTab(element) {
    // ..Unused for now due to change in spec..
    this.notifyTabChange.emit(element._id);
  }

  onPreviewTemplate(element: Templates) {
    Swal.fire({
      type: 'warning',
      allowEnterKey: false,
      allowEscapeKey: false,
      showCancelButton: true,
      allowOutsideClick: false,
      html: this.translate.instant('Notif_S7.TEXT', { templateName: element.template_name }),
      title: this.translate.instant('Notif_S7.TITLE'),
      cancelButtonText: this.translate.instant('Notif_S7.BUTTON2'),
      confirmButtonText: this.translate.instant('Notif_S7.BUTTON1'),
    }).then((confirm) => {
      if (confirm.value) {
        this.sendTemplatePreview(element);
      }
    });
  }

  sendTemplatePreview(template: Templates) {
    this.isLoading = true;
    this.subs.sink = this.notificationService.sendNotificationPreview(template?._id).subscribe(
      (resp) => {
        this.isLoading = false;
        Swal.fire({
          type: 'success',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          html: this.translate.instant('Notif_S8.TEXT', { notificationRef: template?.template_name }),
          title: this.translate.instant('Notif_S8.TITLE'),
          confirmButtonText: this.translate.instant('Notif_S8.BUTTON1'),
        });
      },
      (err) => {
        this.isLoading = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getTemplateList(this.notification_id);
      }
    }
  }

  back() {
    this.router.navigate(['/notification-management']);
  }

  getScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsDropdown().subscribe(
      (seasons) => {
        this.seasonList = seasons;
        this.originalSeasonList = seasons;
        this.filteredScholarSeason = of(this.seasonList);
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getPrograms() {
    let filter;
    if (this.selectedScholarSeason) {
      filter = {
        scholar_season_id: this.selectedScholarSeason,
      };
    }
    this.subs.sink = this.financeService.getAllProgram(filter).subscribe(
      (programs) => {
        this.programList = programs;
        this.originalProgramList = programs;
        this.filteredProgram = of(this.programList);
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  onScholarSeasonSelected(value) {
    // console.log('_value', value);

    if (value !== 'AllS' && value !== 'Default') {
      this.selectedScholarSeason = value;
      this.filteredValue.scholar_seasons = [value];
      if (this.programFilter.value) {
        this.programFilter.setValue('');
        this.filteredValue.programs = null;
      }
      this.getTemplateList(this.notification_id);
    } else if (value === 'Default') {
      this.selectedScholarSeason = '';
      this.filteredValue.scholar_seasons = ['default'];
      if (this.programFilter.value && this.programFilter.value !== 'Default') {
        this.programFilter.setValue('');
        this.filteredValue.programs = null;
      }
      this.getTemplateList(this.notification_id);
    } else {
      this.selectedScholarSeason = '';
      this.filteredValue.scholar_seasons = null;
      this.getTemplateList(this.notification_id);
    }
  }

  onProgramSelected(value) {
    if (value === 'Default') {
      this.filteredValue.programs = ['default'];
      this.selectedScholarSeason = '';
      this.filteredValue.scholar_seasons = ['default'];
      if (this.scholarSeasonFilter.value && this.scholarSeasonFilter.value !== 'Default') {
        this.scholarSeasonFilter.setValue('');
        this.filteredValue.scholar_seasons = null;
      }
      this.getTemplateList(this.notification_id);
    } else if (value !== 'AllS' && value !== 'Default') {
      this.filteredValue.programs = [value];
      this.getTemplateList(this.notification_id);
    } else {
      this.filteredValue.programs = null;
      this.getTemplateList(this.notification_id);
    }
  }

  initFilter() {
    this.subs.sink = this.scholarSeasonFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (typeof statusSearch === 'string') {
        const filteredSeason = this.seasonList.filter((sch) => sch.scholar_season.toLowerCase().includes(statusSearch.toLowerCase()));
        this.filteredScholarSeason = of(filteredSeason);
        if (statusSearch === '') {
          this.filteredScholarSeason = of(this.seasonList);
        }
      }
    });

    this.subs.sink = this.programFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (typeof statusSearch === 'string') {
        const filteredProgram = this.programList.filter((pro) => pro.program.toLowerCase().includes(statusSearch.toLowerCase()));
        this.filteredProgram = of(filteredProgram);
        if (statusSearch === '') {
          this.filteredProgram = of(this.programList);
        }
      }
    });
  }

  resetTable() {
    this.isReset = true;
    this.selectedScholarSeason = '';
    this.scholarSeasonFilter.setValue('');
    this.programFilter.setValue('');
    this.statusFilter.setValue('AllM');
    this.filteredValue = {
      is_publish: null,
      programs: null,
      scholar_seasons: null,
    };
    this.getTemplateList(this.notification_id);
  }
}
