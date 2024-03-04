import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AlumniRoutingModule } from './alumni-routing.module';
import { AlumniTableComponent } from './alumni-table/alumni-table.component';

@NgModule({
  declarations: [AlumniTableComponent],
  imports: [
    CommonModule,
    AlumniRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),

    NgxMaterialTimepickerModule,
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
export class AlumniModule {}
