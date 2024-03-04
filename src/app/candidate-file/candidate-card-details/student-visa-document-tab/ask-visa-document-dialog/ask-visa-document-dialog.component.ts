import Swal from 'sweetalert2';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { StudentsService } from 'app/service/students/students.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-ask-visa-document-dialog',
  templateUrl: './ask-visa-document-dialog.component.html',
  styleUrls: ['./ask-visa-document-dialog.component.scss']
})
export class AskVisaDocumentDialogComponent implements OnInit {
  currentUser: any
  isPermission: any;
  currentUserTypeId;
  isWaitingForResponse = false;

  constructor(
    public dialogRef: MatDialogRef<AskVisaDocumentDialogComponent>,
    private studentService: StudentsService,
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
    this.isPermission = this.authService.getPermission();
    const user = this.authService.getLocalStorageUser();
    const currentUserEntity = user?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = [currentUserEntity?.type?._id];
  }

  onValidate(){
    this.isWaitingForResponse = true;
    let filter = this.parentData?.filter ? this.cleanFilterData() : null;
    const studentIds = this.parentData?.from && this.parentData?.from === 'multiple' ? this.mappedMultipleData() : [this.parentData?.student?._id];
    filter = {
      ...filter,
      candidate_ids: studentIds
    }
    
    this.studentService.askVisaDocument(filter, this.currentUserTypeId).subscribe((resp) => {
      if(resp){
        const amountSent = resp?.amount_sent;
        const amountNotSent = resp?.amount_not_sent;
        const totalSent = this.sumObjectValues(amountSent);
        const totalNotSent = this.sumObjectValues(amountNotSent);
        
        if((amountSent?.status_not_sent || amountSent?.status_rejected || amountSent?.status_expired) && amountNotSent?.status_not_required) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('AskVisaDocument_S5.TITLE'),
            text: this.translate.instant('AskVisaDocument_S5.TEXT'),
            confirmButtonText: this.translate.instant('AskVisaDocument_S5.BUTTON'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(()=> {
            this.isWaitingForResponse = false;
            this.dialogRef.close();
          })
        } else if ((amountSent?.status_not_sent || amountSent?.status_rejected || amountSent?.status_expired) && (amountNotSent?.status_not_completed || amountNotSent?.status_validated || amountNotSent?.status_waiting_for_validation)) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('AskVisaDocument_S2.TITLE'),
            text: this.translate.instant('AskVisaDocument_S2.TEXT'),
            confirmButtonText: this.translate.instant('AskVisaDocument_S2.BUTTON'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(()=> {
            this.isWaitingForResponse = false;
            this.dialogRef.close();
          })
        } else if ( !totalSent && totalNotSent && totalNotSent === amountNotSent?.status_not_required){
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('AskVisaDocument_S4.TITLE'),
            text: this.translate.instant('AskVisaDocument_S4.TEXT'),
            confirmButtonText: this.translate.instant('AskVisaDocument_S4.BUTTON'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(()=> {
            this.isWaitingForResponse = false;
            this.dialogRef.close();
          })
        } else if (!totalSent && totalNotSent && (totalNotSent === amountNotSent?.status_not_completed || totalNotSent === amountNotSent?.status_validated || totalNotSent === amountNotSent?.status_waiting_for_validation)){
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('AskVisaDocument_S3.TITLE'),
            text: this.translate.instant('AskVisaDocument_S3.TEXT'),
            confirmButtonText: this.translate.instant('AskVisaDocument_S3.BUTTON'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(()=> {
            this.isWaitingForResponse = false;
            this.dialogRef.close();
          })
        } else {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo'),
            confirmButtonText: this.translate.instant('OK'),
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(()=> {
            this.isWaitingForResponse = false;
            this.dialogRef.close(true);
          })
        }
      } else {
        this.isWaitingForResponse = false;
      }
    },
    (err) => {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  sumObjectValues(obj){
    if(obj){
      const tempValue = Object.values(obj);
      const sumValue = tempValue.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);
      return sumValue;
    }
  }

  mappedMultipleData() {
    if(this.parentData?.selectedData) {
      const selectedData = this.parentData?.selectedData?.map((student) => {
        return student?._id
      });

      return selectedData;
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.parentData?.filter);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      };
    });

    if(!filterData?.validation_statuses?.length) delete filterData['validation_statuses'];

    return filterData;
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
