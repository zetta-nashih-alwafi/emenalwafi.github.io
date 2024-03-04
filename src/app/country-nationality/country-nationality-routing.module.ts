import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryNationalityComponent } from './country-nationality.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CountryNationalityComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CountryNationalityRoutingModule { }
