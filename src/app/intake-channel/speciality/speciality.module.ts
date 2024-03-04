import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialityComponent } from './speciality.component';
import { SpecialityRoutingModule } from './speciality-routing.module';
import { AddSpecialityDialogComponent } from './add-speciality-dialog/add-speciality-dialog.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [SpecialityComponent, AddSpecialityDialogComponent],
  imports: [CommonModule, SpecialityRoutingModule, SharedModule, CKEditorModule, NgSelectModule, SweetAlert2Module.forRoot()],
  providers: [],
})
export class SpecialityModule {}
