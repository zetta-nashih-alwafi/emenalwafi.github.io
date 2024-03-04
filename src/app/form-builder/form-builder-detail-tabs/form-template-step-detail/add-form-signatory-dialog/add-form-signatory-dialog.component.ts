import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UserService } from 'app/service/user/user.service';
import { SubSink } from 'subsink';

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
  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddFormSignatoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public parentData,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getUserTypeList();
  }

  getUserTypeList() {
    let userTypes = [];
    this.subs.sink = this.userService.getAllUserTypeIncludeStudent("include_student").subscribe(
      (res) => {
        if (res) {
          const userTypes = res.sort((a,b) => a.name.localeCompare(b.name));
          // console.log(res)
          if (this.parentData && this.parentData.signatory && this.parentData.signatory.length) {
            const signatory = this.parentData.signatory;
            this.userTypeList = userTypes.filter((userType) => !signatory.find((validator) => validator._id === userType._id));
          } else {
            this.userTypeList = [...userTypes];
          }
        }
      }, (err) => {
        this.authService.postErrorLog(err);
      });
  }

  submit() {
    // console.log(this.userTypeCtrl.value);
    this.dialogRef.close(this.userTypeCtrl.value);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
