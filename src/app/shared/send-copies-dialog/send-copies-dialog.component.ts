import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CrossCorrectionService } from 'app/service/cross-correction/cross-correction.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-send-copies-dialog',
  templateUrl: './send-copies-dialog.component.html',
  styleUrls: ['./send-copies-dialog.component.scss'],
})
export class SendCopiesDialogComponent implements OnInit {
  private subs = new SubSink();
  crossCorrectionDetails;
  isForCertifier: boolean = false;
  isTaskDone = false;

  action = new UntypedFormControl('');

  constructor(
    public dialogRef: MatDialogRef<SendCopiesDialogComponent>,
    private crossCorrectionService: CrossCorrectionService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log('data yang dipilih', this.data);
    this.isForCertifier = this.data.type === 'send_copies_validate' ? true : false;
    if (this.isForCertifier) {
      this.getDetailCertifier();
    } else {
      this.getDetail();
    }
  }

  getDetail() {
    this.subs.sink = this.crossCorrectionService
      .getCorrectorsAndStudentsSendCopies(this.data.rncp._id, this.data.test._id, this.data.class_id._id, this.data._id)
      .subscribe(
        (res) => {
          this.crossCorrectionDetails = res[0];
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

  getDetailCertifier() {
    this.subs.sink = this.crossCorrectionService.getValidateSendCopies(this.data._id).subscribe(
      (res) => {
        this.crossCorrectionDetails = res;
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

  save() {
    // console.log(this.isForCertifier);
    if (this.isForCertifier) {
      // console.log('1');
      this.subs.sink = this.crossCorrectionService.markSendCopiesValidateAsDone(this.data._id, this.action.value).subscribe(
        (res) => {
          if (res) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo !'),
            }).then((result) => {
              this.dialogRef.close(true);
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
    } else {
      // console.log('2');
      this.subs.sink = this.crossCorrectionService.markSendCopiesAsDoneAndCreateMarkEntry(this.data._id, this.action.value).subscribe(
        (resp) => {
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo !'),
            }).then((result) => {
              this.dialogRef.close(true);
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
  }
}
