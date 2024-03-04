import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationDetailComponent } from './organization-detail.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationDetailRoutingModule {}
