import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import { FormFillingRevisionDialogComponent } from '../form-filling-revision-dialog/form-filling-revision-dialog.component';
import { FormFillingService } from '../form-filling.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

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
}

interface UserType {
  _id: string;
  name: string;
}

@Component({
  selector: 'ms-form-filling-revision-box',
  templateUrl: './form-filling-revision-box.component.html',
  styleUrls: ['./form-filling-revision-box.component.scss'],
  providers: [ParseStringDatePipe, ParseUtcToLocalPipe],
})
export class FormFillingRevisionBoxComponent implements OnInit {
  isExpanded = false;
  _subs = new SubSink();
  _messages: Message[] = [];
  _unformattedMessages: Message[] = [];
  isWaitingForResponse: boolean;
  datePipe;

  @Input() formDetail;
  @Input() dataForm;
  @Input() stepId;
  @Input() stepData: any;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  @Input() set messages(value: Message[]) {
    this._messages = this.formatMessages(value);
    this._unformattedMessages = value;
  }

  get messages() {
    return this._messages;
  }

  get unformattedMessages() {
    return this._unformattedMessages;
  }

  constructor(
    private dialog: MatDialog,
    private parseStringDate: ParseStringDatePipe,
    private parseUtcToLocal: ParseUtcToLocalPipe,
    public translate: TranslateService,
    private formFillingService: FormFillingService,
  ) {}

  ngOnInit() {
    console.log('messages', this.messages);
  }

  openRevisionDialog() {
    this._subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          type: 'reply',
          formData: this.formDetail,
          stepId: this.stepId ? this.stepId : null,
          existingMessages: this.unformattedMessages,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        this.triggerRefresh.emit(null);
      });
  }

  positionChat(message) {
    let classPosition;
    if (this.formDetail.formType === 'teacher_contract') {
      if (this.formDetail.formId === this.formDetail.userId) {
        if (message && message.user_type_id && message.user_type_id.name && message.user_type_id.name === 'Teacher') {
          classPosition = 'right-side';
        } else {
          classPosition = 'left-side';
        }
      } else {
        if (message.created_by && message.created_by._id === this.formDetail.userId) {
          classPosition = 'right-side';
        } else {
          classPosition = 'left-side';
        }
      }
    } else {
      if (message && message.created_by && message.created_by._id) {
        if (message.created_by._id === this.formDetail.userId) {
          classPosition = 'right-side';
        } else {
          classPosition = 'left-side';
        }
      }
    }

    return classPosition;
  }

  chatHeaderName(message) {
    let headerName;
    if (message && message.user_type_id && message.user_type_id.name === 'Teacher') {
      // console.log('teacher');
      if (this.dataForm && this.dataForm.last_name && this.dataForm.first_name && this.dataForm.civility) {
        headerName = this.translate.instant(this.dataForm.civility) + ' ' + this.dataForm.first_name + ' ' + this.dataForm.last_name;
      }
    } else {
      if (message && message.created_by) {
        const civility = message.created_by.civility === 'neutral' ? ' ' : this.translate.instant(message.created_by.civility);
        headerName = civility + ' ' + message.created_by.first_name + ' ' + message.created_by.last_name;
      }
    }
    return headerName;
  }

  // transform the dates to meet the specification
  formatMessages(messages: Message[]) {
    return messages
      .map((message) => ({
        ...message,
        created_date: message.created_date,
        created_time: this.parseUtcToLocal.transform(message && message.created_time ? message.created_time : ''),
      }))
      .reverse();
  }

  getTranslatedDate(dateRaw) {
    if (typeof dateRaw === 'object') {
      const date = new Date(dateRaw.year, dateRaw.month, dateRaw.date, dateRaw.hour, dateRaw.minute);
      this.datePipe = new DatePipe(this.translate.currentLang);
      return this.datePipe.transform(date, 'EEE d MMM, y');
    } else {
      let date = dateRaw;
      if (typeof date === 'number') {
        date = date.toString();
      }
      if (date.length === 8) {
        const year: number = parseInt(date.substring(0, 4));
        const month: number = parseInt(date.substring(4, 6));
        const day: number = parseInt(date.substring(6, 8));
        date = new Date(year, month, day);
      }
      this.datePipe = new DatePipe(this.translate.currentLang);
      const formatDate = moment(date, 'DD/MM/YYYY');
      const dateTranslate = this.datePipe.transform(formatDate, 'EEEE d MMMM y');
      return dateTranslate;
    }
  }
}
