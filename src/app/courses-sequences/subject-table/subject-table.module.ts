import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubjectTableRoutingModule } from './subject-table-routing.module';
import { SubjectTableComponent } from './subject-table.component';

@NgModule({
  declarations: [SubjectTableComponent],
  imports: [CommonModule, SubjectTableRoutingModule, SharedModule],
})
export class SubjectTableModule {}
