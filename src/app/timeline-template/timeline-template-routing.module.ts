import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { TimelineTemplateComponent } from './timeline-template/timeline-template.component';


const routes: Routes = [
  {
    path: '',
    component: TimelineTemplateComponent,
    canActivate: [PermissionGuard],
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
  exports: [RouterModule]
})
export class TimelineTemplateRoutingModule { }
