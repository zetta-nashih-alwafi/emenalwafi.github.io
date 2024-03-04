import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as moment from 'moment';
import { ApplicationUrls } from 'app/shared/settings';
import { PAUSE } from '@angular/cdk/keycodes';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  templateUrl: './student-reply-commentaries-dialog.component.html',
  styleUrls: ['./student-reply-commentaries-dialog.component.scss'],
})
export class StudentReplyCommentariesDialogComponent implements OnInit, OnDestroy {
  public Editor = DecoupledEditor;
  private subs = new SubSink();
  isWaitingForResponse = false;
  isEdit = false;
  candidateId;
  commentId;
  currentUser;
  allUser;
  allDataUser;
  noteId;
  isEditMode = false;
  noteOnEditId: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  form: UntypedFormGroup;
  repliesList = [];
  filteredValues = {
    candidate_id: '',
    subject: '',
    comment_body: '',
    created_by: '',
    date_comment_created: '',
    category: '',
  };
  candidateComments: any;
  public config = {
    placeholder: this.translate.instant('Answer'),
    height: '20rem',
    toolbar: [],
  };
  commentForm = new UntypedFormControl(null);

  constructor(
    public dialogRef: MatDialogRef<StudentReplyCommentariesDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private utilService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.candidateId = this.data.candidateId;
      this.commentId = this.data.commentId;
      this.currentUser = this.data.currentUser;
      this.allDataUser = this.data.allDataUser;
    }
    this.initAddCommentForm();
    this.config['mention'] = {
      feeds: [
        {
          marker: '@',
          feed: (query) => this.getFeedItems(query),
          minimumCharacters: 0,
        },
      ],
    };
    if (this.commentId) {
      this.getCandidateComment();
    }
  }

  getCandidateComment() {
    this.isWaitingForResponse = true;
    this.repliesList = [];
    this.subs.sink = this.candidateService.GetOneCandidateComment(this.commentId).subscribe(
      (resp) => {
        if (!resp) {
          this.repliesList = [];
          this.isWaitingForResponse = false;
          return;
        } else {
          this.isWaitingForResponse = false;
          this.candidateComments = resp;
          console.log(resp);
          const payload = _.cloneDeep(resp);
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
          this.form.patchValue(payload);
          const tmpData = _.cloneDeep(resp);
          this.repliesList = tmpData;
        }
      },
      (err) => {
        this.repliesList = [];
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

  transformDate(data) {
    if (data) {
      const date = data;
      const datee = moment(date).format('DD/MM/YYYY');
      return datee;
    } else {
      return '';
    }
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

  initAddCommentForm() {
    this.form = this.fb.group({
      candidate_id: [this.candidateId],
      created_by: [this.currentUser._id],
      subject: [null, Validators.required],
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

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  getFeedItems(queryText) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!queryText) {
          this.allUser = this.allDataUser
            .map((newData) => {
              return '@' + newData.last_name + ' ' + newData.first_name;
            })
            .slice(0, 4);
          console.log('all user', this.allUser);
          resolve(this.allUser);
        } else {
          const itemsToDisplay = this.allDataUser.filter((user) => {
            console.log(queryText);
            let userName = this.utilService.simpleDiacriticSensitiveRegex((user.last_name + user.first_name).toLowerCase());
                userName = userName.toLowerCase().trim();

            let searchString = this.utilService.simpleDiacriticSensitiveRegex(queryText.toLowerCase());
                searchString = searchString.toLowerCase().trim();

            return userName.includes(searchString);
          });

          this.allUser = itemsToDisplay.map((newData) => {
            return '@' + newData.last_name.toUpperCase() + ' ' + newData.first_name;
          });

          console.log('all user', this.allUser);
          resolve(this.allUser);
        }
      }, 50);
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

  submit() {
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.form.value);
    payload['tagged_user_ids'] = this.getUserTagged();
    payload.reply_for_comment_id = this.commentId;
    payload.comment = this.commentForm.value;
    payload.is_reply = true;
    delete payload.reply_comment_ids;
    this.subs.sink = this.candidateService.CreateCandidateComment(payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.dialogRef.close(true);
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

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {}
}
