import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { FollowUpContractComponent } from './follow-up-contract/follow-up-contract.component';
import { FollowUpContractRoutingModule } from './follow-up-contract-routing.module';
import { RefuseToSignNoteDialogComponent } from './refuse-to-sign-note-dialog/refuse-to-sign-note-dialog.component';

@NgModule({
  declarations: [FollowUpContractComponent, RefuseToSignNoteDialogComponent],
  imports: [CommonModule, SharedModule, FollowUpContractRoutingModule, SweetAlert2Module.forRoot(), NgSelectModule],
})
export class FollowUpContractModule {}
