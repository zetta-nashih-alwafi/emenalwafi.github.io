import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserPermissionRoutingModule } from './user-permission-routing';
import { UserPermissionComponent } from './user-permission.component';

@NgModule({
  declarations: [UserPermissionComponent],
  imports: [CommonModule, SharedModule, UserPermissionRoutingModule, SweetAlert2Module.forRoot(), NgSelectModule],
})
export class UserPermissionModule {}
