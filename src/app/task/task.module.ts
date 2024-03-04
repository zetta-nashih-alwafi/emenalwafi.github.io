import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskComponent } from './task/task.component';
import { TaskRoutingModule } from './task-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { DatePipe } from '@angular/common';
import { AddTestTaskDialogComponent } from './add-test-task-dialog/add-test-task-dialog.component';
import { AssignCorrectorDialogComponent } from './assign-corrector-dialog/assign-corrector-dialog.component';
import { ManualTaskDialogComponent } from './manual-task-dialog/manual-task-dialog.component';
import { AddManualTaskDialogComponent } from './add-manual-task-dialog/add-manual-task-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    TaskComponent,
    AddTestTaskDialogComponent,
    AssignCorrectorDialogComponent,
    ManualTaskDialogComponent,
    AddManualTaskDialogComponent,
  ],
  imports: [CommonModule, SharedModule, TaskRoutingModule, NgSelectModule],
  providers: [DatePipe],
})
export class TaskModule {}
