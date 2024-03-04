import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { SequenceTableComponent } from './sequence-table.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SequenceTableRoutingModule } from './sequence-table-routing.module';
import { AddSequenceDialogComponent } from './add-sequence-dialog/add-sequence-dialog.component';

@NgModule({
  declarations: [SequenceTableComponent],
  imports: [CommonModule, SequenceTableRoutingModule, SharedModule, NgSelectModule],
})
export class SequenceTableModule {}
