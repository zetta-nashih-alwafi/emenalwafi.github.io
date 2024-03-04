import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormBuilderDetailTabsComponent } from './form-builder-detail-tabs/form-builder-detail-tabs.component';
import { FormBuilderTableComponent } from './form-builder-table.component';
import { KeyTableWindowComponent } from './key-table-window/key-table-window.component';

const routes: Routes = [
  {
    path: '',
    component: FormBuilderTableComponent,
  },
  {
    path: 'template-detail',
    component: FormBuilderDetailTabsComponent,
  },
  {
    path: 'key-table',
    component: KeyTableWindowComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormBuilderRoutingModule {}
