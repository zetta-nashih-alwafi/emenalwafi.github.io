import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectorComponent } from './sector.component';
import { AddSectorDialogComponent } from './add-sector-dialog/add-sector-dialog.component';
import { SectorRoutingModule } from './sector-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [SectorComponent, AddSectorDialogComponent],
  imports: [CommonModule, SectorRoutingModule, SharedModule, SweetAlert2Module],
  providers: [],
})
export class SectorModule {}
