import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { debounceTime, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { UntypedFormControl } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';

interface Keys {
  key: string;
  description: string;
}

@Component({
  selector: 'ms-key-table-window',
  templateUrl: './key-table-window.component.html',
  styleUrls: ['./key-table-window.component.scss'],
})
export class KeyTableWindowComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isWaitingForResponse = false;
  dataSource = new MatTableDataSource([]);
  dataCount = 0;
  noData: any;
  templateId: any;
  stepId: any;
  templateType: any;
  displayedColumns: string[] = ['key', 'description', 'action'];
  filterColumns: string[] = ['keyFilter', 'descriptionFilter', 'actionFilter'];
  private subs = new SubSink();
  sortValue = null;
  descriptionFilter = new UntypedFormControl('');
  filteredValues: Keys = {
    key: null,
    description: null,
  };
  dummyData = [
    {
      key: '${user_civility}',
      description: 'description of civility',
    },
    {
      key: '${user_first_name}',
      description: 'description of user first name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
    {
      key: '${user_last_name}',
      description: 'description of user last name',
    },
  ];

  constructor(
    private translate: TranslateService,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private formBuilderService: FormBuilderService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.subs.sink = this.route.queryParamMap.subscribe((res) => {
      if (res) {
        const lang = res.get('lang');
        this.stepId = res.get('stepId');
        this.translate.use(lang);
      }
    });
    this.initFilter();
    this.populateTableData();
  }

  initFilter() {
    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((text) => {
      this.filteredValues.description = text;
      this.paginator.pageIndex = 0;
      this.populateTableData();
    });
  }

  populateTableData() {
    this.isWaitingForResponse = true;
    const filter = {
      ...this.filteredValues,
    };
    this.subs.sink = this.formBuilderService
      .getAllFormBuilderKey(filter, this.translate.currentLang, this.stepId, this.sortValue)
      .subscribe(
        (resp) => {
          if (resp && resp.length > 0) {
            this.dataSource.data = resp;
            this.dataCount = resp.length;
            this.dataSource.paginator = this.paginator;
          } else {
            this.dataSource.data = resp;
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
            this.dataCount = resp.length;
            this.dataSource.paginator = this.paginator;
          }
          this.isWaitingForResponse = false;
          this.coreService.sidenavOpen = false;
        },
        (err) => {
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;
          this.coreService.sidenavOpen = false;
          // Record error log
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  async onCopyToClipBoard(element: { key: string; description: string }) {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(element.key);
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active && sort.direction ? { [sort.active]: sort.direction } : null;
    this.paginator.pageIndex = 0;
    this.populateTableData();
  }

  resetSelection() {
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      key: null,
      description: null,
    };
    this.descriptionFilter.setValue('', { emitEvent: false });

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;

    this.populateTableData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
