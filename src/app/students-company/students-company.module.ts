import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CompanyStudentsComponent } from './students/company-students.component';
import { StudentsCompanyRoutingModule } from './students-company-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [CompanyStudentsComponent],
  imports: [CommonModule, SharedModule, StudentsCompanyRoutingModule, SweetAlert2Module.forRoot(), CKEditorModule, NgSelectModule],
})
export class StudentsCompanyModule {}
