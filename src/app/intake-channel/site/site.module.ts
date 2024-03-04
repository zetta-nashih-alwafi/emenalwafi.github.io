import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteComponent } from './site.component';
import { AddSiteDialogComponent } from './add-site-dialog/add-site-dialog.component';
import { SiteRoutingModule } from './site-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [SiteComponent, AddSiteDialogComponent],
  imports: [CommonModule, SiteRoutingModule, SharedModule, SweetAlert2Module.forRoot()],
  providers: [],
})
export class SiteModule {}
