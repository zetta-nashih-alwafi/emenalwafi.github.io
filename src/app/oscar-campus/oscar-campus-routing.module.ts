import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OscarCampusComponent } from './oscar-campus.component';

const routes: Routes = [
  {
    path: '',
    component: OscarCampusComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OscarCampusRoutingModule {}
