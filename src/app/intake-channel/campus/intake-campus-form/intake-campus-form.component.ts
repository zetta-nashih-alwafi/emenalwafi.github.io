import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AddSiteCampusDialogComponent } from '../add-site-campus-dialog/add-site-campus-dialog.component';
import { map } from 'rxjs/operators';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-intake-campus-form',
  templateUrl: './intake-campus-form.component.html',
  styleUrls: ['./intake-campus-form.component.scss'],
})
export class CampusFormComponent implements OnInit, OnDestroy {
  campusForm: UntypedFormGroup;
  firstForm: any;
  private subs = new SubSink();
  isWaitingForResponse = false;
  isLoading = false;
  campusId: any;
  campusData: any;
  noData: any;

  // ======= Table Site Init
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = ['select', 'name', 'address', 'postcode', 'city', 'country', 'mainAddress', 'action'];
  // filterColumns: string[] = [
  //   'selectFilter',
  //   'nameFilter',
  //   'addressFilter',
  //   'postcodeFilter',
  //   'cityFilter',
  //   'countryFilter',
  //   'mainAddressFilter',
  //   'actionFilter',
  // ];
  dataLoaded = false;
  dataCount = 0;
  sortValue: any;
  dataSelectedAll: any;
  previousLength = 0;
  pageSelected = [];
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;
  selectType: any;
  disabledExport = true;
  allDataForCheckbox = [];
  dataSelected = [];
  private timeOutVal: any;
  private intVal: any;
  hideCampusSigle = false;
  // ======================

  constructor(
    private intakeChannelService: IntakeChannelService,
    private pageTitleService: PageTitleService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private router: ActivatedRoute,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private route: Router,
    public permission:PermissionService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.pageTitleService.setTitle(this.translate.instant('Campus'));
    this.subs.sink = this.router.paramMap.subscribe((param) => {
      this.campusId = param.get('id');
    });
    this.getDataCampus();
    this.initForm();
  }

  getDataCampus() {
    if (this.campusId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeChannelService.GetOneCampus(this.campusId).subscribe(
        (resp) => {
          if (resp) {
            this.campusData = _.cloneDeep(resp);
            this.populateData(_.cloneDeep(resp));
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err)
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  populateData(data) {
    const control = this.campusForm.get('sites').value;
    const sites = _.cloneDeep(control);
    for (let i = sites.length - 1; i >= 0; i--) {
      this.removeCampus(i);
    }
    if (data && data.sites && data.sites.length) {
      data.sites.forEach((element) => {
        this.addCampus();
      });
      data.sites = data.sites.map((list) => {
        return {
          site_id: list.site_id._id,
          is_main_address: list.is_main_address,
        };
      });
    }
    this.campusForm.patchValue(data);
    this.firstForm = _.cloneDeep(this.campusForm.value);
    this.dataSource.data = _.cloneDeep(this.campusData.sites);
    this.paginator.length = this.campusData.sites.length;
    this.dataSource.paginator = this.paginator;
    this.dataCount = this.campusData.sites.length;
    console.log('data', data, this.campusForm.value);
    this.refreshTitle();
  }

  refreshTable() {
    if (this.campusId) {
      this.isLoading = true;
      this.subs.sink = this.intakeChannelService.GetOneCampus(this.campusId).subscribe(
        (resp) => {
          this.isLoading = false;
          if (resp) {
            this.campusData = _.cloneDeep(resp);
            this.dataSource.data = _.cloneDeep(this.campusData.sites);
            this.paginator.length = this.campusData.sites.length;
            this.dataSource.paginator = this.paginator;
            this.dataCount = this.campusData.sites.length;
          }
        },
        (err) => {
          this.isLoading = false;
          this.authService.postErrorLog(err)
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  refreshTitle() {
    if (this.campusId) {
      this.pageTitleService.setTitle(this.translate.instant('Campus') + ' - ' + this.campusForm.get('name').value);
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.pageTitleService.setTitle(this.translate.instant('Campus') + ' - ' + this.campusForm.get('name').value);
      });
    } else {
      this.pageTitleService.setTitle(this.translate.instant('Campus'));
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.pageTitleService.setTitle(this.translate.instant('Campus'));
      });
    }
  }

  initForm() {
    this.campusForm = this.fb.group({
      name: [null, Validators.required],
      short_name: [null, Validators.required],
      analytical_code: [null, Validators.required],
      sites: this.fb.array([]),
    });
    this.firstForm = _.cloneDeep(this.campusForm.value);
  }

  campussArray(): UntypedFormArray {
    return this.campusForm.get('sites') as UntypedFormArray;
  }

  initCampus(): UntypedFormGroup {
    return this.fb.group({
      site_id: [null],
      is_main_address: [false],
    });
  }

  addCampus() {
    this.campussArray().push(this.initCampus());
  }

  removeCampus(index: number) {
    this.campussArray().removeAt(index);
  }

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.campusForm.value);
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
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
      this.allDataForCheckbox = [];
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  showOptions(info, row) {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  saveCampus() {
    if (this.campusForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.campusForm.markAllAsTouched();
      return;
    }
    const payload = _.cloneDeep(this.campusForm.value);
    if (this.hideCampusSigle) {
      delete payload.short_name;
    }
    if (this.campusId) {
      console.log(payload);
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeChannelService.UpdateCampus(payload, this.campusId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CAMPUS_S6.Title'),
              html: this.translate.instant('CAMPUS_S6.Text', {
                campus: this.campusForm.get('name').value,
              }),
              confirmButtonText: this.translate.instant('CAMPUS_S6.Button1'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getDataCampus();
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err)
          if (err['message'] === 'GraphQL error: Short name already use') {
            Swal.fire({
              title: this.translate.instant('CAMPUS_SIGLE_S1.Title'),
              html: this.translate.instant('CAMPUS_SIGLE_S1.Text'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('CAMPUS_SIGLE_S1.Button1'),
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
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    } else {
      console.log(payload);
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeChannelService.CreateCampus(payload).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CAMPUS_S6.Title'),
              html: this.translate.instant('CAMPUS_S6.Text', {
                campus: this.campusForm.get('name').value,
              }),
              confirmButtonText: this.translate.instant('CAMPUS_S6.Button1'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.route.navigate([`/campus/campus-form/${resp._id}`]);
            });
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err)
          if (err['message'] === 'GraphQL error: Name already exists!' || err['message'] === 'GraphQL error: Campus name already used') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
            });
          } else if (err['message'] === 'GraphQL error: Short name already use') {
            Swal.fire({
              title: this.translate.instant('CAMPUS_SIGLE_S1.Title'),
              html: this.translate.instant('CAMPUS_SIGLE_S1.Text'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('CAMPUS_SIGLE_S1.Button1'),
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
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  checkIfMainAddress(data) {
    console.log(data);
    if (data && data.is_main_address) {
      Swal.fire({
        title: this.translate.instant('CAMPUS_S7.Title', {
          site: data.site_id.name,
          campus: this.campusForm.get('name').value,
        }),
        html: this.translate.instant('CAMPUS_S7.Text'),
        type: 'info',
        confirmButtonText: this.translate.instant('CAMPUS_S7.Button1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return true;
    } else {
      return false;
    }
  }

  changeMainAddredd(data) {
    if (this.checkIfMainAddress(data)) {
      return;
    }
    const payload = _.cloneDeep(this.campusForm.value);
    if (payload.sites && payload.sites.length) {
      payload.sites = payload.sites.map((list) => {
        return {
          site_id: list.site_id,
          is_main_address: false,
        };
      });
      payload.sites.forEach((element, idx) => {
        if (element.site_id === data.site_id._id) {
          payload.sites[idx].is_main_address = true;
        }
      });
    }
    console.log('payload change main', payload);
    Swal.fire({
      title: this.translate.instant('CAMPUS_S1.Title', {
        site: data.site_id.name,
      }),
      html: this.translate.instant('CAMPUS_S1.Text', {
        site: data.site_id.name,
        campus: this.campusForm.get('name').value,
      }),
      type: 'info',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('CAMPUS_S1.Button1'),
      cancelButtonText: this.translate.instant('CAMPUS_S1.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
    }).then((res) => {
      if (res.value) {
        this.isWaitingForResponse = true;
        delete payload.name;
        this.subs.sink = this.intakeChannelService.UpdateCampus(payload, this.campusId).subscribe(
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
              }).then(() => {
                this.refreshTable();
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err)
            if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
                type: 'warning',
                title: this.translate.instant('Invalid_Form_Warning.TITLE'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
      }
    });
  }

  removeSiteCampus(data) {
    if (data && data.is_main_address) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('CAMPUS_S4.Title'),
        html: this.translate.instant('CAMPUS_S4.Text', {
          site: data.site_id.name,
          campus: this.campusForm.get('name').value,
        }),
        confirmButtonText: this.translate.instant('CAMPUS_S4.Button1'),
      });
      return;
    }
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('CAMPUS_S3.Title'),
      html: this.translate.instant('CAMPUS_S3.Text', {
        site: data.site_id.name,
        campus: this.campusForm.get('name').value,
      }),
      type: 'info',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('CAMPUS_S3.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('CAMPUS_S3.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('CAMPUS_S3.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('CAMPUS_S3.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        const indx = this.campusData.sites.findIndex((resp) => resp.site_id._id === data.site_id._id);
        this.removeCampus(indx);
        const payload = _.cloneDeep(this.campusForm.value);
        console.log('payload change main', payload, indx);
        this.isWaitingForResponse = true;
        this.subs.sink = this.intakeChannelService.UpdateCampus(payload, this.campusId).subscribe(
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
              }).then(() => {
                this.refreshTable();
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            this.authService.postErrorLog(err)
            if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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
                type: 'warning',
                title: this.translate.instant('Invalid_Form_Warning.TITLE'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
      }
    });
  }

  resetTable() {
    this.selection.clear();
    this.dataSelected = [];
    this.pageSelected = [];
    this.isCheckedAll = false;
    this.refreshTable();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  goToSite() {
    const url = this.route.createUrlTree(['/site']);
    window.open(url.toString(), '_blank');
  }

  connectSite(data) {
    if (data && data.is_main_address) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
      return;
    }
    this.subs.sink = this.dialog
      .open(AddSiteCampusDialogComponent, {
        disableClose: true,
        width: '660px',
        data: {
          allData: this.campusData,
          dataRow: data ? data : null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        this.refreshTable();
      });
  }
}
