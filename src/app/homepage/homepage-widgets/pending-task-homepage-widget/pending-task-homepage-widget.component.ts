import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { TaskService } from 'app/service/task/task.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { UtilityService } from 'app/service/utility/utility.service';
import * as moment from 'moment';

@Component({
  selector: 'ms-pending-task-homepage-widget',
  standalone: true,
  imports: [CommonModule, SharedModule],
  providers: [ParseUtcToLocalPipe],
  templateUrl: './pending-task-homepage-widget.component.html',
  styleUrls: ['./pending-task-homepage-widget.component.scss'],
})
export class PendingTaskHomepageWidgetComponent implements OnInit, OnDestroy {
  tasks: any[] = [];
  private subs = new SubSink();

  // User Login Data
  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;

  juryProcessName = '';
  rncpTitle;

  constructor(
    public taskService: TaskService,
    private authService: AuthService,
    private translate: TranslateService,
    private parseUTCtoLocal: ParseUtcToLocalPipe,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    // Get Data User Login
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.getPendingTaskData();
  }

  get currentLang(): string {
    return this.translate.currentLang.toLowerCase();
  }

  getPendingTaskData() {
    const pagination = { limit: 5, page: 0 };
    const sort = { due_date: 'desc' };
    const filter = { task_status: 'todo', is_not_parent_task: true, pending_due_date: true };
    this.subs.sink = this.taskService.getMyTask(pagination, sort, filter, this.currentUserTypeId).subscribe((task) => {
      this.tasks = task;
    });
  }

  translateDate(date) {
    let value = date;
    if (date && typeof date === 'object' && date.time && date.date) {
      return this.parseUTCtoLocal.transformDate(date.date, date.time);
    } else if (date && typeof date === 'object' && !date.time && date.date) {
      return this.parseUTCtoLocal.transformDate(date.date, '15:59');
    } else {
      if (typeof date === 'number') {
        value = date.toString();
      }
      if (value.length === 8 && !value.includes('-')) {
        const year: number = +value.substring(0, 4);
        const month: number = +value.substring(4, 6);
        const day: number = +value.substring(6, 8);
        return [year, month, day].join('-');
      }
    }
  }

  getLocalDate(date) {
    if (date && date.date && date.time) {
      const today = new Date();
      const todaydate = moment(today).format('MM/DD/YYYY');
      const dateeLocal = this.parseUTCtoLocal.transformDate(date.date, date.time);
      const dateResult = moment(dateeLocal, 'DD/MM/YYYY').format('MM/DD/YYYY');
      if (dateResult === todaydate) {
        return 'Due today';
      } else {
        return dateResult;
      }
    } else if (date && date.date && !date.time) {
      const dateeLocal = this.parseUTCtoLocal.transformDate(date.date, '15:59');
      const dateResult = moment(dateeLocal, 'DD/MM/YYYY').format('MM/DD/YYYY');
      return dateResult;
    }
  }

  onOpenTask(task) {
    this.taskService.openTask(task);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
