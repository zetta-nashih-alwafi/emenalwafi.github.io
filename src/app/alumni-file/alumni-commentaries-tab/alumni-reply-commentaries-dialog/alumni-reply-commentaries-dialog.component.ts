import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import * as moment from 'moment';
import { ApplicationUrls } from 'app/shared/settings';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  templateUrl: './alumni-reply-commentaries-dialog.component.html',
  styleUrls: ['./alumni-reply-commentaries-dialog.component.scss'],
})
export class AlumniReplyCommentariesDialogComponent implements OnInit, OnDestroy {
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
    alumni_id: '',
    subject: '',
    comment_body: '',
    created_by: '',
    date_comment_created: '',
    category: '',
  }
  candidateComments: any;
  public config = {
    placeholder: this.translate.instant('Answer'),
    height: '20rem',
    toolbar: [],
  };
  commentForm = new UntypedFormControl(null);

  constructor(
    public dialogRef: MatDialogRef<AlumniReplyCommentariesDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private alumniService: AlumniService,
    private authService: AuthService,
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
          minimumCharacters: 3
        },
      ],
    };
    if (this.commentId) {
      this.getAlumniComment();
    }
  }

  getAlumniComment() {
    this.isWaitingForResponse = true;
    this.repliesList = [];
    this.subs.sink = this.alumniService.GetOneAlumniComment(this.commentId)
      .subscribe((resp) => {
        if (!resp) {
          this.repliesList = [];
          this.isWaitingForResponse = false;
            return;
        } else {
          this.isWaitingForResponse = false;
          this.candidateComments = resp
          const payload = _.cloneDeep(resp);
          if (payload && payload.alumni_id && payload.alumni_id._id) {
            payload.alumni_id = payload.alumni_id._id
          }
          if (payload && payload.created_by && payload.created_by._id) {
            payload.created_by = this.currentUser._id
          }
          if (payload && payload.reply_for_comment_id && payload.reply_for_comment_id._id) {
            payload.reply_for_comment_id = payload.reply_for_comment_id._id
          }
          if (payload && payload.reply_comment_ids && payload.reply_comment_ids.length) {
            payload.reply_comment_ids = payload.reply_comment_ids.map((ressp) => ressp._id);
          } else {
            payload.reply_comment_ids = null
          }
          if (payload && payload.tagged_user_ids && payload.tagged_user_ids.length) {
            payload.tagged_user_ids = payload.tagged_user_ids.map((ressp) => ressp._id);
          } else {
            payload.tagged_user_ids = null
          }
          this.form.patchValue(payload)
          const tmpData = _.cloneDeep(resp);
          this.repliesList = tmpData;
        }
      }, (err) =>{
        this.authService.postErrorLog(err)
      })
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
      alumni_id: [this.candidateId],
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
    return new Promise( resolve => {
      setTimeout( () => {
        if (!queryText) {
          this.allUser = this.allDataUser.map((newData) => {
            return '@' + newData.last_name + ' ' + newData.first_name;
          }).slice(0, 10);
          console.log('all user', this.allUser);
          resolve ( this.allUser );
        } else {
          const itemsToDisplay = this.allDataUser.filter((user) => {
          console.log(queryText);
          const searchString = queryText.toLowerCase();
          return (user.last_name.toLowerCase().trim().includes(searchString));
          })

          this.allUser = itemsToDisplay.map((newData) => {
            return '@' + newData.last_name + ' ' + newData.first_name;
          });

          console.log('all user', this.allUser);
          resolve( this.allUser );
        }
      }, 50 );
    });
  }

  submit() {
    const payload = _.cloneDeep(this.form.value);
    payload.reply_for_comment_id = this.commentId;
    payload.comment = this.commentForm.value;
    payload.is_reply = true;
    delete payload.reply_comment_ids;
    this.subs.sink = this.alumniService.CreateAlumniComment(payload).subscribe((resp) => {
      if (resp) {
        this.dialogRef.close(true);
      }
    }, (err)=>{
      this.authService.postErrorLog(err)
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {}
}
