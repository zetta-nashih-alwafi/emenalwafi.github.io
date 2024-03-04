import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges, Input } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { Router } from '@angular/router';
import { PermissionService } from 'app/service/permission/permission.service';
import { ApplicationUrls } from 'app/shared/settings';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { timeHours } from 'd3';
import { CoreService } from 'app/service/core/core.service';
import { AddContractFollowUpDialogComponent } from 'app/follow-up-contract/add-contract-follow-up-dialog/add-contract-follow-up-dialog.component';
import { ContractService } from '../../service/contract/contract.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { environment } from 'environments/environment';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { RefuseToSignNoteDialogComponent } from 'app/follow-up-contract/refuse-to-sign-note-dialog/refuse-to-sign-note-dialog.component';
@Component({
  selector: 'ms-contract-student-tab',
  templateUrl: './contract-student-tab.component.html',
  styleUrls: ['./contract-student-tab.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class ContractStudentTabComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() userData: any;
  @Input() candidateId: any;
  @Input() candidate: any;
  @Input() scholarSeasonData: any;
  displayedColumns: string[] = ['templateName', 'financier', 'startDate', 'endDate', 'status', 'action'];
  filterColumns: String[] = [
    'selectFilter',
    'studentNumberFilter',
    'nameFilter',
    'programFilter',
    'templateNameFilter',
    'financierFilter',
    'typeOfFinancementFilter',
    'startDateFilter',
    'endDateFilter',
    'contractManagerFilter',
    'sendDateFilter',
    'statusFilter',
    'actionFilter',
  ];
  filterForm: UntypedFormGroup;
  isCheckedAll = false;
  isWaitingForResponse = false;
  filteredValues = {
    school: '',
    campus: '',
    level: '',
    scholar_season: '',
    student_unique_number: '',
    program_id: null,
    template_type: 'fc_contract'
  };
  searching = {
    trial_date: '',
  };
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../../../assets/img/shield-account.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  userSelected: any[];
  userSelectedId: any[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataCount = 0;
  disabledExport = true;
  isSameData = false;
  private subs = new SubSink();
  noData: any;
  currentUser: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Exporter Liste des Candidats';
  selectType: any;
  entityData: any;
  private timeOutVal: any;
  private intervalVal: any;
  titleList = [];
  originalTitleList = [];
  originalNationalityList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;
  allStudentForExport = [];
  allStudentForCustom = [];
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  campusList = [];
  listObjective = [];
  levels = [];
  school = [];
  scholars = [];
  scholarSelected = [];
  filteredTrialDateList: Observable<any[]>;
  allCandidateData: any = [];
  isWasSelectAll = false;
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];
  allStudentForCheckbox = [];
  dataSelected = [];
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    private candidatesService: CandidatesService,
    private authService: AuthService,
    public permissionService: PermissionService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private router: Router,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private coreService: CoreService,
    private contractService: ContractService,
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.pageTitleService.setMessage('');
    this.subs.unsubscribe();
  }

  ngOnChanges() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.coreService.sidenavOpen = false;
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getContractData('First');
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getContractData('AfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getContractData(data) {
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    // console.log(pagination);

    const filter = this.cleanFilterData();
    if (this.candidate && this.candidate.candidate_unique_number) {
      this.isLoading = true;
      const userTypesList = this.currentUser?.app_data?.user_type_id ? this.currentUser.app_data.user_type_id : [];
      this.subs.sink = this.candidatesService.getAllFormContractFCProcessesStudentCard(pagination, filter, userTypesList).subscribe(
        (students: any) => {
          if (students && students.length) {
            console.log('resp', students);
            this.dataSource.data = students;
            // console.log('table data', this.dataSource.data);
            this.paginator.length = students[0].count_document;
            this.dataCount = students[0].count_document;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
          this.isLoading = false;
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
          });
        },
      );
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getContractData('sortData');
      }
    }
  }

  resetCandidate() {
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      school: '',
      campus: '',
      level: '',
      scholar_season: '',
      student_unique_number: '',
      program_id: '',
      template_type: 'fc_contract'
    };
    // reset filter value to be null when reset clicked
    this.searching = {
      trial_date: '',
    };
    // reset filter value to be null when reset clicked
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getContractData('resetCandidate');
    this.school = [];
    this.campusList = [];
    this.levels = [];
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  isSomeSelected() {
    return this.selection.selected.length > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.getDataAllForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;

    const filter = this.cleanFilterData();
    this.subs.sink = this.contractService.getAllFCContractCheckbox(this.currentUserTypeId, pagination).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          console.log('getDataAllForCheckbox', this.selection, this.isCheckedAll);
          this.isLoading = false;
          if (this.isCheckedAll) {
            if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        this.isReset = false;
        this.isLoading = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info, row) {
    if (row) {
      if (this.dataSelected && this.dataSelected.length) {
        const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
        if (dataFilter && dataFilter.length < 1) {
          this.dataSelected.push(row);
        } else {
          const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
          this.dataSelected.splice(indexFilter, 1);
        }
      } else {
        this.dataSelected.push(row);
      }
    }
    const numSelected = this.dataSelected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  cleanFilterData() {
    this.filteredValues.student_unique_number =
      this.candidate && this.candidate.candidate_unique_number ? this.candidate.candidate_unique_number : null;
    this.filteredValues.program_id = this.scholarSeasonData
      ? this.scholarSeasonData.intake_channel
        ? this.scholarSeasonData.intake_channel._id
        : null
      : null;
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if(key === 'template_type') {
        filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
      } else if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  transformDate(data) {
    if (data && data.date && data.time && data.date !== 'Invalid date') {
      const date = data.date;
      const time = data.time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }

  transformDateDue(data) {
    if (data && data.due_date && data.due_time) {
      const date = data.due_date;
      const time = data.due_time;

      const datee = this.parseUtcToLocalPipe.transformDate(date, time);
      return datee;
    } else {
      return '';
    }
  }
  addContract() {
    this.subs.sink = this.dialog
      .open(AddContractFollowUpDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          title: 'Add new',
          user_id: this.candidate.user_id,
          continuous_formation_manager_id: this.candidate.continuous_formation_manager_id
            ? this.candidate.continuous_formation_manager_id._id
            : null,
          admission_member_id: this.candidate.admission_member_id ? this.candidate.admission_member_id._id : null,
          candidate_id: this.candidateId,
          from:'student_card',
          candidate:this.candidate
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getContractData('addContract');
          this.onGoToForm(resp, 'add');
        }
      });
  }

  editContract(element) {
    this.subs.sink = this.dialog
      .open(AddContractFollowUpDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          title: 'edit',
          user_id: this.candidate.user_id,
          continuous_formation_manager_id: this.candidate.continuous_formation_manager_id._id,
          admission_member_id: this.candidate.admission_member_id._id,
          candidate_id: element._id,
          element: element,
          from:'student_card',
          candidate:this.candidate
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getContractData('addContract');
        }
      });
  }

  // onGoToForm(element, type) {
  //   const url = this.router.createUrlTree(['/form-fc-contract'], {
  //     queryParams: {
  //       formId: element._id,
  //       userId: this.userData._id,
  //       candidateId: element.candidate_id._id,
  //       formType: 'fc_contract',
  //       action: type,
  //     },
  //   });
  //   window.open(url.toString(), '_blank');
  // }

  onGoToForm(element, type) {
    let userTypeId = "";        
    
    if(type ==='edit') {
      const user_who_complete_step = element?.form_builder_id?.steps && element?.form_builder_id?.steps?.length ? element?.form_builder_id?.steps[0].user_who_complete_step?.name : null;      
      this.currentUser?.app_data?.user_type?.forEach(user => {
        if(user?.name === user_who_complete_step) {
          userTypeId = user?._id
        }
      })          
    } else if(type === 'add') {
      this.currentUser?.app_data?.user_type?.forEach(user => {
        if(user?.name === element?.user_who_complete) {
          userTypeId = user?._id
        }
      })
    } 
    if(!userTypeId) {
        userTypeId = this.authService.getCurrentUser().entities[0].type._id;
    }    
    const url = this.router.createUrlTree(['/form-fill'], {
      queryParams: {
        formId: element._id,
        formType: 'fc_contract',
        userId: this.currentUser._id,
        userTypeId: userTypeId,        
      },
    });
    window.open(url.toString(), '_blank');
  }

  deleteContract(element) {
    let timeDisabled = 3;
    Swal.fire({
      title: 'Attention',
      html: this.translate.instant('promosi.Are you sure you want to delete this item?'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
        }, 1000);
        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
        // clearTimeout(this.timeOutVal);
      },
    }).then((res) => {
      if (res.value) {
        this.isLoading = true;
        this.subs.sink = this.contractService.deleteFcContractProcess(element._id).subscribe(
          (list) => {
            this.isLoading = false;
            if (list) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
              }).then((resss) => {
                this.getContractData('deleteContract');
              });
            }
          },
          (error) => {
            this.isReset = false;
            this.isLoading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
      }
    });
  }

  getTextForSigningProgressStatus(signatories: any[]): string {
    const text = this.translate.instant('in_progress_of_signing');
    const array = [];
    const signatory = signatories.find((signatory: any) => signatory && !signatory.is_already_sign);
    if (signatory && signatory.user_id) {
      const validator = signatory.user_id;
      if (validator.civility && validator.civility !== 'neutral') array.push(this.translate.instant(validator.civility));
      if (validator.last_name) array.push(String(validator.last_name).toLocaleUpperCase());
      if (validator.first_name) array.push(String(validator.first_name));
    }
    return array.length ? `${text} - ${array.join(' ')}` : text;
  }

  sendMail(data) {
    console.log('_data', data);
    const admission_financement_ids =
      data.admission_financement_ids && data.admission_financement_ids.length
        ? data.admission_financement_ids.map((list) => list.organization_id && list.organization_id._id)
        : [];
    const company_branch_id =
      data.admission_financement_ids && data.admission_financement_ids.length
        ? data.admission_financement_ids.map((list) => list.company_branch_id && list.company_branch_id._id)
        : [];
    if (data) {
      const mappedData = {
        candidate_id: {
          candidate_admission_status: data.candidate_id.candidate_admission_status,
          civility: data.candidate_id.civility,
          email: data.candidate_id.email,
          emailDefault: data.candidate_id.school_mail,
          first_name: data.candidate_id.first_name,
          last_name: data.candidate_id.last_name,
        },
        financial_supports: data.candidate_id.payment_supports,
        admission_financement_ids: admission_financement_ids.length ? _.uniqBy(admission_financement_ids) : [],
        company_branch_id: company_branch_id.length ? _.uniqBy(company_branch_id) : [],
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (!this.isReset && resp) {
            this.getContractData('send email');
          }
        });
    }
  }

  getContractPDF(data) {
    if (data) {
      this.isWaitingForResponse = true;
      const formBuilderId = data?.form_builder_id?._id;
      let formProcessStepId;
      if(data?.steps?.length) {
        const stepContract = data?.steps?.filter((step) => step?.step_type === 'step_with_signing_process');
        if (stepContract?.length){
          formProcessStepId = stepContract[0]._id;
        }
      }
      if (formBuilderId && formProcessStepId) {
        this.subs.sink = this.candidatesService.generateContractPDF(formBuilderId, formProcessStepId, false).subscribe(
          (contract: any) => {
            if (contract) {
              if (data) {
                const link = document.createElement('a');
                link.setAttribute('type', 'hidden');
                link.href = `${environment.apiUrl}/fileuploads/${contract}`.replace('/graphql', '');
                link.target = '_blank';
                link.click();
                link.remove();
              }
            }
            this.isWaitingForResponse = false;
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
              type: 'error',
              title: 'Error',
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    }
  }

  getTemplatePDF(data) {
    if (data) {
      const link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = `${environment.apiUrl}/fileuploads/${data}`.replace('/graphql', '');
      link.target = '_blank';
      link.click();
      link.remove();
    }
  }

  sendReminder(contractProcessId) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.SendEmailFcContractProcess(contractProcessId, this.translate.currentLang).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
        }
      },
      (err) => {
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
  openNote(data){
    this.dialog
    .open(RefuseToSignNoteDialogComponent, {
      minWidth: '650px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: data,
    })
  }
}
