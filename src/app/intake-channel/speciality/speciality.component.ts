import { UtilityService } from 'app/service/utility/utility.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddSpecialityDialogComponent } from 'app/intake-channel/speciality/add-speciality-dialog/add-speciality-dialog.component';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'ms-speciality',
  templateUrl: './speciality.component.html',
  styleUrls: ['./speciality.component.scss'],
})
export class SpecialityComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  titleData: any;
  noData: any;
  exportName: string;
  displayedColumns: string[] = ['select', 'speciality', 'sigle', 'description', 'action'];
  filterColumns: string[] = ['selectFilter', 'specialityFilter', 'sigleFilter', 'descriptionFilter', 'actionFilter'];
  filteredValues = {
    name: '',
    description: '',
    intake_channel: '',
    programs: null,
    scholar_season_id: null,
  };
  dataLoaded: Boolean = false;

  intackChannelCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  sortValue = null;
  dataCount = 0;
  isReset: Boolean = false;
  private subs = new SubSink();

  speciality = [];
  description = [];
  intake_channel = [];
  program = [];
  specialityFilter = new UntypedFormControl('');
  filteredSpecilaity: Observable<any[]>;
  descriptionFilter = new UntypedFormControl('');
  filteredDescription: Observable<any[]>;
  programFilter = new UntypedFormControl('');
  filteredProgram: Observable<any[]>;

  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected: any[] = [];
  dataSelectedId: any[];
  scholarSeasonTitle;

  scholarSeasonId;
  private timeOutVal: any;
  allStudentForCheckbox = [];
  pageSelected = [];
  dataUnselect: any = [];

  allInternshipId = [];
  currentUser: any;
  isOperator: boolean;

  constructor(
    private intakeChannelServices: IntakeChannelService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private utilityService: UtilityService,
    public permissionService: PermissionService,
    private authService:AuthService,
    private pageTitleService: PageTitleService,
    private httpClient: HttpClient,
    private permission: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.getSpecialityDropdown();
    this.getSpecialityData();
    this.pageTitleService.setTitle('INTAKE_CHANNEL.PAGE_TITLE.Speciality');
    this.currentUser = this.authService.getLocalStorageUser();
    this.isOperator = !!this.permission.getPermission('operator_admin') || !!this.permission.getPermission('operator_dir');
  }

  addLegalDialog() {
    this.subs.sink = this.dialog
      .open(AddSpecialityDialogComponent, {
        width: '1035px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSpecialityData();
          this.getSpecialityDropdown();
        }
      });
  }

  editLegalDialog(data) {
    console.log(data);
    this.subs.sink = this.dialog
      .open(AddSpecialityDialogComponent, {
        width: '1035px',
        minHeight: '100px',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSpecialityData();
          this.getSpecialityDropdown();
        }
      });
  }

  deletePayment(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('SPECIALITY_S1.Title'),
      html: this.translate.instant('SPECIALITY_S1.Text', {
        name: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SPECIALITY_S1.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SPECIALITY_S1.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SPECIALITY_S1.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SPECIALITY_S1.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.intakeChannelServices.DeleteSpecialization(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getSpecialityData();
              this.getSpecialityDropdown();
            });
          },
          (err) => {
            this.authService.postErrorLog(err)
            if (err['message'] === 'GraphQL error: Cannot delete speciality, sector already connected to program') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SPECIALITY_S1a.Title'),
                html: this.translate.instant('SPECIALITY_S1a.Text'),
                confirmButtonText: this.translate.instant('SPECIALITY_S1a.Button1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (
              err['message'] === 'GraphQL error: Cannot delete speciality, because this speciality already connected to candidate'
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SPECIALITY_S1b.Title'),
                html: this.translate.instant('SPECIALITY_S1b.Text'),
                confirmButtonText: this.translate.instant('SPECIALITY_S1b.Button1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
      }
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getSpecialityData();
            this.getSpecialityDropdown();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  initFilter() {
    this.filteredSpecilaity = this.specialityFilter.valueChanges.pipe(
      startWith(''),
      map((searchTxt) =>
        this.speciality.filter((sector) => sector && sector.toLowerCase().includes(searchTxt ? searchTxt.toLowerCase() : '')),
      ),
    );
    this.filteredProgram = this.programFilter.valueChanges.pipe(
      startWith(''),
      map((searchTxt) =>
        this.program.filter((program) => program && program.program.toLowerCase().includes(searchTxt ? searchTxt.toLowerCase() : '')),
      ),
    );
  }

  getSpecialityDropdown() {
    this.subs.sink = this.intakeChannelServices.GetAllSpecializationsByScholar().subscribe(
      (resp: any) => {
        if (resp) {
          console.log('dropdown', resp);
          this.speciality = resp.map((data) => {
            return data.name;
          });
          this.speciality = _.uniqBy(this.speciality);
          this.initFilter();
        }
      },
      (error) => {
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
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getSpecialityData() {
    this.filteredValues.scholar_season_id = this.scholarSeasonId;
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.intakeChannelServices.GetAllSpecializations(pagination, this.sortValue, this.filteredValues).subscribe(
      (legalEntities: any) => {
        if (legalEntities && legalEntities.length) {
          this.dataSource.data = legalEntities;
          this.paginator.length = legalEntities[0].count_document;
          this.dataCount = legalEntities[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        console.log('_=>>', this.dataSource.data);
      },
      (error) => {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
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
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getSpecialityData();
      }
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.dataUnselect = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
      // this.getDataAllForCheckbox(0);
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeChannelServices.GetAllSpecializations(pagination, this.sortValue, this.filteredValues).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          console.log('getDataAllForCheckbox', this.selection, this.isCheckedAll);
          this.isWaitingForResponse = false;
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
        this.isWaitingForResponse = false;
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
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  showOptions(info, row?) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselect.includes(row?._id)) {
          this.dataUnselect.push(row?._id);
          this.selection.deselect(row?._id);
        } else {
          const indx = this.dataUnselect.findIndex((list) => list === row?._id);
          this.dataUnselect.splice(indx, 1);
          this.selection.select(row?._id);
        }
      }
    } else {
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
    }
    this.selectType = info;
  }

  getAllIdForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselect.length < 1) {
        this.csvDownloadSpeciality();
      } else {
        if (pageNumber === 0) {
          this.allStudentForCheckbox = [];
          this.dataSelected = [];
        }

        const pagination = {
          limit: 500,
          page: pageNumber,
        };

        this.isWaitingForResponse = true;

        this.subs.sink = this.intakeChannelServices.GetAllSpecializations(pagination, this.sortValue, this.filteredValues).subscribe(
            (sectors: any) => {
              if (sectors && sectors.length) {
                this.allStudentForCheckbox.push(...sectors);
                const page = pageNumber + 1;
                this.getAllIdForCheckbox(page);
              } else {
                this.isWaitingForResponse = false;
                if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
                  this.allStudentForCheckbox.forEach((element) => {
                    if (!this.dataUnselect?.includes(element?._id)) {
                      this.selection.select(element._id);
                      this.dataSelected.push(element);
                    }
                  });

                  if (this.dataSelected && this.dataSelected.length) {
                    this.csvDownloadSpeciality();
                  }
                }
              }
            },
            (error) => {
              this.isReset = false;
              this.isWaitingForResponse = false;
              this.authService.postErrorLog(error);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translate.instant('OK'),
              });
            },
          );
      }
    } else {
      this.csvDownloadSpeciality();
    }
  }

  csvDownloadSpeciality() {
    if(!this.selection.selected?.length) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Level') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
      // const currentLang = this.translate.currentLang;
      Swal.fire({
        type: 'question',
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
              Swal.enableConfirmButton();
            } else {
              Swal.disableConfirmButton();
              reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
            }
          });
        },
        onOpen: function () {
          Swal.disableConfirmButton();
          Swal.getContent().addEventListener('click', function (e) {
            Swal.enableConfirmButton();
          });
          const input = Swal.getInput();
          const inputValue = input.getAttribute('value');
          if (inputValue === ';') {
            Swal.enableConfirmButton();
          }
        },
      }).then((separator) => {
        if (separator?.value) {
          const fileType = separator.value;
          this.openDownloadCsv(fileType);
        }
      });
    }
  }

  openDownloadCsv(fileType) {
    const lang = this.translate.currentLang.toLowerCase();
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

    let url = environment.apiUrl.replace('graphql', '') + 'downloadSpeciality';
    url += `/${fileType}/`;
    url += `${lang}`;
    url += `?user_type_id="${userTypesList[0]}"`;

    if (this.dataSelected?.length) {
      const levelIds = this.dataSelected.map((item) => `${item?._id}`);
      url += `&filter={"speciality_ids":${JSON.stringify(levelIds)}}`;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;

    this.httpClient.get(`${encodeURI(url)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => this.resetSelection());
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  resetSelection() {
    this.selection.clear();
    this.dataSelected = [];
    this.dataUnselect = [];
    this.allStudentForCheckbox = [];
    this.isCheckedAll = false;
  }

  setSpecialityFilter(id: string) {
    this.filteredValues.name = id;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getSpecialityData();
      this.getSpecialityDropdown();
    }
  }

  setProgramsFilter(id: string) {
    this.filteredValues.programs = id ? [id] : null;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getSpecialityData();
      this.getSpecialityDropdown();
    }
  }

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      name: '',
      description: '',
      intake_channel: '',
      programs: null,
      scholar_season_id: null,
    };
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = '';
    this.specialityFilter.setValue('', { emitEvent: false });
    this.descriptionFilter.setValue('', { emitEvent: false });
    this.programFilter.setValue('', { emitEvent: false });
    this.getSpecialityData();
    this.getSpecialityDropdown();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
