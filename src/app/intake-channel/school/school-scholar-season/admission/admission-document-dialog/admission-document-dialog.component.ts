import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-admission-document-dialog',
  templateUrl: './admission-document-dialog.component.html',
  styleUrls: ['./admission-document-dialog.component.scss']
})
export class AdmissionDocumentDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  selectedTests = [];

  isValid = true;

  admissionDocForm: UntypedFormGroup;

  blockList = [
    {
      name: 'Baccalauréat ou équivalent',
      isChecked: false,
    }, 
    {
      name: 'Justificatif / attestation validant 60 ECTS ou équivalent',
      isChecked: false,
    }, 
    {
      name: 'Justificatif / attestation validant 120 ECTS ou équivalent',
      isChecked: false,
    }, 
    {
      name: 'Justificatif / attestation validant 180 ECTS ou équivalent',
      isChecked: false,
    }, 
    {
      name: 'Justificatif / attestation validant 240 ECTS ou équivalent',
      isChecked: false,
    }, 
    {
      name: "Pièces d'identité",
      isChecked: false,
    }, 
  ]
  isWaitingForResponse: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AdmissionDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private fb: UntypedFormBuilder,
    private intakeChannelService: IntakeChannelService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initAdmissionDocForm();
    this.blockList?.forEach((block) => {
      this.addAdmissionChoises();
    })

    if(this.parentData?.item === 'single') {
      this.populatedData();
    };
  }

  populatedData() {
    const dataProgram = _.cloneDeep(this.parentData?.programIds[0]);

    if(dataProgram?.adm_doc_names?.length) {
      this.selectedTests = dataProgram?.adm_doc_names;
      dataProgram?.adm_doc_names.forEach((document) => {
        const indexDocument = this.blockList?.findIndex((findDoc) => findDoc?.name === document);
        this.blockList[indexDocument].isChecked = true;
      });
    };
  }

  initAdmissionDocForm() {
    this.admissionDocForm = this.fb.group({
      choices: this.fb.array([]),
    });
  }

  addAdmissionChoises() {
    this.getSegmentFormarray().push(new UntypedFormControl(null));
  }

  getSegmentFormarray(): UntypedFormArray {
    return this.admissionDocForm.get('choices') as UntypedFormArray;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onCheckTest(event: MatCheckboxChange, test, blockIndex) {
    if (event?.checked && test?.name) {
      if (!this.selectedTests.includes(test?.name)) {
        this.isValid = true;
        this.selectedTests.push(test?.name);
        const data = this.getSegmentFormarray().at(blockIndex);
        data.patchValue(test?.name);
      };
    } else if (!event?.checked && test?.name) {
      const foundIndex = this.selectedTests.findIndex((testId) => testId === test?.name);
      if (foundIndex || foundIndex === 0) {
        this.selectedTests.splice(foundIndex, 1);
        const data = this.getSegmentFormarray().at(blockIndex);
        data.patchValue(null);

        if(!this.selectedTests?.length) {
          this.isValid = false;
        }
      }
    }
  }

  checkValidation() {
    if(this.selectedTests?.length) {
      this.isValid = true;
      return true;
    } else {
      this.isValid = false;
      return false;
    }
  }

  validate() {
    this.isWaitingForResponse = true;
    if (!this.checkValidation()) {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        return;
      })
    } else {
      const temp = _.cloneDeep(this.parentData.programIds);
      const program_ids = [];
      if (temp && temp.length) {
        temp.forEach((element) => {
          program_ids.push(element._id.toString());
        });
      };
      const program_input = {
        adm_doc_names: this.selectedTests,
      };

      const filteredValues = this.parentData?.filter;

      const is_select_all = this.parentData?.select_all;

      this.subs.sink = this.intakeChannelService.updatePrograms(program_ids, program_input, is_select_all, filteredValues).subscribe(() => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
          confirmButtonText: 'OK',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(true);
        });
      }, (error) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: error && error['message'] ? error['message'] : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
