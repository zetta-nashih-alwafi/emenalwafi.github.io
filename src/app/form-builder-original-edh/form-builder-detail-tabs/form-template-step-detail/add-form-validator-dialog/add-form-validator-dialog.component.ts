import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-form-validator-dialog',
  templateUrl: './add-form-validator-dialog.component.html',
  styleUrls: ['./add-form-validator-dialog.component.scss'],
})
export class AddFormValidatorDialogComponent implements OnInit, OnDestroy {
  addValidatorForm: UntypedFormGroup;
  private subs = new SubSink();

  userTypeCtrl = new UntypedFormControl(null, [Validators.required]);
  userTypeList: any[] = [];
  filtereduserType: Observable<any[]>;

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddFormValidatorDialogComponent>,
    private formBuilderService: FormBuilderService,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.getUserTypeList();
  }

  getUserTypeList() {
    this.subs.sink = this.formBuilderService.getUserTypesForValidator().subscribe((resp) => {
      console.log(this.parentData);
      let tempData = resp;
      if (this.parentData && this.parentData.validators && this.parentData.validators.length) {
        const validators = this.parentData.validators;
        tempData = tempData.filter((userType) => !validators.find((validator) => validator._id === userType._id));
      }
      tempData = this.filterOutStudentAsFinalValidator(tempData); // prevent user selecting student as final validator
      this.userTypeList = tempData;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  filterOutStudentAsFinalValidator(userTypes: { name: string; _id: string }[]) {
    return userTypes.filter((type) => type._id !== '5a067bba1c0217218c75f8ab' || type.name !== 'Student');
  }

  submit() {
    if (this.userTypeCtrl.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.userTypeCtrl.markAllAsTouched();
    } else {
      console.log(this.userTypeCtrl.value);
      this.dialogRef.close(this.userTypeCtrl.value);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
