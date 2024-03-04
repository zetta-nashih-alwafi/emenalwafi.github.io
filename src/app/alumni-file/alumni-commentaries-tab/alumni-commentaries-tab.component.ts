import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ApplicationUrls } from 'app/shared/settings';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AlumniCommentariesDialogComponent } from './alumni-commentaries-dialog/alumni-commentaries-dialog.component';
import { AlumniReplyCommentariesDialogComponent } from './alumni-reply-commentaries-dialog/alumni-reply-commentaries-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { UsersService } from 'app/service/users/users.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { CoreService } from 'app/service/core/core.service';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-alumni-commentaries-tab',
  templateUrl: './alumni-commentaries-tab.component.html',
  styleUrls: ['./alumni-commentaries-tab.component.scss'],
})
export class AlumniCommentariesTabComponent implements OnInit, OnDestroy, OnChanges {
  public Editor = DecoupledEditor;
  @Input() candidateId;
  @Input() userData;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
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
    alumni_id: '',
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
  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private alumniService: AlumniService,
    public dialog: MatDialog,
    private authService: AuthService,
    public utilService: UtilityService,
    private coreService: CoreService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    // this.updatePageTitle();
    this.getAllAlumniCommentCategories();
    this.initForm();
    this.initAddCommentForm();
    this.initFilter();
    if (this.candidateId) {
      this.filteredValues.alumni_id = this.candidateId;
      this.getAllAlumniComment();
      this.getAlumniCommentFilter();
    }
    if (this.userData && this.userData.length) {
      this.getAllUsers(this.userData);
    }
    this.config['mention'] = {
      feeds: [
        {
          marker: '@',
          feed: (query) => this.getFeedItems(query),
          minimumCharacters: 3,
        },
      ],
    };
    this.translateFinanceHistory();
    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
  }

  getAllAlumniCommentCategories() {
    this.subs.sink = this.alumniService.GetAllAlumniCommentCategories().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.categoryFilterList = resp;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  // updatePageTitle() {
  // this.pageTitleService.setTitle(this.translate.instant('Student Card Commentaries'));
  // this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
  //   this.pageTitleService.setTitle(this.translate.instant('Student Card Commentaries'));
  // });
  // }

  getCurrentUser() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isUserAdmtc = this.utilService.isUserEntityADMTC();
    this.isUserAcaDirAdmin = this.utilService.isUserAcadDirAdmin();
    if (this.isUserAdmtc) {
      this.entityData = this.currentUser.entities.find((entity) => entity.entity_name === 'admtc');
    } else if (this.isUserAcaDirAdmin) {
      this.entityData = this.currentUser.entities.find((entity) => entity.type.name === 'Academic Director');
    }
  }

  replyComment(_id) {
    this.subs.sink = this.dialog
      .open(AlumniReplyCommentariesDialogComponent, {
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
    this.isWaitingForResponse = false;
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
          minimumCharacters: 3,
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
    }
    // this.updatePageTitle();
    this.initForm();
    this.initFilter();
    if (this.candidateId) {
      this.filteredValues.alumni_id = this.candidateId;
      this.getAllAlumniComment();
      this.getAlumniCommentFilter();
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
        this.getAllAlumniComment();
      }
    });

    this.subs.sink = this.filterForm.controls['dateFilter'].valueChanges.subscribe((value) => {
      this.filteredValues.date_comment_created = value === 'AllF' ? '' : value;
      if (!this.isReset) {
        this.getAllAlumniComment();
      }
    });

    this.subs.sink = this.filterForm.controls['categoryFilter'].valueChanges.subscribe((value) => {
      this.filteredValues.category = value === 'AllF' ? '' : value;
      if (!this.isReset) {
        this.getAllAlumniComment();
      }
    });

    this.subs.sink = this.filterForm.controls['searchCommentFilter'].valueChanges.pipe(debounceTime(400)).subscribe((commentSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (commentSearch && !commentSearch.match(symbol) && !commentSearch.match(symbol1)) {
        this.filteredValues.comment_body = commentSearch;
        if (!this.isReset) {
          this.getAllAlumniComment();
        }
      } else {
        this.filteredValues.comment_body = '';
        if (!this.isReset) {
          this.getAllAlumniComment();
        }
      }
    });
  }

  getAllAlumniComment() {
    this.isWaitingForResponse = true;
    this.candidateComments = [];
    this.subs.sink = this.alumniService.GetAllAlumniComments(this.filteredValues).subscribe(
      (resp) => {
        if (!resp) {
          this.candidateComments = [];
          this.isReset = false;
          this.isWaitingForResponse = false;
          return;
        } else {
          this.originalComments = _.cloneDeep(resp);
          const tmpData = _.cloneDeep(resp);
          tmpData.forEach((comments) => {
            comments.comment = comments.comment.replace('MRS', this.translate.instant('MRS'));
            comments.comment = comments.comment.replace('Mme', this.translate.instant('MRS'));
            comments.comment = comments.comment.replace('Mrs', this.translate.instant('MRS'));
            comments.comment = comments.comment.replace('MR', this.translate.instant('MR'));
            comments.comment = comments.comment.replace('Mr', this.translate.instant('MR'));
            comments.comment = comments.comment.replace('M.', this.translate.instant('MR'));
            comments.comment = comments.comment.replace('paid the amount of', this.translate.instant('paid the amount of'));
            comments.comment = comments.comment.replace('by bank on the', this.translate.instant('finance_comments.bank'));
            comments.comment = comments.comment.replace('by credit card on the', this.translate.instant('finance_comments.credit_card'));
            comments.comment = comments.comment.replace('by transfer on the', this.translate.instant('finance_comments.transfer'));
            comments.comment = comments.comment.replace('by check on the', this.translate.instant('finance_comments.check'));
            comments.comment = comments.comment.replace('by SEPA on the', this.translate.instant('finance_comments.sepa'));
            comments.comment = comments.comment.replace('An avoir of', this.translate.instant('An avoir of'));
            comments.comment = comments.comment.replace('A refund of', this.translate.instant('A Refund of'));
            comments.comment = comments.comment.replace('was made the', this.translate.instant('was made the'));
            comments.comment = comments.comment.replace('to', this.translate.instant('to'));
            (comments.comment = comments.comment.replace('The payment of', this.translate.instant('The payment of'))),
              (comments.comment = comments.comment.replace(
                'EUR paid by SEPA Direct Debit\n                    the',
                this.translate.instant('EUR paid by SEPA Direct Debit the'),
              )),
              (comments.comment = comments.comment.replace(
                'has been the subject of a “ChargeBack” and has therefore been rejected',
                this.translate.instant('has been the subject of a “ChargeBack” and has therefore been rejected'),
              )),
              (comments.comment = comments.comment.replace('from', this.translate.instant('from')));
            comments.comment = comments.comment.replace('Reference', this.translate.instant('Référence'));
            comments.comment = comments.comment.replace(
              'There has been some modification on the terms',
              this.translate.instant('There has been some modification on the terms'),
            );
            comments.subject = comments.subject.replace('Modification on term', this.translate.instant('Modification on term'));
            comments.subject = comments.subject.replace('Avoir of', this.translate.instant('Avoir of'));
            comments.subject = comments.subject.replace('Refund of', this.translate.instant('Refund of'));
            comments.subject = comments.subject.replace('Payment of', this.translate.instant('Payment of'));
          });
          this.candidateComments = tmpData;
          this.isReset = false;
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  translateFinanceHistory() {
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      if (this.originalComments && this.originalComments.length) {
        const datas = _.cloneDeep(this.originalComments);
        datas.forEach((comments) => {
          comments.comment = comments.comment.replace('MRS', this.translate.instant('MRS'));
          comments.comment = comments.comment.replace('Mme', this.translate.instant('MRS'));
          comments.comment = comments.comment.replace('Mrs', this.translate.instant('MRS'));
          comments.comment = comments.comment.replace('MR', this.translate.instant('MR'));
          comments.comment = comments.comment.replace('Mr', this.translate.instant('MR'));
          comments.comment = comments.comment.replace('M.', this.translate.instant('MR'));
          comments.comment = comments.comment.replace('paid the amount of', this.translate.instant('paid the amount of'));
          comments.comment = comments.comment.replace('by bank on the', this.translate.instant('finance_comments.bank'));
          comments.comment = comments.comment.replace('by credit card on the', this.translate.instant('finance_comments.credit_card'));
          comments.comment = comments.comment.replace('by transfer on the', this.translate.instant('finance_comments.transfer'));
          comments.comment = comments.comment.replace('by check on the', this.translate.instant('finance_comments.check'));
          comments.comment = comments.comment.replace('by SEPA on the', this.translate.instant('finance_comments.sepa'));
          comments.comment = comments.comment.replace('An avoir of', this.translate.instant('An avoir of'));
          comments.comment = comments.comment.replace('A refund of', this.translate.instant('A Refund of'));
          comments.comment = comments.comment.replace('was made the', this.translate.instant('was made the'));
          comments.comment = comments.comment.replace('to', this.translate.instant('to'));
          comments.comment = comments.comment.replace('from', this.translate.instant('from'));
          comments.comment = comments.comment.replace('Reference', this.translate.instant('Référence'));
          comments.comment = comments.comment.replace(
            'There has been some modification on the terms',
            this.translate.instant('There has been some modification on the terms'),
          );
          comments.subject = comments.subject.replace('Modification on term', this.translate.instant('Modification on term'));
          comments.subject = comments.subject.replace('Avoir of', this.translate.instant('Avoir of'));
          comments.subject = comments.subject.replace('Refund of', this.translate.instant('Refund of'));
          comments.subject = comments.subject.replace('Payment of', this.translate.instant('Payment of'));
        });
        this.candidateComments = datas;
      }
    });
  }

  getAlumniCommentFilter() {
    this.userFilterList = [];
    this.dateFilterList = [];
    const filteredValues = {
      alumni_id: this.candidateId,
    };
    this.subs.sink = this.alumniService.GetAlumniCommentsFilterList(filteredValues).subscribe(
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
          this.isReset = false;
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  hideEditDeleteButton(comment) {
    let allow = false;
    if (this.currentUser._id && comment.created_by && comment.created_by._id) {
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
              .slice(0, 10);
            resolve(this.allUser);
          } else {
            const itemsToDisplay = this.allDataUser.filter((user) => {
              const searchString = queryText.toLowerCase();
              return user.last_name.toLowerCase().trim().includes(searchString);
            });

            this.allUser = itemsToDisplay.map((newData) => {
              return '@' + newData.last_name + ' ' + newData.first_name;
            });

            resolve(this.allUser);
          }
        }
      }, 50);
    });
  }

  initAddCommentForm() {
    this.form = this.fb.group({
      alumni_id: [this.candidateId],
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

  submit(payload) {
    if (payload && payload.alumni_id && payload.alumni_id._id) {
      payload.alumni_id = payload.alumni_id._id;
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
    this.form.patchValue(payload);
    const payloads = _.cloneDeep(this.form.value);
    payloads.reply_for_comment_id = payload._id;
    payloads.comment = this.commentForm.value;
    payloads.is_reply = true;
    delete payloads.reply_comment_ids;
    this.subs.sink = this.alumniService.CreateAlumniComment(payloads).subscribe(
      (resp) => {
        if (resp) {
          this.resetComment();
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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
      alumni_id: this.candidateId,
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
    this.getAllAlumniComment();
    this.getAllAlumniCommentCategories();
    this.getAlumniCommentFilter();
  }

  addComment() {
    this.subs.sink = this.dialog
      .open(AlumniCommentariesDialogComponent, {
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

  getSubject(subject: string) {
    const n = subject.lastIndexOf(' ');
    const status = subject.substring(n + 1);
    const listStatus = [
      'admission_in_progress',
      'engaged',
      'registered',
      'resigned',
      'resigned_after_engaged',
      'resigned_after_registered',
    ];
    if (listStatus.includes(status)) {
      return subject.replace(status, this.translate.instant(status));
    } else {
      return subject;
    }
  }

  editComment(comment) {
    this.subs.sink = this.dialog
      .open(AlumniCommentariesDialogComponent, {
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
        this.subs.sink = this.alumniService.DeleteAlumniComment(comment._id).subscribe(
          (ressp) => {
            if (ressp) {
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
            // Record error log
            this.authService.postErrorLog(err);
          },
        );
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intVal);
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }
}
