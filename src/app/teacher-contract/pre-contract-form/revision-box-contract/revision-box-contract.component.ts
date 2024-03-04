import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import { RevisionBoxContractDialogComponent } from '../revision-box-contract-dialog/revision-box-contract-dialog.component';

interface Message {
  created_date: string;
  created_time: string;
  created_by: User;
  user_type_id: UserType;
  message: string;
}

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  civility: string;
  entities: any;
}

interface UserType {
  _id: string;
  name: string;
}

@Component({
  selector: 'ms-revision-box-contract',
  templateUrl: './revision-box-contract.component.html',
  styleUrls: ['./revision-box-contract.component.scss'],
  providers: [ParseStringDatePipe, ParseUtcToLocalPipe],
})
export class RevisionBoxContractComponent implements OnInit {
  isExpanded = false;
  _subs = new SubSink();
  _messages: Message[] = [];
  _unformattedMessages: Message[] = [];
  @Input() set messages(value: Message[]) {
    this._messages = this.formatMessages(value);
    this._unformattedMessages = value;
  }
  @Input() disabledReply: boolean;
  @Input() formData;
  @Input() formDetail;
  @Input() stepId;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  get messages() {
    return this._messages;
  }

  get unformattedMessages() {
    return this._unformattedMessages;
  }

  constructor(private dialog: MatDialog, private parseStringDate: ParseStringDatePipe, private parseUtcToLocal: ParseUtcToLocalPipe) {}

  ngOnInit() {
    console.log('message', this.messages);
  }

  openRevisionDialog() {
    console.log('openRevisionDialog', this.unformattedMessages, this.messages);
    this._subs.sink = this.dialog
      .open(RevisionBoxContractDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          type: 'reply',
          formData: this.formDetail,
          stepId: this.stepId ? this.stepId : null,
          existingMessages: this.messages,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        this.triggerRefresh.emit(null);
      });
  }

  onExpand() {
    this.isExpanded = !this.isExpanded;
  }

  // transform the dates to meet the specification
  formatMessages(messages: Message[]) {
    return messages
      .filter((message) => {
        if (message) {
          return {
            ...message,
            created_date: this.parseStringDate.transformStringToDateWithMonthName(message.created_date),
            created_time: this.parseUtcToLocal.transform(message.created_time),
          };
        }
      })
      .reverse();
  }

  getTime(item) {
    let time = '';
    time = this.parseUtcToLocal.transformAMPM(item);
    return time;
  }
}
