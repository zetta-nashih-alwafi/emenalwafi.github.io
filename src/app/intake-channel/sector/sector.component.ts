import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { map, startWith, tap } from 'rxjs/operators';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { AddSectorDialogComponent } from './add-sector-dialog/add-sector-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'ms-sector',
  templateUrl: './sector.component.html',
  styleUrls: ['./sector.component.scss'],
})
export class SectorComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  noData: any;
  displayedColumns: string[] = ['select', 'name', 'sigle', 'description', 'action'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sortValue = null;
  dataCount = 0;

  dataLoaded: Boolean = false;
  isWaitingForResponse = false;
  isLoading: Boolean = false;
  isReset: Boolean = false;

  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected = [];
  dataUnselect: any = [];
  dataSelectedId = [];
  allStudentForCheckbox = [];
  pageSelected = [];
  currentUser: any;
  isOperator: boolean;

  private timeOutVal: any;

  constructor(
    private intakeService: IntakeChannelService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private authService:AuthService,
    private pageTitleService: PageTitleService,
    private httpClient: HttpClient,
    private permission: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.getSectorsData();
    this.pageTitleService.setTitle('INTAKE_CHANNEL.PAGE_TITLE.Sector');
    this.currentUser = this.authService.getLocalStorageUser();
    this.isOperator = !!this.permission.getPermission('operator_admin') || !!this.permission.getPermission('operator_dir');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  onAddSector() {
    this.subs.sink = this.dialog
      .open(AddSectorDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          title: 'Add',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSectorsData();
        }
      });
  }

  onEditSector(data) {
    this.subs.sink = this.dialog
      .open(AddSectorDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          title: 'Edit',
          content: data,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSectorsData();
        }
      });
  }

  onDeleteSector(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('SECTOR_S1s.Title'),
      html: this.translate.instant('SECTOR_S1s.Text', {
        name: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SECTOR_S1s.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SECTOR_S1s.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SECTOR_S1s.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SECTOR_S1s.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isLoading = true;
        this.subs.sink = this.intakeService.DeleteSector(data._id).subscribe(
          (resp) => {
            this.isLoading = false;
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.selection.clear();
              this.dataSelected = [];
              this.isCheckedAll = false;
              this.getSectorsData();
            });
          },
          (err) => {
            console.log('_message', err['message']);
            this.isLoading = false;
            this.authService.postErrorLog(err)
            if (err['message'] === 'GraphQL error: Cannot Delete Sector which connected to specialities') {
              // not checked yet
              Swal.fire({
                title: this.translate.instant('SECTOR_S1.Title'),
                html: this.translate.instant('SECTOR_S1.Text'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('SECTOR_S1.Button'),
              });
            } else if (err['message'] === 'GraphQL error: Cannot delete sector, because this sector already connected to candidate') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SECTOR_S1b.Title'),
                html: this.translate.instant('SECTOR_S1b.Text'),
                confirmButtonText: this.translate.instant('SECTOR_S1b.Button1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (err['message'] === 'GraphQL error: Cannot delete sector, sector already connected to program') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SECTOR_S1a.Title'),
                html: this.translate.instant('SECTOR_S1a.Text'),
                confirmButtonText: this.translate.instant('SECTOR_S1a.Button1'),
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
            this.getSectorsData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getSectorsData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.intakeService.GetAllSectorsTable(pagination, this.sortValue).subscribe(
      (resp: any) => {
        if (resp && resp.length) {
          this.dataSource.data = resp;
          console.log('dataSource =>', this.dataSource.data);
          this.paginator.length = resp[0].count_document;
          this.dataCount = resp[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (error) => {
        this.authService.postErrorLog(error)
        if (error) {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.isWaitingForResponse = false;
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
        }
      },
    );
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getSectorsData();
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
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.isCheckedAll = true;
      this.dataSelected = [];
      this.dataUnselect = [];
      this.allStudentForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselect.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetAllSectorsTable(pagination, this.sortValue).subscribe(
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
        this.csvDownloadSector();
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

        this.subs.sink = this.intakeService.GetAllSectorsTable(pagination, this.sortValue).subscribe(
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
                    this.csvDownloadSector();
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
      this.csvDownloadSector();
    }
  }

  csvDownloadSector() {
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

    let url = environment.apiUrl.replace('graphql', '') + 'downloadSector';
    url += `/${fileType}/`;
    url += `${lang}`;
    url += `?user_type_id="${userTypesList[0]}"`;

    if (this.dataSelected?.length) {
      const levelIds = this.dataSelected.map((item) => `${item?._id}`);
      url += `&filter={"sector_ids":${JSON.stringify(levelIds)}}`;
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

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = '';
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getSectorsData();
  }
}
