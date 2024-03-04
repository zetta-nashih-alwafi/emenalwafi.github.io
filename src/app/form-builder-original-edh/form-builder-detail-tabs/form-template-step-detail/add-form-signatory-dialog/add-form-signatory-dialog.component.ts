import { TranslateService } from '@ngx-translate/core';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ms-add-form-signatory-dialog',
  templateUrl: './add-form-signatory-dialog.component.html',
  styleUrls: ['./add-form-signatory-dialog.component.scss'],
})
export class AddFormSignatoryDialogComponent implements OnInit, OnDestroy {
  addValidatorForm: UntypedFormGroup;
  private subs = new SubSink();

  userTypeCtrl = new UntypedFormControl(null, [Validators.required]);
  userTypeList: any[] = [];
  filtereduserType: Observable<any[]>;
  templateType;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddFormSignatoryDialogComponent>,
    private contractService: TeacherContractService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public parentData,
  ) {}

  ngOnInit() {
    const param = this.route.snapshot.queryParams;
    if (param && param.templateType) {
      this.templateType = param.templateType;
    }
    if (this.templateType && this.templateType === 'fc_contract') {
      this.getUserTypeListFc();
    } else {
      this.getUserTypeList();
    }
    // this.initAddStepForm();
  }

  getUserTypeList() {
    this.subs.sink = this.contractService.getUserTypesForValidator().subscribe(
      (resp) => {
        console.log(this.parentData);
        let tempData = resp;
        if (this.parentData && this.parentData.validators && this.parentData.validators.length) {
          const validators = this.parentData.validators;
          tempData = tempData.filter((userType) => !validators.find((validator) => validator._id === userType._id));
        }
        this.userTypeList = tempData;

        // this.filtereduserType = this.userTypeCtrl.valueChanges.pipe(
        //   startWith(''),
        //   map((searchTxt) => {
        //     searchTxt = searchTxt ? searchTxt : '';
        //     return this.userTypeList.filter((userType) => userType.name.toLowerCase().trim().includes(searchTxt.toLowerCase().trim()));
        //   }),
        // );
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

  getUserTypeListFc() {
    this.subs.sink = this.contractService.getUserTypesForSignFc().subscribe(
      (resp) => {
        console.log(this.parentData);
        let tempData = resp;
        if (this.parentData && this.parentData.validators && this.parentData.validators.length) {
          const validators = this.parentData.validators;
          tempData = tempData.filter((userType) => !validators.find((validator) => validator._id === userType._id));
        }
        this.userTypeList = tempData;
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

  selectUserType(validator) {
    // this.addValidatorForm.get('_id').patchValue(validator._id);
    // this.addValidatorForm.get('user_type').patchValue(validator.name);
  }

  initAddStepForm() {
    // this.addValidatorForm = this.fb.group({
    //   _id: [null, [Validators.required]],
    //   name: [null, [Validators.required, removeSpaces]],
    // })
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    console.log(this.userTypeCtrl.value);
    this.dialogRef.close(this.userTypeCtrl.value);
  }

  checkFormValidity(): boolean {
    if (this.userTypeCtrl.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.userTypeCtrl.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
