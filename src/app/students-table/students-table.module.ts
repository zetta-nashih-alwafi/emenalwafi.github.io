import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsTableRoutingModule } from './students-table-routing.module';
import { AssignSequenceDialogComponent } from './assign-sequence-dialog/assign-sequence-dialog.component';
import { StudentsTableComponent } from './students-table.component';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { SendOneTimeFormDialogComponent } from './send-one-time-form-dialog/send-one-time-form-dialog.component';
import { AddDocumentBuilderDialogComponent } from './add-document-builder-dialog/add-document-builder-dialog.component';

@NgModule({
  declarations: [StudentsTableComponent, AssignSequenceDialogComponent, AddDocumentBuilderDialogComponent, SendOneTimeFormDialogComponent],
  imports: [CommonModule, SharedModule, StudentsTableRoutingModule, SweetAlert2Module.forRoot(), NgSelectModule],
})
export class StudentsTableModule {}
