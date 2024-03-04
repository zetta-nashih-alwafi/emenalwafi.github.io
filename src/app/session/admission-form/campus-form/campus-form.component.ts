import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionService } from 'app/service/admission/admission.service';
import { SubSink } from 'subsink';
import { ChangeCampusDialogComponent } from './change-campus-dialog/change-campus-dialog.component';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { EventEmitter } from '@angular/core';
@Component({
  selector: 'ms-campus-form',
  templateUrl: './campus-form.component.html',
  styleUrls: ['./campus-form.component.scss'],
})
export class CampusFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  private subs = new SubSink();
  candidateData;
  isWaitingForResponse = false;

  intVal;
  timeOutVal;

  constructor(private admissionService: AdmissionService, private translate: TranslateService, public dialog: MatDialog) { }

  ngOnInit() {
    this.getOneCandidate();
  }

  ngOnChanges() {
    if (this.selectedIndex === 0) {
      this.getOneCandidate();
    }
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        const response = resp;
        this.candidateData = response;
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

  validateCampus() {
    const campus = this.candidateData.campus.name;
    let timeDisabled = 3;
    Swal.fire({
      type: 'question',
      title: this.translate.instant('TRANSFER_S3.Title'),
      text: this.translate.instant('TRANSFER_S3.Text', { campusName: campus }),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('TRANSFER_S3.Button 1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('TRANSFER_S3.Button 2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('TRANSFER_S3.Button 1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('TRANSFER_S3.Button 1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((resp) => {
      clearTimeout(this.timeOutVal);
      if (resp.value) {
        const payload = {
          program_confirmed: 'done',
        };
        this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload).subscribe(
          (ressp) => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo'),
              confirmButtonText: this.translate.instant('OK'),
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then((res) => {
              if (res.value) {
                this.isWaitingForResponse = false;
                this.candidateData = ressp;
                this.admissionService.setStatusStepCampus(true);
                this.admissionService.setIndexStep(1);
              }
            });
          },
          (err) => {
            this.isWaitingForResponse = false;
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEGAL_S5.Title'),
                text: this.translate.instant('LEGAL_S5.Text'),
                confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
              });
            } else if (err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit'
              || err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
              });
            } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('IBAN_S1.Title'),
                text: this.translate.instant('IBAN_S1.Text'),
                confirmButtonText: this.translate.instant('IBAN_S1.Button'),
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              }).then((res) => {
                if (res.value) {
                  const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
                  if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                    const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
                    this.moveToTab.emit(tabValid);
                    console.log(tabValid);
                  }
                }
              });
            }
          },
        );
        // this.subs.sink = this.candidateService.DeleteCandidateComment(comment._id).subscribe((resp) => {
        //   if (resp) {
        //   }
        // });
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  changeCampusDialog(step) {
    this.subs.sink = this.dialog
      .open(ChangeCampusDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          data: this.candidateData,
          step: step,
          candidateId: this.candidateData._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        console.log('Masuk Sini Harus', resp);
        if (resp === 'cancel') {
          this.admissionService.setStatusStepCampus(false);
          this.admissionService.setStatusEditCampusMode(false);
        } else {
          console.log('Masuk Sini Harus');
          this.candidateRequestCampusTransfer(resp);
        }
      });
  }

  candidateRequestCampusTransfer(newProgram) {
    console.log(newProgram);
    const payload = { program_confirmed: 'request_transfer' };
    this.subs.sink = this.admissionService.UpdateCandidateCampus(this.candidateData._id, payload, newProgram).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          this.candidateData = resp;
          this.admissionService.setStatusStepCampus(false);
          this.admissionService.setStatusEditCampusMode(false);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          });
        } else if (err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit'
          || err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
            html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
            confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
          });
        } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('IBAN_S1.Title'),
            text: this.translate.instant('IBAN_S1.Text'),
            confirmButtonText: this.translate.instant('IBAN_S1.Button'),
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

  createPayload(payload) {
    if (payload && payload._id) {
      delete payload._id;
    }
    if (payload && payload.campus) {
      payload.campus = payload.campus._id;
    }
    if (payload && payload.intake_channel) {
      payload.intake_channel = payload.intake_channel._id;
    }
    if (payload && payload.scholar_season) {
      payload.scholar_season = payload.scholar_season._id;
    }
    if (payload && payload.level) {
      payload.level = payload.level._id;
    }
    if (payload && payload.school) {
      payload.school = payload.school._id;
    }
    if (payload && payload.sector) {
      payload.sector = payload.sector._id;
    }
    if (payload && payload.speciality) {
      payload.speciality = payload.speciality._id;
    }
    if (payload && payload.registration_profile) {
      payload.registration_profile = payload.registration_profile._id;
    }
    if (payload && payload.admission_member_id) {
      payload.admission_member_id = payload.admission_member_id._id;
    }
    return payload;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
