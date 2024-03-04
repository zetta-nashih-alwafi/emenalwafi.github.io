import { PageTitleService } from './../../../core/page-title/page-title.service';
import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AddNoteFinancementDialogComponent } from 'app/form-filling/form-fill-financement/add-note-financement-dialog/add-note-financement-dialog.component';
import { AdmissionService } from 'app/service/admission/admission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { EditStudentFinancementDialogComponent } from 'app/shared/components/edit-student-financement-dialog/edit-student-financement-dialog.component';
import { FinancementDeductionDialogComponent } from 'app/shared/components/financement-deduction-dialog/financement-deduction-dialog.component';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-student-financement-tab-detail',
  templateUrl: './student-financement-tab-detail.component.html',
  styleUrls: ['./student-financement-tab-detail.component.scss'],
})
export class StudentFinancementTabDetailComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() userData: any;
  @Input() candidateId: any;
  @Input() scholarSeasonData: any;

  private subs = new SubSink();

  noData: any;
  dataCount = 0;
  isLoading: Boolean;

  isWaitingForResponse = false;

  // this static for thumb up validation berfore get userId from ULR for dinamic userId
  thumbsValidator: any;

  displayedColumns: string[] = ['type', 'organization', 'rate_hour', 'hours', 'total', 'document', 'status', 'action'];
  dataSource = new MatTableDataSource([]);
  currentUser: any;
  isFCManager: boolean;
  isAdmission: boolean;
  volumeOfHours: any;
  candidateData: any;
  fullRate: number;
  total: number;
  dividen: any;
  timeOutVal: NodeJS.Timeout;
  isOperator: boolean;

  disableAcceptFinancement = false;
  candidateAndOrgBilling = [];
  constructor(
    public dialog: MatDialog,
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private authService: AuthService,
    private permissions: NgxPermissionsService,
    private financeService: FinancesService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.updatePageTitle();
    this.checkEntity();
    this.getOneCandidate();
    // console.log(this.dataSource);
    // console.log('CADIDATE ID>>', this.candidateId);
    this.checkDisableAddFinancement();
    console.log('_scholar', this.scholarSeasonData);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getOneCandidate();
        }),
      )
      .subscribe();
  }
  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Financement'));
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Financement'));
    });
  }

  checkDisableAddFinancement() {
    const filter = {
      candidate_id: this.candidateId ? this.candidateId : null,
      intake_channel: this.scholarSeasonData?.intake_channel ? this.scholarSeasonData?.intake_channel._id : null,
    };
    this.candidateAndOrgBilling = [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.checkDisableAddFinancementCadidate(filter).subscribe((candidate) => {
      if (candidate?.length) {
        this.candidateAndOrgBilling = this.candidateAndOrgBilling.concat(candidate);
      }
      this.subs.sink = this.financeService.checkDisableAddFinancementOrganization(filter).subscribe((organization) => {
        if (organization?.length) {
          this.candidateAndOrgBilling = this.candidateAndOrgBilling.concat(organization);
        }
        if (this.candidateAndOrgBilling?.length) {
          for (let i = 0; i < this.candidateAndOrgBilling.length; i++) {
            if (this.candidateAndOrgBilling[i]?.terms?.length) {
              const notBilledTerm = this.candidateAndOrgBilling[i]?.terms?.filter((term) => term.term_status === 'not_billed');
              if (notBilledTerm?.length) {
                this.disableAcceptFinancement = false;
                break;
              } else {
                this.disableAcceptFinancement = true;
              }
            } else {
              if (this.candidateAndOrgBilling[i]?.total_amount > 0) {
                this.disableAcceptFinancement = false;
                break;
              } else {
                this.disableAcceptFinancement = true;
              }
            }
          }
        } else {
          this.disableAcceptFinancement = true;
        }
        console.log('this.disableAcceptFinancement', this.disableAcceptFinancement);
        this.isWaitingForResponse = false;
      });
    });
  }

  checkEntity() {
    this.currentUser = this.authService.getCurrentUser();
    // this.isFCManager = !!this.permissions.getPermission('Continuous formation manager');
    this.isAdmission = !!this.permissions.getPermission('Admission Member') || !!this.permissions.getPermission('Admission Director');
    // this.isOperator = !!this.permissions.getPermission('operator_dir') || !!this.permissions.getPermission('operator_admin');
    console.log('uat544 currentUser', this.currentUser);
    if (
      this.currentUser &&
      this.currentUser.app_data &&
      this.currentUser.app_data.user_type &&
      this.currentUser.app_data.user_type.length
    ) {
      const filterOperator = this.currentUser.app_data.user_type.filter(
        (type) => type.name === 'operator_dir' || type.name === 'operator_admin',
      );
      const filterFCManager = this.currentUser.app_data.user_type.filter((type) => type.name === 'Continuous formation manager');
      this.isOperator = filterOperator && filterOperator.length ? true : false;
      this.isFCManager = filterFCManager && filterFCManager.length ? true : false;
    }
    console.log('uat544 cek', this.isOperator, this.isFCManager);
  }

  ngOnChanges() {
    this.getOneCandidate();
    this.checkEntity();
  }

  getOneCandidate() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.candidateId).subscribe(
      (res) => {
        if (res) {
          this.volumeOfHours = res.volume_hour;
          this.candidateData = res;
          // UAT_863 12/05/2023 Update the way to get full rate of student, get from selected payment of student
          if (this.candidateData) {
            this.populateFinancementTable();
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

  populateFinancementTable() {
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = {
      candidate_id: this.candidateId,
      admission_process_id:
        this.scholarSeasonData && this.scholarSeasonData.admission_process_id ? this.scholarSeasonData.admission_process_id._id : '',
      program_id: this.scholarSeasonData.intake_channel ? this.scholarSeasonData.intake_channel._id : '',
    };
    // const filter = null;
    this.subs.sink = this.formBuilderService.getAllAdmissionFinancements(filter, pagination).subscribe(
      (resp) => {
        console.log(resp);

        if (resp && resp.length) {
          this.dataSource.data = resp;
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0].count_document;
          this.dividen = this.calculateTotal(resp);
          const result =
          this.candidateData?.selected_payment_plan?.total_amount +
          this.candidateData?.selected_payment_plan?.down_payment -
          this.candidateData?.selected_payment_plan?.additional_expense;
          this.fullRate = isNaN(result) ? 0 : result;
          this.total = this.fullRate - this.dividen - this.candidateData?.selected_payment_plan?.down_payment;
          console.log('_total 2', this.dividen);
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.dividen = 0;
          const result =
          this.candidateData?.selected_payment_plan?.total_amount +
          this.candidateData?.selected_payment_plan?.down_payment -
          this.candidateData?.selected_payment_plan?.additional_expense;
          this.fullRate = isNaN(result) ? 0 : result;
          this.total = this.fullRate - this.dividen - this.candidateData?.selected_payment_plan?.down_payment;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.dividen = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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

  checkTermsStatus(candidateId: string) {
    const filter = {
      candidate_id: candidateId,
    };
    return this.financeService.GetOneFinanceOrganizationForCheckStatus(filter);
  }

  openEditFinancementDialog(type: string, element?, indexFinance?) {
    if (element?.actual_status === 'accepted') {
      this.isWaitingForResponse = true;
      this.subs.sink = this.checkTermsStatus(this.candidateId).subscribe(
        (resp: any) => {
          this.isWaitingForResponse = false;
          if (resp && resp.length) {
            if (resp.length <= indexFinance) {
              indexFinance = resp.length - 1;
            }
            const isCantEdit = resp[indexFinance]?.terms?.some(
              (term) => term?.term_status === 'billed' || term?.term_status === 'partially_paid' || term?.term_status === 'paid',
            );
            if (isCantEdit) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('financement_s9.TITLE'),
                html: this.translate.instant('financement_s9.TEXT'),
                confirmButtonText: this.translate.instant('financement_s9.BUTTON'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
              return;
            }
          }
          this.openAddFinancementDialog(type, element);
        },
        (err) => {
          this.isWaitingForResponse = false;
        },
      );
    } else {
      this.openAddFinancementDialog(type, element);
    }
  }

  openAddFinancementDialog(compType: string, element?) {
    if (this.disableAcceptFinancement) {
      Swal.fire({
        title: this.translate.instant('DISABLE_ACCEPT_FINANCEMENT.Title'),
        text: this.translate.instant('DISABLE_ACCEPT_FINANCEMENT.Text'),
        type: 'info',
        showConfirmButton: true,
        confirmButtonText: this.translate.instant('DISABLE_ACCEPT_FINANCEMENT.Button'),
      });
      return;
    }
    const previousData = _.cloneDeep(element);
    this.subs.sink = this.dialog
      .open(EditStudentFinancementDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        width: '660px',
        // this for static and dinamic dialog data
        data: {
          comps: {
            title:
              compType === 'add' ? 'Add financement' : element?.actual_status === 'accepted' ? 'Modify financement' : 'Edit financement',
            icon: null,
            isEdit: compType === 'edit' ? true : false,
          },
          info: compType === 'edit' ? element : null,
          candidateId: this.candidateId,
          admission_process_id:
            this.candidateData && this.candidateData.admission_process_id ? this.candidateData.admission_process_id._id : '',
          isFCManager: this.isFCManager || this.isOperator,
          user_id: this.currentUser._id,
          type_of_formation:
            this.candidateData && this.candidateData.type_of_formation_id && this.candidateData.type_of_formation_id.type_of_formation
              ? this.candidateData.type_of_formation_id.type_of_formation
              : '',
          intakeChannelId:
            this.scholarSeasonData && this.scholarSeasonData.intake_channel && this.scholarSeasonData.intake_channel._id
              ? this.scholarSeasonData.intake_channel._id
              : null,
          previousData: compType === 'edit' ? previousData : null,
          company_branch_id: element?.company_branch_id ? element?.company_branch_id : null,
          mentor_user_id: element?.mentor_user_id ? element?.mentor_user_id : null,
          signatory_user_id: element?.signatory_user_id ? element?.signatory_user_id : null,
          compType: compType ? compType : '',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        console.log('04111', resp);
        if (resp && resp.for === 'dialog' && resp?.isFC) {
          this.subs.sink = this.dialog
            .open(FinancementDeductionDialogComponent, {
              disableClose: true,
              width: '850px',
              panelClass: 'no-padding-pop-up',
              data: resp,
            })
            .afterClosed()
            .subscribe((resps) => {
              if (resps) {
                this.getOneCandidate();
                this.populateFinancementTable();
              }
            });
        } else if (resp) {
          this.getOneCandidate();
          this.populateFinancementTable();
        }
      });
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

  createPayloadForDelete(data) {
    const payload = _.cloneDeep(data);
    if (this.candidateId) {
      payload['candidate_id'] = this.candidateId;
    }
    payload.hours = parseFloat(parseFloat(payload?.hours).toFixed(2));
    payload.rate_per_hours = parseFloat(parseFloat(payload?.rate_per_hours).toFixed(2));
    if (payload.organization_name_other) {
      payload.organization_name = payload?.organization_name_other;
      delete payload?.organization_name_other;
    } else if (payload.organization_type !== 'Company') {
      payload['organization_id'] = payload?.organization_id?._id;
      payload['company_branch_id'] = null;
      delete payload?.organization_name;
      delete payload?.organization_name_other;
      delete payload?.organization_type;
    } else {
      payload['company_branch_id'] = payload?.organization_name;
      payload['organization_id'] = null;
      delete payload?.organization_name;
      delete payload?.organization_name_other;
      delete payload?.organization_type;
    }
    if (payload && payload?.actual_status) {
      payload['actual_status'] = payload?.actual_status;
    }
    if (payload && payload?.created_by) {
      delete payload?.created_by;
    }
    if (payload && payload?._id) {
      delete payload?._id;
    }
    return payload;
  }

  deleteFinancement(element) {
    let timeDisabled = 3;
    let entityName = '';
    if (element?.organization_id) {
      entityName = element?.organization_id?.name;
    } else if (element?.company_branch_id) {
      entityName = element?.company_branch_id?.company_name;
    }
    Swal.fire({
      title: this.translate.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translate.instant('CONFIRMDELETE', {
        value: entityName ? entityName : '',
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
      const payload = this.createPayloadForDelete(element);
      if (element) {
        const dumyDialog = {
          organization_type: element?.organization_id ? element?.organization_id.organization_type : element?.organization_type,
          organization_name: element?.organization_id ? element?.organization_id?._id : this.translate.instant('other'),
          organization_names: element?.organization_id ? element?.organization_id?.name : this.translate.instant('other'),
          document_pdf: element?.document_pdf,
          additional_information: element?.additional_information,
          organization_name_other: element?.organization_name,
        };
        // console.log('_parent data', this.parentData);

        if (!element?.organization_id && element?.company_branch_id) {
          dumyDialog.organization_type = 'Company';
          dumyDialog.organization_name = element?.company_branch_id ? element?.company_branch_id?._id : this.translate.instant('other');
          dumyDialog.organization_names = element?.company_branch_id
            ? element?.company_branch_id?.company_name
            : this.translate.instant('other');
        }
        if (dumyDialog.organization_name_other) {
          payload.organization_name = dumyDialog.organization_name_other;
        } else if (dumyDialog.organization_type !== 'Company') {
          payload['organization_id'] = dumyDialog.organization_name;
          payload['company_branch_id'] = null;
        } else {
          payload['company_branch_id'] = dumyDialog.organization_name;
          payload['organization_id'] = null;
        }
        if (res.value) {
          const data = {
            for: 'dialog',
            candidateId: this.candidateId ? this.candidateId : null,
            intakeChannelId:
              this.scholarSeasonData && this.scholarSeasonData.intake_channel && this.scholarSeasonData.intake_channel._id
                ? this.scholarSeasonData.intake_channel._id
                : null,
            financementName: element?.organization_id?.name ? element?.organization_id?.name : dumyDialog?.organization_names,
            data: payload,
            info: element,
            id: element?._id ? element?._id : null,
            from: 'delete',
          };
          if (element?.actual_status === 'accepted' && element?.total !== 0) {
            this.subs.sink = this.dialog
              .open(FinancementDeductionDialogComponent, {
                disableClose: true,
                width: '850px',
                panelClass: 'no-padding-pop-up',
                data: data,
              })
              .afterClosed()
              .subscribe((resp) => {
                if (resp) {
                  this.deleteFinancementOption(element, resp);
                }
              });
          } else {
            this.deleteFinancementOption(element);
          }
        }
      }
    });
  }

  deleteFinancementOption(data, payload?) {
    this.isLoading = true;
    this.subs.sink = this.formBuilderService.DeleteAdmissionFinancement(data?._id, payload?.amount_splits).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.getOneCandidate(), this.populateFinancementTable();
          });
        } else {
          this.isLoading = false;
          this.getOneCandidate();
          this.populateFinancementTable();
        }
      },
      (err) => {
        this.isLoading = false;
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
        }).then(() => {
          this.getOneCandidate();
          this.populateFinancementTable();
        });
      },
    );
  }

  downloadDoc(item: any) {
    console.log(item);
    if (item) {
      const a = document.createElement('a');
      a.target = '_blank';
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
            callFrom: 'student_card',
          },
          source: element,
          currentUserId: this.currentUser._id,
          // admission_financement_id: this.formDetail.formId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.populateFinancementTable();
          this.getOneCandidate();
        }
      });
  }
}
