import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationComponent } from './organization.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
  },
  {
    path: 'organization-detail',
    loadChildren: () => import('../organization-detail/organization-detail.module').then((m) => m.OrganizationDetailModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}
