import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { FinancesService } from 'app/service/finance/finance.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'ms-add-doc-builder-document',
  templateUrl: './add-doc-builder-document.component.html',
  styleUrls: ['./add-doc-builder-document.component.scss'],
})
export class AddDocBuilderDocumentComponent implements OnInit {
  formDetails: UntypedFormGroup;
  isPublished: boolean;
  private subs = new SubSink();
  scholars: any[];
  documentBuilders: any[];
  selectedDocBuilderName;
  constructor(
    @Inject(MAT_DIALOG_DATA) public inputData: any,
    private financeService: FinancesService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private documentService: DocumentIntakeBuilderService,
    public dialogRef: MatDialogRef<AddDocBuilderDocumentComponent>,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.getAllDocumentBuilders();
    this.getScholarSeasons();
    this.initFormDetails();
    if (this.inputData) this.patchDataFromInput();
  }

  patchDataFromInput() {
    // this.getAllDocumentBuilders(this.inputData.scholar_id);
    const data = {
      document_builder_scholar_season: this.inputData.scholar_id,
      document_builder_id: this.inputData._id,
    };
    this.formDetails.patchValue(data);
  }

  initFormDetails() {
    this.formDetails = this.fb.group({
      // document_builder_scholar_season: [null, [Validators.required]],
      document_builder_id: [null, [Validators.required]],
    });
  }

  setSelectedDocBuilderName(input) {
    this.selectedDocBuilderName = input;
  }

  getScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp) {
          this.scholars = resp;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  submit() {
    const nameSelected = this.documentBuilders.find((idSelected) => {
      return idSelected._id == this.selectedDocBuilderName;
    });
    this.dialogRef.close([nameSelected.document_builder_name, { ...this.formDetails.value }]);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  handleDocumentBuilderScholarSeasonSelected() {
    // enable document_builder_id
    this.formDetails.get('document_builder_id').enable();
    this.formDetails.get('document_builder_id').patchValue(null);
    this.getAllDocumentBuilders();
  }

  getAllDocumentBuilders(fromPopulate?) {
    // let scholar_season_id = this.formDetails.get('document_builder_scholar_season').value;
    // if (fromPopulate) {
    //   scholar_season_id = fromPopulate;
    // } else {
    //   scholar_season_id = this.formDetails.get('document_builder_scholar_season').value;
    // }
    const filter = {
      status: true,
      hide_form: false,
    };
    this.subs.sink = this.documentService.getAllDocumentsDropdown(filter).subscribe(
      (resp) => {
        if (resp) {
          this.documentBuilders = _.cloneDeep(resp.sort((a, b) => a.document_builder_name.localeCompare(b.document_builder_name, undefined, { caseFirst: 'lower' })));
        }        
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
}
