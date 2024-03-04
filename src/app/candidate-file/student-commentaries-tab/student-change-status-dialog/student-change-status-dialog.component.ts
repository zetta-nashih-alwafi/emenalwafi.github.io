import { Component, Inject, OnDestroy, OnInit, Input } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import * as moment from 'moment';
@Component({
  templateUrl: './student-change-status-dialog.component.html',
  styleUrls: ['./student-change-status-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class StudentChangeStatusDialogComponent implements OnInit, OnDestroy {
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
  today = new Date();

  public config = {
    placeholder: this.translate.instant('Type a note'),
    height: '20rem',
    toolbar: [
      'heading',
      '|',
      'fontsize',
      '|',
      'bold',
      'italic',
      'Underline',
      'strikethrough',
      'highlight',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
    ],
  };

  categoryFilterList = [];
  categoryFilterCtrl = new UntypedFormControl('');

  constructor(
    public dialogRef: MatDialogRef<StudentChangeStatusDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private utilService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parseLocalToUtc: ParseLocalToUtcPipe,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.candidateId = this.data.candidateId;
      this.currentUser = this.data.currentUser;
      this.isEdit = this.data.isEdit;
      this.allDataUser = this.data.allDataUser
    }
    this.initAddCommentForm();
    this.getAllCandidateCommentCategories();
    if (this.isEdit) {
      this.commentId = this.data.commentToEdit;
      this.getOneCandidateComment();
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
  getOneCandidateComment() {
    this.isWaitingForResponse = true;
    this.commentData = [];
    this.subs.sink = this.candidateService.GetOneCandidateComment(this.commentId).subscribe(
      (resp) => {
        if (!resp) {
          this.commentData = [];
          this.isWaitingForResponse = false;
          return;
        } else {
          console.log(resp);
          const tmpData = _.cloneDeep(resp);
          if (tmpData.candidate_id && tmpData.candidate_id._id) {
            tmpData.candidate_id = tmpData.candidate_id._id;
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
          console.log(tmpData);
          this.commentData = tmpData;
          this.form.patchValue(tmpData);
          this.initialForm = this.form.getRawValue();
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

  initAddCommentForm() {
    this.form = this.fb.group({
      candidate_id: [this.candidateId],
      created_by: [this.currentUser._id],
      subject: [null],
      comment: [null, Validators.required],
      is_personal_situation: [false],
      is_restrictive_conditions: [false],
      is_reply: [false],
      reply_for_comment_id: [null],
      reply_comment_ids: [null],
      tagged_user_ids: [null],
      category: [null],
      date: [null, Validators.required],
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
    console.log(this.allDataUser);

    // return this.allUser;
    // return new Promise( resolve => {
    // } );
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!queryText) {
          if(this.allDataUser?.length){
            this.allUser = this.allDataUser
            .map((newData) => {
              return '@' + newData.last_name + ' ' + newData.first_name;
            })
            .slice(0, 10);
          }
          console.log('all user', this.allUser);
          resolve(this.allUser);
        } else {
          if(this.allDataUser?.length){
            const itemsToDisplay = this.allDataUser.filter((user) => {
              console.log(queryText);
              const searchString = queryText.toLowerCase();
              return user.last_name.toLowerCase().trim().includes(searchString);
            });

            this.allUser = itemsToDisplay.map((newData) => {
              return '@' + newData.last_name + ' ' + newData.first_name;
            });
          }

          console.log('all user', this.allUser);
          resolve(this.allUser);
        }
      }, 50);
    });
  }

  getUserTagged() {
    let noteText = this.utilService.cleanHTML(this.form.controls['comment'].value).split(' ');
    let taggedName = [];
    let foundIndex = false;
    let lengthIndex;
    noteText.forEach((res) => {
      console.log('_', res);
      if (res.includes('@')) {
        const removeAt = res.substr(1, res.length);
        console.log('_>>>', removeAt);
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
    console.log(taggedName);
    if (taggedName?.length) {
      taggedName.forEach((element) => {
        let foundedlists = [];
        let splited = element.split(' ');
        for (let index = 0; index < splited.length; index++) {
          // if (index % 2 === 0) {
          if (this.allDataUser?.length) {
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
          }
          // }
        }
      });
    }
    console.log('_res', taggedIdUser);
    return taggedIdUser;
  }

  submit() {
    this.createComment();
  }

  createComment() {
    const payload = this.form.getRawValue();
    console.log('608', payload);
    const currDate = moment(payload.date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    const currentTime = moment(this.today).format('HH:mm');
    const time_utc = this.parseLocalToUtc.transform(currentTime);
    const utcDate = this.parseLocalToUtc.transformDate(currDate, currentTime);
    if (this.data && this.data.newStatus === 'resign_after_school_begins') {
      payload['resign_after_school_begins_at'] = {
        date: currDate !== 'Invalid date' ? currDate : null,
        time: '15:59',
      };
    } else if (this.data && this.data.newStatus === 'no_show') {
      payload['no_show_at'] = {
        date: currDate !== 'Invalid date' ? currDate : null,
        time: '15:59',
      };
    }
    payload['status_changed_at'] = {
      date: currDate !== 'Invalid date' ? currDate : null,
      time: '15:59',
    };
    payload['tagged_user_ids'] = this.getUserTagged();
    payload['is_reply'] = false;
    delete payload['reply_for_comment_id'];
    delete payload['reply_comment_ids'];
    if (this.data && (this.data.newStatus === 'resign_after_school_begins' || this.data.newStatus === 'no_show') && this.data.statusValue) {
      const status = this.data.newStatus === 'resign_after_school_begins' ? 'Resigned after school begins' : 'No Show';
      payload['category'] = 'Status';
      payload['subject'] = 'Status Change';
      let reason = payload.comment;
      const tags = ['<p>', '</p>', '<h1>', '</h1>', '<h2>', '</h2>', '<h3>', '</h3>', '<h4>', '</h4>', '<h5>', '</h5>', '<h6>', '</h6>'];
      tags.forEach((tag) => {
        if (reason.includes(tag)) {
          reason = reason.replaceAll(tag, ' ');
        }
      });
      const updateComment =
        'The status of the student has been changed the ' +
        (currDate !== 'Invalid date' ? currDate : '') +
        ' from ' +
        this.data.statusValue +
        ' to ' +
        status +
        '<br>Reason: ' +
        reason;
      payload['comment'] = updateComment;
    } else if (this.data && this.data.newStatus === 'registered' && this.data.currentStatus === 'No show' && this.data.statusValue) {
      const status = this.data.newStatus;
      payload['category'] = 'Status';
      payload['subject'] = 'Status Change';
      let reason = payload.comment;
      const tags = ['<p>', '</p>', '<h1>', '</h1>', '<h2>', '</h2>', '<h3>', '</h3>', '<h4>', '</h4>', '<h5>', '</h5>', '<h6>', '</h6>'];
      tags.forEach((tag) => {
        if (reason.includes(tag)) {
          reason = reason.replaceAll(tag, ' ');
        }
      });
      const updateComment =
        'The status of the student has been changed the ' +
        (currDate !== 'Invalid date' ? currDate : '') +
        ' from ' +
        this.data.currentStatus +
        ' to ' +
        status +
        '<br>Reason: ' +
        reason;
      payload['comment'] = updateComment;
    } else {
      payload['category'] = 'Admission';
      payload['subject'] = this.translate.instant('Status change to', { newStatus: this.data.newStatus });
    }
    delete payload['date'];
    console.log('608 payload final', payload, currentTime, time_utc, utcDate);
    this.dialogRef.close(payload);

    // this.subs.sink = this.candidateService.CreateCandidateComment(payload).subscribe((resp) => {
    //   if (resp) {
    //     this.dialogRef.close('create');
    //   }
    // });
  }

  updateComment() {
    let payload = this.form.getRawValue();
    payload['tagged_user_ids'] = this.getUserTagged();
    payload['is_reply'] = false;
    console.log(payload);

    // this.subs.sink = this.candidateService.UpdateCandidateComment(this.commentId, payload).subscribe((resp) => {
    //   if (resp) {
    //     Swal.fire({
    //       type: 'success',
    //       title: this.translate.instant('Bravo'),
    //       confirmButtonText: this.translate.instant('OK'),
    //       allowOutsideClick: false,
    //       allowEscapeKey: false,
    //     }).then((res) => {
    //       if (res.value) {
    //         this.dialogRef.close('create');
    //       }
    //     });
    //   }
    // });
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

  ngOnDestroy() { }
}
