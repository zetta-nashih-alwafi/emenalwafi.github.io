import { UtilityService } from 'app/service/utility/utility.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, uniqBy } from 'lodash';
import { AuthService } from './../../service/auth-service/auth.service';
import { StudentsService } from 'app/service/students/students.service';
import { FormBuilder, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { NgSelectComponent } from '@ng-select/ng-select';
import { removeSpaces } from 'app/service/customvalidator.validator';

@Component({
  selector: 'ms-add-tags-dialog',
  templateUrl: './add-tags-dialog.component.html',
  styleUrls: ['./add-tags-dialog.component.scss'],
})
export class AddTagsDialogComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  subs = new SubSink();
  isWaitingForResponse = false;
  tags = [];
  tagList = [];
  isCreateTag = false;
  currentUser


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddTagsDialogComponent>,
    private fb: UntypedFormBuilder,
    private studentsService: StudentsService,
    private authService: AuthService,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private utilService: UtilityService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getAllTags();
    this.currentUser = this.authService.getLocalStorageUser();
  }

  checkAllTag() {
    return this.tags?.length === this.form.get('tag')?.value?.length ? true : false
  }

  selectAllTag(event) {
    if (event.checked && this.tags?.length) {
      const tagIds = this.tags?.map(tag => tag?._id).filter(tag => tag !== 'create')
      this.form.get('tag')?.patchValue(tagIds, { emitEvent: false })
    } else {
      this.form.get('tag')?.patchValue(null);
    }
  }

  toggleCreateTag(item: any) {
    if (item.name !== 'Create a tag') return;
    this.isCreateTag = true;
  }

  initForm() {
    this.form = this.fb.group({
      tag: [null, Validators.required],
      tag_name: [null],
    });
  }
  getAllTags() {
    this.isWaitingForResponse = true;
    this.tags = [];
    this.tagList = [];
    this.subs.sink = this.studentsService.getAllTags().subscribe(
      (resp) => {
        if (resp) {
          const temp = cloneDeep(resp);
          if (this.data?.tags?.length && this.data?.from === 'student-card') {
            const tagIds = this.data.tags.map((tag) => tag?._id);
            temp.forEach((tag) => {
              if (!tagIds.includes(tag?._id)) {
                this.tags.push(tag);
                this.tagList.push(tag)
              }
            });
          } else {
            this.tags = temp;
            this.tagList = temp;
          }
          this.tagList = uniqBy(this.tagList, '_id');
          this.tagList = this.tagList.sort((a, b) => {
            if (this.utilService.simplifyRegex(a?.name?.toLowerCase()) < this.utilService.simplifyRegex(b?.name?.toLowerCase())) {
              return -1;
            } else if (this.utilService.simplifyRegex(a?.name?.toLowerCase()) > this.utilService.simplifyRegex(b?.name?.toLowerCase())) {
              return 1;
            } else {
              return 0;
            }
          });
          this.tags = uniqBy(this.tags, '_id');
          this.tags = this.tags.sort((a, b) => {
            if (this.utilService.simplifyRegex(a?.name?.toLowerCase()) < this.utilService.simplifyRegex(b?.name?.toLowerCase())) {
              return -1;
            } else if (this.utilService.simplifyRegex(a?.name?.toLowerCase()) > this.utilService.simplifyRegex(b?.name?.toLowerCase())) {
              return 1;
            } else {
              return 0;
            }
          });
          this.tags.unshift({ name: this.translate.instant('StudentCardTag.Create a tag'), _id: 'create' });
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
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
  checkValidator() {
    const value = JSON.stringify(this.form?.get('tag')?.value);
    const realValue = this.form?.get('tag')?.value;
    this.tags = [];
    const varCreate = ['create'];
    if (value === JSON.stringify(varCreate)) {
      this.isCreateTag = true;
      this.form?.get('tag_name')?.setValidators([Validators.required,removeSpaces]);
      this.tags = [{ name: this.translate.instant('StudentCardTag.Create a tag'), _id: 'create' }];
    } else if (realValue?.length) {
      this.isCreateTag = false;
      this.form?.get('tag_name')?.clearValidators();
      this.tags = _.cloneDeep(this.tagList);
    } else {
      this.isCreateTag = false;
      this.form?.get('tag_name')?.clearValidators();
      this.tags = _.cloneDeep(this.tagList);
      this.tags.unshift({ name: this.translate.instant('StudentCardTag.Create a tag'), _id: 'create' });
    }
    this.form?.get('tag_name')?.updateValueAndValidity();
  }
  createPayload(newTag) {
    const tagIds = this.data?.tags?.map((tag) => tag?._id);
    const currentTag = tagIds?.length ? tagIds : [];
    const selectedTag = this.form?.get('tag')?.value;
    if (this.isCreateTag) {
      if (!currentTag?.includes(newTag)) {
        currentTag?.push(newTag);
      }
    } else if (selectedTag?.length && !this.isCreateTag) {
      selectedTag.forEach(tag => {
        if (!currentTag.includes(tag)) {
          currentTag?.push(tag);
        }
      })
    }
    return {
      tag_ids: currentTag,
    };
  }
  validate() {
    if (this.form?.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.form.markAllAsTouched();
      return;
    }
    if (this.isCreateTag) {
      this.createTag();
    } else {
      if (this.data?.from === 'student-card') {
        this.updateCandidate();
      } else if (this.data?.from === 'all-students') {
        this.updateManyCandidate();
      }
    }
  }
  createTag() {
    const payload = {
      name: this.form?.get('tag_name')?.value,
    };
    const tagName = this.form?.get('tag_name')?.value
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentsService.createTag(payload).subscribe(
      (resp) => {
        if (resp) {
          if (this.data?.from === 'student-card') {
            this.updateCandidate(resp?._id);
          } else if (this.data?.from === 'all-students') {
            this.updateManyCandidate(resp?._id);
          }
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        if (err && err['message']?.includes('Tag already exist')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('student_tags_S3.TITLE'),
            html: this.translate.instant('student_tags_S3.TEXT', { tagName }),
            confirmButtonText: this.translate.instant('student_tags_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  updateCandidate(dataNewTagId?) {
    const newTag = dataNewTagId ? dataNewTagId : null;
    const payload = this.createPayload(newTag);
    this.isWaitingForResponse = true;
    // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
    const is_save_identity_student = true;
    this.subs.sink = this.candidateService.UpdateCandidateId(this.data?.candidateId, payload, is_save_identity_student).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
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
  updateManyCandidate(dataNewTagId?) {
    const payload = dataNewTagId ? dataNewTagId : this.form?.get('tag')?.value
    const userTypesList = this.currentUser?.app_data ? this.currentUser.app_data.user_type_id : [];
    const candidateIds = {
      candidate_ids: this.data?.candidateId
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentsService.modifyCandidatesTag(userTypesList, candidateIds, payload, false, true).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
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
  close() {
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  closeSelect(select: NgSelectComponent) {
    select.close();
  }
}
