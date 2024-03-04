import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { AddFormStepDialogComponent } from './add-form-step-dialog/add-form-step-dialog.component';
import { AddFormValidatorDialogComponent } from './add-form-validator-dialog/add-form-validator-dialog.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AddFormSignatoryDialogComponent } from './add-form-signatory-dialog/add-form-signatory-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'ms-form-template-step-detail',
  templateUrl: './form-template-step-detail.component.html',
  styleUrls: ['./form-template-step-detail.component.scss'],
})
export class FormTemplateStepDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() templateId;
  @Input() templateType;
  @Input() isPublished: boolean;
  @Output() routeTabIndex = new EventEmitter<number>();
  @Output() finalValidation = new EventEmitter<boolean>();
  @ViewChildren('stepperForm') public stepper: QueryList<any>;
  private stepperForm;
  // @ViewChild('stepperForm', {static: false}) stepperForm;

  templateDetailForm: UntypedFormGroup;
  templateData: any;
  private subs = new SubSink();
  noData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isPublishable = false;
  dataSource = new MatTableDataSource([]);
  dataSourceValidator = new MatTableDataSource([]);
  isWaitingForResponse = false;

  displayedColumns: string[] = ['number', 'stepName', 'action'];
  displayedColumnsValidator: string[] = ['number', 'userType', 'action'];
  stepCount = 0;
  validatorCount = 0;
  selectedStepIndex = 0;
  initialForm: any;
  templateSteps = [];

  templateTypeFiltered: Observable<any[]>;
  templateTypeList = [
    {
      value: 'student_admission',
      name: 'Student Admission',
    },
    {
      value: 'alumni',
      name: 'alumni',
    },
    {
      value: 'teacher_contract',
      name: 'teacher_contract',
    },
    {
      value: 'fc_contract',
      name: 'fc_contract',
    },
  ];
  listShowFinalValidator = ['v2'];
  listShowContractSignatory = ['teacher_contract', 'fc_contract'];
  intVal: any;
  timeOutVal: any;
  isStepOverflowing = false;

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private formBuilderService: FormBuilderService,
    private router: Router,
    private translate: TranslateService,
    private utilService: UtilityService,
  ) {}

  ngOnInit() {
    this.initTemplateDetailForm();
    this.formBuilderService.setStepData(null);
    console.log(this.templateId);
    if (this.templateId) {
      this.populateTemplateData();
    } else {
      console.log('this.templateType', this.templateType);
      this.templateDetailForm.get('template_type').setValue(this.templateType);
      this.dataSource.data = [];
      this.paginator.length = 0;
      this.stepCount = 0;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      console.log(this.noData);
    }

    this.templateTypeFiltered = this.templateDetailForm.get('template_type').valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        searchText
          ? this.templateTypeList
              .filter((type) => (type ? type.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
          : this.templateTypeList,
      ),
    );
    console.log(this.noData);
    console.log(this.dataSource.data);
  }

  ngAfterViewInit() {
    this.subs.sink = this.stepper.changes.subscribe((stepperRef: QueryList<any>) => {
      if (stepperRef.length) {
        this.stepperForm = stepperRef.first;
        this.checkIfOverflown();
      }
    });
  }

  populateTemplateData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.formBuilderService.getFormBuilderTemplateFirstTab(this.templateId).subscribe(
      (resp) => {
        console.log(resp);

        this.isWaitingForResponse = false;
        const tempData = _.cloneDeep(resp);

        this.templateData = tempData;
        console.log('_temp data', this.templateData);

        if (tempData) {
          // If the data is already published, we need to disable all button and form. But ng-select need to be disable via the form

          if (tempData.created_by && tempData.created_by._id) {
            tempData.created_by = tempData.created_by._id;
          }
          if (tempData.steps && tempData.steps.length) {
            tempData.steps.forEach((step) => {
              this.pushTemplateStep();
            });
          }
          if (tempData.contract_signatory && tempData.contract_signatory.length) {
            tempData.contract_signatory.forEach((signatory) => {
              if (signatory) {
                this.pushTemplateValidator();
              }
            });
          }
          this.templateDetailForm.patchValue(tempData);
          this.initialForm = this.templateDetailForm.getRawValue();
          this.finalValidation.emit(this.templateDetailForm.get('is_final_validator_active').value);
          this.initValueChanges();
          this.templateSteps = this.getTemplateStep().value;
          this.updateTableData();
        }
      },
      (err) => {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.stepCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        console.log(this.noData);

        this.swalError(err);
      },
    );
  }

  initValueChanges() {
    this.templateDetailForm.valueChanges.subscribe(() => {
      this.isFormUnchanged();
    });
  }

  onStepChange(event) {
    console.log(event);
    this.selectedStepIndex = event.selectedIndex;
    this.setStepPreview(event.selectedIndex);
  }

  setStepPreview(index: any) {
    // this.formBuilderService.setStepData(this.templateData.steps[index]);
  }

  checkPublishable(templateData: any) {
    if (
      !this.templateDetailForm.valid ||
      !templateData.contract_template_text ||
      !templateData.steps.some(
        (step) =>
          step &&
          step.segments &&
          step.segments.length &&
          step.segments.some((segment) => segment && segment.question_fields && segment.question_fields.length),
      ) // check if at least one step has segment and at least one segment has a question
    ) {
      this.isPublishable = false;
    } else {
      this.isPublishable = true;
    }
  }

  updateTableData() {
    this.dataSource.data = this.getTemplateStep().value;
    this.dataSource.paginator = this.paginator;
    this.stepCount = this.getTemplateStep().length;
    console.log(this.dataSource);
    this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
    console.log(this.noData);

    this.dataSourceValidator.data = this.getTemplateValidator().value;
    this.validatorCount = this.getTemplateValidator().length;
  }

  initTemplateDetailForm() {
    const currentUser = this.utilService.getCurrentUser();
    this.templateDetailForm = this.fb.group({
      form_builder_name: [null, [Validators.required, removeSpaces]],
      is_published: [false],
      is_contract_signatory_in_order: [false],
      created_by: [currentUser._id, [Validators.required]],
      steps: this.fb.array([]),
      contract_signatory: this.fb.array([]),
      template_type: [this.templateType, Validators.required],
      is_final_validator_active: [false],
    });
    this.initialForm = this.templateDetailForm.getRawValue();
  }

  initStepsForm() {
    return this.fb.group({
      _id: [null, [Validators.required]],
      step_title: ['', [Validators.required]],
    });
  }

  pushTemplateStep() {
    this.getTemplateStep().push(this.initStepsForm());
  }

  getTemplateStep(): UntypedFormArray {
    return this.templateDetailForm.get('steps') as UntypedFormArray;
  }

  initValidatorsForm() {
    return this.fb.group({
      _id: [null, [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  pushTemplateValidator() {
    this.getTemplateValidator().push(this.initValidatorsForm());
  }

  getTemplateValidator(): UntypedFormArray {
    return this.templateDetailForm.get('contract_signatory') as UntypedFormArray;
  }

  addTemplateStep() {
    if (this.templateData && this.templateData.is_published) {
      this.swalIsPublished();
    } else {
      if (!this.templateDetailForm.get('form_builder_name').value) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('FormSave_S1.TITLE'),
          html: this.translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        });
        this.templateDetailForm.markAllAsTouched();
      } else {
        this.subs.sink = this.dialog
          .open(AddFormStepDialogComponent, {
            width: '400px',
            minHeight: '100px',
            panelClass: 'certification-rule-pop-up',
            disableClose: true,
            data: this.templateSteps ? this.templateSteps : null,
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              this.pushTemplateStep();
              this.isWaitingForResponse = true;
              this.subs.sink = this.formBuilderService.createFormBuilderStep(result).subscribe(
                (resp) => {
                  this.isWaitingForResponse = false;
                  this.getTemplateStep()
                    .at(this.getTemplateStep().length - 1)
                    .patchValue(resp);
                  this.saveTemplateDetail();
                },
                (err) => this.swalError(err),
              );
            }
          });
      }
    }
  }

  isFormUnchanged() {
    const initialForm = JSON.stringify(this.initialForm);
    const currentForm = JSON.stringify(this.templateDetailForm.getRawValue());
    this.formBuilderService.childrenFormValidationStatus = false;
    if (initialForm === currentForm) {
      this.formBuilderService.childrenFormValidationStatus = true;
      return true;
    } else {
      this.formBuilderService.childrenFormValidationStatus = false;
      return false;
    }
  }

  addTemplateSignatory() {
    if (this.templateData && this.templateData.is_published) {
      this.swalIsPublished();
    } else {
      if (!this.templateDetailForm.get('form_builder_name').value) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('FormSave_S1.TITLE'),
          html: this.translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        });
        this.templateDetailForm.markAllAsTouched();
      } else {
        this.subs.sink = this.dialog
          .open(AddFormSignatoryDialogComponent, {
            width: '400px',
            minHeight: '100px',
            panelClass: 'certification-rule-pop-up',
            disableClose: true,
            data: {
              validators: this.getTemplateValidator().value,
            },
          })
          .afterClosed()
          .subscribe((result) => {
            if (result && result.length) {
              result.forEach((userType) => {
                this.pushTemplateValidator();
                this.getTemplateValidator()
                  .at(this.getTemplateValidator().length - 1)
                  .patchValue({ _id: userType, name: '' });
              });
              this.saveAfterSetSignatory();
            }
          });
      }
    }
  }

  addTemplateValidator() {
    if (this.templateData && this.templateData.is_published) {
      this.swalIsPublished();
    } else {
      this.subs.sink = this.dialog
        .open(AddFormValidatorDialogComponent, {
          width: '400px',
          minHeight: '100px',
          panelClass: 'certification-rule-pop-up',
          disableClose: true,
          data: {
            validators: this.getTemplateValidator().value,
          },
        })
        .afterClosed()
        .subscribe((result) => {
          if (result && result.length) {
            result.forEach((userType) => {
              this.pushTemplateValidator();
              this.getTemplateValidator()
                .at(this.getTemplateValidator().length - 1)
                .patchValue({ _id: userType, name: '' });
            });
            this.saveTemplateDetail();
          }
        });
    }
  }

  onMoveItem(event: CdkDragDrop<any[]>) {
    const paginationIndex = this.paginator.pageIndex === 0 ? 0 : this.paginator.pageIndex * 10;
    const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
    const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
    const nextIndex = event.currentIndex + paginationIndex;
    if (temp.steps && temp.steps.length) {
      moveItemInArray(temp.steps, prevIndex, nextIndex);
    }
    this.templateDetailForm.patchValue(temp);
    this.saveTemplateDetail(true);
  }

  onMoveItemValidator(event: CdkDragDrop<any[]>) {
    const prevIndex = this.dataSourceValidator.data.findIndex((d) => d === event.item.data);
    const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
    if (temp.contract_signatory && temp.contract_signatory.length) {
      moveItemInArray(temp.contract_signatory, prevIndex, event.currentIndex);
    }
    this.templateDetailForm.patchValue(temp);
    this.saveTemplateDetail(true);
  }

  editStep(rowIndex) {
    const pageIndex = this.paginator.pageIndex === 0 ? 0 : this.paginator.pageIndex * 10;
    const indexSelected = pageIndex + rowIndex;
    this.routeTabIndex.emit(indexSelected);
  }

  deleteStep(stepId, rowIndex, name) {
    const paginationIndex = this.paginator.pageIndex === 0 ? 0 : this.paginator.pageIndex * 10;
    const selectedIndex = paginationIndex + rowIndex;
    if (this.templateData && this.templateData.is_published) {
      this.swalIsPublished();
    } else {
      let timeDisabled = 4;
      Swal.fire({
        title: this.translate.instant('DeleteStep_S1.Title'),
        text: this.translate.instant('DeleteStep_S1.Text', { name }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('DeleteStep_S1.Button1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DeleteStep_S1.Button2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          this.intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('DeleteStep_S1.Button1') + ` (${timeDisabled})`;
          }, 1000);
          clearInterval(this.timeOutVal);
          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('DeleteStep_S1.Button1');
            Swal.enableConfirmButton();
            clearInterval(this.intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.isWaitingForResponse = true;
          this.subs.sink = this.formBuilderService.deleteFormBuilderStep(stepId).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              if (resp) {
                const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
                if (temp && temp.steps && temp.steps[selectedIndex]) {
                  temp.steps.splice(selectedIndex, 1);
                }
                this.saveTemplateDetail(false, temp);
              }
            },
            (err) => this.swalError(err),
          );
        }
      });
    }
  }

  deleteValidator(rowIndex, userType) {
    if (this.templateData && this.templateData.is_published) {
      this.swalIsPublished();
    } else {
      const user_type = this.translate.instant('USER_TYPES.' + userType.name);
      let timeDisabled = 3;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('UserForm_S13.TITLE'),
        html: this.translate.instant('UserForm_S13.TEXT', { user_type: user_type }),
        confirmButtonText: this.translate.instant('UserForm_S13.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('UserForm_S13.CANCEL'),
        showCancelButton: true,
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: true,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('UserForm_S13.CONFIRM') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('UserForm_S13.CONFIRM');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((result) => {
        if (result.value) {
          const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
          if (temp && temp.contract_signatory && temp.contract_signatory[rowIndex]) {
            temp.contract_signatory.splice(rowIndex, 1);
          }
          this.saveTemplateDetail(false, temp);
        }
      });
    }
  }

  deleteSignatory(rowIndex) {
    if (this.templateData && this.templateData.is_published) {
      this.swalIsPublished();
    } else {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Are you sure?'),
        text: this.translate.instant('This will remove the signatory'),
        confirmButtonText: this.translate.instant('Yes'),
        cancelButtonText: this.translate.instant('No'),
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
          const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
          if (temp && temp.contract_signatory && temp.contract_signatory[rowIndex]) {
            temp.contract_signatory.splice(rowIndex, 1);
          }
          this.saveAfterSetSignatory(false, temp);
        }
      });
    }
  }

  saveTemplateDetail(noNeedSwal?: boolean, customPayload?) {
    if (this.templateDetailForm.invalid) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.templateDetailForm.markAllAsTouched();
      return true;
    }

    // Create payload first
    let payload = this.templateDetailForm.getRawValue();
    if (customPayload) {
      payload = customPayload;
    }
    if (payload.steps && payload.steps.length) {
      const tempSteps = [];
      payload.steps.forEach((step) => {
        tempSteps.push(step._id);
      });
      payload.steps = tempSteps;
    }
    if (payload.contract_signatory && payload.contract_signatory.length) {
      const tempSignatory = [];
      payload.contract_signatory.forEach((signatory) => {
        tempSignatory.push(signatory._id);
      });
      payload.contract_signatory = tempSignatory;
    }

    // If templateId exist, we call update, but if not, then we call create
    if (this.templateId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.updateFormBuilderTemplate(this.templateId, payload).subscribe(
        (resp) => {
          this.formBuilderService.childrenFormValidationStatus = true;
          this.isWaitingForResponse = false;
          this.initialForm = this.templateDetailForm.getRawValue();
          console.log(resp);
          if (resp && resp._id) {
            if (noNeedSwal) {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                this.router.navigate([`/form-builder/template-detail`], {
                  queryParams: { templateId: resp._id, templateType: this.templateType },
                }),
              );
            } else {
              this.bravoSwalOnSave(resp);
            }
          }
        },
        (err) => this.swalError(err),
      );
    } else {
      this.formBuilderService.childrenFormValidationStatus = true;
      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.createFormBuilderTemplate(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initialForm = this.templateDetailForm.getRawValue();
          console.log(resp);
          if (resp && resp._id) {
            if (noNeedSwal) {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                this.router.navigate([`/form-builder/template-detail`], {
                  queryParams: { templateId: resp._id, templateType: this.templateType },
                }),
              );
            } else {
              this.bravoSwalOnSave(resp);
            }
          }
        },
        (err) => {
          this.swalError(err);
          // Remove the added step from the form if get error when add step
          const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
          if (temp && temp.steps && temp.steps.length) {
            temp.steps.forEach((step, stepIndex) => {
              this.getTemplateStep().removeAt(stepIndex);
            });
          }
        },
      );
    }
  }

  saveAfterSetSignatory(noNeedSwal?: boolean, customPayload?) {
    // Create payload first
    let payload = this.templateDetailForm.getRawValue();
    if (customPayload) {
      payload = customPayload;
    }
    if (payload.steps && payload.steps.length) {
      const tempSteps = [];
      payload.steps.forEach((step) => {
        tempSteps.push(step._id);
      });
      payload.steps = tempSteps;
    }
    if (payload.contract_signatory && payload.contract_signatory.length) {
      const tempSignatory = [];
      payload.contract_signatory.forEach((signatory) => {
        tempSignatory.push(signatory._id);
      });
      payload.contract_signatory = tempSignatory;
    }

    // If templateId exist, we call update, but if not, then we call create
    if (this.templateId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.updateFormBuilderTemplate(this.templateId, payload).subscribe(
        (resp) => {
          this.formBuilderService.childrenFormValidationStatus = true;
          this.isWaitingForResponse = false;
          this.initialForm = this.templateDetailForm.getRawValue();
          console.log(resp);
          if (resp && resp._id) {
            if (noNeedSwal) {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                this.router.navigate([`/form-builder/template-detail`], {
                  queryParams: { templateId: resp._id, templateType: this.templateType },
                }),
              );
            } else {
              this.bravoSwalOnSave(resp);
            }
          }
        },
        (err) => this.swalError(err),
      );
    } else {
      this.formBuilderService.childrenFormValidationStatus = true;
      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.createFormBuilderTemplate(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initialForm = this.templateDetailForm.getRawValue();
          console.log(resp);
          if (resp && resp._id) {
            if (noNeedSwal) {
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                this.router.navigate([`/form-builder/template-detail`], {
                  queryParams: { templateId: resp._id, templateType: this.templateType },
                }),
              );
            } else {
              this.bravoSwalOnSave(resp);
            }
          }
        },
        (err) => {
          this.swalError(err);
          // Remove the added step from the form if get error when add step
          const temp = _.cloneDeep(this.templateDetailForm.getRawValue());
          if (temp && temp.steps && temp.steps.length) {
            temp.steps.forEach((step, stepIndex) => {
              this.getTemplateStep().removeAt(stepIndex);
            });
          }
        },
      );
    }
  }

  bravoSwalOnSave(resp) {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((res) => {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate([`/form-builder/template-detail`], {
          queryParams: { templateId: resp._id, templateType: this.templateType },
        }),
      );
    });
  }

  swalError(err) {
    this.isWaitingForResponse = false;
    console.log('[Response BE][Error] : ', err);
    if (err['message'] === 'GraphQL error: pre contract template name already exist') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S3.TITLE'),
        text: this.translate.instant('UserForm_S3.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S3.BUTTON 1'),
      });
    } else if (err['message'] === 'GraphQL error: form builder already published') {
      this.formBuilderService.childrenFormValidationStatus = true;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UserForm_S18.TITLE'),
        text: this.translate.instant('UserForm_S18.TEXT'),
        confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }

  publishFormBuilderTemplate(event: MatSlideToggleChange) {
    console.log(event);
    if (event && event.checked) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Are you sure?'),
        text: this.translate.instant('This will publish the Form Template Detail'),
        confirmButtonText: this.translate.instant('Yes'),
        cancelButtonText: this.translate.instant('No'),
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
          this.templateDetailForm.get('is_published').patchValue(true, { emitEvent: false });
          this.publishTemplateCallAPI();
        } else {
          this.templateDetailForm.get('is_published').patchValue(false, { emitEvent: false });
        }
      });
    } else {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Are you sure?'),
        text: this.translate.instant('This will unpublish Form Template Detail'),
        confirmButtonText: this.translate.instant('Yes'),
        cancelButtonText: this.translate.instant('No'),
        showCancelButton: true,
      }).then((result) => {
        if (result.value) {
          this.templateDetailForm.get('is_published').patchValue(false, { emitEvent: false });
          this.unpublishTemplateCallAPI();
          // this.saveTemplateDetail(false);
        } else {
          this.templateDetailForm.get('is_published').patchValue(true, { emitEvent: false });
        }
      });
    }
    this.formBuilderService.childrenFormValidationStatus = true;
  }

  onPreview() {
    let url;
    const type = this.templateDetailForm.get('template_type').value;
    switch (type) {
      case 'alumni':
        url = this.router.createUrlTree(['/form-survey'], { queryParams: { templateId: this.templateId, isPreview: true } });
        break;
      case 'student_admission':
        url = this.router.createUrlTree(['/form-continuous'], { queryParams: { templateId: this.templateId, isPreview: true } });
        break;
      case 'teacher_contract':
        url = this.router.createUrlTree(['/form-teacher-contract'], {
          queryParams: { templateId: this.templateId, isPreview: true, formType: 'teacher_contract' },
        });
        break;
      case 'fc_contract':
        url = this.router.createUrlTree(['/form-fc-contract'], {
          queryParams: { templateId: this.templateId, isPreview: true, formType: 'fc_contract' },
        });
        break;
      default:
        break;
    }

    if (url) {
      window.open(url.toString(), '_blank');
    }
  }

  publishTemplateCallAPI() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.publishContractTemplateFirstTab(this.templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((res) => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([`/form-builder/template-detail`], {
              queryParams: { templateId: this.templateId, templateType: this.templateType },
            }),
          );
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.templateDetailForm.get('is_published').patchValue(false, { emitEvent: false });
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('UserForm_S15.TITLE'),
          text: this.translate.instant('UserForm_S15.TEXT'),
          confirmButtonText: this.translate.instant('UserForm_S15.BUTTON_1'),
        });
      },
    );
  }

  unpublishTemplateCallAPI() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.unpublishContractTemplateFirstTab(this.templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((res) => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([`/form-builder/template-detail`], {
              queryParams: { templateId: this.templateId, templateType: this.templateType },
            }),
          );
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.templateDetailForm.get('is_published').patchValue(true, { emitEvent: false });
        if (err['message'] === 'GraphQL error: form builder already connected to type of formation') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('FormCF_S1.TITLE'),
            text: this.translate.instant('FormCF_S1.TEXT'),
            confirmButtonText: this.translate.instant('FormCF_S1.BUTTON1'),
          });
        } else if (
          err['message'] === 'GraphQL error: form builder already used' ||
          err['message'] === 'GraphQL error: form builder already used by fc contract process' ||
          err['message'] === 'GraphQL error: form builder already used by teacher'
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Cannot unpublish this template !'),
            text: this.translate.instant('Cannot unpublish template, this template is already used!'),
            confirmButtonText: this.translate.instant('Okay'),
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

  displayFn(selectedValue: any) {
    if (selectedValue) {
      const found = this.templateTypeList.find((res) => res.value === selectedValue);
      if (found) {
        return found.name;
      }
    }
  }

  handleFinalValidator(event) {
    this.finalValidation.emit(this.templateDetailForm.get('is_final_validator_active').value);
    if (!event.checked && !this.templateDetailForm.get('is_final_validator_active').value) {
      this.templateDetailForm.get('is_contract_signatory_in_order').setValue(false);
      this.getTemplateValidator().clear();
      console.log('_val', this.templateDetailForm.value);
      this.updateTableData();
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

  fireUnsavedDataWarningSwal() {
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
  }

  scrollLeft() {
    const element = this.stepperForm._elementRef.nativeElement.children[0];
    element.scrollBy({
      top: 0,
      left: -150,
      behavior: 'smooth',
    });
  }

  scrollRight() {
    const element = this.stepperForm._elementRef.nativeElement.children[0];
    element.scrollBy({
      top: 0,
      left: 150,
      behavior: 'smooth',
    });
  }

  checkIfOverflown() {
    if (
      this.stepperForm &&
      this.stepperForm._elementRef &&
      this.stepperForm._elementRef.nativeElement &&
      this.stepperForm._elementRef.nativeElement.children &&
      this.stepperForm._elementRef.nativeElement.children[0]
    ) {
      const element = this.stepperForm._elementRef.nativeElement.children[0];
      this.isStepOverflowing = element.scrollWidth > element.clientWidth;
    }
  }

  swalIsPublished() {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('UserForm_S18.TITLE'),
      text: this.translate.instant('UserForm_S18.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S18.CONFIRM'),
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  showFinalValidator() {
    let show = false;
    const type = this.templateDetailForm.get('template_type').value;
    if (type && this.listShowFinalValidator.includes(type)) {
      show = true;
    }
    return show;
  }

  showContractSignatory() {
    let show = false;
    const type = this.templateDetailForm.get('template_type').value;
    if (type && this.listShowContractSignatory.includes(type)) {
      show = true;
    }
    return show;
  }
}
