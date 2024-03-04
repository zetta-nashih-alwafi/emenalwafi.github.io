import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdmissionDiplomaComponent } from './admission-diploma.component';

export const routes: Routes = [
   {
     path: '',
     component: AdmissionDiplomaComponent,
   },
   {
     path: ':formId',
     component: AdmissionDiplomaComponent,
   },
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class AdmissionDiplomaRoutingModule { }
