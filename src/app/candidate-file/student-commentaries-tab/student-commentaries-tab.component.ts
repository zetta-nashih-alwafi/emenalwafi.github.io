import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ApplicationUrls } from 'app/shared/settings';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { StudentCommentariesDialogComponent } from './student-commentaries-dialog/student-commentaries-dialog.component';
import { StudentReplyCommentariesDialogComponent } from './student-reply-commentaries-dialog/student-reply-commentaries-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { UsersService } from 'app/service/users/users.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { CoreService } from 'app/service/core/core.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { StudentsTableService } from 'app/students-table/StudentTable.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ms-student-commentaries-tab',
  templateUrl: './student-commentaries-tab.component.html',
  styleUrls: ['./student-commentaries-tab.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class StudentCommentariesTabComponent implements OnInit, OnDestroy, OnChanges {
  public Editor = DecoupledEditor;
  @Input() candidateId;
  @Input() userData;
  @Input() studentId;
  @Output() loadingData: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();
  isWaitingForResponse = false;
  loadDataUser = false;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  isReset = false;
  currentUser;
  isUserAdmtc = false;
  isUserAcaDirAdmin = false;
  entityData: any;
  allDataUser: any;
  allUser: any;
  form: UntypedFormGroup;
  candidateComments: any[] = [];

  filteredValues = {
    candidate_ids: '',
    subject: '',
    comment_body: '',
    created_by: '',
    date_comment_created: '',
    category: '',
  };

  originalComments: any[] = [];

  categoryFilterList = [];
  userFilterList = [];
  dateFilterList = [];

  filterForm: UntypedFormGroup;

  public config = {
    placeholder: this.translate.instant('Answer'),
    height: '20rem',
    toolbar: [],
  };
  commentForm = new UntypedFormControl(null);
  private intVal: any;
  private timeOutVal: any;

  listManualActions = [
    'Finance - OD student balance adjustment',
    'Finance - OD cash transfer',
    'Finance - Refund',
    'Finance - Avoir',
    'Finance - Payment line',
    'Finance - Billing',
  ];
  candidateIds: any;

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private pageTitleService: PageTitleService,
    public dialog: MatDialog,
    private authService: AuthService,
    public utilService: UtilityService,
    private userService: UsersService,
    private coreService: CoreService,
    public permission: PermissionService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private studentService: StudentsTableService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.updatePageTitle();
    this.initForm();
    this.initAddCommentForm();
    this.initFilter();
    if (this.studentId) {
      this.getAllCandidateIds(this.studentId);
    } else {
      this.candidateIds = [this.candidateId];
      this.filteredValues.candidate_ids = this.candidateIds;
      this.getAllCandidateComment();
    }
    if (this.userData && this.userData.length) {
      this.getAllUsers(this.userData);
    }
    this.getAllCandidateCommentCategories();
    this.config['mention'] = {
      feeds: [
        {
          marker: '@',
          feed: (query) => this.getFeedItems(query),
          minimumCharacters: 0,
        },
      ],
    };
    this.translateFinanceHistory();
    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
  }

  getAllCandidateIds(id) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentService.getAllCandidateIds([id]).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp.length && resp[0]?.candidate_ids) {
          this.candidateIds = resp[0].candidate_ids.map((data) => data._id);
          this.filteredValues.candidate_ids = this.candidateIds;

          this.getAllCandidateComment();
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getAllCandidateCommentCategories() {
    this.subs.sink = this.candidateService.GetAllCandidateCommentCategories().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.categoryFilterList = resp;
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Commentaries'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Commentaries'));
      if (this.originalComments && this.originalComments.length) {
        const tmpData = _.cloneDeep(this.originalComments);
        tmpData.forEach((comments) => {
          this.updateDetailCommentaries(comments);
          this.updateDetailCommentariesManualActions(comments, comments?.category);
          if (comments?.category === 'Finance') {
            this.updateDetailCommentariesFinance(comments);
          }
        });
        this.candidateComments = tmpData;
      }
    });
  }

  getCurrentUser() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isUserAdmtc = this.utilService.isUserEntityADMTC();
    this.isUserAcaDirAdmin = this.utilService.isUserAcadDirAdmin();
    console.log('currentUser : ', this.currentUser);
    if (this.isUserAdmtc) {
      this.entityData = this.currentUser.entities.find((entity) => entity.entity_name === 'admtc');
    } else if (this.isUserAcaDirAdmin) {
      this.entityData = this.currentUser.entities.find((entity) => entity.type.name === 'Academic Director');
    }
  }

  replyComment(_id) {
    this.subs.sink = this.dialog
      .open(StudentReplyCommentariesDialogComponent, {
        width: '1015px',
        minHeight: '300px',
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        panelClass: 'grey-mode-pop-up',
        data: {
          commentId: _id,
          candidateId: this.candidateId,
          currentUser: this.currentUser,
          allDataUser: this.allDataUser,
          allUser: this.allUser,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetComment();
        }
      });
  }

  getAllUsers(respAdmtc) {
    this.loadDataUser = true;
    // this.subs.sink = this.userService.getAllUserNote().subscribe(
    //   (respAdmtc) => {
    this.loadDataUser = false;
    this.loadingData.emit(false);
    const listResponse = _.cloneDeep(respAdmtc);
    this.allDataUser = listResponse;
    this.allUser = this.allDataUser.map((newData) => {
      return '@' + newData.last_name + ' ' + newData.first_name;
    });
    this.config['mention'] = {
      feeds: [
        {
          marker: '@',
          feed: (query) => this.getFeedItems(query),
          minimumCharacters: 0,
        },
      ],
    };
    // },
    // (err) => {
    //   this.loadDataUser = false;
    //   this.loadingData.emit(false);
    //   this.isWaitingForResponse = false;
    // },
    // );
  }

  ngOnChanges() {
    if (this.userData && this.userData.length) {
      this.getAllUsers(this.userData);
      this.checkAutoReply();
    }
    this.updatePageTitle();
    this.initForm();
    this.initFilter();
    if (this.studentId) {
      this.getAllCandidateIds(this.studentId);
    }
    this.translateFinanceHistory();
  }

  initForm() {
    this.filterForm = this.fb.group({
      searchCommentFilter: [null],
      userFilter: [null],
      dateFilter: [null],
      categoryFilter: [null],
    });
  }

  initFilter() {
    this.subs.sink = this.filterForm.controls['userFilter'].valueChanges.subscribe((value) => {
      this.filteredValues.created_by = value === 'AllM' ? '' : value;
      if (!this.isReset) {
        this.getAllCandidateComment('filter');
      }
    });

    this.subs.sink = this.filterForm.controls['dateFilter'].valueChanges.subscribe((value) => {
      this.filteredValues.date_comment_created = value === 'AllF' ? '' : value;
      if (!this.isReset) {
        this.getAllCandidateComment('filter');
      }
    });

    this.subs.sink = this.filterForm.controls['categoryFilter'].valueChanges.subscribe((value) => {
      this.filteredValues.category = value === 'AllF' ? '' : value;
      if (!this.isReset) {
        this.getAllCandidateComment('filter');
      }
    });

    this.subs.sink = this.filterForm.controls['searchCommentFilter'].valueChanges.pipe(debounceTime(400)).subscribe((commentSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (commentSearch && !commentSearch.match(symbol) && !commentSearch.match(symbol1)) {
        this.filteredValues.comment_body = commentSearch;
        if (!this.isReset) {
          this.getAllCandidateComment('filter');
        }
      } else {
        this.filteredValues.comment_body = '';
        if (!this.isReset) {
          this.getAllCandidateComment('filter');
        }
      }
    });
  }

  updateDetailCommentariesFinance(comments) {
    const reference = comments?.comment?.match(/Reference: (.*?)(?=<\/p>)/ || [])?.[1];
    const note = comments?.comment?.match(/Note: (.*?)(?=<\/p>)/ || [])?.[1];

    if (comments?.subject.includes('Delete action')) {
      const data = {
        createdUser: `${
          comments?.created_by?.civility && comments?.created_by?.civility !== 'neutral'
            ? this.translate.instant(comments?.created_by?.civility)
            : ''
        } ${comments?.created_by?.first_name} ${comments?.created_by?.last_name.toUpperCase()}`,
        amount: comments?.payment_amount,
        note: `${note ? note : '-'}`,
        reference: `${reference ? reference : '-'}`,
        typeManual: this.translate.instant(
          'manual_action_finance.manual_action.' + comments?.subject?.slice(comments?.subject.indexOf('action:') + 8),
        ),
        edit: '',
      };

      comments.comment = this.translate.instant('RemoveManualAction.Body', { data });
    } else if (comments?.subject.includes('Edit action')) {
      let edits = '';
      if (comments?.param_comment) {
        const param = JSON.parse(comments.param_comment);
        const mappedParam = this.mappingParamManualActions(param);
        if (mappedParam.date) {
          edits = edits ? edits + ', ' + mappedParam.date : mappedParam.date;
        }

        if (mappedParam.credit) {
          edits = edits ? edits + ', ' + mappedParam.credit : mappedParam.credit;
        }

        if (mappedParam.debit) {
          edits = edits ? edits + ', ' + mappedParam.debit : mappedParam.debit;
        }

        if (mappedParam.initialLegaLentity) {
          edits = edits ? edits + ' , ' + mappedParam.initialLegaLentity : mappedParam.initialLegaLentity;
        }

        if (mappedParam.destionationLegalEntity) {
          edits = edits ? edits + ', ' + mappedParam.destionationLegalEntity : mappedParam.destionationLegalEntity;
        }
      }

      let data = {
        createdUser: `${
          comments?.created_by?.civility && comments?.created_by?.civility !== 'neutral'
            ? this.translate.instant(comments?.created_by?.civility)
            : ''
        } ${comments?.created_by?.first_name} ${comments?.created_by?.last_name.toUpperCase()}`,
        amount: comments?.payment_amount,
        note: `${note ? note : '-'}`,
        reference: `${reference ? reference : '-'}`,
        typeManual: this.translate.instant(
          'manual_action_finance.manual_action.' + comments?.subject?.slice(comments?.subject.indexOf('action:') + 8),
        ),
        edit: edits,
      };

      comments.comment = this.translate.instant('EditManualAction.Body', { data });
      
    } else if (comments?.subject === 'Modification on term') {
      comments.comment = comments.comment.replace('MRS', this.translate.instant('MRS'));
      comments.comment = comments.comment.replace('Mme', this.translate.instant('MRS'));
      comments.comment = comments.comment.replace('Mrs', this.translate.instant('MRS'));
      comments.comment = comments.comment.replace('MR', this.translate.instant('MR'));
      comments.comment = comments.comment.replace('Mr', this.translate.instant('MR'));
      comments.comment = comments.comment.replace('M.', this.translate.instant('MR'));
      // START UAT_450
      comments.subject = comments?.subject?.replace('Modification on term', this.translate.instant('Modification on term'));
      comments.comment = comments?.comment?.replaceAll(
        'Update in the term of',
        this.translate.instant('FINANCE_COMMENTARIES.Update in the term of'),
      );
      comments.comment = comments?.comment?.replace('Nb of terms:', this.translate.instant('FINANCE_COMMENTARIES.Nb of terms'));
      comments.comment = comments?.comment?.replace(
        'Payment method of term',
        this.translate.instant('FINANCE_COMMENTARIES.Payment method of term'),
      );
      comments.comment = comments?.comment?.replaceAll('Amount term', this.translate.instant('FINANCE_COMMENTARIES.Amount term'));
      comments.comment = comments?.comment?.replaceAll('Due date term', this.translate.instant('FINANCE_COMMENTARIES.Due date term'));
      comments.comment = comments?.comment?.replaceAll('No Date', this.translate.instant('FINANCE_COMMENTARIES.No date'));
      comments.comment = comments?.comment?.replaceAll('check', this.translate.instant('PAYMENT_METHODS.check'));
      comments.comment = comments?.comment?.replaceAll('cash', this.translate.instant('PAYMENT_METHODS.cash'));
      comments.comment = comments?.comment?.replaceAll('credit_card', this.translate.instant('PAYMENT_METHODS.credit_card'));
      comments.comment = comments?.comment?.replaceAll('transfer', this.translate.instant('PAYMENT_METHODS.transfer'));
      comments.comment = comments?.comment?.replaceAll('sepa', this.translate.instant('PAYMENT_METHODS.sepa'));
      const utcTimeRegexEN = /utc time/gi;
      const utcTimeRegexFR = /heure utc/gi;
      comments.comment = comments?.comment?.replaceAll(utcTimeRegexEN, this.translate.instant('UTC Time'));
      comments.comment = comments?.comment?.replaceAll(utcTimeRegexFR, this.translate.instant('UTC Time'));
      // END UAT_450
    } else if (comments?.subject.includes('Remove Payment of')) {
      const data = {
        createdUser: `${
          comments?.created_by?.civility && comments?.created_by?.civility !== 'neutral'
            ? this.translate.instant(comments?.created_by?.civility)
            : ''
        } ${comments?.created_by?.first_name} ${comments?.created_by?.last_name.toUpperCase()}`,
        amount: comments?.payment_amount,
        note: `${note ? note : '-'}`,
        reference: `${reference ? reference : '-'}`,
      };
      comments.comment = this.translate.instant('RemovePayment.Body', { data });
    } else {
      comments.comment = comments.comment.replace('MRS', this.translate.instant('MRS'));
      comments.comment = comments.comment.replace('Mme', this.translate.instant('MRS'));
      comments.comment = comments.comment.replace('Mrs', this.translate.instant('MRS'));
      comments.comment = comments.comment.replace('MR', this.translate.instant('MR'));
      comments.comment = comments.comment.replace('Mr', this.translate.instant('MR'));
      comments.comment = comments.comment.replace('M.', this.translate.instant('MR'));
      comments.comment = comments.comment.replace('paid the amount of', this.translate.instant('paid the amount of'));
      comments.comment = comments.comment.replace('The payment of', this.translate.instant('The payment of'));
      comments.comment = comments.comment.replace('paid by', this.translate.instant('paid by'));
      comments.comment = comments.comment.replace('Bank Debit', this.translate.instant('Bank Debit'));
      comments.comment = comments.comment.replace('SEPA Direct Debit', this.translate.instant('SEPA Direct Debit'));
      comments.comment = comments.comment.replace(
        'has been the subject of a “ChargeBack” and has therefore been rejected',
        this.translate.instant('has been the subject of a “ChargeBack” and has therefore been rejected'),
      );
      comments.comment = comments.comment.replace('by bank on the', this.translate.instant('finance_comments.bank'));
      comments.comment = comments.comment.replace('by credit card on the', this.translate.instant('finance_comments.credit_card'));
      comments.comment = comments.comment.replace('by transfer on the', this.translate.instant('finance_comments.transfer'));
      comments.comment = comments.comment.replace('by check on the', this.translate.instant('finance_comments.check'));
      comments.comment = comments.comment.replace('by SEPA on the', this.translate.instant('finance_comments.sepa'));
      comments.comment = comments.comment.replace('by sepa on the', this.translate.instant('finance_comments.sepa'));
      comments.comment = comments.comment.replace('by cash on the', this.translate.instant('finance_comments.cash'));
      comments.comment = comments.comment.replaceAll('The payment was added by', this.translate.instant('finance_comments.the_payment'));
      comments.comment = comments.comment.replace('from', this.translate.instant('finance_comments.from'));
      comments.comment = comments.comment.replace('by', this.translate.instant('finance_comments.by'));
      comments.comment = comments.comment.replace('Reference', this.translate.instant('Référence'));
      comments.comment = comments.comment.replace('An avoir of', this.translate.instant('An avoir of'));
      comments.comment = comments?.comment?.replace('A refund of', this.translate.instant('A Refund of'));
      comments.comment = comments.comment.replace('was made the', this.translate.instant('was made the'));
      comments.comment = comments.comment.replace(/to\s/, this.translate.instant('to') + ' ');
      comments.comment = comments.comment.replaceAll('add_manual_payment', this.translate.instant('Add manual payment'));
      comments.comment = comments.comment.replaceAll(
        /[^re]admission_form/g,
        ' ' + this.translate.instant('finance_comments.admission_form'),
      );
      comments.comment = comments.comment.replaceAll(/readmission_form/g, this.translate.instant('finance_comments.readmission_form'));
      comments.comment = comments.comment.replaceAll('asking_payment', this.translate.instant('finance_comments.asking_payment'));
      comments.comment = comments.comment.replaceAll('auto_debit', this.translate.instant('Auto Debit'));
      comments.comment = comments.comment.replace('the', this.translate.instant('the'));
      const utcTimeRegexEN = /utc time/gi;
      const utcTimeRegexFR = /heure utc/gi;
      comments.comment = comments?.comment?.replaceAll(utcTimeRegexEN, this.translate.instant('UTC Time'));
      comments.comment = comments?.comment?.replaceAll(utcTimeRegexFR, this.translate.instant('UTC Time'));
    }
  }

  mappingParamManualActions(param) {
    let date;
    let credit;
    let debit;
    let initialLegaLentity;
    let destionationLegalEntity;

    if (param?.date_action && param?.old_date_action) {
      date = this.translate.instant('Date') + ': ' + param.old_date_action + ' &#8594 ' + param.date_action;
    }

    if (param?.credit && param?.old_credit) {
      credit = this.translate.instant('Amount') + ': ' + param.old_credit + ' &#8594 ' + param.credit;
    }

    if (param?.debit && param?.old_debit) {
      debit = this.translate.instant('Amount') + ': ' + param.old_debit + ' &#8594 ' + param.debit;
    }

    if (param?.initial_legal_entity_id && param?.old_initial_legal_entity_id) {
      initialLegaLentity =
        this.translate.instant('Initial legal entity') +
        ': ' +
        param.old_initial_legal_entity_id +
        ' &#8594 ' +
        param.initial_legal_entity_id;
    }

    if (param?.destination_legal_entity_id && param?.old_destination_legal_entity_id) {
      destionationLegalEntity =
        this.translate.instant('Legal entity of destination') +
        ': ' +
        param.old_destination_legal_entity_id +
        ' &#8594 ' +
        param.destination_legal_entity_id;
    }

    return {
      date,
      credit,
      debit,
      initialLegaLentity,
      destionationLegalEntity,
    };
  }

  updateDetailCommentaries(comments) {
    comments.comment = comments.comment?.replaceAll('<p>The student', this.translate.instant('Transfer_Program.The student'));
    comments.comment = comments.comment?.replaceAll(
      'has been transferred from',
      this.translate.instant('Transfer_Program.has been transferred from'),
    );
    comments.comment = comments.comment?.replace(/to\s/, this.translate.instant('Transfer_Program.to') + ' ');
    comments.comment = comments.comment?.replaceAll('\n    the', this.translate.instant('Transfer_Program.\n    the'));
    comments.comment = comments.comment?.replaceAll('by', this.translate.instant('Transfer_Program.by'));
    comments.comment = comments.comment?.replaceAll('MRS', this.translate.instant('MRS'));
    comments.comment = comments.comment?.replaceAll('Mme', this.translate.instant('MRS'));
    comments.comment = comments.comment?.replaceAll('Mrs', this.translate.instant('MRS'));
    comments.comment = comments.comment?.replaceAll('MR', this.translate.instant('MR'));
    comments.comment = comments.comment?.replaceAll('Mr', this.translate.instant('MR'));
    comments.comment = comments.comment?.replaceAll('M.', this.translate.instant('MR'));
    const utcTimeRegexEN = /utc time/gi;
    const utcTimeRegexFR = /heure utc/gi;
    comments.comment = comments?.comment?.replaceAll(utcTimeRegexEN, this.translate.instant('UTC Time'));
    comments.comment = comments?.comment?.replaceAll(utcTimeRegexFR, this.translate.instant('UTC Time'));
    comments.comment = comments?.comment?.replaceAll('Zettaparte platform (Request from EDH Asana)', this.translate.instant('Transfer_Program.Zettabyte platform'));
  }

  updateDetailCommentariesManualActions(comments, type) {
    let amount = 0;
    let note = '';
    let reference = '';
    amount = comments?.payment_amount;
    if (comments?.master_transaction_id) {
      reference = comments?.master_transaction_id?.reference;
      note = comments?.master_transaction_id?.note;
    } else {
      amount = comments?.subject?.slice(comments?.subject.indexOf('of ') + 3, comments?.subject.indexOf('EUR'));
      reference = comments?.comment?.slice(comments?.comment?.indexOf('Reference: ') + 10, comments?.comment?.indexOf('Note: '));
      note = comments?.comment?.slice(comments?.comment?.indexOf('Note: ') + 5);
    }

    const data = {
      createdUser: `${
        comments?.created_by?.civility && comments?.created_by?.civility !== 'neutral'
          ? this.translate.instant(comments?.created_by?.civility)
          : ''
      } ${comments?.created_by?.first_name} ${comments?.created_by?.last_name.toUpperCase()}`,
      manualAction: this.translate.instant('manual_action_finance.manual_action.' + comments?.category.slice(10)),
      amount,
      note,
      reference,
    };

    if (comments?.master_transaction_id) {
      comments.comment = this.translate.instant('Commentaries_Manual_Actions', {
        createdUser: data?.createdUser,
        manualActions: data?.manualAction,
        amount: data?.amount,
        note: data?.note ? data?.note : '-',
        reference: data?.reference ? data?.reference : '-',
      });
    } else {
      comments.comment = this.translate.instant('Commentaries_Manual_Actions_Non_Master', {
        createdUser: data?.createdUser,
        manualActions: data?.manualAction,
        amount: data?.amount,
        note: data?.note ? data?.note : '-',
        reference: data?.reference ? data?.reference : '-',
      });
    }
  }

  updateTranslateCategory(category) {
    if (this.listManualActions.includes(category)) {
      const translated = `manual_action_finance.category.${category}`;
      return this.translate.instant(translated);
    } else {
      return category;
    }
  }

  getAllCandidateComment(form?) {
    this.isWaitingForResponse = true;
    this.candidateComments = [];
    this.subs.sink = this.candidateService.GetAllCandidateComments(this.filteredValues).subscribe(
      (resp) => {
        if (!resp) {
          this.candidateComments = [];
          this.isReset = false;
          if (!form) {
            this.getCandidateCommentFilter();
          } else {
            this.isWaitingForResponse = false;
          }
          return;
        } else {
          console.log('_test', resp);
          this.originalComments = _.cloneDeep(resp);
          const tmpData = _.cloneDeep(resp);
          tmpData.forEach((comments) => {
            if (comments?.category === 'Finance') {
              this.updateDetailCommentariesFinance(comments);
            } else if (comments?.subject === 'Transfer of program') {
              // UAT_744 - Transfer Program
              this.updateDetailCommentaries(comments);
            } else {
              if (this.listManualActions.includes(comments?.category)) {
                this.updateDetailCommentariesManualActions(comments, comments?.category);
              } else {
                // UAT759
                let reference = null;
                if (comments?.category === 'Finance') {
                  const temp = comments.comment.includes('Reference:') ? comments.comment.split('Reference:') : [];
                  reference = temp?.length === 2 ? 'Reference:' + temp[1] : null;
                  comments.comment = temp?.length === 2 ? temp[0] : comments.comment;
                }
                const utcTimeRegexEN = /utc time/gi;
                const utcTimeRegexFR = /heure utc/gi;
                comments.comment = comments?.comment?.replaceAll(utcTimeRegexEN, this.translate.instant('UTC Time'));
                comments.comment = comments?.comment?.replaceAll(utcTimeRegexFR, this.translate.instant('UTC Time'));
                comments.comment = comments?.comment?.replace('MRS', this.translate.instant('MRS'));
                comments.comment = comments?.comment?.replace('Mme', this.translate.instant('MRS'));
                comments.comment = comments?.comment?.replace('Mrs', this.translate.instant('MRS'));
                comments.comment = comments?.comment?.replace('MR', this.translate.instant('MR'));
                comments.comment = comments?.comment?.replace('Mr', this.translate.instant('MR'));
                comments.comment = comments?.comment?.replace('M.', this.translate.instant('MR'));
                comments.comment = comments?.comment?.replace('An avoir of', this.translate.instant('An avoir of'));
                comments.comment = comments?.comment?.replace('A refund of', this.translate.instant('A Refund of'));
                comments.comment = comments?.comment?.replace('was made the', this.translate.instant('was made the'));
                (comments.comment = comments?.comment?.replace('The payment of', this.translate.instant('The payment of'))),
                  (comments.comment = comments?.comment?.replace(
                    'EUR paid by SEPA Direct Debit\n                    the',
                    this.translate.instant('EUR paid by SEPA Direct Debit the'),
                  )),
                  (comments.comment = comments?.comment?.replace(
                    'EUR paid by SEPA Direct Debit\n                      the',
                    this.translate.instant('EUR paid by SEPA Direct Debit the'),
                  )),
                  (comments.comment = comments?.comment?.replace(
                    'has been the subject of a “ChargeBack” and has therefore been rejected',
                    this.translate.instant('has been the subject of a “ChargeBack” and has therefore been rejected'),
                  )),
                  (comments.comment = comments?.comment?.replace('Reference', this.translate.instant('Référence')));
                comments.comment = comments?.comment?.replace(
                  'There has been some modification on the terms',
                  this.translate.instant('There has been some modification on the terms'),
                );
                comments.subject = comments?.subject?.replace('Avoir of', this.translate.instant('Avoir of'));
                comments.subject = comments?.subject?.replace('Refund of', this.translate.instant('Refund of'));
                comments.subject = comments?.subject?.replace('Payment of', this.translate.instant('Payment of'));

                if (comments.subject === 'Status Change') {
                  comments.subject = comments?.subject?.replace('Status Change', this.translate.instant('Status Change'));
                }
                if (comments.category === 'Status') {
                  comments.category = comments?.category?.replace('Status', this.translate.instant('Status'));
                }
                comments.comment = comments?.comment?.replace(
                  'The status of the student has been changed the',
                  this.translate.instant('The status of the student has been changed the'),
                );
                comments.comment = comments?.comment?.replace('Reason:', this.translate.instant('Reason:'));
                comments.comment = comments?.comment?.replace(
                  'Resigned after school begins',
                  this.translate.instant('Resigned after school begins'),
                );
                comments.subject = comments?.subject?.replace(
                  'Change status special case',
                  this.translate.instant('Change status special case'),
                );
                comments.comment = comments.comment.replace('No Show', this.translate.instant('No Show'));
                comments.comment = comments.comment.replace('registered', this.translate.instant('registered'));

                // UAT_759
                comments.comment = comments.comment.replaceAll('auto_debit', this.translate.instant('Auto Debit'));
                comments.comment = comments.comment.replaceAll('asking_payment', this.translate.instant('Asking payment'));
                comments.comment = comments.comment.replaceAll('admission_form', this.translate.instant('Admission Form'));
                comments.comment = comments.comment.replaceAll('readmission_form', this.translate.instant('Readmission form'));
                comments.comment = comments.comment.replaceAll('add_manual_payment', this.translate.instant('Add manual payment'));
                comments.comment = comments.comment.replace('Add manual payment', this.translate.instant('Add manual payment'));
                if (comments.category !== 'Finance') {
                  comments.comment = comments.comment.replace('from', this.translate.instant('from'));
                  comments.comment = comments.comment.replace(/to\s/, this.translate.instant('to') + ' ');
                  comments.comment = comments.comment.replace('by transfer on the', this.translate.instant('finance_comments.transfer'));
                  comments.comment = comments.comment.replaceAll('by', this.translate.instant('by'));
                  comments.comment = comments.comment.replaceAll('on the', this.translate.instant('on the'));
                  comments.comment = comments.comment.replace('Reference', this.translate.instant('Référence'));
                }
              }
            }
          });
          this.candidateComments = tmpData;
          this.isReset = false;
          if (!form) {
            this.getCandidateCommentFilter();
          } else {
            this.isWaitingForResponse = false;
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
        return;
      },
    );
  }

  translateFinanceHistory() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.config.placeholder = this.translate.instant('Answer');
      if (this.originalComments && this.originalComments.length) {
        const datas = _.cloneDeep(this.originalComments);
        datas.forEach((comments) => {
          if (comments?.category === 'Finance') {
            this.updateDetailCommentariesFinance(comments);
          } else if (comments?.subject === 'Transfer of program') {
            this.updateDetailCommentaries(comments);
          } else {
            if (this.listManualActions.includes(comments?.category)) {
              this.updateDetailCommentariesManualActions(comments, comments?.category);
            } else {
              // UAT759
              let reference = null;
              if (comments?.category === 'Finance') {
                const temp = comments.comment.includes('Reference:') ? comments.comment.split('Reference:') : [];
                reference = temp?.length === 2 ? 'Reference:' + temp[1] : null;
                comments.comment = temp?.length === 2 ? temp[0] : comments.comment;
              }
              const utcTimeRegexEN = /utc time/gi;
              const utcTimeRegexFR = /heure utc/gi;
              comments.comment = comments?.comment?.replaceAll(utcTimeRegexEN, this.translate.instant('UTC Time'));
              comments.comment = comments?.comment?.replaceAll(utcTimeRegexFR, this.translate.instant('UTC Time'));
              comments.comment = comments?.comment?.replace('MRS', this.translate.instant('MRS'));
              comments.comment = comments?.comment?.replace('Mme', this.translate.instant('MRS'));
              comments.comment = comments?.comment?.replace('Mrs', this.translate.instant('MRS'));
              comments.comment = comments?.comment?.replace('MR', this.translate.instant('MR'));
              comments.comment = comments?.comment?.replace('Mr', this.translate.instant('MR'));
              comments.comment = comments?.comment?.replace('M.', this.translate.instant('MR'));
              comments.comment = comments?.comment?.replace('An avoir of', this.translate.instant('An avoir of'));
              comments.comment = comments?.comment?.replace('A refund of', this.translate.instant('A Refund of'));
              comments.comment = comments?.comment?.replace('was made the', this.translate.instant('was made the'));
              (comments.comment = comments?.comment?.replace('The payment of', this.translate.instant('The payment of'))),
                (comments.comment = comments?.comment?.replace(
                  'EUR paid by SEPA Direct Debit\n                    the',
                  this.translate.instant('EUR paid by SEPA Direct Debit the'),
                )),
                (comments.comment = comments?.comment?.replace(
                  'EUR paid by SEPA Direct Debit\n                      the',
                  this.translate.instant('EUR paid by SEPA Direct Debit the'),
                )),
                (comments.comment = comments?.comment?.replace(
                  'has been the subject of a “ChargeBack” and has therefore been rejected',
                  this.translate.instant('has been the subject of a “ChargeBack” and has therefore been rejected'),
                )),
                (comments.comment = comments?.comment?.replace('Reference', this.translate.instant('Référence')));
              comments.comment = comments?.comment?.replace(
                'There has been some modification on the terms',
                this.translate.instant('There has been some modification on the terms'),
              );
              comments.subject = comments?.subject?.replace('Avoir of', this.translate.instant('Avoir of'));
              comments.subject = comments?.subject?.replace('Refund of', this.translate.instant('Refund of'));
              comments.subject = comments?.subject?.replace('Payment of', this.translate.instant('Payment of'));

              if (comments.subject === 'Status Change') {
                comments.subject = comments?.subject?.replace('Status Change', this.translate.instant('Status Change'));
              }
              if (comments.category === 'Status') {
                comments.category = comments?.category?.replace('Status', this.translate.instant('Status'));
              }
              comments.comment = comments?.comment?.replace(
                'The status of the student has been changed the',
                this.translate.instant('The status of the student has been changed the'),
              );
              comments.comment = comments?.comment?.replace('Reason:', this.translate.instant('Reason:'));
              comments.comment = comments?.comment?.replace(
                'Resigned after school begins',
                this.translate.instant('Resigned after school begins'),
              );
              comments.subject = comments?.subject?.replace(
                'Change status special case',
                this.translate.instant('Change status special case'),
              );
              comments.comment = comments.comment.replace('No Show', this.translate.instant('No Show'));
              comments.comment = comments.comment.replace('registered', this.translate.instant('registered'));

              // UAT_759
              comments.comment = comments.comment.replaceAll('auto_debit', this.translate.instant('Auto Debit'));
              comments.comment = comments.comment.replaceAll('asking_payment', this.translate.instant('Asking payment'));
              comments.comment = comments.comment.replaceAll('admission_form', this.translate.instant('Admission Form'));
              comments.comment = comments.comment.replaceAll('readmission_form', this.translate.instant('Readmission form'));
              comments.comment = comments.comment.replaceAll('add_manual_payment', this.translate.instant('Add manual payment'));
              comments.comment = comments.comment.replace('Add manual payment', this.translate.instant('Add manual payment'));
              if (comments.category !== 'Finance') {
                comments.comment = comments.comment.replace('from', this.translate.instant('from'));
                comments.comment = comments.comment.replace(/to\s/, this.translate.instant('to') + ' ');
                comments.comment = comments.comment.replace('by transfer on the', this.translate.instant('finance_comments.transfer'));
                comments.comment = comments.comment.replaceAll('by', this.translate.instant('by'));
                comments.comment = comments.comment.replaceAll('on the', this.translate.instant('on the'));
                comments.comment = comments.comment.replace('Reference', this.translate.instant('Référence'));
              }
            }
          }
        });
        this.candidateComments = datas;
      }
    });
  }

  getCandidateCommentFilter() {
    this.userFilterList = [];
    this.dateFilterList = [];
    const filteredValues = {
      candidate_ids: this.candidateIds,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.GetCandidateCommentsFilterList(filteredValues).subscribe(
      (resp) => {
        if (!resp.length) {
          this.userFilterList = [
            {
              name: '',
              key: this.translate.instant('No items found'),
              disabled: true,
            },
          ];
          this.dateFilterList = [
            {
              date: '',
              key: this.translate.instant('No items found'),
              disabled: true,
            },
          ];
          this.isReset = false;
          this.isWaitingForResponse = false;
          return;
        } else {
          console.log(resp);
          const filterData = _.cloneDeep(resp);
          filterData.forEach((filters) => {
            if (
              filters &&
              filters.created_by &&
              filters.created_by.first_name &&
              filters.created_by.last_name &&
              filters.is_reply === false
            ) {
              const name = {
                name: filters.created_by.first_name + ' ' + filters.created_by.last_name,
                key: filters.created_by.first_name + ' ' + filters.created_by.last_name,
              };
              this.userFilterList.push(name);
            }
            if (filters && filters.date_created && filters.is_reply === false) {
              const date = {
                date: this.transformDate(filters.date_created),
                key: this.transformDate(filters.date_created),
              };
              this.dateFilterList.push(date);
            }
          });
          this.userFilterList = _.uniqBy(this.userFilterList, 'name');
          this.dateFilterList = _.uniqBy(this.dateFilterList, 'date');
          console.log('filterData', this.userFilterList, this.dateFilterList);
          this.isReset = false;
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  hideEditDeleteButton(comment) {
    let allow = false;
    if (comment?.master_transaction_id || comment?.master_transaction_id?.is_manual_action) {
      allow = false;
      return allow;
    } else if (this.currentUser._id && comment.created_by && comment.created_by._id) {
      allow = this.currentUser._id === comment.created_by._id ? true : false;
      return allow;
    } else {
      return allow;
    }
  }

  transformDate(data) {
    if (data) {
      const date = data;
      const datee = moment(date).format('DD/MM/YYYY');
      return datee;
    } else {
      return '';
    }
  }
  transformUTCtoLocal(data) {
    if (data) {
      const date = data;
      const time = moment(date).format('HH:mm');
      let datee = this.parseUTCToLocalPipe.fixDateFormat(data);
      datee = moment(datee, 'DD/MM/YYYYHH:mm').format('DD/MM/YYYY');
      return datee;
    } else {
      return '';
    }
  }

  parseTimeToLocal(createdAt) {
    const time = createdAt.time;
    if (time) {
      const parsed = this.parseUTCToLocalPipe.transform(time);
      return parsed;
    } else {
      return '';
    }
  }

  transformTimeLocal(data) {
    if (data) {
      const date = data;
      const time = moment(date).format('HH:mm:ss');
      return time;
    } else {
      return '';
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  getFeedItems(queryText) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.allDataUser && this.allDataUser.length) {
          if (!queryText) {
            this.allUser = this.allDataUser
              .map((newData) => {
                return '@' + newData.last_name + ' ' + newData.first_name;
              })
              .slice(0, 4);
            resolve(this.allUser);
          } else {
            const itemsToDisplay = this.allDataUser.filter((user) => {
              let userName = this.utilService.simpleDiacriticSensitiveRegex((user.last_name + user.first_name).toLowerCase());
              userName = userName.toLowerCase().trim();

              let searchString = this.utilService.simpleDiacriticSensitiveRegex(queryText.toLowerCase());
              searchString = searchString.toLowerCase().trim();

              return userName.includes(searchString);
            });

            this.allUser = itemsToDisplay.map((newData) => {
              return '@' + newData.last_name.toUpperCase() + ' ' + newData.first_name;
            });

            resolve(this.allUser);
          }
        }
      }, 50);
    });
  }

  initAddCommentForm() {
    this.form = this.fb.group({
      candidate_id: [this.candidateId],
      created_by: [this.currentUser._id],
      comment: [null, Validators.required],
      is_personal_situation: [false],
      is_restrictive_conditions: [false],
      reply_comment_ids: [null],
      reply_for_comment_id: [null],
      tagged_user_ids: [null],
      category: [null],
      is_reply: [true],
    });
  }

  getUserTagged() {
    let noteText = this.utilService.cleanHTML(this.commentForm.value).split(' ');
    let taggedName = [];
    let foundIndex = false;
    let lengthIndex;
    noteText.forEach((res) => {
      if (res.includes('@')) {
        const removeAt = res.substr(1, res.length);
        taggedName.push(removeAt);
        foundIndex = true;
        lengthIndex = taggedName.length;
        return;
      }
      if (foundIndex) {
        taggedName[lengthIndex - 1] = taggedName[lengthIndex - 1] + ' ' + res;
        foundIndex = false;
      }
    });
    let taggedIdUser = [];
    taggedName.forEach((element) => {
      let foundedlists = [];
      let splited = element.split(' ');
      for (let index = 0; index < splited.length; index++) {
        this.allDataUser.find((userlist) => {
          if (
            userlist &&
            userlist.last_name &&
            userlist.first_name &&
            userlist.last_name.toLowerCase().includes(splited[index].toLowerCase()) &&
            userlist.first_name === splited[splited.length - 1]
          ) {
            foundedlists.push(userlist);
            taggedIdUser.push(userlist._id);
          }
        });
      }
    });
    return taggedIdUser;
  }

  submit(payload) {
    if (payload && payload.candidate_id && payload.candidate_id._id) {
      payload.candidate_id = payload.candidate_id._id;
    }
    if (payload && payload.created_by && payload.created_by._id) {
      payload.created_by = this.currentUser._id;
    }
    if (payload && payload.reply_for_comment_id && payload.reply_for_comment_id._id) {
      payload.reply_for_comment_id = payload.reply_for_comment_id._id;
    }
    if (payload && payload.reply_comment_ids && payload.reply_comment_ids.length) {
      payload.reply_comment_ids = payload.reply_comment_ids.map((ressp) => ressp._id);
    } else {
      payload.reply_comment_ids = null;
    }
    if (payload && payload.tagged_user_ids && payload.tagged_user_ids.length) {
      payload.tagged_user_ids = payload.tagged_user_ids.map((ressp) => ressp._id);
    } else {
      payload.tagged_user_ids = null;
    }
    payload['tagged_user_ids'] = this.getUserTagged();
    this.form.patchValue(payload);
    const payloads = _.cloneDeep(this.form.value);
    payloads.reply_for_comment_id = payload._id;
    payloads.comment = this.commentForm.value;
    payloads.is_reply = true;
    delete payloads.reply_comment_ids;
    this.subs.sink = this.candidateService.CreateCandidateComment(payloads).subscribe(
      (resp) => {
        if (resp) {
          this.resetComment();
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  transformTime(data) {
    if (data) {
      const date = data;
      const datee = moment(date).format('HH:mm');
      return datee;
    } else {
      return '';
    }
  }

  resetComment() {
    this.isReset = true;
    this.filteredValues = {
      candidate_ids: this.candidateIds,
      subject: '',
      comment_body: '',
      created_by: '',
      date_comment_created: '',
      category: '',
    };

    this.filterForm.controls['searchCommentFilter'].setValue(null, { emitEvent: false });
    this.filterForm.controls['userFilter'].setValue(null, { emitEvent: false });
    this.filterForm.controls['dateFilter'].setValue(null, { emitEvent: false });
    this.filterForm.controls['categoryFilter'].setValue(null, { emitEvent: false });
    this.commentForm.setValue('', { emitEvent: false });
    this.getAllCandidateComment();
    this.getAllCandidateCommentCategories();
  }

  addComment() {
    this.subs.sink = this.dialog
      .open(StudentCommentariesDialogComponent, {
        width: '900px',
        minHeight: '100px',
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        panelClass: 'dark-mode-pop-up',
        data: {
          candidateId: this.candidateId,
          currentUser: this.currentUser,
          allUser: this.allUser,
          allDataUser: this.allDataUser,
          isEdit: false,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetComment();
        }
      });
  }

  getSubject(subject: any) {
    const n = subject.lastIndexOf(' ');
    const status = subject.substring(n + 1);
    const listStatus = [
      'admission_in_progress',
      'engaged',
      'registered',
      'resigned',
      'resigned_after_engaged',
      'resigned_after_registered',
      'bill_validated',
      'financement_validated',
      'mission_card_validated',
      'in_scholarship',
      'resignation_missing_prerequisites',
      'no_show',
      'resign_after_school_begins',
    ];
    if (subject.includes('Edit action')) {
      subject = subject.replace(
        subject?.slice(subject.indexOf('action:') + 8),
        this.translate.instant('manual_action_finance.manual_action.' + subject?.slice(subject.indexOf('action:') + 8)),
      );
      subject = subject.replace('Edit action:', this.translate.instant('EditManualAction.action'));
      return subject;
    } else if (subject.includes('Delete action')) {
      subject = subject.replace(
        subject?.slice(subject.indexOf('action:') + 8),
        this.translate.instant('manual_action_finance.manual_action.' + subject?.slice(subject.indexOf('action:') + 8)),
      );
      subject = subject.replace('Delete action:', this.translate.instant('RemoveManualAction.action'));
      return subject;
    } else if (listStatus.includes(status)) {
      subject = subject.replace('Status change to', this.translate.instant('manual_action_finance.subject.Status change to'));
      subject = subject.replace('Changement de statut', this.translate.instant('manual_action_finance.subject.Status change to'));
      subject = subject.replace(status, this.translate.instant(status));
      return subject;
    } else if (subject.includes('Remove Payment of')) {
      subject = subject?.replace('Remove Payment of', this.translate.instant('RemovePayment.Remove Payment of'));
      return subject;
    } else if (subject === 'Transfer of program') {
      return this.translate.instant(subject);
    } else if (subject.includes('Payment line of')) {
      subject = subject?.replace('Payment line of', this.translate.instant('manual_action_finance.subject.Payment line of'));
      return subject;
    } else if (subject.includes('Billing of')) {
      subject = subject?.replace('Billing of', this.translate.instant('manual_action_finance.subject.Billing of'));
      return subject;
    } else if (subject.includes('Avoir of')) {
      subject = subject?.replace('Avoir of', this.translate.instant('manual_action_finance.subject.Avoir of'));
      return subject;
    } else if (subject.includes('Refund of')) {
      subject = subject?.replace('Refund of', this.translate.instant('manual_action_finance.subject.Refund of'));
      return subject;
    } else if (subject.includes('OD cash transfer of')) {
      subject = subject?.replace('OD cash transfer of', this.translate.instant('manual_action_finance.subject.OD cash transfer of'));
      return subject;
    } else if (subject.includes('OD student balance adjustment of')) {
      subject = subject?.replace(
        'OD student balance adjustment of',
        this.translate.instant('manual_action_finance.subject.OD student balance adjustment of'),
      );
      return subject;
    } else if (subject.includes('Payment of') && !subject.includes('Remove Payment of')) {
      subject = subject?.replace('Payment of', this.translate.instant('Payment of'));
      return subject;
    } else if (subject.includes('Charge Back payment of')) {
      subject = subject?.replace('Charge Back payment of', this.translate.instant('Charge Back payment of'));
      return subject;
    } else {
      return subject;
    }
  }

  editComment(comment) {
    this.subs.sink = this.dialog
      .open(StudentCommentariesDialogComponent, {
        width: '900px',
        minHeight: '100px',
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        panelClass: 'dark-mode-pop-up',
        data: {
          candidateId: this.candidateId,
          currentUser: this.currentUser,
          allUser: this.allUser,
          allDataUser: this.allDataUser,
          isEdit: true,
          commentToEdit: comment._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.resetComment();
        }
      });
  }

  deleteComment(comment) {
    this.isWaitingForResponse = true;
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('Delete_Comment.title'),
      text: this.translate.instant('Delete_Comment.text'),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Delete_Comment.YES', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('Delete_Comment.Cancel'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('Delete_Comment.YES') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('Delete_Comment.YES');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((resp) => {
      clearTimeout(this.timeOutVal);
      if (resp.value) {
        this.subs.sink = this.candidateService.DeleteCandidateComment(comment._id).subscribe(
          (resp) => {
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo'),
                confirmButtonText: this.translate.instant('OK'),
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then((res) => {
                if (res.value) {
                  this.resetComment();
                  this.isWaitingForResponse = false;
                }
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  checkAutoReply() {
    const activatedRoute = this.route?.snapshot?.queryParams;
    if (activatedRoute?.selectedComment) {
      this.replyComment(activatedRoute?.selectedComment);
    }
  }

  formatDate(isoString: string): string {
    if(isoString) {
      const date = moment?.utc(isoString);
      return date?.format('DD/MM/YYYY - HH:mm:ss');  
    }
  }

  convertISODatetoLocal(date) {
    const timestamp = new Date(date);
    const formattedDate = moment(timestamp).format('DD/MM/YYYY');
    return formattedDate;
  }

  ngOnDestroy() {
    clearInterval(this.intVal);
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }
}
