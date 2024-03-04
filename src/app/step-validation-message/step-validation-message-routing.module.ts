import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { StepValidationMessageComponent } from './step-validation-message/step-validation-message.component';

export const routes: Routes = [
  {
    path: '',
    component: StepValidationMessageComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'setting.message_step.show_perm'
    }
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StepValidationMessageRoutingModule {}