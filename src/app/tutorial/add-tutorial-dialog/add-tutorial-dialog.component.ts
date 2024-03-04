import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import Swal from 'sweetalert2';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import * as _ from 'lodash';
import { TestCreationService } from 'app/service/test/test-creation.service';

@Component({
  selector: 'ms-add-tutorial-dialog',
  templateUrl: './add-tutorial-dialog.component.html',
  styleUrls: ['./add-tutorial-dialog.component.scss'],
})
export class AddTutorialDialogComponent implements OnInit, OnDestroy {
  public Editor = DecoupledEditor;
  private subs = new SubSink();
  public config = {
    placeholder: this.translate.instant('Description'),
  };
  public config1 = {
    placeholder: this.translate.instant('Message'),
  };
  form: UntypedFormGroup;
  isWaitingForResponse = false;
  modifyTutorial = false;
  originalUserType;
  userTypeList: any;
  userTypes = [];
  userList = [];

  constructor(
    public dialogRef: MatDialogRef<AddTutorialDialogComponent>,
    private tutorialService: TutorialService,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private userService: UserService,
    private utilService: UtilityService,
    private testService: TestCreationService,
  ) {}

  ngOnInit() {
    this.initTutorialForm();
    this.getUserTypeDropdown();
    if (this.data) {
      this.modifyTutorial = true;
      this.getTutorialForm();
    }
  }

  getTutorialForm() {
    const type = {
      description: this.data.description,
      link: this.data.link,
      message: this.data.message,
      title: this.data.title,
      user_type_ids: [],
    };
    if (this.data.user_type_ids && this.data.user_type_ids.length) {
      this.data.user_type_ids.forEach((element) => {
        type.user_type_ids.push(element._id);
      });
    }
    this.form.patchValue(type);
  }

  initTutorialForm() {
    this.form = this.fb.group({
      user_type_ids: [null, Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      link: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
          ),
        ],
      ],
      message: [this.translate.instant('TUTORIAL_MENU.MESSAGE_TEMPLATE'), Validators.required],
    });
  }

  submitTutorial() {
    if (!this.form.valid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('EVAL_BY_EXPERTISE.EVAL_S2.TITLE'),
        text: this.translate.instant('EVAL_BY_EXPERTISE.EVAL_S2.TEXT'),
        confirmButtonText: this.translate.instant('EVAL_BY_EXPERTISE.EVAL_S2.BUTTON'),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      this.form.markAllAsTouched();
      return;
    }
    if (this.data) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.tutorialService.updateTutorial(this.data._id, this.form.value).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('TUTORIAL_UPDATE.TITLE'),
            text: this.translate.instant('TUTORIAL_UPDATE.TEXT', { title: this.data.title }),
            confirmButtonText: this.translate.instant('TUTORIAL_UPDATE.BUTTON'),
          });
          this.dialogRef.close();
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
      this.isWaitingForResponse = true;
      this.subs.sink = this.tutorialService.createTutorial(this.form.value).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('TUTORIAL_SAVE.TITLE'),
            text: this.translate.instant('TUTORIAL_SAVE.TEXT'),
            confirmButtonText: this.translate.instant('TUTORIAL_SAVE.BUTTON'),
          });
          this.dialogRef.close();
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
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getUserTypeDropdown() {
    this.subs.sink = this.testService.getAllUserType().subscribe(
      (userType) => {
        this.originalUserType = userType;
        this.userTypes = userType.map((type) => {
          const typeEntity = this.getTranslateType(type.name);
          return { name: typeEntity, id: type._id };
        });
        console.log('User Type => ', userType);
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

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  getTranslateType(name) {
    if (name) {
      const value = this.translate.instant('USER_TYPES.' + name);
      return value;
    }
  }
  keysrt(key) {
    return function (a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    };
  }
}
