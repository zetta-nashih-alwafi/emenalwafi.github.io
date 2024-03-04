import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentTemplateDetailsComponent } from './document-template-details/document-template-details.component';
import { DocumentsTabComponent } from './documents-tab.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentsTabComponent,
  },
  {
    path: 'document-template',
    component: DocumentTemplateDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentRoutingModule {}
