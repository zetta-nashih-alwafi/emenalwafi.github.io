import { Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { removeSpaces } from 'app/service/customvalidator.validator';

import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-form-step-dialog',
  templateUrl: './add-form-step-dialog.component.html',
  styleUrls: ['./add-form-step-dialog.component.scss'],
})
export class AddFormStepDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  addStepForm: UntypedFormGroup;

  initialType;
  initialForm;
  isFormChanged;
  stepTypeList;
  filteredStepType;
  filterStepType = new UntypedFormControl('');
  intVal: any;
  timeOutVal: any;
  listMultipleContractType = ['fc_contract', 'teacher_contract'];

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddFormStepDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
  ) {}

  ngOnInit() {
    this.initAddStepForm();
    this.getStepType(this.data.formTemplate);
    if (this.data) {
      // console.log('data', this.data);
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.getStepType(this.data.formTemplate);
      });
    }
    this.patchEditStep();
  }

  patchEditStep() {
    if (this.data.edit) {
      this.isFormChanged = true;
      this.addStepForm.patchValue(this.data.stepData);
      this.initialType = this.addStepForm.get('step_type').value;
      this.initialForm = this.addStepForm.getRawValue();
      this.stepTypeList.forEach((step) => (step.value === this.data.stepData.step_type ? this.filterStepType.setValue(step.key) : ''));
      this.checkFormChange();
    }
  }

  initAddStepForm() {
    this.addStepForm = this.fb.group({
      step_title: ['', [Validators.required, removeSpaces]],
      step_type: ['', [Validators.required]],
    });
  }

  checkFormChange() {
    this.subs.sink = this.addStepForm.valueChanges.subscribe((res) => {
      const currentForm = JSON.stringify(this.addStepForm.getRawValue());
      const initialForm = JSON.stringify(this.initialForm);
      this.isFormChanged = currentForm === initialForm;
    });
  }

  submit() {
    // console.log(this.addStepForm.value);
    this.checkStepTitle(this.addStepForm.get('step_title').value);
    // this.dialogRef.close(this.addStepForm.value);
  }

  checkStepTitle(stepTitle) {
    if (this.data && this.data.length) {
      // console.log('masuk', stepTitle);
      let textFound = this.data.filter((text) => text.step_title.toLowerCase() === stepTitle.toLowerCase());
      // console.log('text found', textFound);
      if (textFound && textFound.length) {
        this.swalError();
        return;
      } else {
        // console.log('step title not match any');
        this.checkStepType(this.addStepForm.get('step_type').value);
        // this.dialogRef.close(this.addStepForm.value);
      }
    } else {
      // console.log('data kosong');
      this.checkStepType(this.addStepForm.get('step_type').value);
      // this.dialogRef.close(this.addStepForm.value);
    }
  }

  checkStepType(stepType) {
    const currentType = this.addStepForm.get('step_type').value;
    const initialType = this.initialType;
    const isTypeChanged = currentType === initialType;
    if (this.data && !isTypeChanged) {
      const dataSteps = [];
      if (this.data.templateSteps && this.data.templateSteps.length) dataSteps.push(...this.data.templateSteps);
      else console.warn(new Error('data.templateSteps is empty, please check form-template-step-detail.component.ts'));
      let typeFound;
      if (stepType === 'final_message') {
        typeFound = dataSteps.filter((step) => step.step_type === stepType);
        if (typeFound && typeFound.length) this.swallStepTypeDuplicate(stepType);
        else this.dialogRef.close(this.addStepForm.value);
      } else if (stepType === 'step_with_signing_process') {
        typeFound = dataSteps.filter((step) => step.step_type === stepType);
        if (typeFound && typeFound.length && this.listMultipleContractType.includes(this.data?.formTemplate)) {
          let timeDisabled = 3;
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_CONFIRMATION.Title'),
            text: this.translate.instant('SWAL_CONFIRMATION.Text'),
            allowEscapeKey: true,
            showCancelButton: true,
            confirmButtonText: this.translate.instant('SWAL_CONFIRMATION.Button1', { timer: timeDisabled }),
            cancelButtonText: this.translate.instant('SWAL_CONFIRMATION.Button2'),
            allowOutsideClick: false,
            allowEnterKey: false,
            onOpen: () => {
              Swal.disableConfirmButton();
              const confirmBtnRef = Swal.getConfirmButton();
              this.intVal = setInterval(() => {
                timeDisabled -= 1;
                confirmBtnRef.innerText = this.translate.instant('SWAL_CONFIRMATION.Button1') + ` (${timeDisabled})`;
              }, 1000);

              this.timeOutVal = setTimeout(() => {
                confirmBtnRef.innerText = this.translate.instant('SWAL_CONFIRMATION.Button1');
                Swal.enableConfirmButton();
                clearInterval(this.intVal);
                clearTimeout(this.timeOutVal);
              }, timeDisabled * 1000);
            },
          }).then((result) => {
            if (result.value) {
              this.dialogRef.close(this.addStepForm.value);
            } else {
              this.dialogRef.close();
            }
          });
        } else if (typeFound && typeFound.length && !this.listMultipleContractType.includes(this.data?.formTemplate)) {
          this.swallStepTypeDuplicate(stepType);
        } else {
          this.dialogRef.close(this.addStepForm.value);
        }
      }
      // else if(stepType==='modality_payment'){
      //   typeFound = dataSteps.filter((step) => step.step_type === 'scholarship_fee');
      //   if(typeFound?.length){
      //     this.dialogRef.close(this.addStepForm.value);
      //   }else{
      //     Swal.fire({
      //       type: 'warning',
      //       title: this.translate.instant('ReAdmission_S13.TITLE'),
      //       text: this.translate.instant('ReAdmission_S13.TEXT'),
      //       confirmButtonText: this.translate.instant('ReAdmission_S13.BUTTON'),
      //     }).then(() => {
      //       this.addStepForm.get('step_type').reset('', { emitEvent: true });
      //       this.filterStepType.reset();
      //     });
      //   }
      // }
      else {
        this.dialogRef.close(this.addStepForm.value);
      }
    } else {
      this.dialogRef.close(this.addStepForm.value);
    }
  }

  selectType(value) {
    const type = this.stepTypeList.find((val) => val.key === value);
    if (type) this.addStepForm.get('step_type').patchValue(type.value);
  }

  getStepType(typeForm) {
    if (typeForm === 'student_admission') {
      this.stepTypeList = this.formBuilderService.getStepTypeListForStudent().map((item) => {
        return { value: item, key: this.translate.instant('ERP_009_TEACHER_CONTRACT.' + item) };
      });
    } else if (typeForm === 'one_time_form') {
      this.stepTypeList = this.formBuilderService.getStepTypeOneTimeForm().map((item) => {
        return { value: item, key: this.translate.instant('ERP_009_TEACHER_CONTRACT.' + item) };
      });
    } else if (typeForm === 'admission_document') {
      this.stepTypeList = this.formBuilderService.getStepTypeAdmissionDocument().map((item) => {
        return { value: item, key: this.translate.instant('ERP_009_TEACHER_CONTRACT.' + item) };
      });
    } else if (typeForm === 'alumni') {
      this.stepTypeList = this.formBuilderService.getStepTypeForAlumni().map((item) => {
        return { value: item, key: this.translate.instant('ERP_009_TEACHER_CONTRACT.' + item) };
      });
    } else {
      this.stepTypeList = this.formBuilderService.getStepTypeListForTeacher().map((item) => {
        return { value: item, key: this.translate.instant('ERP_009_TEACHER_CONTRACT.' + item) };
      });
    }

    this.filteredStepType = this.stepTypeList;
  }

  onValueTypeChange() {
    if (this.filterStepType.value) {
      const searchString = this.filterStepType.value.toLowerCase().trim();
      this.filteredStepType = this.stepTypeList.filter((step) => step.key.toLowerCase().trim().includes(searchString));
    } else {
      this.filteredStepType = this.stepTypeList;
      this.addStepForm.get('step_type').patchValue(null, { emitEvent: false });
    }
  }

  swalError() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('UserForm_S14.TITLE'),
      text: this.translate.instant('UserForm_S14.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S14.CONFIRM'),
    }).then(() => {
      this.addStepForm.get('step_title').reset('', { emitEvent: true });
    });
  }

  swallStepTypeDuplicate(stepType) {
    if (stepType === 'final_message') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Form_S1.TITLE'),
        text: this.translate.instant('Form_S1.TEXT'),
        confirmButtonText: this.translate.instant('Form_S1.BUTTON1'),
      }).then(() => {
        this.addStepForm.get('step_type').reset('', { emitEvent: true });
        this.filterStepType.reset();
      });
    } else if (stepType === 'step_with_signing_process') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Form_S3.TITLE'),
        text: this.translate.instant('Form_S3.TEXT'),
        confirmButtonText: this.translate.instant('Form_S3.BUTTON1'),
      }).then(() => {
        this.addStepForm.get('step_type').reset('', { emitEvent: true });
        this.filterStepType.reset();
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
