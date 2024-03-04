import { AuthService } from './../../service/auth-service/auth.service';
import { StudentsService } from 'app/service/students/students.service';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, FormGroup, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { SubSink } from 'subsink';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'ms-remove-tags-dialog',
  templateUrl: './remove-tags-dialog.component.html',
  styleUrls: ['./remove-tags-dialog.component.scss']
})
export class RemoveTagsDialogComponent implements OnInit, OnDestroy {
  subs = new SubSink();
  isWaitingForResponse = false;
  tagForm = new UntypedFormControl(null)
  tags = []
  currentUser

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RemoveTagsDialogComponent>,
    private translate: TranslateService,
    private studentsService: StudentsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('cek data', this.data)
    this.tags = this.data?.tags?.length ? this.data.tags : []
    this.currentUser = this.authService.getLocalStorageUser();
  }
  checkAllTag() {
    return this.tags?.length === this.tagForm?.value?.length ? true : false
  }
  selectAllTag(event) {
    if (event.checked && this.tags?.length) {
      const tagIds = this.tags?.map(tag => tag?._id)
      this.tagForm.patchValue(tagIds, { emitEvent: false })
    } else {
      this.tagForm.patchValue(null)
    }
  }
  validate() {
    if (this.tagForm?.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.tagForm.markAllAsTouched();
      return;
    }
    const candidateIds = {
      candidate_ids: this.data?.students?.map(student => student?._id)
    }
    const tagIds = this.tagForm?.value
    const userTypesList = this.currentUser?.app_data ? this.currentUser.app_data.user_type_id : [];

    this.isWaitingForResponse = true
    this.subs.sink = this.studentsService.modifyCandidatesTag(userTypesList,candidateIds, tagIds, true, false).subscribe(resp => {
      this.isWaitingForResponse = false
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
    }, err => {
      this.isWaitingForResponse = false;
      this.authService.postErrorLog(err);
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    })
  }
  close() {
    this.dialogRef.close()
  }
  ngOnDestroy() {
    this.subs.unsubscribe()
  }

}
