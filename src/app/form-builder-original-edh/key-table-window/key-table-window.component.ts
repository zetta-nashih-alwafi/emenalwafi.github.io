import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { FormBuilderService } from '../form-builder.service';

@Component({
  selector: 'ms-key-table-window',
  templateUrl: './key-table-window.component.html',
  styleUrls: ['./key-table-window.component.scss'],
})
export class KeyTableWindowComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
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
    private contractService: TeacherContractService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((res) => {
      if (res) {
        console.log(res);
        this.templateId = res.get('templateId');
        this.stepId = res.get('stepId');
        this.templateType = res.get('templateType');
        const stepType = res.get('stepType');
        const lang = res.get('lang');
        switch (stepType) {
          case 'campus_validation':
            console.log('campus');
            break;
          case 'document_to_validate':
            console.log('document to validate');
            break;
          default:
            console.log('summary');
            break;
        }
        this.translate.use(lang);
      }
    });
    this.populateTableData();
  }

  populateTableDataForAlumni() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getAlumniTemplateKeysData(this.templateId, this.stepId).subscribe(
      (resp) => {
        if (resp && resp.length > 0) {
          this.dataSource.data = resp;
          this.dataCount = resp.length;
          this.dataSource.paginator = this.paginator;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isWaitingForResponse = false;
        this.coreService.sidenavOpen = false;
      },
      (err) => {
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isWaitingForResponse = false;
        this.coreService.sidenavOpen = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  populateTableDataForTeacher() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formBuilderService.getContractTemplateKeysDropdown(this.templateId, this.stepId).subscribe(
      (resp) => {
        if (resp && resp.length > 0) {
          this.dataSource.data = resp;
          this.dataCount = resp.length;
          this.dataSource.paginator = this.paginator;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isWaitingForResponse = false;
        this.coreService.sidenavOpen = false;
      },
      (err) => {
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isWaitingForResponse = false;
        this.coreService.sidenavOpen = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  populateTableDataForContract() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService
      .GetListFCContracTemplateQuestionRefIds(null, this.templateId, null, this.translate.currentLang)
      .subscribe(
        (resp) => {
          if (resp && resp.length > 0) {
            this.dataSource.data = resp;
            this.dataCount = resp.length;
            this.dataSource.paginator = this.paginator;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;
          this.coreService.sidenavOpen = false;
        },
        (err) => {
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;
          this.coreService.sidenavOpen = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  populateTableData() {
    if (this.templateType === 'alumni') {
      this.populateTableDataForAlumni();
    } else if (this.templateType === 'teacher_contract') {
      this.populateTableDataForTeacher();
    } else if (this.templateType === 'fc_contract') {
      this.populateTableDataForContract();
    } else if (this.templateType === 'student_admission' || this.templateType === 'admission_document') {
      // use GetDocumentBuilderListOfKeys query
      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.getContractTemplateKeysData().subscribe(
        (resp) => {
          if (resp && resp.length > 0) {
            this.dataSource.data = resp;
            this.dataCount = resp.length;
            this.dataSource.paginator = this.paginator;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;
          this.coreService.sidenavOpen = false;
        },
        (err) => {
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isWaitingForResponse = false;
          this.coreService.sidenavOpen = false;
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

  async onCopyToClipBoard(element: { key: string; description: string }) {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(element.key);
    }
  }
}
