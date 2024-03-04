import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScholarSeasonComponent } from './scholar-season.component';
import { AddScholarSeasonDialogComponent } from './add-scholar-season-dialog/add-scholar-season-dialog.component';
import { ScholarSeasonRoutingModule } from './scholar-season-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ScholarSeasonComponent, AddScholarSeasonDialogComponent],
  imports: [CommonModule, ScholarSeasonRoutingModule, SharedModule, NgSelectModule],
  providers: [],
})
export class ScholarSeasonModule {}
