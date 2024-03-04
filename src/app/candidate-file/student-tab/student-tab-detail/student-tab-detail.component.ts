import { PageTitleService } from './../../../core/page-title/page-title.service';
import { StudentsService } from 'app/service/students/students.service';
import { CustomValidators } from 'ng2-validation';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, Input, OnDestroy, OnInit, Output, OnChanges, EventEmitter } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AdmissionService } from 'app/service/admission/admission.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { StudentChangeStatusDialogComponent } from 'app/candidate-file/student-commentaries-tab/student-change-status-dialog/student-change-status-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { debounceTime } from 'rxjs/operators';
import { UtilityService } from 'app/service/utility/utility.service';

@Component({
  selector: 'ms-student-tab-detail',
  templateUrl: './student-tab-detail.component.html',
  styleUrls: ['./student-tab-detail.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class StudentTabDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() scholarSeasonData;
  @Input() candidateId;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @Output() reloadDataDetail: EventEmitter<boolean> = new EventEmitter();
  @Input() studentStatusList = [];
  @Input() userData;
  private subs = new SubSink();
  registrationData;
  isWaitingForResponse = false;
  hideRegistrationForm = false;
  registrationFee: any;
  isCandidateFC: boolean;
  isCheckOrTransfer: boolean;
  currentUser: any;
  studentId: any;
  timeOutVal: any;

  expanded = true;
  form: UntypedFormGroup;
  backupList: any;

  disableButtonVerify = true;
  currentEmail: any;
  disableButtonSave = false;

  constructor(
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private router: Router,
    private admissionService: AdmissionService,
    private translate: TranslateService,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private studentsService: StudentsService,
    private pageTitleService: PageTitleService,
    public dialog: MatDialog,
    private candidateService: CandidatesService,
    private utilService: UtilityService
  ) {}

  ngOnInit() {
    this.backupList = _.cloneDeep(this.studentStatusList);
    console.log('cek list', this.studentStatusList);
    console.log('cek input', this.userData);
    console.log('cek scholarSeasonData', this.scholarSeasonData);
    this.currentUser = this.authService.getLocalStorageUser();
    this.initForm();
    this.updatePageTitle();
    if (this.scholarSeasonData) {
      this.getRegistrationData();
    }
    if (
      this.scholarSeasonData &&
      this.scholarSeasonData.student_id &&
      this.scholarSeasonData.student_id.program_sequence_ids &&
      this.scholarSeasonData.student_id.program_sequence_ids.length
    ) {
      this.expanded = false;
    }
    console.log('dataaa', this.registrationData);
    if (!this.registrationData?.last_index) {
      this.studentStatusList = [];
    } else {
      this.studentStatusList = this.backupList;
    }
    this.initEmail();
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortStudentStatus()
    })
  }
  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    });
  }

  ngOnChanges() {
    this.sortStudentStatus()
  }

  sortStudentStatus() {
    if (this.studentStatusList?.length) {
      this.studentStatusList = this.studentStatusList?.sort((current, next) => this.utilService.simplifyRegex(this.translate.instant(current?.key)).localeCompare(this.utilService.simplifyRegex(this.translate.instant(next?.key))))
    }
  }

  updateToPostPone(element, payload, is_prevent_resend_notif) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.UpdateCandidateStatusPostPone(element?._id, payload, is_prevent_resend_notif).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
        }).then((resss) => {
          this.reloadDataDetail.emit(true);
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
          err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          });
        } else if (
          err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
          err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
        ) {
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
        } else if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  changeStatus(element, selectedStatusValue) {
    const payload = {
      candidate_admission_status: element.candidate_admission_status === 'registered' ? 'report_inscription' : 'registered',
    };
    const civility = element.civility && element.civility === 'neutral' ? '' : this.translate.instant(element.civility);
    const last_name = element.last_name;
    const first_name = element.first_name;
    let timeDisabled = 4;
    if (element.candidate_admission_status === 'registered' || element.candidate_admission_status === 'financement_validated') {
      payload.candidate_admission_status = 'report_inscription';
      Swal.fire({
        title: this.translate.instant('INSCRIPTION_REPORT_S1.TITLE'),
        html: this.translate.instant('INSCRIPTION_REPORT_S1.TEXT', {
          candidateName: civility + ' ' + first_name + ' ' + last_name,
        }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          if (selectedStatusValue === 'registered') {
            Swal.fire({
              title: this.translate.instant('CHANGESTATUS_TO_REGISTERED.TITLE'),
              html: this.translate.instant('CHANGESTATUS_TO_REGISTERED.TEXT'),
              type: 'question',
              showCancelButton: true,
              cancelButtonText: this.translate.instant('CHANGESTATUS_TO_REGISTERED.BUTTON 2'),
              confirmButtonText: this.translate.instant('CHANGESTATUS_TO_REGISTERED.BUTTON 1'),
            }).then((result) => {
              if (result.value) {
                this.updateToPostPone(element, payload, false);
              } else {
                this.updateToPostPone(element, payload, true);
              }
            });
          } else {
            this.updateToPostPone(element, payload, true);
          }
        }
      });
    } else {
      Swal.fire({
        title: this.translate.instant('INSCRIPTION_REPORT_S2.TITLE'),
        html: this.translate.instant('INSCRIPTION_REPORT_S2.TEXT', {
          candidateName: civility + ' ' + first_name + ' ' + last_name,
        }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          if (selectedStatusValue === 'registered') {
            Swal.fire({
              title: this.translate.instant('CHANGESTATUS_TO_REGISTERED.TITLE'),
              html: this.translate.instant('CHANGESTATUS_TO_REGISTERED.TEXT'),
              type: 'question',
              showCancelButton: true,
              cancelButtonText: this.translate.instant('CHANGESTATUS_TO_REGISTERED.BUTTON 2'),
              confirmButtonText: this.translate.instant('CHANGESTATUS_TO_REGISTERED.BUTTON 1'),
            }).then((result) => {
              if (result.value) {
                this.updateToPostPone(element, payload, false);
              } else {
                this.updateToPostPone(element, payload, true);
              }
            });
          } else {
            this.updateToPostPone(element, payload, true);
          }
        }
      });
    }
  }
  readmittedStatus(value) {
    console.log('readmittedStatus', value);
    const currentStatus = this.translate.instant(this.scholarSeasonData?.candidate_admission_status);
    const newStatus = this.translate.instant(value);
    Swal.fire({
      title: this.translate.instant('Are you sure?'),
      html: this.translate.instant('CHANGESTATUS_S1.TEXT', { currentStatus, newStatus }),
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 2'),
      confirmButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 1'),
    }).then((result) => {
      if (result.value) {
        const dialogRef = this.dialog
          .open(StudentChangeStatusDialogComponent, {
            width: '750px',
            minHeight: '100px',
            disableClose: true,
            data: {
              currentStatus,
              newStatus: value,
              isEdit: false,
              currentUser: this.currentUser,
              candidateId: this.scholarSeasonData?._id,
            },
          })
          .afterClosed()
          .subscribe((responDialog) => {
            if (responDialog) {
              this.isWaitingForResponse = true;
              this.subs.sink = this.admissionService
                .TransferStudentResignedAfterRegisteredToAdmitted(this.scholarSeasonData?._id)
                .subscribe(
                  (resp) => {
                    if (resp) {
                      delete responDialog['status_changed_at'];
                      this.subs.sink = this.candidateService.CreateCandidateComment(responDialog).subscribe(
                        (ressp) => {
                          if (ressp) {
                            Swal.fire({
                              type: 'success',
                              title: this.translate.instant('Bravo'),
                              confirmButtonText: this.translate.instant('OK'),
                              allowOutsideClick: false,
                              allowEscapeKey: false,
                            }).then((res) => {
                              if (res.value) {
                                this.isWaitingForResponse = false;
                                // this.matMenuTrigger.closeMenu;
                                this.reloadDataDetail.emit(true);
                              }
                            });
                          }
                        },
                        (err) => {
                          this.isWaitingForResponse = false;
                          if (
                            err &&
                            err['message'] &&
                            (err['message'].includes('jwt expired') ||
                              err['message'].includes('str & salt required') ||
                              err['message'].includes('Authorization header is missing') ||
                              err['message'].includes('salt'))
                          ) {
                            this.authService.handlerSessionExpired();
                            return;
                          }
                          Swal.fire({
                            type: 'info',
                            title: this.translate.instant('SORRY'),
                            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                          });
                        },
                      );
                    }
                  },
                  (err) => {
                    this.isWaitingForResponse = false;
                    if (err['message'] === 'GraphQL error: There is term that already paid') {
                      Swal.fire({
                        type: 'info',
                        title: this.translate.instant('TRANSFER_S5.Title'),
                        text: this.translate.instant('TRANSFER_S5.Text'),
                        confirmButtonText: this.translate.instant('TRANSFER_S5.Button 1'),
                        allowEnterKey: false,
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                      });
                    } else if (err['message'] === 'GraphQL error: There is term still pending') {
                      Swal.fire({
                        type: 'info',
                        title: this.translate.instant('PAY_SUM_S3.Title'),
                        text: this.translate.instant('PAY_SUM_S3.Text'),
                        confirmButtonText: this.translate.instant('PAY_SUM_S3.Button'),
                        allowEnterKey: false,
                        allowEscapeKey: false,
                        allowOutsideClick: false,
                      });
                    } else {
                      if (
                        err &&
                        err['message'] &&
                        (err['message'].includes('jwt expired') ||
                          err['message'].includes('str & salt required') ||
                          err['message'].includes('Authorization header is missing') ||
                          err['message'].includes('salt'))
                      ) {
                        this.authService.handlerSessionExpired();
                        return;
                      }
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
          });
      }
    });
  }
  updateStatus(value) {
    if (value === 'registered') {
      const statusDP = this.renderTooltipStatusDP(this.registrationData);
      if (statusDP !== 'Paid' && statusDP !== 'Payé' && !this.checkIfDoesntHaveAnyDP(this.registrationData)) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('Followup_S17.Title'),
          text: this.translate.instant('Followup_S17.Text'),
          confirmButtonText: this.translate.instant('Followup_S17.Button'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      } else {
        this.triggerUpdateStatus(value);
      }
    } else {
      this.triggerUpdateStatus(value);
    }
  }

  checkIfDoesntHaveAnyDP(element) {
    if (
      element &&
      element.registration_profile &&
      element.registration_profile.is_down_payment &&
      element.registration_profile.is_down_payment === 'no'
    ) {
      return true;
    } else {
      return false;
    }
  }

  triggerUpdateStatus(value) {
    if (value === 'report_inscription' || this.scholarSeasonData?.candidate_admission_status === 'report_inscription') {
      this.changeStatus(this.scholarSeasonData, value);
    } else if (
      value === 'admission_in_progress' &&
      (this.scholarSeasonData?.candidate_admission_status === 'resigned_after_registered' ||
        this.scholarSeasonData?.candidate_admission_status === 'resigned_after_engaged' ||
        this.scholarSeasonData?.candidate_admission_status === 'resignation_missing_prerequisites')
    ) {
      this.readmittedStatus(value);
    } else {
      const payload = {
        candidate_admission_status: value,
      };
      const currentStatus = this.translate.instant(this.scholarSeasonData?.candidate_admission_status);
      const newStatus = this.translate.instant(value);
      const statusValue = this.scholarSeasonData?.candidate_admission_status;

      const titleSwal =
        (this.scholarSeasonData?.candidate_admission_status === 'registered' && value === 'no_show') ||
        (this.scholarSeasonData?.candidate_admission_status === 'no_show' && value === 'registered')
          ? 'SWAL_CHANGE_STATUS_NO_SHOW'
          : 'CHANGESTATUS_S1.TITLE';
      Swal.fire({
        title: this.translate.instant(titleSwal),
        html: this.translate.instant('CHANGESTATUS_S1.TEXT', { currentStatus, newStatus }),
        type: 'warning',
        showCancelButton: true,
        cancelButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 2'),
        confirmButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 1'),
      }).then((result) => {
        if (result.value) {
          const dialogRef = this.dialog
            .open(StudentChangeStatusDialogComponent, {
              width: '750px',
              minHeight: '100px',
              disableClose: true,
              data: {
                currentStatus,
                statusValue,
                newStatus: value,
                isEdit: false,
                currentUser: this.currentUser,
                candidateId: this.scholarSeasonData?._id,
                allDataUser: this.userData,
              },
            })
            .afterClosed()
            .subscribe((responDialog) => {
              if (responDialog) {
                console.log('responDialog', responDialog);
                if (value === 'resign_after_school_begins') {
                  payload['resign_after_school_begins_at'] = responDialog['resign_after_school_begins_at'];
                  delete responDialog['resign_after_school_begins_at'];
                } else if (value === 'no_show') {
                  payload['no_show_at'] = responDialog['no_show_at'];
                  delete responDialog['no_show_at'];
                }
                payload['status_changed_at'] = responDialog['status_changed_at'];
                delete responDialog['status_changed_at'];
                if (value === 'registered') {
                  Swal.fire({
                    title: this.translate.instant('CHANGESTATUS_TO_REGISTERED.TITLE'),
                    html: this.translate.instant('CHANGESTATUS_TO_REGISTERED.TEXT'),
                    type: 'question',
                    showCancelButton: true,
                    cancelButtonText: this.translate.instant('CHANGESTATUS_TO_REGISTERED.BUTTON 2'),
                    confirmButtonText: this.translate.instant('CHANGESTATUS_TO_REGISTERED.BUTTON 1'),
                  }).then((result) => {
                    if (result.value) {
                      this.updateCandidate(responDialog, payload, false);
                    } else {
                      this.updateCandidate(responDialog, payload, true);
                    }
                  });
                } else {
                  this.updateCandidate(responDialog, payload, true);
                }
              }
            });
        }
      });
    }
  }

  updateCandidate(responDialog, payload, preventNotif) {
    this.isWaitingForResponse = true;
    const is_save_identity_student = true;
    this.subs.sink = this.admissionService
      .UpdateCandidateStatus(this.scholarSeasonData?._id, payload, preventNotif, is_save_identity_student)
      .subscribe(
        (resp) => {
          if (resp) {
            this.subs.sink = this.candidateService.CreateCandidateComment(responDialog).subscribe(
              (resp) => {
                if (resp) {
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo'),
                    confirmButtonText: this.translate.instant('OK'),
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                  }).then((res) => {
                    if (res.value) {
                      this.isWaitingForResponse = false;
                      // this.matMenuTrigger.closeMenu;
                      this.reloadDataDetail.emit(true);
                    }
                  });
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                if (
                  err &&
                  err['message'] &&
                  (err['message'].includes('jwt expired') ||
                    err['message'].includes('str & salt required') ||
                    err['message'].includes('Authorization header is missing') ||
                    err['message'].includes('salt'))
                ) {
                  this.authService.handlerSessionExpired();
                  return;
                }
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (
            err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
            err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('LEGAL_S5.Title'),
              text: this.translate.instant('LEGAL_S5.Text'),
              confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
            });
          } else if (
            err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
            err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SPEA Direct Debit')
          ) {
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
          } else if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.authService.handlerSessionExpired();
            return;
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
  initForm() {
    this.form = this.fb.group({
      school_mail: [null, [CustomValidators.email]],
      cvec_number: [null],
      ine_number: [null],
    });
  }

  getRegistrationData() {
    const data = _.cloneDeep(this.scholarSeasonData);
    console.log('student Data', data);

    if (data && data.student_id && data.student_id._id) {
      this.studentId = _.cloneDeep(data.student_id._id);
    }

    if (data && data.type_of_formation_id && data.type_of_formation_id.type_of_formation !== 'classic') {
      this.isCandidateFC = true;
    } else {
      this.isCandidateFC = false;
    }
    if (data && data.announcement_email && data.announcement_email.sent_date && data.announcement_email.sent_time) {
      this.hideRegistrationForm = false;
    } else {
      this.hideRegistrationForm = true;
    }
    data.announcement_email = this.transformDate(data.announcement_email);
    if (data && data.registration_profile && data.registration_profile.additional_cost_ids) {
      this.calculateRegistrationFees(data.registration_profile.additional_cost_ids);
    }
    this.form.patchValue(data);
    this.registrationData = data;
    this.currentEmail = data.school_mail;

    if (data && data.payment_method && (data.payment_method === 'transfer' || data.payment_method === 'check')) {
      this.isCheckOrTransfer = true;
    } else {
      this.isCheckOrTransfer = false;
    }

    if (this.isCandidateFC && !data.admission_process_id) {
      this.hideRegistrationForm = true;
    }

    console.log('_regis', this.registrationData);

    if (!this.registrationData?.last_index) {
      this.studentStatusList = [];
      console.log('masuk', this.studentStatusList);
    } else {
      this.studentStatusList = this.backupList;
    }
  }
  calculateRegistrationFees(datas) {
    // console.log(datas);
    let fees = 0;
    if (datas && datas.length) {
      datas.forEach((fee) => {
        fees = fees + fee.amount;
      });
      this.registrationFee = fees;
    }
  }

  transformDate(data) {
    if (data && data.sent_date && data.sent_time) {
      const date = data.sent_date;
      const time = data.sent_time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }
  transformDateStatus(data) {
    if (data && data.date && data.time) {
      const date = data.date;
      const time = data.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }
  getRegistrationDate(status) {
    // if (status.candidate_admission_status === 'engaged') {
    //   const date = this.transformDateStatus(status.engaged_at);
    //   return date ? date : '-';
    // }
    if (status.candidate_admission_status === 'registered') {
      const date = this.transformDateStatus(status.registered_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'resigned') {
      const date = this.transformDateStatus(status?.resigned_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'resigned_after_engaged') {
      const date = this.transformDateStatus(status?.resigned_after_engaged_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'resigned_after_registered') {
      const date = this.transformDateStatus(status?.resigned_after_registered_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'resign_after_school_begins') {
      const date = this.transformDateStatus(status?.resign_after_school_begins_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'no_show') {
      const date = this.transformDateStatus(status?.no_show_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'report_inscription') {
      if (status.inscription_at && status.inscription_at.date) {
        const date = this.transformDateStatus(status.inscription_at);
        return date ? date : '-';
      } else {
        return '-';
      }
    } else if (
      status.candidate_admission_status === 'admitted' ||
      status.candidate_admission_status === 'admission_in_progress' ||
      status.candidate_admission_status === 'engaged'
    ) {
      const date = this.transformDateStatus(status.candidate_sign_date);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'bill_validated') {
      const date = this.transformDateStatus(status.bill_validated_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'financement_validated') {
      const date = this.transformDateStatus(status.financement_validated_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'mission_card_validated') {
      const date = this.transformDateStatus(status.mission_card_validated_at);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'in_scholarship') {
      const date = this.transformDateStatus(status.in_scholarship);
      return date ? date : '-';
    } else if (status.candidate_admission_status === 'resignation_missing_prerequisites') {
      const date = this.transformDateStatus(status.resignation_missing_prerequisites_at);
      return date ? date : '-';
    } else {
      return '-';
    }
  }
  viewPDF(link) {
    const a = document.createElement('a');
    a.target = 'blank';
    a.href = `${environment.apiUrl}/fileuploads/${link}?download=true`.replace('/graphql', '');
    a.download = link;
    a.click();
    a.remove();
  }

  viewPDFAmendment(link) {
    const a = document.createElement('a');
    a.target = 'blank';
    a.href = `${link}`;
    a.download = link;
    a.click();
    a.remove();
  }

  viewAdmissionFile(candidateId) {
    const query = { candidate: candidateId };
    if (
      (this.isCandidateFC && this.registrationData.admission_process_id && this.registrationData.admission_process_id._id) ||
      (this.registrationData.readmission_status &&
        this.registrationData.admission_process_id &&
        this.registrationData.admission_process_id._id)
    ) {
      const userTypeId = this.authService.getCurrentUser().entities[0].type._id;
      const querys = {
        formId: this.registrationData.admission_process_id._id,
        formType: 'student_admission',
        userId: this.currentUser._id,
        userTypeId: userTypeId,
      };
      const url = this.router.createUrlTree(['/form-fill'], { queryParams: querys });
      window.open(url.toString(), '_blank');
    } else {
      const url = this.router.createUrlTree(['/session/register'], { queryParams: query });
      window.open(url.toString(), '_blank');
    }
  }

  exportPDF() {
    if (this.registrationData.school_contract_pdf_link) {
      this.viewPDF(this.registrationData.school_contract_pdf_link);
    } else {
      this.isWaitingForResponse = true;
      this.subs.sink = this.admissionService.GeneratePDFSchoolContract(this.registrationData._id).subscribe(
        (data) => {
          this.isWaitingForResponse = false;
          const link = document.createElement('a');
          link.setAttribute('type', 'hidden');
          link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
          link.target = '_blank';
          link.click();
          link.remove();
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

  exportPDFAmendement() {
    if (this.registrationData?.current_school_contract_amendment_form?.school_amendment_form_link) {
      this.viewPDFAmendment(this.registrationData?.current_school_contract_amendment_form?.school_amendment_form_link);
    } else {
      this.isWaitingForResponse = true;
      const isDontSavePdfToStudent = false;
      this.subs.sink = this.admissionService
        .GeneratePDFSchoolContractAmendement(this.registrationData._id, isDontSavePdfToStudent)
        .subscribe(
          (data) => {
            this.isWaitingForResponse = false;
            const link = document.createElement('a');
            link.setAttribute('type', 'hidden');
            link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
            link.target = '_blank';
            link.click();
            link.remove();
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

  renderTooltipStatusDP(element) {
    if (
      element.payment_method === 'transfer' ||
      element.payment_method === 'check' ||
      element.payment_method === 'sepa' ||
      element.payment_method === 'cash'
    ) {
      if (element.payment_method === 'sepa' || element.payment_method === 'cash') {
        if (element.payment === 'sepa_pending' || element.payment === 'pending') {
          return this.translate.instant('Pending');
        } else if (element.payment === 'not_authorized') {
          return this.translate.instant('Rejecteds');
        } else if (!element.billing_id.deposit) {
          return this.translate.instant('Not paid');
        } else if (
          element.billing_id &&
          element.billing_id.deposit &&
          element.billing_id.deposit_pay_amount &&
          element.billing_id.deposit_pay_amount >= element.billing_id.deposit
        ) {
          return this.translate.instant('Paid');
        } else if (
          element.billing_id &&
          element.billing_id.deposit &&
          element.billing_id.deposit_pay_amount &&
          element.billing_id.deposit_pay_amount < element.billing_id.deposit
        ) {
          return this.translate.instant('Partially paid');
        } else {
          return this.translate.instant('Not paid');
        }
      } else {
        if (
          element.billing_id &&
          element.billing_id.deposit &&
          element.billing_id.deposit_pay_amount === 0 &&
          element.payment === 'pending'
        ) {
          return this.translate.instant('Pending');
        } else if (
          element.billing_id &&
          element.billing_id.deposit &&
          element.billing_id.deposit_pay_amount &&
          element.billing_id.deposit_pay_amount > 0 &&
          element.billing_id.deposit_pay_amount >= element.billing_id.deposit
        ) {
          return this.translate.instant('Paid');
        } else if (
          element.billing_id &&
          element.billing_id.deposit &&
          element.billing_id.deposit_pay_amount &&
          element.billing_id.deposit_pay_amount > 0 &&
          element.billing_id.deposit_pay_amount < element.billing_id.deposit
        ) {
          return this.translate.instant('Partially paid');
        } else {
          return this.translate.instant('Not paid');
        }
      }
    } else {
      if (!element && element.billing_id && element.billing_id.deposit) {
        return this.translate.instant('Not paid');
      } else if (
        element &&
        element.billing_id &&
        element.billing_id.deposit &&
        element.billing_id.deposit_pay_amount &&
        element.billing_id.deposit_pay_amount >= element.billing_id.deposit
      ) {
        return this.translate.instant('Paid');
      } else if (
        element &&
        element.billing_id &&
        element.billing_id.deposit &&
        element.billing_id.deposit_pay_amount &&
        element.billing_id.deposit_pay_amount < element.billing_id.deposit
      ) {
        return this.translate.instant('Partially paid');
      } else {
        return this.translate.instant('Not paid');
      }
    }
  }

  openDocTransferOrCheck(fileUrl) {
    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = `${environment.apiUrl}/fileuploads/${fileUrl}`.replace('/graphql', '');
    link.target = '_blank';
    link.click();
    link.remove();
  }

  composeSequencePanelTitle(sequence: any) {
    if (sequence) {
      const array = [];
      if (sequence.name) array.push(String(sequence.name));
      if (sequence.type_of_sequence) array.push(this.translate.instant('course_sequence.' + sequence.type_of_sequence));
      // Note: Date and time is still UTC
      if (sequence.start_date && sequence.start_date.date && sequence.start_date.time) {
        array.push(this.parseUtcToLocalPipe.transformDate(sequence.start_date.date, sequence.start_date.time));
      }
      if (sequence.end_date && sequence.end_date.date && sequence.end_date.time) {
        array.push(this.parseUtcToLocalPipe.transformDate(sequence.end_date.date, sequence.end_date.time));
      }
      return array.join(' - ');
    } else {
      return this.translate.instant('No Data');
    }
  }

  getAssignedClassFromSequence(sequence) {
    // console.log('STUDENT ID', this.studentId);
    // console.log('SEQUENCE', sequence);
    if (
      sequence &&
      sequence.program_sequence_groups &&
      sequence.program_sequence_groups[0] &&
      sequence.program_sequence_groups[0].student_classes
    ) {
      const classes = sequence.program_sequence_groups[0].student_classes;
      const studentClass = classes.find((item) => {
        if (item && item.students_id && item.students_id[0] && item.students_id[0]._id) {
          const match = item.students_id.find((student) => student._id === this.studentId);
          return Boolean(match);
        } else {
          return false;
        }
      });
      if (!Boolean(studentClass)) return null;
      return studentClass;
    } else {
      return null;
    }
  }
  onSave() {
    if (this.form?.get('school_mail')?.hasError('email')) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Format.Title'),
        html: this.translate.instant('Invalid_Format.Text'),
        confirmButtonText: this.translate.instant('Invalid_Format.Button'),
      });
      return;
    }
    const payload = this.form.value;
    this.isWaitingForResponse = true;
    // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
    const is_save_identity_student = true;
    this.subs.sink = this.studentsService.updateCandidate(this.scholarSeasonData?._id, payload, is_save_identity_student).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          this.reloadData.emit(true);
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  initEmail() {
    this.form
      .get('school_mail')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((resp) => {
        if (resp !== this.currentEmail) {
          this.disableButtonVerify = false;
          this.disableButtonSave = true;
        } else {
          this.disableButtonVerify = true;
          this.disableButtonSave = false;
        }
      });
  }

  verifyEmail() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService
      .checkEmailAvailbility(this.form.get('school_mail').value, this.scholarSeasonData?.user_id?._id)
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo'),
              confirmButtonText: this.translate.instant('OK'),
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              this.disableButtonSave = false;
            });
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          if (error) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('SWAL_USER_EXIST_DUMMY.TITLE'),
              text: this.translate.instant('SWAL_USER_EXIST_DUMMY.TEXT'),
              confirmButtonText: this.translate.instant('SWAL_USER_EXIST_DUMMY.BUTTON'),
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              this.disableButtonSave = true;
            });
          }
        },
      );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
