import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidatesFcRoutingModule } from './candidates-fc-routing.module';
import { CandidatesFcTableComponent } from './candidates-fc-table/candidates-fc-table.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { CandidatesModule } from 'app/candidates/candidates.module';

@NgModule({
  declarations: [CandidatesFcTableComponent],
  imports: [CommonModule, CandidatesFcRoutingModule, SharedModule, SweetAlert2Module.forRoot(), NgSelectModule,CandidatesModule],
})
export class CandidatesFcModule {}
