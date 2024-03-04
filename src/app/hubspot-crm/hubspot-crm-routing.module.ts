import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HubspotCrmComponent } from './hubspot-crm.component';

const routes: Routes = [
  {
    path: '',
    component: HubspotCrmComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HubspotCrmRoutingModule {}
