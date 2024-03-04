import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { ExportDownloaderService } from './export-downloader.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'ms-export-downloader-screen',
  templateUrl: './export-downloader-screen.component.html',
  styleUrls: ['./export-downloader-screen.component.scss']
})
export class ExportDownloaderScreenComponent implements OnInit, OnDestroy {
  isLoading : Boolean = true;
  fileName : string = '';
  fileToken : string = '';
  subs = new SubSink();

  constructor(private router: ActivatedRoute, private exportDownloaderService: ExportDownloaderService, private translate: TranslateService, private route: Router) { }

  // *************** Initialize Component
  ngOnInit(): void {
    // *************** Fetch the FileName & File Token, if no display swal token no longer working and route to mailbox
    this.router.params.subscribe((param) => {
      this.fileName = param?.fileName ? param?.fileName : '';
      this.fileToken = param?.fileToken ? param?.fileToken : '';
      if (this.fileName && this.fileToken) {
        this.checkFileTokenValidity();
      } else {
        this.swalExpiredFileToken();
      }
    });
  }

  // *************** Function to check the validity of the token
  checkFileTokenValidity() {
    if (this.fileToken) {
      this.subs.sink = this.exportDownloaderService.checkFileExpirationTokenForExport(this.fileToken).subscribe(response => {
        this.isLoading = false;
        if (response === 'file token still active') {
          // *************** If valid, then download the file
          this.downloadFile();
        } else {
          // *************** If invalid, then display swal token expired
          this.swalExpiredFileToken();
        }
      })
    }
  }

  // *************** function to download the file
  downloadFile() {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = `${environment.apiUrl}/fileuploads/${this.fileName}?download=true`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
    this.swalSuccess();
  }

  // *************** function to display bravo swal after download the file
  swalSuccess() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.route.navigate([`/mailbox`]);
    });
  }

  // *************** function to display swal file token is invalid
  swalExpiredFileToken() {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('EXPORT_DOWNLOADER_S1.TITLE'),
      html: this.translate.instant('EXPORT_DOWNLOADER_S1.TEXT'),
      confirmButtonText: this.translate.instant('EXPORT_DOWNLOADER_S1.BUTTON 1'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.route.navigate([`/mailbox`]);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
