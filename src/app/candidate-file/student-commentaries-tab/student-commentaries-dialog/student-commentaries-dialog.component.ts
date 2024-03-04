import { fadeInAnimation } from './../../../core/route-animation/route.animation';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  templateUrl: './student-commentaries-dialog.component.html',
  styleUrls: ['./student-commentaries-dialog.component.scss'],
})
export class StudentCommentariesDialogComponent implements OnInit, OnDestroy {
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

  constructor(
    public dialogRef: MatDialogRef<StudentCommentariesDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private utilService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.candidateId = this.data.candidateId;
      this.currentUser = this.data.currentUser;
      this.allDataUser = this.data.allDataUser;
      this.allUser = this.data.allUser;
      this.isEdit = this.data.isEdit;
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
          minimumCharacters: 0,
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
        this.commentData = [];
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
    console.log(this.allDataUser);

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
    taggedName.forEach((element) => {
      let foundedlists = [];
      let splited = element.split(' ');
      for (let index = 0; index < splited.length; index++) {
        // if (index % 2 === 0) {
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
        // }
      }
    });
    console.log('_res', taggedIdUser);
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
    let payload = this.form.getRawValue();
    payload['tagged_user_ids'] = this.getUserTagged();
    payload['is_reply'] = false;
    delete payload['reply_for_comment_id'];
    delete payload['reply_comment_ids'];
    console.log(payload);

    this.subs.sink = this.candidateService.CreateCandidateComment(payload).subscribe(
      (resp) => {
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

  updateComment() {
    let payload = this.form.getRawValue();
    payload['tagged_user_ids'] = this.getUserTagged();
    payload['is_reply'] = false;
    console.log(payload);

    this.subs.sink = this.candidateService.UpdateCandidateComment(this.commentId, payload).subscribe(
      (resp) => {
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

  ngOnDestroy() {}
}
