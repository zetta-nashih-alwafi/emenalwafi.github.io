import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AddFinancementDialogComponent } from 'app/shared/components/add-financement-dialog/add-financement-dialog.component';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

const DUMMY_MESSAGES = [
  {
    date: '02/02/2022',
    creator: 'Jhon Doe',
    message:
      'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eaque hic accusamus, ut veniam earum, natus aut obcaecati nisi sed cum aspernatur unde minus! In, sapiente quidem facere tempore rerum nostrum nesciunt ratione placeat repellat expedita nihil nemo adipisci error blanditiis nobis sint beatae libero atque.',
  },
  {
    date: '02/02/2022',
    creator: 'Jahe Doe',
    message:
      'Eaque hic accusamus, ut veniam earum, natus aut obcaecati nisi sed cum aspernatur unde minus! In, sapiente quidem facere tempore rerum nostrum nesciunt ratione placeat repellat expedita nihil nemo adipisci error blanditiis nobis sint beatae libero atque.',
  },
  {
    date: '02/02/2022',
    creator: 'Elisabth Swan',
    message:
      'In, sapiente quidem facere tempore rerum nostrum nesciunt ratione placeat repellat expedita nihil nemo adipisci error blanditiis nobis sint beatae libero atque.',
  },
  {
    date: '02/02/2022',
    creator: 'Roby',
    message:
      'Aspernatur unde minus! In, sapiente quidem facere tempore rerum nostrum nesciunt ratione placeat repellat expedita nihil nemo adipisci error blanditiis nobis sint beatae libero atque.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eaque hic accusamus, ut veniam earum, natus aut obcaecati nisi sed cum ',
  },
];

@Component({
  selector: 'ms-add-note-financement-dialog',
  templateUrl: './add-note-financement-dialog.component.html',
  styleUrls: ['./add-note-financement-dialog.component.scss'],
})
export class AddNoteFinancementDialogComponent implements OnInit {
  addNoteFinancementForm: UntypedFormGroup;
  private subs = new SubSink();
  isWaitingForResponse = false;

  messages;
  timeOutVal: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    public dialogRef: MatDialogRef<AddFinancementDialogComponent>,
    private fb: UntypedFormBuilder,
    private utilService: UtilityService,
    private translate: TranslateService,
    private formFillingService: FormFillingService,
  ) {}

  ngOnInit() {
    this.initForm();
    console.log('this.parentData:::::',this.addNoteFinancementForm.value,this.parentData.source);
    this.getAllFinancementNotes();
  }

  getAllFinancementNotes() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.GetAllFinancementNotes(this.parentData.source._id).subscribe(
      (res) => {
        console.log('_all notes', res);
        if (res) {
          this.messages = res;
        }
        if (this.messages.length === 0) {
          this.addNoteFinancementForm.get('comment').setValidators([Validators.required]);
          this.addNoteFinancementForm.get('comment').updateValueAndValidity();
        } else {
          this.addNoteFinancementForm.get('comment').clearValidators();
          this.addNoteFinancementForm.get('comment').updateValueAndValidity();
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      }
    );
  }

  initForm() {
    this.addNoteFinancementForm = this.fb.group({
      // admission_financement_id: [this.parentData.admission_financement_id, Validators.required],
      admission_financement_id:[this.parentData.source._id, Validators.required],
      created_by:
        this.parentData.comps.callFrom === 'student_card'
          ? [this.parentData.currentUserId, Validators.required]
          : this.parentData.source.candidate_id.user_id._id
          ? [this.parentData.source.candidate_id.user_id._id, Validators.required]
          : [null],
      comment: [null],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  sendNote() {
    console.log(this.addNoteFinancementForm.controls);
    console.log(this.parentData);
    console.log(this.addNoteFinancementForm.value);

    this.isWaitingForResponse = true;
    if (this.addNoteFinancementForm.invalid) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
      });
      this.addNoteFinancementForm.markAllAsTouched();
      this.isWaitingForResponse = false;
    } else if (
      (this.addNoteFinancementForm.get('comment').value === null || this.addNoteFinancementForm.get('comment').value === '') &&
      this.messages.length === 0
    ) {
      this.dialogRef.close();
    } else {
      if (this.addNoteFinancementForm.get('comment').value === null || this.addNoteFinancementForm.get('comment').value === '') {
        this.dialogRef.close();
      } else {
        const payload = this.addNoteFinancementForm.value;
        this.subs.sink = this.formFillingService.createFinancementNote(payload).subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            console.log(resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((res) => {
              this.getAllFinancementNotes();
              this.addNoteFinancementForm.get('comment').setValue('');
            });
          },
          (err) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    }
  }

  handleSubmit() {
    this.sendNote();
  }

  translateDate(dateRaw) {
    if (dateRaw) {
      const datee = moment(dateRaw).format('MM/DD/YYYY');
      return datee;
    } else {
      return '';
    }
  }

  deleteNote(element) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('COMPANY_S14.title'),
      html: this.translate.instant('COMPANY_S14.text'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMPANY_S14.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('COMPANY_S14.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isWaitingForResponse = true;
        this.subs.sink = this.formFillingService.DeleteFinancementNote(element._id).subscribe(
          (res) => {
            if (res) {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((res) => {
                this.getAllFinancementNotes();
              });
            } else {
              this.isWaitingForResponse = false;
            }
          },
          (err) => {
            this.isWaitingForResponse = false
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        );
      }
    });
  }
}
