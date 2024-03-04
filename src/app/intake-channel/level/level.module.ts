import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LevelComponent } from './level.component';
import { AddLevelDialogComponent } from './add-level-dialog/add-level-dialog.component';
import { LevelRoutingModule } from './level-routing.module';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [LevelComponent, AddLevelDialogComponent],
  imports: [CommonModule, SharedModule, LevelRoutingModule],
  providers: [],
})
export class LevelModule {}
