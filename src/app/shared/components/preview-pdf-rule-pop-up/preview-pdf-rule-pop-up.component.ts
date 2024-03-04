import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { AdmissionService } from 'app/service/admission/admission.service';
import { environment } from 'environments/environment';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-preview-pdf-rule-pop-up',
  templateUrl: './preview-pdf-rule-pop-up.component.html',
  styleUrls: ['./preview-pdf-rule-pop-up.component.scss'],
})
export class PreviewPdfRulePopUp implements OnInit, OnDestroy {
  private subs = new SubSink();

  titleText = 'dummy rule';
  pdfFile = '';
  pdfReadyDownload = '';
  docDownloaded = false;
  checked: boolean;
  titleLongName: string = 'dummy long name';
  isWaitingForResponse = false;

  constructor(
    public dialogRef: MatDialogRef<PreviewPdfRulePopUp>,
    private translate: TranslateService,
    private admissionService: AdmissionService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.generetaPDFAmandement();
  }
  generetaPDFAmandement() {
    let candidateId = this.data.candidate.candidate_id._id;
    this.isWaitingForResponse = true;
    const isDontSavePdfToStudent = true;
    this.subs.sink = this.admissionService.GeneratePDFSchoolContractAmendement(candidateId, isDontSavePdfToStudent).subscribe(
      (data) => {
        this.isWaitingForResponse = false;
        this.pdfFile = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
        this.pdfReadyDownload = `${environment.apiUrl}/fileuploads/${data}?download=true`.replace('/graphql', '');
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  downloadDoc() {
    const url = this.pdfReadyDownload;
    const element = document.createElement('a');
    element.href = url;
    element.target = '_blank';
    element.setAttribute('type', 'hidden');
    element.click();
    element.remove();
    this.docDownloaded = true;
  }
  submit() {
    let candidateId = this.data.candidate.candidate_id._id;
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getSchoolContractAmendmentImprovement(candidateId).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close('success');
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }
  closeDialog() {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
