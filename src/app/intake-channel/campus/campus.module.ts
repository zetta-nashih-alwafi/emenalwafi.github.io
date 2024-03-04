import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampusFormComponent } from './intake-campus-form/intake-campus-form.component';
import { AddSiteCampusDialogComponent } from './add-site-campus-dialog/add-site-campus-dialog.component';
import { CampusComponent } from './campus.component';
import { CampusRoutingModule } from './campus-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@NgModule({
  declarations: [CampusFormComponent, AddSiteCampusDialogComponent, CampusComponent],
  imports: [CommonModule, CampusRoutingModule, SharedModule, NgSelectModule, NgxMaterialTimepickerModule],
  providers: [],
})
export class CampusModule {}
