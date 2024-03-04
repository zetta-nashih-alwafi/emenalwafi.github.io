import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterBreadcrumbComponent } from './filter-breadcrumb.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    FilterBreadcrumbComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule
  ],
  exports: [FilterBreadcrumbComponent]
})
export class FilterBreadcrumbModule { }
