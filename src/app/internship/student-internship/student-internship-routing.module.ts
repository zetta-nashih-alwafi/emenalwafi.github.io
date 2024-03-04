import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentInternshipComponent } from './student-internship.component';

const routes: Routes = [
  {
    path: 'my-internships',
    pathMatch: 'full',
    component: StudentInternshipComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: StudentInternshipComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentInternshipRoutingModule {}
