import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CoreService } from 'app/service/core/core.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DuplicateFormBuilderDialogComponent } from './duplicate-form-builder-dialog/duplicate-form-builder-dialog.component';
import { Observable, of } from 'rxjs';
import { FormBuilderService } from './form-builder.service';
import { AddFormTemplateDialogComponent } from './add-form-template-dialog/add-form-template-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'ms-form-builder-table',
  templateUrl: './form-builder-table.component.html',
  styleUrls: ['./form-builder-table.component.scss'],
})
export class FormBuilderTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  isWaitingForResponse = false;
  isTopWaitingForResponse = false;
  noData: any;

  displayedColumns: string[] = ['templateName', 'templateType', 'createdDate', 'creator', 'status', 'action'];
  filterColumns: string[] = [
    'templateNameFilter',
    'templateTypeFilter',
    'createdDateFilter',
    'creatorFilter',
    'statusFilter',
    'actionFilter',
  ];
  templateCount = 0;

  statusList = [
    { name: 'AllM', id: '' },
    { name: 'Published', id: 'true' },
    { name: 'Not Published', id: 'false' },
  ];
  templateTypeList = [
    { key: 'AllM', value: '' },
    { key: 'Alumni survey', value: 'alumni' },
    { key: 'fc_contract', value: 'fc_contract' },
    { key: 'Student admission', value: 'student_admission' },
    { key: 'teacher_contract', value: 'teacher_contract' },
  ];

  templateNameFilter = new UntypedFormControl('');
  templateTypeFilter = new UntypedFormControl('');
  createdDateFilter = new UntypedFormControl('');
  creatorFilter = new UntypedFormControl('');
  statusFilter = new UntypedFormControl('');
  private subs = new SubSink();
  filteredTempleteType: Observable<any>;

  filteredValues = {
    created_at: null,
    created_by: null,
    status: null,
    form_builder_name: null,
    template_type: null,
  };
  sortValue = null;
  isReset: any = false;
  timeOutVal: any;
  constructor(
    private pageTitleService: PageTitleService,
    private formBuilderService: FormBuilderService,
    public utilService: UtilityService,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService,
    private coreService: CoreService,
    private userService: AuthService,
  ) {
    // this.pageTitleService.setTitle(this.translate.instant('List of Form Template'));
  }

  ngOnInit() {
    this.getTemplateTable();
    this.initFilter();
    this.coreService.sidenavOpen = false;
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isReset) {
            this.getTemplateTable();
          }
        }),
      )
      .subscribe();
  }

  getTemplateTable() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.subs.sink = this.formBuilderService.getAllFormBuilders(pagination, this.filteredValues, this.sortValue).subscribe((resp) => {
      if (resp) {
        this.dataSource.data = resp;
        this.templateCount = resp[0] && resp[0].count_document ? resp[0].count_document : 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isWaitingForResponse = false;
      }
    }, (err) => {
      if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
      ) {
        this.userService.handlerSessionExpired();
        return;
      }
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  onAddFormBuilder() {
    this.subs.sink = this.dialog
      .open(AddFormTemplateDialogComponent, {
        width: '800px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          // this.goToTemplateDetail(resp);
          this.addFormBuilder(resp);
        }
      });
  }

  addFormBuilder(param) {
    this.router.navigate(['form-builder/template-detail'], {
      queryParams: { templateType: param },
    });
  }

  goToDetail() {
    this.router.navigate(['/template-detail']);
  }

  initFilter() {
    this.subs.sink = this.templateNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((text) => {
      this.paginator.pageIndex = 0;
      this.filteredValues.form_builder_name = text;
      this.getTemplateTable();
    });

    // this.filteredTempleteType = this.templateTypeFilter.valueChanges.pipe(
    //   debounceTime(400),
    //   startWith(''),
    //   map((searchText) =>
    //     searchText
    //       ? this.templateTypeList
    //           .filter((type) => (type ? type.key.toLowerCase().includes(searchText.toLowerCase()) : false))
    //           .sort((a: any, b: any) => a.name.localeCompare(b.name))
    //       : this.templateTypeList,
    //   ),
    // );

    this.subs.sink = this.createdDateFilter.valueChanges.pipe().subscribe((text) => {
      this.paginator.pageIndex = 0;
      this.filteredValues.created_at = moment(text).format('DD/MM/YYYY');
      this.getTemplateTable();
    });

    this.subs.sink = this.creatorFilter.valueChanges.pipe(debounceTime(400)).subscribe((text) => {
      this.filteredValues.created_by = text;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });

    this.subs.sink = this.statusFilter.valueChanges.pipe().subscribe((text) => {
      this.filteredValues.status = text === 'true' ? true : text === 'false' ? false : null;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    });
  }

  sortData(sort: Sort) {
    console.log('sort', sort.active);
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (!this.isWaitingForResponse) {
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    }
  }

  setTypeFilter(value) {
    if (value === '') {
      this.filteredValues.template_type = null;
      this.paginator.pageIndex = 0;
      this.getTemplateTable();
    } else {
      console.log(value);
      this.paginator.pageIndex = 0;
      this.filteredValues.template_type = value;
      this.getTemplateTable();
    }
  }

  resetSelection() {
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      created_at: null,
      created_by: null,
      status: null,
      form_builder_name: null,
      template_type: null,
    };

    this.templateNameFilter.setValue('', { emitEvent: false });
    this.createdDateFilter.setValue('', { emitEvent: false });
    this.creatorFilter.setValue('', { emitEvent: false });
    this.statusFilter.setValue('', { emitEvent: false });
    this.templateTypeFilter.setValue('', { emitEvent: false });

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;

    this.getTemplateTable();
  }

  duplicateTemplate(template) {
    console.log(template);
    this.subs.sink = this.dialog
      .open(DuplicateFormBuilderDialogComponent, {
        width: '400px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: template._id,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getTemplateTable();
        }
      });
  }

  goToTemplateDetail(template) {
    this.router.navigate([`form-builder/template-detail`], {
      queryParams: { templateId: template._id, templateType: template.template_type },
    });
  }

  deleteFormBuilderTemplate(template) {
    const templateId = template._id;
    const templateName = template.form_builder_name;
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S11.TITLE', { templateName: templateName }),
      text: this.translate.instant('UserForm_S11.TEXT', { templateName: templateName }),
      confirmButtonText: this.translate.instant('UserForm_S11.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S11.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S11.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S11.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      if (result.value) {
        clearTimeout(this.timeOutVal);
        this.isTopWaitingForResponse = true;
        this.subs.sink = this.formBuilderService.deleteFormBuilderTemplate(templateId).subscribe(
          (resp) => {
            this.isTopWaitingForResponse = false;
            console.log(resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo !'),
              confirmButtonText: this.translate.instant('OK'),
            }).then((ressult) => {
              this.getTemplateTable();
            });
          },
          (err) => {
            this.isTopWaitingForResponse = false
            if (
err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
            ) {
              this.userService.handlerSessionExpired();
              return;
            }
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        );
      } else {
        clearTimeout(this.timeOutVal);
        return;
      }
    });
  }

  translateDate(date) {
    if (date) {
      return moment(date).format('DD/MM/YYYY');
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle('');
  }
}
