import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CountryNationalityRoutingModule } from './country-nationality-routing.module';
import { CountryNationalityComponent } from './country-nationality.component';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    CountryNationalityComponent
  ],
  imports: [
    CommonModule,
    CountryNationalityRoutingModule,
    SharedModule,
    NgSelectModule,
  ]
})
export class CountryNationalityModule { }
