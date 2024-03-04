import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { ImportFinanceComponent } from './import-finance/import-finance.component';

export const routes: Routes = [
  {
    path: '',
    component: ImportFinanceComponent,
    canActivate: [PermissionGuard],
    canDeactivate: [CanExitService],
    data: {},
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportFinanceRoutingModule {}
