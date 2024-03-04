import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AddLevelDialogComponent } from './add-level-dialog/add-level-dialog.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Component({
  selector: 'ms-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss'],
})
export class LevelComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  displayedColumns: string[] = ['select', 'name', 'description', 'accounting_plan', 'action'];
  dataSource = new MatTableDataSource([]);
  noData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataCount = 0;

  isWaitingForResponse = false;
  isLoading = false;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;

  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  disabledExport = true;
  selectType: any;
  dataSelected = [];
  dataUnselect = [];
  dataSelectedId = [];
  allStudentForCheckbox = [];
  currentUser: any;

  private timeOutVal: any;
  isOperator: boolean = false;

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private permission: NgxPermissionsService,
    private intakeService: IntakeChannelService,
    private authService:AuthService,
    private pageTitleService: PageTitleService,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
    this.getLevelsData();
    this.isOperator = !!this.permission.getPermission('operator_admin') || !!this.permission.getPermission('operator_dir');
    this.pageTitleService.setTitle('INTAKE_CHANNEL.PAGE_TITLE.Level');
    this.currentUser = this.authService.getLocalStorageUser();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getLevelsData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getLevelsData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.intakeService.GetAllLevelsTable(pagination).subscribe(
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

  resetTable() {
    this.isReset = true;
    this.isCheckedAll = false;
    this.selection.clear();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.selectType = '';
    this.paginator.pageIndex = 0;
    this.getLevelsData();
  }

  onAddLevel() {
    this.subs.sink = this.dialog
      .open(AddLevelDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          title: 'Add',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getLevelsData();
        }
      });
  }

  onEditLevel(data) {
    this.subs.sink = this.dialog
      .open(AddLevelDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          title: 'Edit',
          content: data,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getLevelsData();
        }
      });
  }

  onDeleteLevel(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('LEVEL_S1.Title'),
      html: this.translate.instant('LEVEL_S1.Text', {
        name: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('LEVEL_S1.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('LEVEL_S1.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('LEVEL_S1.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('LEVEL_S1.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.isLoading = true;
        this.subs.sink = this.intakeService.DeleteLevel(data._id).subscribe(
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
              this.getLevelsData();
            });
          },
          (err) => {
            this.isLoading = false;
            this.authService.postErrorLog(err)
            console.log('_message', err['message']);
            if (err['message'] === 'GraphQL error: Cannot Delete Sector which connected to specialities') {
              // will change the message
              Swal.fire({
                title: this.translate.instant('SECTOR_S1.Title'),
                html: this.translate.instant('SECTOR_S1.Text'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('SECTOR_S1.Button'),
              });
            } else if (
              err['message'] === 'GraphQL error: Cannot delete level, because this level already connected to candidate' ||
              err['message'] === 'GraphQL error: Cannot delete level beacuse this level already assign to student'
            ) {
              // will change the message
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEVEL_S1b.Title'),
                html: this.translate.instant('LEVEL_S1b.Text'),
                confirmButtonText: this.translate.instant('LEVEL_S1b.Button1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            } else if (err['message'] === 'GraphQL error: Cannot delete level beacuse this level already use in program') {
              // will change the message
              Swal.fire({
                type: 'info',
                title: this.translate.instant('LEVEL_S1a.Title'),
                html: this.translate.instant('LEVEL_S1a.Text'),
                confirmButtonText: this.translate.instant('LEVEL_S1a.Button1'),
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
    this.subs.sink = this.intakeService.GetAllLevelsTable(pagination).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
            this.allStudentForCheckbox.forEach((element) => {
              this.selection.select(element._id);
              this.dataSelected.push(element);
            });
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
        this.csvDownloadLevel();
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

        this.subs.sink = this.intakeService.GetAllLevelsTable(pagination).subscribe(
            (students: any) => {
              if (students && students.length) {
                this.allStudentForCheckbox.push(...students);
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
                    this.csvDownloadLevel();
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
      this.csvDownloadLevel();
    }
  }

  csvDownloadLevel() {
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

    let url = environment.apiUrl.replace('graphql', '') + 'downloadLevelsCSV';
    url += `/${fileType}/`;
    url += `${lang}`;
    url += `?user_type_id="${userTypesList[0]}"`;

    if (this.dataSelected?.length) {
      const levelIds = this.dataSelected.map((item) => `${item?._id}`);
      url += `&filter={"level_ids":${JSON.stringify(levelIds)}}`;
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
}