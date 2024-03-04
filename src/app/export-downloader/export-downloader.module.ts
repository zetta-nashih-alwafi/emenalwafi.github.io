import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExportDownloaderRoutingModule } from './export-downloader-routing.module';
import { ExportDownloaderScreenComponent } from './export-downloader-screen.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    ExportDownloaderScreenComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ExportDownloaderRoutingModule
  ]
})
export class ExportDownloaderModule { }
