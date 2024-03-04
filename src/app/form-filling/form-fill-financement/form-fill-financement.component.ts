import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AddFinancementDialogComponent } from 'app/shared/components/add-financement-dialog/add-financement-dialog.component';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { FormFillingService } from '../form-filling.service';
import * as _ from 'lodash';
import { StepMessageProcessDialogComponent } from 'app/form-builder/step-message-process/step-message-process.component';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { AddNoteFinancementDialogComponent } from './add-note-financement-dialog/add-note-financement-dialog.component';
import { environment } from 'environments/environment';
import { ApplicationUrls } from 'app/shared/settings';
import { AdmissionService } from 'app/service/admission/admission.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'ms-form-fill-financement',
  templateUrl: './form-fill-financement.component.html',
  styleUrls: ['./form-fill-financement.component.scss'],
})
export class FormFillFinancementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() formData: any;
  @Input() userData: any;
  @Input() userId: any;
  @Input() stepData: any;
  @Input() currentStepIndex;
  @Input() formDetail;
  @Input() isReceiver: any;
  noData: any;
  dataCount = 0;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  private subs = new SubSink();
  isLastStep = false;
  processFinish = false;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  dataSource = new MatTableDataSource([]);

  // this static for thumb up validation berfore get userId from ULR for dinamic userId
  thumbsValidator: any;

  displayedColumns: string[] = ['type', 'organization', 'rate_hour', 'hours', 'total', 'document', 'status', 'action'];
  isReset: boolean;
  isLoading = false;
  timeOutVal: NodeJS.Timeout;
  fullRate: any;
  candidateData: any;
  volumeOfHours: any;
  total: number;
  financementData: any;
  allAccepted: boolean;

  dontShowSwal: boolean;
  cantNextStep: boolean;

  dummyData = [
    {
      organization_type: 'OPCO',
      organization_name: 'Zettabyte',
      rate_per_hours: 12,
      hours: 150,
      total: 1800,
      actual_status: 'added_by_student',
      document: 'http://eprints.unm.ac.id/4319/1/RISTAWATI.pdf', // dummy
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
  userTypeId: any;
  dividen: number;
  isFCManager: boolean;
  isSubmitValidation: any;
  isUsingStepMessage = false;
  currentUser = null;
  userMainId = null;
  userTypeFCManager = '61ceb560688f572138e023b2';
  userTypeCandidate = '5fe98eeadb866c403defdc6c';

  constructor(
    public dialog: MatDialog,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private formFillingService: FormFillingService,
    private candidateService: CandidatesService,
    private admissionService: AdmissionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    if (this.userId) {
      this.userMainId = this.userId;
    } else {
      this.currentUser = this.authService.getLocalStorageUser();
      this.userId = this.route.snapshot.queryParamMap.get('userId');
      this.userTypeId = this.route.snapshot.queryParamMap.get('userTypeId');
      if (this.currentUser && this.currentUser._id) {
        this.userMainId = this.currentUser._id;
      } else {
        if (this.userId) {
          this.userMainId = this.userId;
        } else {
          this.userMainId = null;
        }
      }
    }
    // *************** Validation to check user who access the form is not candidate
    if (this.userId && this.route.snapshot.queryParamMap.get('userId') && this.userTypeId && this.userTypeId !== this.userTypeCandidate) {
      this.isFCManager = true;
      this.getOneUser();
    } else {
      this.isFCManager = false;
    }
    if (!this.formDetail.isPreview) {
      if (this.stepData && this.stepData.form_builder_step && this.stepData.form_builder_step._id) {
        if (this.stepData.step_type === 'finance' && this.stepData.step_status === 'accept') {
          this.processFinish = true;
        } else {
          this.processFinish = false;
          this.getOneCandidate();
        }
      } else {
        this.processFinish = false;
        this.getOneCandidate();
      }
    } else {
      this.dataSource.data = this.dummyData;
      this.volumeOfHours = 100;
      this.fullRate = 5000;
      this.total = 5000;
    }
  }

  getOneCandidate() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.volumeOfHours = res.volume_hour;
          this.candidateData = res;
          if (this.candidateData) {
            this.getFinancementTable();
          }
        } else {
          this.volumeOfHours = 0;
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

  getOneUser() {
    this.subs.sink = this.formFillingService.getOneUser(this.userId).subscribe(
      (res) => {
        if (res) {
          this.thumbsValidator = res.entities.some((data) => data.type._id === '61ceb560688f572138e023b2');
        } else {
          this.thumbsValidator = false;
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

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.formDetail.isPreview) {
            this.getOneCandidate();
          }
        }),
      )
      .subscribe();
  }

  openAddFinancementDialog(compType: string, element?) {
    this.subs.sink = this.dialog
      .open(AddFinancementDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '660px',
        // this for static and dinamic dialog data
        data: {
          comps: {
            title: compType === 'add' ? 'Add financement' : 'Edit financement',
            icon: null,
            isEdit: compType === 'edit' ? true : false,
          },
          info: compType === 'edit' ? element : null,
          candidateId: this.formDetail.candidateId,
          admission_process_id: this.formDetail.formId,
          isFCManager: this.isFCManager,
          actual_status: 'added_by_student',
          user_id: this.candidateData.user_id._id,
          logginUserId:this.userId,
          from : 'financement'
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getOneCandidate();
        }
      });
  }
  openAddNoteFinancementDialog(element?) {
    this.subs.sink = this.dialog
      .open(AddNoteFinancementDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '660px',
        // this for static and dinamic dialog data
        data: {
          comps: {
            title: 'Note Financement',
            icon: null,
            isEdit: false,
          },
          source: element,
          admission_financement_id: this.formDetail.formId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getFinancementTable();
        }
      });
  }

  downloadDoc(item: any) {
    if (item) {
      const a = document.createElement('a');
      a.target = 'blank';
      a.href = `${environment.apiUrl}/fileuploads/${item}?download=true`.replace('/graphql', '');
      a.download = item;
      a.click();
      a.remove();
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Swal_Not_Upload_Doc.TITLE'),
        text: this.translate.instant('Swal_Not_Upload_Doc.TEXT'),
        confirmButtonText: this.translate.instant('Swal_Not_Upload_Doc.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    }
  }

  getFinancementTable() {
    if (!this.processFinish) {
      this.isLoading = true;
      const pagination = {
        limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
        page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
      };
      const filter = {
        candidate_id: this.formDetail.candidateId,
        admission_process_id: this.formDetail.formId,
      };
      // const filter = null;
      this.subs.sink = this.formBuilderService.getAllAdmissionFinancements(filter, pagination).subscribe(
        (res) => {
          if (res && res.length > 0) {
            this.isLoading = false;
            this.financementData = res;
            this.dataSource.data = res;
            this.paginator.length = res[0].count_document;
            this.dataCount = res[0].count_document;
            this.dividen = this.calculateTotal(res);
            // UAT_863 12/05/2023 Update the way to get full rate of student, get from selected payment of student
            const result =
              this.candidateData?.selected_payment_plan?.total_amount +
              this.candidateData?.selected_payment_plan?.down_payment -
              this.candidateData?.selected_payment_plan?.additional_expense;
            this.fullRate = isNaN(result) ? 0 : result;
            this.total = this.fullRate - this.dividen - this.candidateData?.selected_payment_plan?.down_payment;
            this.dontShowSwal = this.dataSource.data.some(
              (ress) => ress.actual_status === 'rejected' || ress.actual_status === 'added_by_student',
            );
            this.cantNextStep = this.dataSource.data.some(
              (ress) =>
                ress.actual_status === 'added_by_student' ||
                ress.actual_status === 'in_progress_by_fc_in_charge' ||
                ress.actual_status === 'submitted_for_validation',
            );
            this.allAccepted = this.dataSource.data.every((ress) => ress.actual_status === 'accepted');
            this.isSubmitValidation = res.every((resp) => resp.actual_status === 'submitted_for_validation');
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
            this.dividen = 0;
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
            this.isReset = false;
            this.isLoading = false;
            const result =
              this.candidateData?.selected_payment_plan?.total_amount +
              this.candidateData?.selected_payment_plan?.down_payment -
              this.candidateData?.selected_payment_plan?.additional_expense;
            this.fullRate = isNaN(result) ? 0 : result;
            this.total = this.fullRate - this.dividen - this.candidateData?.selected_payment_plan?.down_payment;
          }
        },
        (err) => {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isLoading = false;
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

  calculateTotal(resp) {
    let total = 0;
    resp.forEach((element) => {
      if (element.actual_status === 'accepted') {
        total += element.total;
      }
    });
    return total;
  }

  deleteFinancement(element) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: element.organization_name ? element.organization_name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
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
        this.isLoading = true;
        this.subs.sink = this.formBuilderService.DeleteAdmissionFinancement(element._id).subscribe(
          (ress) => {
            if (ress) {
              this.isLoading = false;
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((reds) => this.getFinancementTable());
            } else {
              this.isLoading = false;
              this.getFinancementTable();
            }
          },
          (err) => {
            this.isLoading = false;
            this.getFinancementTable();
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

  updateValidation(element) {
    if (this.userId && this.thumbsValidator) {
      this.isLoading = true;
      const payload = _.cloneDeep(element);
      payload.is_financement_validated = !payload.is_financement_validated;
      delete payload._id;
      this.subs.sink = this.formBuilderService.UpdateAdmissionFinancement(element._id, payload).subscribe(
        (res) => {
          if (res) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getFinancementTable();
            });
          } else {
            this.isLoading = false;
          }
        },
        (err) => {
          this.isLoading = false;
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
  validate() {
    this.isLoading = true;
    if (this.dataSource.data.length === 0) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FINANCEMENT_S5.TITLE'),
        html: this.translate.instant('FINANCEMENT_S5.TEXT'),
        confirmButtonText: this.translate.instant('FINANCEMENT_S5.BUTTON1'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      this.isLoading = false;
    } else {
      if (!this.dontShowSwal) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('FINANCEMENT_S7.TITLE'),
          html: this.translate.instant('FINANCEMENT_S7.TEXT'),
          confirmButtonText: this.translate.instant('FINANCEMENT_S7.BUTTON1'),
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
        this.isLoading = false;
      } else {
        const timeDisabled = 3;
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('FINANCEMENT_S3.TITLE'),
          text: this.translate.instant('FINANCEMENT_S3.TEXT'),
          allowEscapeKey: true,
          showCancelButton: true,
          confirmButtonText: this.translate.instant('FINANCEMENT_S3.BUTTON1', { timer: timeDisabled }),
          cancelButtonText: this.translate.instant('FINANCEMENT_S3.BUTTON2'),
          allowOutsideClick: false,
          allowEnterKey: false,
        }).then((resp) => {
          clearTimeout(this.timeOutVal);
          if (resp.value) {
            this.isLoading = false;
            this.nextStepMassage();
          } else {
            this.isLoading = false;
          }
        });
      }
    }
  }

  nextStep() {
    if (this.dataSource.data.length === 0) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FINANCEMENT_S5.TITLE'),
        html: this.translate.instant('FINANCEMENT_S5.TEXT'),
        confirmButtonText: this.translate.instant('FINANCEMENT_S5.BUTTON1'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      this.isLoading = false;
    } else {
      if (this.cantNextStep) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('FINANCEMENT_S6.TITLE'),
          html: this.translate.instant('FINANCEMENT_S6.TEXT'),
          confirmButtonText: this.translate.instant('FINANCEMENT_S6.BUTTON1'),
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
      } else {
        this.isLoading = true;
        const timeDisabled = 3;
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('FINANCEMENT_S3.TITLE'),
          text: this.translate.instant('FINANCEMENT_S3.TEXT'),
          allowEscapeKey: true,
          showCancelButton: true,
          confirmButtonText: this.translate.instant('FINANCEMENT_S3.BUTTON1', { timer: timeDisabled }),
          cancelButtonText: this.translate.instant('FINANCEMENT_S3.BUTTON2'),
          allowOutsideClick: false,
          allowEnterKey: false,
        }).then((resp) => {
          clearTimeout(this.timeOutVal);
          if (resp.value) {
            this.isLoading = false;
            this.nextStepMassage();
          } else {
            this.isLoading = false;
          }
        });
      }
    }
  }

  nextStepMassage() {
    // StepMessageProcessDialogComponent
    let stepId = null;
    if (this.stepData && this.stepData.form_builder_step && this.stepData.form_builder_step._id) {
      stepId = this.stepData.form_builder_step._id;
    }
    this.subs.sink = this.dialog
      .open(StepMessageProcessDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          stepId: stepId,
          isPreview: false,
          student_admission_process_id: this.formDetail.formId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp && (resp.type === 'accept' || resp.type === 'empty')) {
          this.isLoading = true;
          this.subs.sink = this.formFillingService
            .acceptFormProcessStepFinance(this.formDetail.formId, this.stepData._id, this.translate.currentLang)
            .subscribe(
              (res) => {
                this.triggerRefresh.emit(this.formDetail.formId);
                this.processFinish = true;
                this.isLoading = false;
              },
              (err) => {
                this.isLoading = false;
                if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('LEGAL_S5.Title'),
                    text: this.translate.instant('LEGAL_S5.Text'),
                    confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
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
      });
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

  renderTooltipOrganizationName(element) {
    if (element.organization_id) {
      return element.organization_id.name;
    } else if (element.company_branch_id) {
      return element.company_branch_id.company_name;
    } else {
      return element.organization_name;
    }
  }
}
