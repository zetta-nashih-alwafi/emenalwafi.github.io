import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TimelineTemplateComponent } from './timeline-template/timeline-template.component';
import { TimelineTemplateRoutingModule } from './timeline-template-routing.module';
import { AddTimelineTemplateDialogComponent } from './timeline-template/add-timeline-template-dialog/add-timeline-template-dialog.component';

@NgModule({
  declarations: [TimelineTemplateComponent, AddTimelineTemplateDialogComponent],
  imports: [
    CommonModule,
    TimelineTemplateRoutingModule,
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
  ],
})
export class TimelineTemplateModule {}
