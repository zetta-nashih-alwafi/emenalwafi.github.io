import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserService } from 'app/service/user/user.service';
import { CustomValidators } from 'ng2-validation';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { AddUserEntityDialogComponent } from '../add-user-entity-dialog/add-user-entity-dialog.component';
import { Router } from '@angular/router';
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-add-new-user-dialog',
  templateUrl: './add-new-user-dialog.component.html',
  styleUrls: ['./add-new-user-dialog.component.scss'],
})
export class AddNewUserDialogComponent implements OnInit {
  private subs = new SubSink();
  addNewUserForm: UntypedFormGroup;

  isWaitingForResponse = false;
  currentUser: any;
  currentUserTypeId:any

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddNewUserDialogComponent>,
    private userService: UserService,
    private translate: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: Router,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    console.log(this.route);

    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initForm();
  }

  initForm() {
    this.addNewUserForm = this.fb.group({
      civility: ['', [Validators.required]],
      email: ['', [CustomValidators.email, Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      office_phone: ['', [Validators.maxLength(10), Validators.minLength(10), CustomValidators.number]],
      portable_phone: ['', [Validators.maxLength(10), Validators.minLength(10), CustomValidators.number]],
      position: [null],
    });
  }

  submit() {
    const payload = _.cloneDeep(this.addNewUserForm.value);
    // this.closeDialog();
    this.openAddUserTypeDialog(payload);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openAddUserTypeDialog(payload) {
    const dialog = this.dialog.open(AddUserEntityDialogComponent, {
      panelClass: 'certification-rule-pop-up',
      width: '850px',
      autoFocus: false,
      data: {
        fromUserTable: true,
        payload: payload,
      },
      disableClose:true
    });
    dialog.afterClosed().subscribe((res) => {
      // console.log(res);
      if (res) {
        this.subs.sink = this.userService.registerUser(res, this.currentUser._id,this.currentUserTypeId).subscribe(
          (resp) => {
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                console.log(payload);
                if (this.route.url.includes('/internship/users/details/')) {
                  this.route
                    .navigateByUrl('/', { skipLocationChange: true })
                    .then(() => this.route.navigateByUrl(`/internship/users/details/${resp._id}`));
                } else {
                  window.open(`./internship/users/details/${resp._id}`, '_blank');
                }
              });
              this.dialogRef.close(true);
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
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
