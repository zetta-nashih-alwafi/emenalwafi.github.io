import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CompaniesInternshipRoutingModule } from './companies-internship-routing.module';
import { CompaniesInternshipComponent } from './companies-internship/companies-internship.component';
// import { CompanyFileModule } from 'app/company-file/company-file.module';

@NgModule({
  declarations: [CompaniesInternshipComponent],
  imports: [
    CommonModule,
    CompaniesInternshipRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),

    NgxMaterialTimepickerModule,
    // CompanyFileModule,
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
    {
      provide: LOCALE_ID,
      useValue: 'id-ID',
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-ES',
    },
  ],
})
export class CompaniesInternshipModule {}
