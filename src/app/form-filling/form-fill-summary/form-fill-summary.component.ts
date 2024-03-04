import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { FormFillingService } from '../form-filling.service';
import { SubSink } from 'subsink';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormFillingRevisionDialogComponent } from '../form-filling-revision-dialog/form-filling-revision-dialog.component';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationUrls } from 'app/shared/settings';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdmissionService } from 'app/service/admission/admission.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ms-form-fill-summary',
  templateUrl: './form-fill-summary.component.html',
  styleUrls: ['./form-fill-summary.component.scss'],
})
export class FormFillSummaryComponent implements OnInit {
  @Input() userDatas: any;
  @Input() formData: any;
  @Input() stepData: any;
  @Input() currentStepIndex;
  @Input() formDetail;
  @Input() isReceiver: any;
  candidateDataFullRate: any;
  foundDocumentToValidate: any;
  @Input() set userDataInput(value: any) {
    this._userData = value;
    if (value) {
      if (this.formDetail.formId) {
        this.getStudentAdmissionData();
      }
    }
  }
  noData: any;
  dataCount = 0;
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['type', 'organization', 'rate_hour', 'hours', 'total', 'status'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  candidateData: any;
  rateAmount: any;
  discount: any;
  discountCalculted: any;
  registrationFee: any;
  totalCost: any;
  payAmount: any;
  additionalCost: any;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();

  templateSummaryForm: UntypedFormGroup;
  private subs = new SubSink();
  private _userData: any;

  get userData() {
    return this._userData;
  }

  isUserValidator = true; // temporary
  isUserStudent = false; // temporary
  timeOutVal: any;
  // formData: any;
  templateStep = [];
  isValidator = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  signature = false;
  isAccepted = false;
  isLoading = false;
  formattedSignatureDate: string;
  isWaitingForResponse = false;
  hasValidatorValidated = false;
  documentExpectedDisplays: { stepIndex: number; selectedDocumentUrl: any }[] = [];
  fullRate: any;
  volumeOfHours: any;
  total: number;
  dividen: any;

  processFinish = false;

  dummyData = [
    {
      organization_type: 'OPCO',
      organization_name: 'Zettabyte',
      rate_per_hours: 12,
      hours: 150,
      total: 1800,
      actual_status: 'added_by_student',
      document: 'http://eprints.unm.ac.id/4319/1/RISTAWATI.pdf', //dummy
      is_financement_validated: true,
    },
    {
      organization_type: 'OPCO',
      organization_name: 'Zettabyte',
      rate_per_hours: 10,
      hours: 200,
      total: 2000,
      actual_status: 'added_by_student',
      document: 'http://eprints.unm.ac.id/4319/1/RISTAWATI.pdf', // dummy
      is_financement_validated: false,
    },
  ];
  currentUser = null;
  userId = null;
  userMainId = null;

  constructor(
    private translate: TranslateService,
    private formFillingService: FormFillingService,
    private formBuilderService: FormBuilderService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
    private fb: UntypedFormBuilder,
    private admissionService: AdmissionService,
    private candidateService: CandidatesService,
    private authService: AuthService,
    private route: ActivatedRoute,
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
    if (this.formData && this.formData.steps && this.formData.steps.length > 0) {
      if (
        this.formData.steps[this.formData.steps.length - 1].step_type === 'step_summary' &&
        this.formData.steps[this.formData.steps.length - 1].step_status === 'accept'
      ) {
        this.processFinish = true;
      } else {
        this.processFinish = false;
        this.checkDisableForm();
      }
    } else {
      this.processFinish = false;
      this.checkDisableForm();
    }
    if (this.formDetail.templateId) {
      this.getRandomStudentAdmissionData();
      this.volumeOfHours = 100;
      this.fullRate = 5000;
      this.total = 5000;
      this.dataSource.data = this.dummyData;
    }
    this.subs.sink = this.translate.onLangChange.subscribe((resp) => {
      moment.locale(resp.lang);
      this.checkSignature();
    });
    this.initTemplateSummaryForm();
    if (this.formDetail.formId) {
      if (this.formDetail.formType === 'admissionDocument') {
        this.getAdmissionDocumentData();
      } else {
        this.getStudentAdmissionData();
      }
    }
    // console.log('_form', this.formData);
    // console.log('_step', this.stepData);
  }

  initTemplateSummaryForm() {
    this.templateSummaryForm = this.fb.group({
      signature: [null],
    });
  }

  checkDisableForm() {
    const finalValidators = this.formData.final_validators.map((validator) => validator._id);
    if (this.userData && this.userData.entities && this.userData.entities.length) {
      this.isValidator = !!this.userData.entities.find((ent) => {
        if (ent && ent.type && this.formData.is_final_validator_active && finalValidators.includes(ent.type._id)) {
          return true;
        } else {
          return false;
        }
      });
    }
  }

  checkSignature() {
    if (this.formData && this.formData.signature_date && this.formData.signature_date.date) {
      this.signature = true;
      this.formattedSignatureDate = this.formatSignatureDate();
    } else {
      this.signature = false;
    }
  }

  formatSignatureDate() {
    moment.locale(this.translate.currentLang);
    const duration = moment.duration({ hours: environment.timezoneDiff });
    const acceptance_date = moment(this.formData.signature_date.date + this.formData.signature_date.time, 'DD/MM/YYYYHH:mm')
      .add(duration)
      .format();
    return moment(acceptance_date).format('DD MMMM YYYY - HH:mm');
  }

  checkFormAccept() {
    if (this.formData && this.formData.admission_status === 'submitted') {
      this.isAccepted = true;
    } else if (this.formData && this.formData.admission_status === 'signing_process') {
      this.isAccepted = true;
    }
  }

  getStudentAdmissionData() {
    this.formData = [];
    this.templateStep = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneStudentAdmissionProcess(this.formDetail.formId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = _.cloneDeep(resp);
          this.getOneCandidate();
          this.getFinancementTable();
          this.getOneCandidateData();
          this.documentExpectedDisplays = [];
          const templateSteps = [];
          this.formData.steps.forEach((step, stepIndex) => {
            if (step && step.length !== 0) {
              // push to documentExpectedDetails all the document expected steps detail
              if (
                step.step_type &&
                step.step_type === 'document_expected' &&
                step.segments &&
                step.segments.length &&
                step.segments[0].questions[0]
              ) {
                this.documentExpectedDisplays.push({
                  stepIndex,
                  selectedDocumentUrl: this.setPreviewUrl(step.segments[0].questions[0].answer) || null,
                });
              }
              templateSteps.push(step);
            }
          });
          this.templateStep = templateSteps;
          // console.log('this.templateStep', this.templateStep);
          this.checkDisableForm();
          this.checkFormAccept();
          this.checkSignature();
          this.hasValidatorValidated = this.checkIfValidatorHasValidated(resp);
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
      },
    );
  }

  getAdmissionDocumentData() {
    this.formData = [];
    this.templateStep = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneAdmissionDocumentProcess(this.formDetail.formId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = _.cloneDeep(resp);
          this.getOneCandidate();
          this.getFinancementTable();
          this.getOneCandidateData();
          this.documentExpectedDisplays = [];
          const templateSteps = [];
          this.formData.steps.forEach((step, stepIndex) => {
            if (step && step.length !== 0) {
              // push to documentExpectedDetails all the document expected steps detail
              if (
                step.step_type &&
                step.step_type === 'document_expected' &&
                step.segments &&
                step.segments.length &&
                step.segments[0].questions[0]
              ) {
                this.documentExpectedDisplays.push({
                  stepIndex,
                  selectedDocumentUrl: this.setPreviewUrl(step.segments[0].questions[0].answer) || null,
                });
              }
              templateSteps.push(step);
            }
          });
          this.templateStep = templateSteps;
          // console.log('this.templateStep', this.templateStep);
          this.checkDisableForm();
          this.checkFormAccept();
          this.checkSignature();
          this.hasValidatorValidated = this.checkIfValidatorHasValidated(resp);
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
      },
    );
  }

  checkIfValidatorHasValidated(payload): boolean {
    if (!this.isValidator) {
      return false;
    }
    return this.getAllValidatorsWhoValidated(payload).includes(this.formDetail.userId);
  }

  getAllValidatorsWhoValidated(payload): any[] {
    return payload && payload.final_validator_statuses && payload.final_validator_statuses.length
      ? payload.final_validator_statuses
          .filter((status) => status && status.user_id && status.user_id._id && status.is_already_sign)
          .map((status) => status.user_id._id)
      : [];
  }

  getRandomStudentAdmissionData() {
    this.formData = [];
    this.templateStep = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.GetOneRandomStudentAdmissionProcess(this.formDetail.templateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.formData = resp;
          resp.steps.forEach((step) => {
            if (step && step.length !== 0) {
              this.templateStep.push(step);
            }
          });
          console.log('_form', this.formData);
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
      },
    );
  }

  onAskForRevision() {
    this.subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          existingMessages: this.formDetail.revise_request_messages ? this.formDetail.revise_request_messages : null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
      });
  }

  onCompleteRevision() {
    this.isWaitingForResponse = true;
    if (this.formDetail.formType === 'admissionDocument') {
      this.acceptAdmissionDocumentProcessStep();
    } else {
      this.acceptStudentAdmissionProcessStep();
    }
  }

  acceptStudentAdmissionProcessStep() {
    this.subs.sink = this.formFillingService.acceptStudentAdmissionProcessStep(this.userMainId, this.formDetail.formId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
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

  acceptAdmissionDocumentProcessStep() {
    this.subs.sink = this.formFillingService.acceptAdmissionDocumentProcessStep(this.userMainId, this.formDetail.formId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
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

  validateForm() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S10.TITLE'),
      html: this.translate.instant('UserForm_S10.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S10.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S10.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        if (this.formDetail.formType === 'admissionDocument') {
          this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
            (ress) => {
              if (ress) {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Bravo!'),
                  confirmButtonText: this.translate.instant('OK'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then((resss) => {
                  this.triggerRefresh.emit(this.formDetail.formId);
                });
              }
            },
            (err) => {
              if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('LEGAL_S5.Title'),
                  text: this.translate.instant('LEGAL_S5.Text'),
                  confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
                });
              } else if (
                err['message'] ===
                  'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
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
        } else {
          this.subs.sink = this.formFillingService
            .validateStudentAdmissionProcess(this.formDetail.formId, this.formDetail.userTypeId)
            .subscribe(
              (ress) => {
                if (ress) {
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Bravo!'),
                    confirmButtonText: this.translate.instant('OK'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then((resss) => {
                    this.triggerRefresh.emit(this.formDetail.formId);
                  });
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
      } else {
        return;
      }
    });
  }

  getDocumentSelectedUrl(index: number) {
    return this.documentExpectedDisplays.find((doc) => doc.stepIndex === index).selectedDocumentUrl || null;
  }

  setDocumentDisplayed(stepIndex: number, docUrl: string) {
    const docIndex = this.documentExpectedDisplays.findIndex((doc) => doc.stepIndex === stepIndex);
    if (docIndex >= 0) {
      this.documentExpectedDisplays[docIndex].selectedDocumentUrl = this.setPreviewUrl(docUrl);
    }
  }

  submitForm() {
    this.nextStepMassage();
  }

  submitFormMutation() {
    this.isWaitingForResponse = true;
    const payload = {
      signature: 'done',
    };
    console.log('candidateID', this.candidateData);
    this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload).subscribe(
      (res) => {
        this.processFinish = true;
        if (res) {
          this.sendNotif(this.stepData.form_builder_step._id);
          this.isWaitingForResponse = false;
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

  // Swal for complete revision
  swalCompleteRevision() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S5.TITLE'),
      html: this.translate.instant('UserForm_S5.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S5.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S5.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S5.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S5.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((ress) => {
          return;
        });
      } else {
        return;
      }
    });
  }

  setPreviewUrl(url) {
    if (!url) {
      return null;
    }
    const result = this.serverimgPath + url + '#view=fitH';
    const previewURL = this.cleanUrlFormat(result);
    return previewURL;
  }

  cleanUrlFormat(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  downloadPDF() {
    this.isLoading = true;
    const lang = this.translate.currentLang.toLowerCase();
    this.subs.sink = this.formFillingService.generatePDFStep(this.formDetail.candidateId, this.stepData._id, lang).subscribe(
      (data) => {
        const link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
        link.target = '_blank';
        link.click();
        link.remove();
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('Network error: Http failure response for') ||
            err['message'].includes('PDF is still being generated at the moment'))
        ) {
          Swal.fire({
            title: this.translate.instant('GENERATE_PDF_12.Title'),
            text: this.translate.instant('GENERATE_PDF_12.Text'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('GENERATE_PDF_12.Button'),
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

  sendNotif(stepId) {
    this.subs.sink = this.formFillingService
      .sendPreviewFormBuilderStepNotification(this.userMainId, stepId, this.formDetail.formId, false)
      .subscribe(
        (resp) => {
          if (resp) {
            // console.log('_success', resp);
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

  nextStepMassage() {
    // StepMessageProcessDialogComponent
    this.subs.sink = this.dialog
      .open(StepMessageProcessDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          // stepId: '61e62d5a6680ee7d2b7bb205',
          stepId: this.stepData.form_builder_step._id,
          isPreview: false,
          student_admission_process_id: this.formDetail.formId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && resp.type) {
          if (resp.type === 'accept' || resp.type === 'empty') {
            // console.log('submitFormMutation');
            this.submitFormMutation();
          } else {
            // console.log(resp.type);
          }
        }
        // this.triggerRefresh.emit(this.formDetail.formId);
      });
    // ...
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateAdmission(this.formData.candidate_id._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = resp;
        console.log('candidate dataa', this.candidateData);
        if (
          this.candidateData &&
          this.candidateData.intake_channel &&
          this.candidateData.intake_channel.admission_document &&
          this.candidateData.intake_channel.admission_document.s3_file_name
        ) {
          this.setPreviewUrl(this.candidateData.intake_channel.admission_document.s3_file_name);
        }
        if (this.candidateData && this.candidateData.school) {
          this.getFullRateCandidate();
        }
        if (this.candidateData.registration_profile.payment_modes) {
          this.getAdditionalCost(this.candidateData.registration_profile.payment_modes);
        }
        if (this.candidateData.registration_profile.additional_cost_ids) {
          this.calculateRegistrationFees(this.candidateData.registration_profile.additional_cost_ids);
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
      },
    );
  }

  getFullRateCandidate() {
    const school = this.candidateData.school ? this.candidateData.school._id : null;
    const scholar = this.candidateData.scholar_season ? this.candidateData.scholar_season._id : null;
    const campus = this.candidateData.campus ? this.candidateData.campus._id : null;
    const level = this.candidateData.level ? this.candidateData.level._id : null;
    const sector = this.candidateData.sector ? this.candidateData.sector._id : null;
    const speciality = this.candidateData.speciality ? this.candidateData.speciality._id : null;

    this.subs.sink = this.admissionService.GetOneFullRate(scholar, school, campus, level, sector, speciality).subscribe(
      (lists) => {
        if (lists) {
          const discountPercent =
            this.candidateData && this.candidateData.registration_profile && this.candidateData.registration_profile.discount_on_full_rate
              ? this.candidateData.registration_profile.discount_on_full_rate
              : 0;
          this.discount = discountPercent;
          if (this.candidateData && this.candidateData.registration_profile_type) {
            if (this.candidateData.registration_profile_type === 'internal') {
              this.rateAmount = lists.amount_internal;
              this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
            } else {
              this.rateAmount = lists.amount_external;
              this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
            }
          } else {
            this.rateAmount = lists.amount_external;
            this.discountCalculted = discountPercent ? (discountPercent / 100) * this.rateAmount : 0;
          }
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
  getAdditionalCost(data) {
    const additionalCost = data.find((element) => element.term === this.candidateData.selected_payment_plan.times);
    this.additionalCost = additionalCost ? additionalCost.additional_cost : 0;
  }

  calculateRegistrationFees(datas) {
    // console.log(datas);
    let fees = 0;
    if (datas && datas.length) {
      datas.forEach((fee) => {
        fees = fees + fee.amount;
      });
      this.registrationFee = fees;
      this.calcTotal();
    }
  }

  calcTotal() {
    if (this.candidateData && this.candidateData.selected_payment_plan.total_amount) {
      const dp = this.candidateData.selected_payment_plan.down_payment ? this.candidateData.selected_payment_plan.down_payment : 0;
      this.totalCost = this.candidateData.selected_payment_plan.total_amount + dp;
      return this.totalCost ? this.totalCost : 0;
    } else {
      const amount = this.registrationFee ? this.registrationFee : 0;
      return amount;
    }
  }
  calcTotalToPay() {
    if (this.candidateData && this.candidateData.selected_payment_plan) {
      this.payAmount = this.candidateData.selected_payment_plan.total_amount;
      return this.payAmount;
    }
  }
  getFinancementTable() {
    // this.isLoading = true;
    const pagination = {
      limit: 50,
      page: 0,
    };
    const filter = {
      candidate_id: this.formDetail.candidateId,
      admission_process_id: this.formDetail.formId,
    };
    // const filter = null;
    this.subs.sink = this.formBuilderService.getAllAdmissionFinancements(filter, pagination).subscribe(
      (res) => {
        if (res && res.length > 0) {
          // this.isLoading = false;
          this.dataSource.data = res;
          this.dividen = this.calculateTotal(res);
        } else {
          this.dataSource.data = [];
          this.dataCount = 0;
          this.dividen = 0;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          // this.isLoading = false;
        }
      },
      (err) => {
        this.dataSource.data = [];
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        // this.isLoading = false;
        this.dividen = 0;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  formatDecimal(value) {
    if (value) {
      return parseFloat(value).toFixed(2);
    } else {
      return 0;
    }
  }

  renderTooltip(element) {
    if (element.organization_id) {
      return this.translate.instant(element.organization_id.organization_type);
    } else if (element.company_branch_id) {
      return this.translate.instant('Company');
    } else {
      return `${
        element.organization_type && element.organization_type === 'Company'
          ? this.translate.instant('Company')
          : this.translate.instant(element.organization_type)
      } - ${this.translate.instant('other')}`;
    }
  }

  getOneCandidateData() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.volumeOfHours = res.volume_hour;
          this.candidateDataFullRate = res;

          if (this.candidateDataFullRate) {
            const school = this.candidateDataFullRate.school ? this.candidateDataFullRate.school._id : null;
            const scholar = this.candidateDataFullRate.scholar_season ? this.candidateDataFullRate.scholar_season._id : null;
            const campus = this.candidateDataFullRate.campus ? this.candidateDataFullRate.campus._id : null;
            const level = this.candidateDataFullRate.level ? this.candidateDataFullRate.level._id : null;
            const sector = this.candidateDataFullRate.sector ? this.candidateDataFullRate.sector._id : null;
            const speciality = this.candidateDataFullRate.speciality ? this.candidateDataFullRate.speciality._id : null;
            this.getFullRate(scholar, school, campus, level, sector, speciality, res);
          }
        } else {
          this.volumeOfHours = 0;
          this.fullRate = 0;
          this.total = 0;
        }
      },
      (err) => {
        this.volumeOfHours = 0;
        this.fullRate = 0;
        this.total = 0;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getFullRate(scholar, school, campus, level, sector, speciality, resp) {
    this.subs.sink = this.admissionService.GetOneFullRateFC(scholar, school, campus, level, sector, speciality).subscribe(
      (res) => {
        if (res) {
          // console.log('_res', res);
          const fullRate = this.candidateDataFullRate.registration_profile_type === 'external' ? res.amount_external : res.amount_internal;
          let additionalCost = 0;
          if (
            this.candidateDataFullRate &&
            this.candidateDataFullRate.registration_profile &&
            this.candidateDataFullRate.registration_profile.additional_cost_ids &&
            this.candidateDataFullRate.registration_profile.additional_cost_ids.length
          ) {
            this.candidateDataFullRate.registration_profile.additional_cost_ids.forEach((element) => {
              if (element.amount) {
                additionalCost += element.amount;
              }
            });
          }
          const addtional =
            this.candidateDataFullRate.selected_payment_plan && this.candidateDataFullRate.selected_payment_plan.additional_expense
              ? this.candidateDataFullRate.selected_payment_plan.additional_expense
              : additionalCost;

          // Updated on 02/06/2022 ERP_044 when checking in selected payment already include the addtional expanse from registration profile (if any)

          // let addtionalRegistrationProfile = 0;
          // if (
          //   this.candidateData &&
          //   this.candidateData.registration_profile &&
          //   this.candidateData.registration_profile.additional_cost_ids &&
          //   this.candidateData.registration_profile.additional_cost_ids.length > 0
          // ) {
          //   this.candidateData.registration_profile.additional_cost_ids.forEach((res) => {
          //     addtionalRegistrationProfile += res.amount;
          //   });
          // } else {
          //   addtionalRegistrationProfile = 0;
          // }

          const discount =
            this.candidateDataFullRate.registration_profile && this.candidateDataFullRate.registration_profile.discount_on_full_rate
              ? this.candidateDataFullRate.registration_profile.discount_on_full_rate
              : 0;
          const fullRateDisc = fullRate * (discount / 100);
          if (discount > 0) {
            this.fullRate = fullRate - fullRateDisc + addtional;
          } else {
            this.fullRate = fullRate + addtional;
          }
          const depositPayed =
            this.candidateDataFullRate && this.candidateDataFullRate.billing_id && this.candidateDataFullRate.billing_id.deposit_pay_amount
              ? this.candidateDataFullRate.billing_id.deposit_pay_amount
              : 0;
          this.total = this.fullRate - this.dividen - depositPayed;
          if (isNaN(this.total)) {
            this.total = 0;
          }
        } else {
          this.fullRate = 0;
          this.total = 0;
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

  calculateTotal(resp) {
    let total = 0;
    resp.forEach((element) => {
      if (element.actual_status === 'accepted') {
        total += element.total;
      }
    });
    return total;
  }

  renderTooltipOrganizationName(element) {
    if (element.organization_id) {
      return element.organization_id.name;
    } else if (element.company_branch_id) {
      return element.company_branch_id.company_name;
    } else {
      return element.organization_name;
    }
  }
  generateIban(iban) {
    let data = '';
    if (iban) {
      iban = iban.replaceAll(/\s/g, '');
      for (let i = 0; i < iban.length; i++) {
        data += '*';
      }
      data += ' ' + iban.substr(iban.length - 4);
    }
    return data;
  }
}
