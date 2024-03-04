import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeCampusDialogComponent } from 'app/session/admission-form/campus-form/change-campus-dialog/change-campus-dialog.component';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { UtilityService } from 'app/service/utility/utility.service';
import { StepDynamicMessageDialogComponent } from 'app/shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import { FormFillingService } from '../form-filling.service';
import { timingSafeEqual } from 'crypto';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ms-form-fill-campus-validation',
  templateUrl: './form-fill-campus-validation.component.html',
  styleUrls: ['./form-fill-campus-validation.component.scss'],
})
export class FormFillCampusValidationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() formData;
  @Input() currentStepIndex;
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Output() moveToTab = new EventEmitter<string>();
  @Input() formDetail: any;
  @Input() isReceiver: any;
  @Input() stepData: any;
  @Input() userData: any;
  private subs = new SubSink();
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  candidateData;
  isWaitingForResponse = false;
  formId: any;
  intVal;
  timeOutVal;
  isUsingStepMessage = false;

  processFinish = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  currentUser = null;
  userId = null;
  userMainId = null;

  constructor(
    private admissionService: AdmissionService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public utilitySevice: UtilityService,
    private formFillingService: FormFillingService,
    private authService: AuthService,
    private formBuilderService: FormBuilderService,
    public sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    if (this.currentUser && this.currentUser._id) {
      this.userMainId = this.currentUser._id;
    } else {
      if (this.userId) {
        this.userMainId = this.userId;
      } else {
        this.userMainId = null;
      }
    }
    console.log(this.formDetail);
    console.log(this.stepData);
    console.log(this.userData);
    console.log(this.formData);
    this.checkStepNotificationOrMessage();
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    if (!this.formDetail.isPreview) {
      this.getOneCandidate();
      if (
        this.formData &&
        this.formData.steps &&
        this.formData.steps.length &&
        this.formData.steps[this.formData.steps.length - 1].step_type === 'campus_validation' &&
        this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
      ) {
        this.processFinish = true;
      }
    }
  }

  ngOnChanges() {
    if (!this.formDetail.isPreview) {
      this.getOneCandidate();
      if (
        this.formData &&
        this.formData.steps &&
        this.formData.steps.length &&
        this.formData.steps[this.formData.steps.length - 1].step_type === 'campus_validation' &&
        this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
      ) {
        this.processFinish = true;
      }
    }

    // if (this.selectedIndex === 0) {
    //   this.getOneCandidate();
    // }
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.formDetail.candidateId).subscribe(
      (resp) => {
        console.log('GetOneCandidate', resp);
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
      console.log(resp);

      if (resp.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('OK'),
        }).then((resss) => {
          this.nextStepMassage();
        });
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  validateCampusMutation() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          // this.nextStepMassage();
          this.processFinish = true;
          this.triggerRefresh.emit(this.formDetail.formId);
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

  checkStepNotificationOrMessage() {
    if (
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const formBuilderID = this.formDetail.templateId;
      const formBuilderStepID = this.stepData.form_builder_step._id;
      const pagination = { limit: 20, page: 0 };

      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.getAllStepNotificationsAndMessages(formBuilderID, formBuilderStepID, pagination).subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response && response.length) {
            this.isUsingStepMessage = !!response.find((item) => item && item.type && item.type === 'message');
          } // default value of isUsingStepMessage is false so no need an else block
        },
        (error) => {
          this.isWaitingForResponse = false;
          console.error(error);
        },
      );
    }
  }

  sendNotif(stepId) {
    // this.subs.sink = this.formFillingService
    //   .sendPreviewFormBuilderStepNotification(this.userMainId, stepId, this.formDetail.formId, false)
    //   .subscribe((resp) => {
    //     if (resp) {
    //       console.log('_success', resp);
    //     }
    //   }, (err) => {
    //     Swal.fire({
    //       type: 'info',
    //       title: this.translate.instant('SORRY'),
    //       text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
    //       confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    //     });
    //   });
  }

  nextStepMassage() {
    // StepDynamicMessageDialogComponent
    this.isWaitingForResponse = false;
    let stepId = null;
    if (this.stepData && this.stepData.form_builder_step && this.stepData.form_builder_step._id) {
      stepId = this.stepData.form_builder_step._id;
      // this.sendNotif(stepId);
    }
    this.subs.sink = this.dialog
      .open(StepDynamicMessageDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          step_id: this.stepData.form_builder_step._id,
          form_process_id: this.formDetail.formId,
          is_preview: typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false,
          dataPreview: null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && resp.type) {
          if (resp.type === 'accept' || resp.type === 'empty') {
            console.log('validateCampusMutation');
            this.validateCampusMutation();
          } else {
            console.log(resp.type);
          }
        }
        // this.triggerRefresh.emit(this.formDetail.formId);
      });
    // ...
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
