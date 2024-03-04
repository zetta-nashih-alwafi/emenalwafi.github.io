import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoExternalComponent } from './promo-external/promo-external.component';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { PromoExternalRoutingModule } from './promo-external-routing.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AddPromoExternalDialogComponent } from './add-promo-external-dialog/add-promo-external-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
  declarations: [PromoExternalComponent, AddPromoExternalDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    CKEditorModule,
    NgSelectModule,
    SlickCarouselModule,
    PromoExternalRoutingModule,
    MatSlideToggleModule,
    SweetAlert2Module.forRoot(),
  ],
})
export class PromoExternalModule {}
