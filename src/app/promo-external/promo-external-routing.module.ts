import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { PromoExternalComponent } from './promo-external/promo-external.component';

export const routes: Routes = [
  {
    path: '',
    component: PromoExternalComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'setting.external_promotion.show_perm'
    },
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
export class PromoExternalRoutingModule {}