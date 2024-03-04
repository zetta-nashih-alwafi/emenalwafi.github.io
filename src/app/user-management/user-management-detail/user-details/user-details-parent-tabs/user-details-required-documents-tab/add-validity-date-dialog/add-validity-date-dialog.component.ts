import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { UsersService } from 'app/service/users/users.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
@Component({
  selector: 'ms-add-validity-date-dialog',
  templateUrl: './add-validity-date-dialog.component.html',
  styleUrls: ['./add-validity-date-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe,ParseStringDatePipe],
})
export class AddValidityDateDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  isWaitingForResponse: boolean = false;
  today: Date = new Date();

  dateOfValidityCtrl: UntypedFormControl = new UntypedFormControl(null, Validators.required);

  constructor(
    public dialogRef: MatDialogRef<AddValidityDateDialogComponent>,
    public translate: TranslateService,
    private utilService: UtilityService,
    private authService: AuthService,
    private teacherManagementServive: TeacherManagementService,
    private usersService: UsersService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private parseLocalToUtc: ParseLocalToUtcPipe,
    private parseStringDatePipe: ParseStringDatePipe,
  ) {}

  ngOnInit(): void {
    if(this.parentData?.dateValidation){
      const date = this.parseStringDatePipe.transformStringToDate(this.parentData?.dateValidation)
      this.dateOfValidityCtrl.patchValue(date)
    }
  }

  validateDate() {
    if (this.dateOfValidityCtrl?.invalid) {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Please fill all the required fields !'),
        html: this.translate.instant('To be able to submit the form please fill in all the required fields.'),
        confirmButtonText: this.translate.instant('I understand'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.dateOfValidityCtrl.markAllAsTouched();
        return;
      });
    } else {
      const payload = this.createPayload();
      this.isWaitingForResponse = true;
      this.subs.sink = this.teacherManagementServive.updateAcadDoc(this.parentData?._id, payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if(resp){
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(resp)
            });  
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ', '')) : err,
            allowOutsideClick: false,
          });
        },
      );
    }
  }
  createPayload() {
    const currDate = this.dateOfValidityCtrl.value ? moment(this.dateOfValidityCtrl.value).format('DD/MM/YYYY') : null;
    let date;
    if (currDate && currDate !== 'Invalid date') {
      date = this.parseLocalToUtc.transformDate(currDate, '15:59');
    }
    return {
      date_of_expired: {
        date: date,
        time: '15:59',
      },
    };
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
