import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewsRoutingModule } from './news-routing.module';
import { AllNewsComponent } from './all-news/all-news.component';
import { AllNewsDetailComponent } from './all-news/all-news-detail/all-news-detail.component';
import { ManageNewsComponent } from './manage-news/manage-news.component';
import { ManageNewsFormComponent } from './manage-news/manage-news-form/manage-news-form.component';
import { ManageNewsTableComponent } from './manage-news/manage-news-table/manage-news-table.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
@NgModule({
  declarations: [
    AllNewsComponent,
    AllNewsDetailComponent,
    ManageNewsComponent,
    ManageNewsTableComponent,
    ManageNewsFormComponent
  ],
  imports: [
    CommonModule,
    NewsRoutingModule,
    SharedModule,
    CKEditorModule,
  ]
})
export class NewsModule { }
