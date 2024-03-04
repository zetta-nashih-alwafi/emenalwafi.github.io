import { AuthService } from './../../service/auth-service/auth.service';
import { cloneDeep, uniqBy } from 'lodash';
import { StudentsService } from './../../service/students/students.service';
import { AddTagsDialogComponent } from 'app/all-students-table/add-tags-dialog/add-tags-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PermissionService } from 'app/service/permission/permission.service';
import { SubSink } from 'subsink';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PageTitleService } from './../../core/page-title/page-title.service';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'ms-student-tags-tab-detail',
  templateUrl: './student-tags-tab-detail.component.html',
  styleUrls: ['./student-tags-tab-detail.component.scss'],
})
export class StudentTagsTabDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() candidateId;
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  isWaitingForResponse = false;
  tags = [];
  candidate;
  constructor(
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    public permission: PermissionService,
    public dialog: MatDialog,
    private studentsService: StudentsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.updatePageTitle();
    this.getTags();
  }
  ngOnChanges() {
    this.reload.emit(true);
  }
  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card - Tags'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card - Tags'));
    });
  }
  getTags() {
    this.tags = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.studentsService.getOneCandidateTag(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.candidate = cloneDeep(resp);
          this.tags = uniqBy(this.candidate?.tag_ids, '_id');
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
  addTag() {
    this.subs.sink = this.dialog
      .open(AddTagsDialogComponent, {
        width: '600px',
        panelClass: 'no-padding-pop-up',
        disableClose: true,
        autoFocus:false,
        data: {
          candidateId: this.candidateId,
          tags: this.tags,
          from: 'student-card',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.getTags();
        }
      });
  }
  removeTag(currentTag) {
    const tagName = currentTag?.name;
    const studentName =
      this.candidate?.last_name?.toUpperCase() +
      ' ' +
      this.candidate?.first_name +
      (this.candidate?.civility ? ' ' + this.translate.instant(this.candidate?.civility) : '');
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('student_tags_S1.TITLE'),
      html: this.translate.instant('student_tags_S1.TEXT', {
        tagName,
        studentName,
      }),
      confirmButtonText: this.translate.instant('student_tags_S1.BUTTON_1'),
      cancelButtonText: this.translate.instant('student_tags_S1.BUTTON_2'),
      allowEscapeKey: true,
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
    }).then((res) => {
      if (res.value) {
        const tagIds = this.tags?.filter((tag) => tag?._id !== currentTag?._id)?.map((curr) => curr?._id);
        const payload = {
          tag_ids: tagIds?.length ? tagIds : null,
        };
        this.isWaitingForResponse = true;
        // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
        const is_save_identity_student = true;
        this.subs.sink = this.studentsService.updateCandidateTag(this.candidateId, payload, is_save_identity_student).subscribe(
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
                this.getTags();
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
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
