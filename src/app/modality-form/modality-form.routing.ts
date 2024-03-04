import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalityFormComponent } from './modality-form.component';

export const routes: Routes = [
   {
     path: '',
     component: ModalityFormComponent,
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class ModalityFormRoutingModule { }
