import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InternshipAggrementComponent } from './internship-aggrement/internship-aggrement.component';


export const routes: Routes = [
   {
      path: '', redirectTo: 'detail', pathMatch: 'full'
   },
   {
      path: '',
      children: [
         {
            path: 'detail',
            component: InternshipAggrementComponent
         },
      ]
   },
   {
      path: '**', redirectTo: 'detail', pathMatch: 'full'
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class InternshipAggrementRoutingModule { }
