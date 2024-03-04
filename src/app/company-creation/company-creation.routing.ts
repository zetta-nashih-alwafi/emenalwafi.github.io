import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyCreationComponent } from './company-creation/company-creation.component';


export const routes: Routes = [
   {
      path: '', redirectTo: 'create', pathMatch: 'full'
   },
   {
      path: '',
      children: [
         {
            path: 'create',
            component: CompanyCreationComponent
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
export class CompanyCreationRoutingModule { }
