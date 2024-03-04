import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { InternshipFileRoutingModule } from './internship-file-routing.module';
import { NoteInternshipComponent } from './internship-note-tab/internship-note-tab.component';
import { InternshipProfileComponent } from './internship-profile-tab/internship-profile-tab.component';
import { InternshipHistoryTabComponent } from './internship-history-tab/internship-history-tab.component';
import { InternshipFileComponent } from './internship-file/internship-file.component';
import { InternshipCardListComponent } from './internship-card-list/internship-card-list.component';
import { InternshipCardDetailsComponent } from './internship-card-details/internship-card-details.component';
import { InternshipFeesComponent } from './frais-de-scolarite-tab/frais-de-scolarite-tab.component';
import { ReconciliationDialogComponent } from './reconciliation-dialog/reconciliation-dialog.component';

@NgModule({
  declarations: [
    InternshipFileComponent,
    InternshipCardDetailsComponent,
    NoteInternshipComponent,
    InternshipHistoryTabComponent,
    InternshipCardListComponent,
    InternshipProfileComponent,
    InternshipFeesComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    InternshipFileRoutingModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule,

    CKEditorModule,
    NgxMaterialTimepickerModule,
  ],

  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR', // 'de-DE' for Germany, 'fr-FR' for France ...
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
export class InternshipFileModule {}
