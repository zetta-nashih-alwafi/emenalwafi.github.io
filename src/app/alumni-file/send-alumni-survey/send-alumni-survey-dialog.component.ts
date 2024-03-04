import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-send-alumni-survey-dialog',
  templateUrl: './send-alumni-survey-dialog.component.html',
  styleUrls: ['./send-alumni-survey-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class SendAlumniSurveyDialogComponent implements OnInit {
  typeForm: UntypedFormGroup;
  private subs = new SubSink();
  templateId;
  listFormBuilder = [];
  today: Date;
  isWaitingForResponse = false;
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<SendAlumniSurveyDialogComponent>,
    private formBuilderService: FormBuilderService,
    private utilService: UtilityService,
    private parseLocalToUtcPipe: ParseLocalToUtcPipe,
    private alumniService: AlumniService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.today = new Date();
    console.log('data', this.data);
    this.initFormBuilder();
    this.getFormBuilder();
  }

  initFormBuilder() {
    this.typeForm = this.fb.group({
      form_builder_id: [null, [Validators.required]],
    });
  }

  getFormBuilder() {
    this.subs.sink = this.formBuilderService.getAllFormBuildersAlumni().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.listFormBuilder = resp;
        } else {
          this.listFormBuilder = [];
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
      },
    );
  }

  onValidate() {
    console.log(this.typeForm.value);
    const currentTime = moment(this.today).format('HH:mm');
    const currentDate = moment(this.today, 'DD/MM/YYYY').format('DD/MM/YYYY');
    const utcTime = moment(currentTime, 'HH:mm').add(-moment().utcOffset(), 'm').format('HH:mm');
    const date = this.parseLocalToUtcPipe.transformDate(currentDate, currentTime);
    const formId = this.typeForm.get('form_builder_id').value;
    const form = this.listFormBuilder.find((list) => list._id === formId);
    if (this.typeForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.typeForm.markAllAsTouched();
      return true;
    } else {
      if (Array.isArray(this.data)) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ALUMNI_S1.TITLE', {
            templateName: form.form_builder_name,
          }),
          html: this.translate.instant('ALUMNI_S1.TEXT'),
          showCancelButton: true,
          allowEscapeKey: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('ALUMNI_S1.BUTTON_1'),
          cancelButtonText: this.translate.instant('ALUMNI_S1.BUTTON_2'),
        }).then((res) => {
          if (res.value) {
            this.isWaitingForResponse = true;
            const dataId = this.data.map((list) => list._id);
            this.subs.sink = this.alumniService.SendAlumniN1Notification(dataId, formId, this.currentUserTypeId).subscribe(
              (resp) => {
                if (dataId && dataId.length) {
                  dataId.forEach((element) => {
                    const newNoteHistory = {
                      alumni_id: element,
                      history_date: date,
                      history_time: utcTime,
                      action: 'Send survey',
                      who: this.utilService.getCurrentUser()._id,
                      description: 'Send survey ' + form.form_builder_name,
                    };
                    this.subs.sink = this.alumniService.createAlumniHistory(newNoteHistory).subscribe(
                      (ressp) => {},
                      (err) => {
                        this.authService.postErrorLog(err);
                      },
                    );
                  });
                }
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('ALUMNI_S2.TITLE'),
                  html: this.translate.instant('ALUMNI_S2.TEXT'),
                  allowOutsideClick: false,
                  confirmButtonText: this.translate.instant('ALUMNI_S2.BUTTON'),
                }).then((resss) => {
                  this.dialogRef.close(resp);
                });
              },
              (err) => {
                this.authService.postErrorLog(err);
              },
            );
          }
        });
      } else {
        const data = [];
        data.push(this.data);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('ALUMNI_S1.TITLE', {
            templateName: form.form_builder_name,
          }),
          html: this.translate.instant('ALUMNI_S1.TEXT'),
          showCancelButton: true,
          allowEscapeKey: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('ALUMNI_S1.BUTTON_1'),
          cancelButtonText: this.translate.instant('ALUMNI_S1.BUTTON_2'),
        }).then((res) => {
          if (res.value) {
            this.isWaitingForResponse = true;
            this.subs.sink = this.alumniService.SendAlumniN1Notification(data, formId, this.currentUserTypeId).subscribe(
              (resp) => {
                if (data && data.length) {
                  data.forEach((element) => {
                    const newNoteHistory = {
                      alumni_id: element,
                      history_date: date,
                      history_time: utcTime,
                      action: 'Send survey',
                      who: this.utilService.getCurrentUser()._id,
                      description: 'Send survey ' + form.form_builder_name,
                    };
                    this.subs.sink = this.alumniService.createAlumniHistory(newNoteHistory).subscribe(
                      (ressp) => {},
                      (err) => {
                        this.authService.postErrorLog(err);
                      },
                    );
                  });
                }
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('ALUMNI_S2.TITLE'),
                  html: this.translate.instant('ALUMNI_S2.TEXT'),
                  allowOutsideClick: false,
                  confirmButtonText: this.translate.instant('ALUMNI_S2.BUTTON'),
                }).then((resss) => {
                  this.dialogRef.close(resp);
                });
              },
              (err) => {
                this.authService.postErrorLog(err);
              },
            );
          }
        });
      }
    }
  }
}
