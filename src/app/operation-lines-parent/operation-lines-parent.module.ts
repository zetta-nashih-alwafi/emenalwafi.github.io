import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperationLinesParentRoutingModule } from './operation-lines-parent-routing.module';
import { OperationLinesParentComponent } from './operation-lines-parent.component';
import { OperationNonExportedComponent } from './operation-non-exported/operation-non-exported.component';
import { OperationExportedComponent } from './operation-exported/operation-exported.component';
import { ScholarSeasonDialogComponent } from './operation-non-exported/scholar-season-dialog/scholar-season-dialog.component';


@NgModule({
  declarations: [
    OperationLinesParentComponent,
    OperationNonExportedComponent,
    OperationExportedComponent,
    ScholarSeasonDialogComponent
  ],
  imports: [
    CommonModule,
    OperationLinesParentRoutingModule,
    SharedModule,
    SweetAlert2Module.forRoot(),
    NgSelectModule
  ]
})
export class OperationLinesParentModule { }
