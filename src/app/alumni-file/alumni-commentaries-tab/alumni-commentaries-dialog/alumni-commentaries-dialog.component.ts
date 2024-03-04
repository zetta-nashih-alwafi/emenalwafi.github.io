import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { UtilityService } from 'app/service/utility/utility.service';
import { AlumniService } from 'app/service/alumni/alumni.service';
import * as moment from 'moment';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  templateUrl: './alumni-commentaries-dialog.component.html',
  styleUrls: ['./alumni-commentaries-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class AlumniCommentariesDialogComponent implements OnInit, OnDestroy {
  public Editor = DecoupledEditor;
  private subs = new SubSink();
  isWaitingForResponse = false;
  isEdit = false;
  candidateId;
  currentUser;
  allUser;
  allDataUser;
  commentId;
  commentData;
  isEditMode = false;
  isAddMore = false;
  noteOnEditId: string;
  form: UntypedFormGroup;
  initialForm;

  public config = {
    placeholder: this.translate.instant('Title'),
    height: '20rem',
    toolbar: [],
  };

  categoryFilterList = [];
  categoryFilterCtrl = new UntypedFormControl('');
  today: Date;

  constructor(
    public dialogRef: MatDialogRef<AlumniCommentariesDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private alumniService: AlumniService,
    private utilService: UtilityService,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.today = new Date();
      this.candidateId = this.data.candidateId;
      this.currentUser = this.data.currentUser;
      this.allDataUser = this.data.allDataUser;
      this.allUser = this.data.allUser;
      this.isEdit = this.data.isEdit;
    }
    this.initAddCommentForm();
    this.getAllAlumniCommentCategories();
    if (this.isEdit) {
      this.commentId = this.data.commentToEdit;
      this.getOneAlumniComment();
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
  getOneAlumniComment() {
    this.isWaitingForResponse = true;
    this.commentData = [];
    this.subs.sink = this.alumniService.GetOneAlumniComment(this.commentId).subscribe(
      (resp) => {
        if (!resp) {
          this.commentData = [];
          this.isWaitingForResponse = false;
          return;
        } else {
          const tmpData = _.cloneDeep(resp);
          if (tmpData.alumni_id && tmpData.alumni_id._id) {
            tmpData.alumni_id = tmpData.alumni_id._id;
          }
          if (tmpData.created_by && tmpData.created_by._id) {
            tmpData.created_by = tmpData.created_by._id;
          }
          if (tmpData.reply_for_comment_id && tmpData.reply_for_comment_id._id) {
            tmpData.reply_for_comment_id = tmpData.reply_for_comment_id._id;
          }
          if (tmpData.reply_comment_ids && tmpData.reply_comment_ids.length) {
            const reply_comment_ids = [];
            tmpData.reply_comment_ids.forEach((reply) => {
              reply_comment_ids.push(reply._id);
            });
            tmpData.reply_comment_ids = reply_comment_ids;
          }
          if (tmpData.tagged_user_ids && tmpData.tagged_user_ids.length) {
            const tagged_user_ids = [];
            tmpData.tagged_user_ids.forEach((user) => {
              tagged_user_ids.push(user._id);
            });
            tmpData.tagged_user_ids = tagged_user_ids;
          }
          if (tmpData.category) {
            this.categoryFilterCtrl.setValue(tmpData.category);
          }
          this.commentData = tmpData;
          this.form.patchValue(tmpData);
          this.initialForm = this.form.getRawValue();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  initAddCommentForm() {
    this.form = this.fb.group({
      alumni_id: [this.candidateId],
      created_by: [this.currentUser._id],
      subject: [null, Validators.required],
      comment: [null, Validators.required],
      is_personal_situation: [false],
      is_restrictive_conditions: [false],
      is_reply: [false],
      reply_for_comment_id: [null],
      reply_comment_ids: [null],
      tagged_user_ids: [null],
      category: [null],
    });
    this.initialForm = this.form.getRawValue();
  }

  selectCategory(value) {
    if (value) {
      if (value === 'add') {
        this.isAddMore = true;
      } else {
        this.form.controls['category'].patchValue(value);
      }
    } else {
      this.form.controls['category'].patchValue(null);
    }
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  getFeedItems(queryText) {
    // return this.allUser;
    // return new Promise( resolve => {
    // } );
    return new Promise((resolve) => {
      setTimeout(() => {
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
      }, 50);
    });
  }

  getUserTagged() {
    const noteText = this.utilService.cleanHTML(this.form.controls['comment'].value).split(' ');
    const taggedName = [];
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
    const taggedIdUser = [];
    taggedName.forEach((element) => {
      const foundedlists = [];
      const splited = element.split(' ');
      for (let index = 0; index < splited.length; index++) {
        // if (index % 2 === 0) {
        this.allDataUser.find((userlist) => {
          if (
            userlist &&
            userlist.last_name &&
            userlist.first_name &&
            userlist.last_name.includes(splited[index]) &&
            userlist.first_name === splited[splited.length - 1]
          ) {
            foundedlists.push(userlist);
            taggedIdUser.push(userlist._id);
          }
        });
        // }
      }
    });
    return taggedIdUser;
  }

  async checkFormValidity(): Promise<boolean> {
    // isWaitingForResponse || checkComparison() || identityForm.invalid
    if (this.form.invalid) {
      this.isWaitingForResponse = false;
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.form.markAllAsTouched();
      return false;
    } else {
      return true;
    }
  }

  async submit() {
    this.isWaitingForResponse = true;
    if (!(await this.checkFormValidity())) {
      return;
    }
    this.isEdit ? this.updateComment() : this.createComment();
  }

  createComment() {
    const payload = this.form.getRawValue();
    const currentTime = moment(this.today).format('HH:mm');
    const currentDate = moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
    const utcTime = moment(currentTime, 'HH:mm').add(-moment().utcOffset(), 'm').format('HH:mm');
    const date = this.parseLocalToUtcPipe.transformDate(currentDate, currentTime);
    payload['tagged_user_ids'] = this.getUserTagged();
    payload['is_reply'] = false;
    delete payload['reply_for_comment_id'];
    delete payload['reply_comment_ids'];

    this.subs.sink = this.alumniService.CreateAlumniComment(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          const newNoteHistory = {
            alumni_id: this.candidateId,
            history_date: date,
            history_time: utcTime,
            action: 'Create commentary',
            who: this.utilService.getCurrentUser()._id,
            description: payload.comment ? this.utilService.cleanHTML(payload.comment) : '',
          };

          this.subs.sink = this.alumniService.createAlumniHistory(newNoteHistory).subscribe(
            (ressp) => {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo'),
                confirmButtonText: this.translate.instant('OK'),
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then((res) => {
                if (res.value) {
                  this.dialogRef.close('create');
                }
              });
            },
            (err) => {
              // Record error log
              this.authService.postErrorLog(err);
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo'),
                confirmButtonText: this.translate.instant('OK'),
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then((res) => {
                if (res.value) {
                  this.dialogRef.close('create');
                }
              });
            },
          );
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  updateComment() {
    const payload = this.form.getRawValue();
    payload['tagged_user_ids'] = this.getUserTagged();
    payload['is_reply'] = false;

    this.subs.sink = this.alumniService.UpdateAlumniComment(this.commentId, payload).subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((res) => {
          if (res.value) {
            this.dialogRef.close('create');
          }
        });
      }
    });
  }

  checkFormChanged() {
    const currentForm = JSON.stringify(this.form.getRawValue());
    const initForm = JSON.stringify(this.initialForm);

    if (currentForm === initForm) {
      return true;
    } else {
      return false;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
