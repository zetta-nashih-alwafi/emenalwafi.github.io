import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignmentReadmissionRoutingModule } from './assignment-readmission-routing.module';
import { AssignmentReadmissionComponent } from './assignment-readmission.component';
import { EditJuryDecisionDialogComponent } from './edit-jury-decision-dialog/edit-jury-decision-dialog.component';
import { EditProgramDesiredDialogComponent } from './edit-program-desired-dialog/edit-program-desired-dialog.component';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { OscarAssignProgramDialogComponent } from 'app/shared/components/oscar-assign-program-dialog/oscar-assign-program-dialog.component';
import { UpdateFinancialSupportStatusDialogComponent } from './update-financial-support-status-dialog/update-financial-support-status-dialog.component';

@NgModule({
  declarations: [
    AssignmentReadmissionComponent,
    EditJuryDecisionDialogComponent,
    EditProgramDesiredDialogComponent,
    UpdateFinancialSupportStatusDialogComponent,
  ],
  imports: [CommonModule, SharedModule, AssignmentReadmissionRoutingModule, NgSelectModule, SweetAlert2Module.forRoot()],
  exports: [EditJuryDecisionDialogComponent],
})
export class AssignmentReadmissionModule {}
