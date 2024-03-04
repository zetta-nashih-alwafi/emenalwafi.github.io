import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { CourseSequenceGroupComponent } from './course-sequence-group/course-sequence-group.component';
import { TemplateSequenceParentComponent } from './template-sequence-parent/template-sequence-parent.component';
import { TemplateSequenceComponent } from './template.component';

export const routes: Routes = [
  {
    path: '',
    component: TemplateSequenceComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'courses_sequences.template.show_perm',
    },
  },
  {
    path: 'form-detail',
    children: [
      { path: '', component: TemplateSequenceParentComponent },
      { path: ':id', component: TemplateSequenceParentComponent },
    ],
  },
  {
    path: 'program-sequence',
    children: [
      { path: '', component: CourseSequenceGroupComponent },
      { path: ':id', component: CourseSequenceGroupComponent },
    ],
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
export class TemplateSequenceRoutingModule {}
