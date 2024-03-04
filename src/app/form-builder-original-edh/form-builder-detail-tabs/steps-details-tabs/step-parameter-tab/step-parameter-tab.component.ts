import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-step-parameter-tab',
  templateUrl: './step-parameter-tab.component.html',
  styleUrls: ['./step-parameter-tab.component.scss'],
})
export class StepParameterTabComponent implements OnInit, OnDestroy {
  @Input() isPublished: boolean;
  @Input() stepId;
  @Input() templateType;
  @Input() step;
  @Output() updateTabs = new EventEmitter();
  private subs = new SubSink();
  stepParamatersForm: UntypedFormGroup;
  initialData: any;
  validatorList;
  statusList;
  listShowContract = ['teacher_contract', 'fc_contract'];
  isWaitingForResponse = false;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private formBuilderService: FormBuilderService,
    private router: Router,
  ) {}

  ngOnInit() {
    console.log('_current', this.step);

    this.initStepParamatersForm();
    this.populateStepData();
    this.getUserTypeList();
    this.getStatusStepList();
  }

  populateStepDataForAlumni() {
    this.isWaitingForResponse = true;
    this.formBuilderService.getOneFormBuilderStepForAlumni(this.stepId).subscribe(
      (step) => {
        this.isWaitingForResponse = false;
        console.log(step);
        if (step) {
          this.stepParamatersForm.patchValue(step);
          this.initialData = _.cloneDeep(this.stepParamatersForm.getRawValue());
          this.initValueChanges();
        }
      },
      (err) => (this.isWaitingForResponse = false),
    );
  }

  populateStepData() {
    console.log('this.templateType', this.templateType);
    if (this.templateType === 'alumni') {
      this.populateStepDataForAlumni();
    } else if (this.templateType === 'teacher_contract' || this.templateType === 'fc_contract') {
      this.isWaitingForResponse = true;
      this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe(
        (step) => {
          this.isWaitingForResponse = false;
          console.log(step);
          if (step) {
            if (step.is_user_who_receive_the_form_as_validator) {
              step.validator = 'teacher';
            }
            this.stepParamatersForm.patchValue(step);
            this.initialData = _.cloneDeep(this.stepParamatersForm.getRawValue());
            this.initValueChanges();
          }
        },
        (err) => (this.isWaitingForResponse = false),
      );
    } else if (this.templateType === 'student_admission' || this.templateType === 'admission_document') {
      this.isWaitingForResponse = true;
      this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe(
        (step) => {
          this.isWaitingForResponse = false;
          if (step) {
            const response = _.cloneDeep(step);
            if (response && response.validator && response.validator._id) {
              response.validator = response.validator._id;
            }
            this.stepParamatersForm.patchValue(response);
            this.initialData = _.cloneDeep(this.stepParamatersForm.getRawValue());
            this.initValueChanges();
          }
        },
        (err) => (this.isWaitingForResponse = false),
      );
    }
  }

  initValueChanges() {
    this.stepParamatersForm.valueChanges.subscribe(() => {
      this.isFormUnchanged();
    });
  }

  getUserTypeList() {
    this.subs.sink = this.formBuilderService.getUserTypesForValidator().subscribe(
      (resp) => {
        console.log(resp);
        // let tempData = resp;
        this.validatorList = resp;
        if (this.templateType === 'teacher_contract') {
          this.validatorList = this.validatorList.filter((item) => item._id !== '61dd3ccff647127fd6bf65d7').map((item) => item);
        } else {
          this.validatorList = this.validatorList.filter(
            (item) => item._id !== '5fe98eeadb866c403defdc6c' && item._id !== '5a067bba1c0217218c75f8ab',
          );
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getStatusStepList() {
    this.statusList = this.formBuilderService.getStatusStepParameters();
    console.log(this.statusList);
  }

  initStepParamatersForm() {
    if (this.templateType && this.templateType === 'fc_contract') {
      this.stepParamatersForm = this.fb.group({
        _id: [null],
        is_validation_required: [false],
        validator: [null],
        is_change_candidate_status_after_validated: [false],
        is_user_who_receive_the_form_as_validator: [false],
        candidate_status_after_validated: [null],
        is_only_visible_based_on_condition: [false],
        is_step_included_in_summary: [false],
        is_final_step: [false],
        segments: [null],
      });
    } else {
      this.stepParamatersForm = this.fb.group({
        _id: [null],
        is_validation_required: [false],
        validator: [null],
        is_change_candidate_status_after_validated: [false],
        is_user_who_receive_the_form_as_validator: [false],
        candidate_status_after_validated: [null],
        is_only_visible_based_on_condition: [false],
        is_step_included_in_summary: [false],
        is_final_step: [false],
        segments: [null],
      });
    }
  }

  onChangeValidationRequirement(event: any) {
    console.log(event, event.checked);
    if (event && !event.checked) {
      this.stepParamatersForm.get('validator').patchValue(null);
      this.stepParamatersForm.get('validator').clearValidators(); // have to clear validators due to late detection of [required]
      // have to set error to null due to asynchronous issue with the toggle and late [required] detection
      this.stepParamatersForm.get('validator').setErrors(null);
    }
  }

  // old onchange status function
  // onChangeStatusRequirement(event: any) {
  //   console.log(event.checked);
  //   if (event && !event.checked) {
  //     this.stepParamatersForm.get('status').patchValue(null);
  //     this.stepParamatersForm.get('status').clearValidators(); // have to clear validators due to late detection of [required]
  //     // have to set error to null due to asynchronous issue with the toggle and late [required] detection
  //     this.stepParamatersForm.get('status').setErrors(null);
  //   }
  // }

  // on change status from 009
  onChangeStatusRequirement(event: any) {
    // console.log(event.checked);
    if (event && !event.checked) {
      // if (this.stepParamatersForm.value && !this.stepParamatersForm.get('candidate_status_after_validated').value) {
      //   this.stepParamatersForm.get('candidate_status_after_validated').patchValue(null);
      // }
      this.stepParamatersForm.get('candidate_status_after_validated').patchValue(null);
      this.stepParamatersForm.get('candidate_status_after_validated').clearValidators();
      this.stepParamatersForm.get('candidate_status_after_validated').setErrors(null);
    }
  }

  onChangeSummaryRequirement(event: any) {
    if (event && !event.checked) {
      return;
    }
  }

  saveStepData() {
    console.log(this.stepParamatersForm.controls);
    if (this.isPublished) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      if (this.checkFormValidity()) {
        return;
      } else {
        this.isWaitingForResponse = true;
        const payload = this.stepParamatersForm.getRawValue();
        if (payload.segments && payload.segments.length) {
          for (let i = 0; i < payload.segments.length; i++) {
            for (let j = 0; j < payload.segments[i].questions.length; j++) {
              delete payload.segments[i].questions[j]['count_document'];
            }
          }
        }
        if (payload.validator === 'teacher') {
          payload.is_user_who_receive_the_form_as_validator = true;
          payload.validator = null;
        } else {
          payload.is_user_who_receive_the_form_as_validator = false;
        }
        console.log(payload);
        this.formBuilderService.createUpdateFormBuilderStep(payload).subscribe((resp) => {
          if (resp) {
            this.initialData = _.cloneDeep(this.stepParamatersForm.getRawValue());
            this.isFormUnchanged();
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((action) => {
              this.formBuilderService.setStepData(null);
              this.updateTabs.emit(true);
              // this.populateStepData();
            });
          } else {
            this.isWaitingForResponse = false;
          }
        });
      }
    }
  }

  checkFormValidity(): boolean {
    if (this.stepParamatersForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.stepParamatersForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  leave() {
    this.checkIfAnyChildrenFormInvalid();
  }

  checkIfAnyChildrenFormInvalid() {
    if (!this.formBuilderService.childrenFormValidationStatus) {
      this.fireUnsavedDataWarningSwal();
    } else {
      this.router.navigate(['form-builder']);
    }
  }

  // old function 031
  // isFormUnchanged() {
  //   const initialData = JSON.stringify(this.initialData);
  //   const currentData = JSON.stringify(this.stepParamatersForm.getRawValue());
  //   console.log('_init', initialData);
  //   console.log('_init 2', currentData);
  //   console.log(initialData === currentData);
  //   if (initialData === currentData) {
  //     this.formBuilderService.childrenFormValidationStatus = true;
  //     return true;
  //   } else {
  //     this.formBuilderService.childrenFormValidationStatus = false;
  //     return false;
  //   }
  // }

  // function from 009
  isFormUnchanged() {
    const initialData = JSON.stringify(this.initialData);
    const currentData = JSON.stringify(this.stepParamatersForm.getRawValue());
    console.log(initialData === currentData);
    if (initialData === currentData) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }

  fireUnsavedDataWarningSwal() {
    if (!this.isPublished) {
      return Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          // I will save first
          return;
        } else {
          // discard changes
          this.formBuilderService.childrenFormValidationStatus = true;
          this.router.navigate(['form-builder']);
        }
      });
    } else {
      // discard changes
      this.formBuilderService.childrenFormValidationStatus = true;
      this.router.navigate(['form-builder']);
    }
  }
  showContract() {
    let show = false;
    const type = this.templateType;
    if (type && this.listShowContract.includes(type)) {
      show = true;
    }
    return show;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  displayValueValidator(data) {
    if (data === 'teacher' && this.templateType === 'teacher_contract') {
      return this.translate.instant('USER_TYPES.Teacher');
    } else if (data && this.validatorList && this.validatorList.length) {
      const validator = this.validatorList.find((list) => list._id === data);
      console.log(validator);
      if (validator && validator.name) {
        return this.translate.instant('USER_TYPES.' + validator.name);
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
}
