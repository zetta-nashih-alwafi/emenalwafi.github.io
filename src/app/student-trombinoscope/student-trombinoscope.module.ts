import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentTrombinoscopeRoutingModule } from './student-trombinoscope-routing.module';
import { StudentTrombinoscopeParentComponent } from './student-trombinoscope-parent.component';
import { TrombCardStudentComponent } from './tromb-card-student/tromb-card-student.component';
import { TrombFilterCardComponent } from './tromb-filter-card/tromb-filter-card.component';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [StudentTrombinoscopeParentComponent, TrombCardStudentComponent, TrombFilterCardComponent],
  imports: [
    CommonModule,
    StudentTrombinoscopeRoutingModule,
    SharedModule,
    NgSelectModule,
    SweetAlert2Module
  ]
})
export class StudentTrombinoscopeModule { }
