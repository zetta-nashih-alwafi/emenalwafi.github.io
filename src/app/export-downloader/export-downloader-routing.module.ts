import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportDownloaderScreenComponent } from './export-downloader-screen.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';

const routes: Routes = [
  {
    path: ':fileName/:fileToken',
    component: ExportDownloaderScreenComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExportDownloaderRoutingModule { }
