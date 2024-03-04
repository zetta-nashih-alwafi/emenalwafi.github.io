import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-refuse-to-sign-note-dialog',
  templateUrl: './refuse-to-sign-note-dialog.component.html',
  styleUrls: ['./refuse-to-sign-note-dialog.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class RefuseToSignNoteDialogComponent implements OnInit,OnDestroy {

  isWaitingForResponse = false;
  private subs = new SubSink();

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<RefuseToSignNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private authService: AuthService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
  ) {}

  ngOnInit(): void {
  }
  displayDate(date,time){
    if (date) {
      const dataTime = time? time: '15:59'
      const parsed = this.parseUTCToLocalPipe.transformDate(date, dataTime);
      return parsed;
    } else {
      return '';
    }
  }
  closeDialog(resp?: any) {
    this.dialogRef.close(resp);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
