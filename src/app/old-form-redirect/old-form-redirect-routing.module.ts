import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormRedirectComponent } from './form-redirect/form-redirect.component';


const routes: Routes = [
  {
    path: '',
    component: FormRedirectComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OldFormRedirectRoutingModule { }
