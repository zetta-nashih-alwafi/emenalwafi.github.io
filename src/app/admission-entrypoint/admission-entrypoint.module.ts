import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdmissionEntrypointTabGroupComponent } from './admission-entrypoint-tab-group.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatTabsModule } from '@angular/material/tabs';
import { AdmissionChannelTabComponent } from './intake-channel-tab/intake-channel-tab.component';
import { LevelsTabComponent } from './levels-tab/levels-tab.component';
import { AdmissionEntrypointRoutingModule } from './admission-entrypoint-routing';
import { ScholarPeriodTabComponent } from './scholar-period-tab/scholar-period-tab.component';
import { ScholarshipFeesTabComponent } from './scholarship-fees-tab/scholarship-fees-tab.component';
import { IntakeChannelTableDetailComponent } from './intake-channel-tab/intake-channel-table-detail/intake-channel-table-detail.component';
import { ScholarCardComponent } from './scholar-card/scholar-card.component';
import { ScholarCardDetailComponent } from './scholar-card/scholar-card-detail/scholar-card-detail.component';
import { ScholarSeasonComponent } from './scholar-seasons-detail/scholar-seasons-detail.component';
import { ConditionDialogComponent } from './intake-channel-tab/condition-dialog/condition-dialog.component';

@NgModule({
  declarations: [
    AdmissionEntrypointTabGroupComponent,
    AdmissionChannelTabComponent,
    LevelsTabComponent,
    ScholarPeriodTabComponent,
    ScholarshipFeesTabComponent,
    IntakeChannelTableDetailComponent,
    ScholarCardComponent,
    ScholarCardDetailComponent,
    ScholarSeasonComponent,
    ConditionDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    AdmissionEntrypointRoutingModule,
    SweetAlert2Module.forRoot(),
    MatTabsModule,
  ],
})
export class AdmissionEntrypointModule {}
