import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllNewsComponent } from './all-news/all-news.component';
import { ManageNewsComponent } from './manage-news/manage-news.component';
import { CanExitService } from 'app/service/exit-guard/can-exit.service';

const routes: Routes = [
  {
    path: 'all-news',
    component: AllNewsComponent,
  },
  {
    path: 'manage-news',
    component: ManageNewsComponent,
    canDeactivate: [CanExitService],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
