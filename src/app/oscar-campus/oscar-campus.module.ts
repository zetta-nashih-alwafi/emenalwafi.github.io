import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OscarCampusRoutingModule } from './oscar-campus-routing.module';
import { OscarCampusComponent } from './oscar-campus.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ImportOscarDialogComponent } from './import-oscar-dialog/import-oscar-dialog.component';
import { OscarAssignProgramDialogComponent } from 'app/shared/components/oscar-assign-program-dialog/oscar-assign-program-dialog.component';

@NgModule({
  declarations: [OscarCampusComponent, ImportOscarDialogComponent],
  imports: [SharedModule, CKEditorModule, CommonModule, OscarCampusRoutingModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class OscarCampusModule {}
