import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-reg-step-validation-message',
  templateUrl: './reg-step-validation-message.component.html',
  styleUrls: ['./reg-step-validation-message.component.scss']
})
export class RegStepValidationMessageComponent implements OnInit, OnChanges {

  @Input() firstTitle;
  @Input() secondTitle;
  @Input() imageUpload;
  @Input() videoLink;
  @Input() validationStep;
  @Input() closeIcon;
  disableVideo = true;
  disableImage = true;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    
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
