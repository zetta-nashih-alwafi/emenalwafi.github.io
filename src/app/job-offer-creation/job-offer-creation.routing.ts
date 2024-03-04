import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobOfferComponent } from './job-offer-creation/job-offer-creation.component';


export const routes: Routes = [
   {
      path: '', redirectTo: 'create', pathMatch: 'full'
   },
   {
      path: '',
      children: [
         {
            path: 'create',
            component: JobOfferComponent
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
export class JobOfferRoutingModule { }
