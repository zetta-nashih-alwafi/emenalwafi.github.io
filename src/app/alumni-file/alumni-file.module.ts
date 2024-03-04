import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AlumniFileComponent } from './alumni-file/alumni-file.component';
import { AlumniFileRoutingModule } from './alumni-file-routing.module';
import { AlumniHistoryTabComponent } from './alumni-history-tab/alumni-history-tab.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AlumniCardListComponent } from './alumni-card-list/alumni-card-list.component';
import { AlumniCardDetailsComponent } from './alumni-card-details/alumni-card-details.component';
import { AlumniInformationTabComponent } from './alumni-information-tab/alumni-information-tab.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AlumniSurveyTabComponent } from './alumni-survey-tab/alumni-survey-tab.component';
import { AlumniCommentariesTabComponent } from './alumni-commentaries-tab/alumni-commentaries-tab.component';

@NgModule({
  declarations: [
    AlumniFileComponent,
    AlumniHistoryTabComponent,
    AlumniCardListComponent,
    AlumniCardDetailsComponent,
    AlumniInformationTabComponent,
    AlumniSurveyTabComponent,
    AlumniCommentariesTabComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,

    NgxMaterialTimepickerModule,
    AlumniFileRoutingModule,
    SweetAlert2Module.forRoot(),
  ],
  providers: [DatePipe],
})
export class AlumniFileModule {}
