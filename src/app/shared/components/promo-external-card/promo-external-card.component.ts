import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationUrls } from 'app/shared/settings';
@Component({
  selector: 'ms-promo-external-card',
  templateUrl: './promo-external-card.component.html',
  styleUrls: ['./promo-external-card.component.scss']
})
export class PromoExternalCardComponent implements OnInit {
  slideAttractions = false;
  myInnerHeight = 600;
  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: false,
    arrows: false,
  };
  @Input() imageUpload;
  @Input() videoLink;
  @Input() title;
  @Input() subTitle;
  @Input() story;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  disableVideo = true;
  disableImage = true;

  constructor( private sanitizer: DomSanitizer ) { }

  ngOnInit() {
  }
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }
  ngOnChanges(){
    if(this.imageUpload) {
      this.disableImage = false;
    }
    if(this.videoLink) {
      this.disableVideo = false;
    }
  }
  sanitizeVideoUrl(url) {
    return url? this.sanitizer.bypassSecurityTrustResourceUrl(url) : false;
  }
  sanitizeImageUrl(url) {
    return url? this.sanitizer.bypassSecurityTrustUrl(url) : false;
  }
}
