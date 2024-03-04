import { CompanyService } from 'app/service/company/company.service';
import { UtilityService } from './../../../../service/utility/utility.service';
import { TranslateService } from '@ngx-translate/core';
import { SchoolService } from 'app/service/schools/school.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-company-note-dialog',
  templateUrl: './add-company-note-dialog.component.html',
  styleUrls: ['./add-company-note-dialog.component.scss'],
})
export class AddCompanyNoteDialogComponent implements OnInit {
  public Editor = DecoupledEditor;
  form: UntypedFormGroup;
  isWaitingForResponse: Boolean = false;
  categoryFilterList: any[] = [];
  // categoryFilter = new UntypedFormControl('');
  isAddMore: Boolean = false;
  id;
  allUser;

  private subs = new SubSink();
  public config = {
    placeholder: this.translate.instant('Title'),
    height: '20rem',
    toolbar: [],
  };

  constructor(
    public dialogRef: MatDialogRef<AddCompanyNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private schoolService: SchoolService,
    private translate: TranslateService,
    private utilService: UtilityService,
    private companyService: CompanyService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log('data', this.data);
    this.initForm();
    this.getCategoryFilterDropdown();
    if (this.data.isEdit) {
      this.getCompanyComment();
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
  initForm() {
    this.form = this.fb.group({
      created_by: [this.data.currentUser._id],
      subject: ['', Validators.required],
      category: [''],
      note: ['', Validators.required],
      tagged_user_ids: [null],
    });
  }

  getCompanyComment() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.companyService.GetOneCompanyNote(this.data.commentId).subscribe(
      (resp) => {
        if (resp) {
          const comment = _.cloneDeep(resp);

          // comment.created_by = resp.created_by ? resp.created_by._id : null
          if (comment.tagged_user_ids && comment.tagged_user_ids.length) {
            const taggedUserId = [];
            comment.tagged_user_ids.forEach((user) => {
              taggedUserId.push(user._id);
            });
            comment.tagged_user_ids = taggedUserId;
          }
          this.form.patchValue(comment);
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getCategoryFilterDropdown() {
    this.subs.sink = this.companyService.GetAllCompanyNoteCategories().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.categoryFilterList = resp.sort((a, b) =>
            a.toLowerCase() > b.toLowerCase() ? 1 : b.toLowerCase() > a.toLowerCase() ? -1 : 0,
          );
        }
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

  getFeedItems(queryText) {
    // return this.allUser;
    // return new Promise( resolve => {
    // } );
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!queryText) {
          this.allUser = this.data.allDataUser
            .map((newData) => {
              return '@' + newData.last_name + ' ' + newData.first_name;
            })
            .slice(0, 10);
          // console.log('all user', this.allUser);
          resolve(this.allUser);
        } else {
          const itemsToDisplay = this.data.allDataUser.filter((user) => {
            // console.log(queryText);
            const searchString = queryText.toLowerCase();
            return user.last_name.toLowerCase().trim().includes(searchString);
          });

          this.allUser = itemsToDisplay.map((newData) => {
            return '@' + newData.last_name + ' ' + newData.first_name;
          });

          // console.log('all user', this.allUser);
          resolve(this.allUser);
        }
      }, 50);
    });
  }

  getUserTagged() {
    let noteText = this.utilService.cleanHTML(this.form.controls['note'].value).split(' ');
    let taggedName = [];
    let foundIndex = false;
    let lengthIndex;
    noteText.forEach((res) => {
      // console.log('_', res);
      if (res.includes('@')) {
        const removeAt = res.substr(1, res.length);
        // console.log('_>>>', removeAt);
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
    // console.log(taggedName);
    taggedName.forEach((element) => {
      let foundedlists = [];
      let splited = element.split(' ');
      for (let index = 0; index < splited.length; index++) {
        // if (index % 2 === 0) {
        if (this.data.allDataUser) {
          this.data.allDataUser.find((userlist) => {
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
    // console.log('_res', taggedIdUser);
    return taggedIdUser;
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  submit() {
    this.isWaitingForResponse = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isWaitingForResponse = false;
      return;
    }

    if (this.data.isEdit) {
      this.edit();
    } else {
      this.create();
    }
  }

  create() {
    const payload = this.form.value;
    payload['tagged_user_ids'] = this.getUserTagged();
    if (this.data.companyId) {
      payload.company_id = this.data.companyId;
    } else if (this.data.companyEntityId) {
      payload.company_entity_id = this.data.companyEntityId;
    }
    this.subs.sink = this.companyService.CreateCompanyNote(payload).subscribe(
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
              this.closeDialog();
            }
          });
        }
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

  edit() {
    const payload = this.form.value;
    payload['tagged_user_ids'] = this.getUserTagged();
    payload.created_by = this.data.currentUser._id;
    if (this.data.companyId) {
      payload.company_id = this.data.companyId;
    } else if (this.data.companyEntityId) {
      payload.company_entity_id = this.data.companyEntityId;
    }
    // console.log(payload);
    this.subs.sink = this.companyService.UpdateCompanyNote(this.data.commentId, payload).subscribe(
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
              this.closeDialog();
            }
          });
        }
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

  closeDialog() {
    this.dialogRef.close();
  }
}
