import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyfileRoutingModule } from './myfile-routing.module';
import { MyFileDetailComponent } from './my-file-detail.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [MyFileDetailComponent],
  imports: [
    CommonModule,
    MyfileRoutingModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SweetAlert2Module.forRoot(),
  ]
})
export class MyfileModule { }
