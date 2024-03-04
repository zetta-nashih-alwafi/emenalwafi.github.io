import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CandidatesComponent } from './candidates/candidates.component';
import { CandidatesRoutingModule } from './candidates-routing.module';
import { AssignRateProfileDialogComponent } from './assign-rate-profile-dialog/assign-rate-profile-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TransferFcProgramCandidateDialogComponent } from './transfer-fc-program-candidate/transfer-fc-program-candidate-dialog.component';

@NgModule({
  declarations: [
    CandidatesComponent,
    AssignRateProfileDialogComponent,
    TransferFcProgramCandidateDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CandidatesRoutingModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule
  ]
})
export class CandidatesModule {}
