import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModuleTableRoutingModule } from './module-table-routing.module';
import { ModuleTableComponent } from './module-table.component';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [ModuleTableComponent],
  imports: [CommonModule, ModuleTableRoutingModule, SharedModule, SweetAlert2Module.forRoot()],
})
export class ModuleTableModule {}
