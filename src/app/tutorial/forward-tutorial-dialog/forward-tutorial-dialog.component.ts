import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { UserService } from 'app/service/user/user.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SubSink } from 'subsink';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { UtilityService } from 'app/service/utility/utility.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'ms-forward-tutorial-dialog',
  templateUrl: './forward-tutorial-dialog.component.html',
  styleUrls: ['./forward-tutorial-dialog.component.scss'],
})
export class ForwardTutorialDialogComponent implements OnInit {
  forwardTutorialForm: UntypedFormGroup;
  private subs = new SubSink();
  public Editor = DecoupledEditor;
  public config = {
    //  placeholder: this.translate.instant('')
  };
  userTypes = [];
  userList = [];
  rncpTitles = [];
  schools = [];
  currentUser: any;
  userTypesList: any;
  userRecipientList: any;
  rncpTitlesList: any;
  originalUserTypesList: any;
  originalUserList: any;
  originalRncpTitlesList: any;
  isWaitingForResponse = false;
  titleReady = false;
  userReady = false;
  userTypeReady = false;
  selectedTitleId: string[] = [];
  selectedUserTypeId: string[] = [];

  isUserAcadDir = false;
  isUserAcadAdmin = false;
  programs = [];
  programList = [];
  selectedProgramList = [];
  selectable = true;
  removable = true;
  filterValue = {
    program: null,
  };
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('languagesInput', { static: false }) languagesInput: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;

  isPermission: any;
  currentUserTypeId: any;

  constructor(
    public dialogRef: MatDialogRef<ForwardTutorialDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private autService: AuthService,
    private rncpTitleService: RNCPTitlesService,
    private tutorialService: TutorialService,
    private utilService: UtilityService,
    private ngxPermissionService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.isUserAcadAdmin = !!this.ngxPermissionService.getPermission('Academic Admin');
    this.isUserAcadDir = !!this.ngxPermissionService.getPermission('Academic Director');
    this.currentUser = this.autService.getLocalStorageUser();
    this.isPermission = this.autService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    console.log(this.data);
    this.initializeForm();
    // this.getTitleList();
    // this.getSchoolList('');
    this.getProgramDropdown();
    this.getUserTypeList();
    this.initFilter();
  }

  getUserList() {
    // const program = this.forwardTutorialForm.get('program_ids').value
    let program = [];
    if (this.selectedProgramList && this.selectedProgramList.length) {
      program = this.selectedProgramList.map((list) => list.program);
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getUserByProgram(program).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.userList = resp.map((user) => {
          return {
            name: (user.civility !== 'neutral' ? this.translate.instant(user.civility) + ' ' : '') + user.first_name + ' ' + user.last_name,
            id: user._id,
          };
        });
        this.originalUserList = resp.map((user) => {
          return {
            name: (user.civility !== 'neutral' ? this.translate.instant(user.civility) + ' ' : '') + user.first_name + ' ' + user.last_name,
            id: user._id,
          };
        });
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
  getSchoolList(titleId) {
    if (this.isUserAcadAdmin || this.isUserAcadDir) {
      const dataSchool = [];
      const schoolId = this.currentUser.entities ? this.currentUser.entities[0].school._id : '';
      this.subs.sink = this.rncpTitleService.getAllSchoolDropdown(titleId).subscribe(
        (resp) => {
          if (resp) {
            this.schools = resp;
            dataSchool.push(schoolId);
            this.forwardTutorialForm.get('school_ids').patchValue(dataSchool);
            this.forwardTutorialForm.get('school_ids').disable();
            console.log(this.forwardTutorialForm.get('school_ids').value, schoolId, resp);
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
    } else {
      this.subs.sink = this.rncpTitleService.getAllSchoolDropdown(titleId).subscribe(
        (resp) => {
          this.schools = resp;
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
  }
  getTitleList() {
    if (this.isUserAcadAdmin || this.isUserAcadDir) {
      const userType = this.currentUser.entities ? this.currentUser.entities[0].type.name : '';
      this.subs.sink = this.autService.getUserById(this.currentUser._id).subscribe(
        (res) => {
          const dataUSer = res.entities.filter((ent) => ent.type.name === userType);
          const title_ids = this.utilService.getAcademicAllAssignedTitle(dataUSer);
          this.subs.sink = this.rncpTitleService.getRncpTitlesForTutorialAcad(title_ids).subscribe(
            (resp) => {
              this.rncpTitlesList = resp;
              this.originalRncpTitlesList = resp;
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
    } else {
      this.subs.sink = this.rncpTitleService.getRncpTitlesForTutorial().subscribe(
        (resp) => {
          this.rncpTitlesList = resp;
          this.originalRncpTitlesList = resp;
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
  }
  getUserTypeList() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getAllUserTypeDropdown().subscribe(
      (userTypes) => {
        this.userTypesList = userTypes;
        this.originalUserTypesList = userTypes;
        this.isWaitingForResponse = false;
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

  // selectedTitle() {
  //   const data = this.forwardTutorialForm.get('rncp_ids').value;
  //   this.selectedTitleId = this.forwardTutorialForm.get('rncp_ids').value;
  //   this.userReady = false;
  //   this.getSchoolList(data);
  //   this.getUserList(data, '');
  // }

  // selectedSchool() {
  //   const data = this.forwardTutorialForm.get('rncp_ids').value;
  //   const school = this.forwardTutorialForm.get('school_ids').value;
  //   this.userReady = false;
  //   this.getUserList(data, school);
  // }
  selectedProgram(value) {
    this.userReady = false;
    this.selectedProgramList.push(value);
    this.selectedProgramList = _.uniqBy(this.selectedProgramList, '_id');
    this.languagesInput.nativeElement.value = '';
    this.forwardTutorialForm.get('program').setValue(null);
    if (this.selectedProgramList && this.selectedProgramList.length) {
      const ids = this.selectedProgramList.map((select) => select._id);
      this.forwardTutorialForm.get('program_ids').patchValue(ids);
      this.getUserList();
    }
  }
  setProgram() {
    this.languagesInput.nativeElement.value = '';
    this.forwardTutorialForm.get('program').setValue(null);
  }
  addTo(event: MatChipInputEvent): void {
    if (this.matAutocomplete.isOpen === false) {
      if (event.input) {
        event.input.value = '';
      }
      this.forwardTutorialForm.get('program').setValue(null);
    }
  }
  selectedUser() {
    this.userReady = false;
  }

  selectedUserType() {
    this.userReady = false;
    // const data = this.forwardTutorialForm.get('rncp_ids').value;
    // const data = this.forwardTutorialForm.get('program_ids').value;
    // if selected user type is student, call API getUserTypeStudent
    let data = [];
    if (this.selectedProgramList && this.selectedProgramList.length) {
      data = this.selectedProgramList.map((list) => list.program);
    }
    if (this.forwardTutorialForm.get('user_type_id').value === '5a067bba1c0217218c75f8ab') {
      this.subs.sink = this.userService.getUserTypeStudentPrograms(this.forwardTutorialForm.get('user_type_id').value, data).subscribe(
        (resp) => {
          this.userRecipientList = resp;
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
    } else {
      this.subs.sink = this.userService.getUserTypePrograms(data, this.forwardTutorialForm.get('user_type_id').value).subscribe(
        (resp) => {
          this.userRecipientList = resp;
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
    this.selectedUserTypeId = this.forwardTutorialForm.get('user_type_id').value;
  }

  initializeForm() {
    this.forwardTutorialForm = this.fb.group({
      // rncp_ids: [[], Validators.required],
      // school_ids: [[], Validators.required],
      program: ['', Validators.required],
      program_ids: [[]],
      category: [true],
      user_id: [[]],
      user_type_id: [[], Validators.required],
      subject: [this.data.title, Validators.required],
      message: [this.data.message || this.translate.instant('TUTORIAL_MENU.MESSAGE_TEMPLATE'), Validators.required],
    });
  }

  userCategeryChanged(event) {
    this.forwardTutorialForm.controls['category'].setValue(event.checked);
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  categoryChange(event) {
    if (event.checked) {
      console.log('Check');
      this.forwardTutorialForm.get('user_id').patchValue(null);
      this.forwardTutorialForm.get('user_id').updateValueAndValidity();
      this.forwardTutorialForm.get('user_id').clearValidators();
      this.forwardTutorialForm.get('user_id').updateValueAndValidity();
      this.forwardTutorialForm.get('user_type_id').setValidators([Validators.required]);
      this.forwardTutorialForm.get('user_type_id').updateValueAndValidity();
    } else {
      console.log('Unceck');
      this.forwardTutorialForm.get('user_type_id').patchValue(null);
      this.forwardTutorialForm.get('user_type_id').updateValueAndValidity();
      this.forwardTutorialForm.get('user_type_id').clearValidators();
      this.forwardTutorialForm.get('user_type_id').updateValueAndValidity();
      this.forwardTutorialForm.get('user_id').setValidators([Validators.required]);
      this.forwardTutorialForm.get('user_id').updateValueAndValidity();
    }
    console.log('Event : ', event, this.forwardTutorialForm.controls);
  }
  keyupUser(event) {
    this.userReady = true;
  }
  keyupUserType(event) {
    this.userTypeReady = true;
  }
  keyupTitle(event) {
    this.titleReady = true;
  }

  valueChange(event) {
    if (event === 'title') {
      this.titleReady = false;
    } else if (event === 'user') {
      this.userReady = false;
    } else if (event === 'type') {
      this.userTypeReady = false;
    }
    console.log('button active : ', this.titleReady, this.userReady, this.userTypeReady);
  }

  forwardTutorial() {
    console.log('payload =>', this.forwardTutorialForm.value);
    let titleName;
    let long_title = [];
    this.selectedTitleId.forEach((element) => {
      titleName = this.rncpTitlesList.filter((title) => {
        return title._id === element;
      });
      long_title = long_title.concat(titleName);
    });
    let name = '';
    if (long_title && long_title.length) {
      let count = 0;
      long_title.forEach((element) => {
        if (element.long_name) {
          count++;
          if (count > 1) {
            name = name + ', ';
            name = name + element.long_name;
          } else {
            name = name + element.long_name;
          }
        }
      });
    }
    console.log('selectedTitleId =>', titleName);
    const payload = _.cloneDeep(this.forwardTutorialForm.value);
    const user_type = this.currentUser.entities ? this.currentUser.entities[0].type._id : '';
    if (this.forwardTutorialForm.get('category').value) {
      payload.recipient_type = `user_type`;
      payload.user_id = [];
    } else {
      payload.recipient_type = `user`;
      payload.user_type_id = [];
    }
    payload.tutorial_id = this.data._id;
    let type = '';
    if (this.data.user_type_ids && this.data.user_type_ids.length) {
      let count = 0;
      this.data.user_type_ids.forEach((element) => {
        if (element.name) {
          count++;
          if (count > 1) {
            type = type + ', ';
            type = type + element.name;
          } else {
            type = type + element.name;
          }
        }
      });
    }
    delete payload.category;
    delete payload.program;
    Swal.fire({
      title: this.translate.instant('TUTORIAL_SEND2.TITLE', { title: this.data.title }),
      html: this.translate.instant('TUTORIAL_SEND2.TEXT', { title: this.data.title, usertype: type, nametitle: name }),
      type: 'question',
      allowEscapeKey: true,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('TUTORIAL_SEND2.BUTTON_1'),
      cancelButtonText: this.translate.instant('TUTORIAL_SEND2.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.tutorialService.sendTutorial(user_type, payload).subscribe(
          (respp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('TUTORIAL_SEND1.TITLE'),
              html: this.translate.instant('TUTORIAL_SEND1.TEXT'),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('TUTORIAL_SEND1.BUTTON'),
            });
            this.dialogRef.close();
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
    });
  }

  getProgramDropdown(filterProgram?) {
    this.isWaitingForResponse = true;
    const pagination = null;
    const filter = filterProgram ? filterProgram : null;
    this.programs = [];
    this.subs.sink = this.tutorialService.getAllPrograms(pagination, filter, this.currentUserTypeId).subscribe((resp) => {
      if (resp) {
        this.programList = _.cloneDeep(resp);
        const temp = this.programList.map((list) => {
          const scholar = list.scholar_season_id && list.scholar_season_id.scholar_season ? list.scholar_season_id.scholar_season : null;
          return { ...list, name: scholar + ' ' + list.program };
        });
        this.programs = _.cloneDeep(temp);
      }
      this.isWaitingForResponse = false;
    });
  }

  initFilter() {
    this.subs.sink = this.forwardTutorialForm
      .get('program')
      .valueChanges.pipe(debounceTime(500))
      .subscribe((data) => {
        console.log('program filter', data);
        if (data && data.length) {
          this.programs = [];
          const pagination = null;
          this.subs.sink = this.tutorialService
            .getAllPrograms(pagination, { program: data.toString() }, this.currentUserTypeId)
            .subscribe((resp) => {
              if (resp && resp.length) {
                this.programList = _.cloneDeep(resp);
                const temp = this.programList.map((list) => {
                  const scholar =
                    list.scholar_season_id && list.scholar_season_id.scholar_season ? list.scholar_season_id.scholar_season : null;
                  return { ...list, name: scholar + ' ' + list.program };
                });
                this.programs = _.cloneDeep(temp);
              }
              console.log('selected', this.selectedProgramList);
            });
        }
      });
  }
  removeTo(id) {
    if (id) {
      const idIndex = this.selectedProgramList.findIndex((list) => list._id === id);
      if (idIndex >= 0) {
        this.selectedProgramList.splice(idIndex, 1);
        const ids = this.selectedProgramList.map((id) => id._id);
        this.forwardTutorialForm.get('program_ids').patchValue(ids);
        this.getUserList();
      }
    }
  }
  setDisableForm() {
    if (
      this.forwardTutorialForm.get('subject').invalid ||
      this.forwardTutorialForm.get('message').invalid ||
      this.selectedProgramList.length === 0 ||
      (this.forwardTutorialForm.get('category').value && this.forwardTutorialForm.get('user_type_id').invalid) ||
      (!this.forwardTutorialForm.get('category').value && this.forwardTutorialForm.get('user_id').invalid)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
