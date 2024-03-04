import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import * as moment from 'moment';

@Component({
  selector: 'ms-assign-starting-date-dialog',
  templateUrl: './assign-starting-date-dialog.component.html',
  styleUrls: ['./assign-starting-date-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe],
})
export class AssingStartingDateDialogComponent implements OnInit, OnDestroy {
  @ViewChild('mobileNumber', { static: false }) mobileNumberInput;
  private subs = new SubSink();
  startDateForm: FormGroup;

  isWaitingForResponse = false;
  today = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AssingStartingDateDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private intakeChannelService: IntakeChannelService,
    private translate: TranslateService,
    public coreService: CoreService,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.startDateForm = this.fb.group({
      date: ['', [Validators.required]],
      time: ['15:59'],
    });
  }

  checkFormValidity(): boolean {
    if (this.startDateForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.startDateForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    const temp = _.cloneDeep(this.parentData.programIds);
    const program_ids = [];
    if (temp && temp.length) {
      temp.forEach((element) => {
        program_ids.push(element._id.toString());
      });
    }
    const currentTime = moment(this.today).format('HH:mm');
    let dueDate = this.startDateForm.get('date').value;
    dueDate = moment(dueDate).format('DD/MM/YYYY');
    const program_input = {
      start_date: {
        date: this.parseLocalToUTCPipe.transformDate(dueDate, currentTime),
        time: this.parseLocalToUTCPipe.transform(currentTime),
      },
    };
    this.updateProgramData(program_ids, program_input);
  }

  updateProgramData(program_ids, payload) {
    this.subs.sink = this.intakeChannelService.updateProgramStartDate(program_ids, payload).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(resp);
        });
      },
      (error) => {
        this.isWaitingForResponse = false;
        console.log(error, error.message);
        this.authService.postErrorLog(error)
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
