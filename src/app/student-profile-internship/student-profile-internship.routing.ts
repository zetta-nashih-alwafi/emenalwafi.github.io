import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentProfileInternshipComponent } from './student-profile-internship/student-profile-internship.component';


export const routes: Routes = [
   {
      path: '', redirectTo: 'create', pathMatch: 'full'
   },
   {
      path: '',
      children: [
         {
            path: 'create',
            component: StudentProfileInternshipComponent
         },
      ]
   },
   {
      path: '**', redirectTo: 'create', pathMatch: 'full'
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class StudentProfileInternshipRoutingModule { }
