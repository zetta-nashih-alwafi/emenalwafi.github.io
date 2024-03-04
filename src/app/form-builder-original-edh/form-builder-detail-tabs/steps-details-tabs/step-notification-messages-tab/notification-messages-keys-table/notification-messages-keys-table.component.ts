import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { SubSink } from 'subsink';
import { map, tap } from 'rxjs/operators';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import Swal from 'sweetalert2';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';

@Component({
  selector: 'ms-notification-messages-keys-table',
  templateUrl: './notification-messages-keys-table.component.html',
  styleUrls: ['./notification-messages-keys-table.component.scss'],
})
export class NotificationMessagesKeysTableComponent implements OnInit {
  @Input() templateId;
  @Input() templateType;
  @Input() stepId;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource([]);
  private subs = new SubSink();
  displayedColumns: string[] = ['key', 'description', 'action'];
  isWaitingForResponse = false;
  noData: any;
  scholarPeriodCount;
  dataCount = 0;

  constructor(
    private translate: TranslateService,
    private formBuilderService: FormBuilderService,
    private contractService: TeacherContractService,
  ) {}

  ngOnInit() {
    // dumy data source
    // this.dataSource.data = [
    //   {
    //     key: '{{civility_candidate}}',
    //     description: 'Civilité - candidat',
    //   },
    //   {
    //     key: '{{first_name_candidate}}',
    //     description: 'Prénom - candidat',
    //   },
    //   {
    //     key: '{{last_name_candidate}}',
    //     description: 'Nom - candidat',
    //   },
    //   {
    //     key: '{{date_of_birth_candidate}}',
    //     description: 'Date Naissance - candidat',
    //   },
    //   {
    //     key: '{{place_of_birth_candidate}}',
    //     description: 'Lieu de naissance - candidat',
    //   },
    // ];
    // console.log(this.templateId, this.templateData);
    this.subs.sink = this.translate.onLangChange.pipe().subscribe((result) => {
      if (result) {
        this.fetchKeysAndPopulateTable();
      }
    });
    this.fetchKeysAndPopulateTable();
  }

  fetchKeysAndPopulateTableForAlumni() {
    this.isWaitingForResponse = true;
    console.log('_step', this.templateId, this.stepId);

    this.subs.sink = this.formBuilderService.getAlumniTemplateKeysData(this.templateId, this.stepId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.dataSource.data = resp;
        this.dataCount = resp.length;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.dataSource.paginator = this.paginator;
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  fetchKeysAndPopulateTableForContract() {
    this.isWaitingForResponse = true;
    console.log('_step', this.templateId, this.stepId);

    this.subs.sink = this.formBuilderService.getContractTemplateKeysDropdown(this.templateId, this.stepId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.dataSource.data = resp;
        this.dataCount = resp.length;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.dataSource.paginator = this.paginator;
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  fetchKeysAndPopulateTable() {
    if (this.templateType === 'alumni') {
      this.fetchKeysAndPopulateTableForAlumni();
    } else if (this.templateType === 'teacher_contract') {
      this.fetchKeysAndPopulateTableForContract();
    } else if (this.templateType === 'fc_contract') {
      this.isWaitingForResponse = true;
      this.subs.sink = this.contractService
        .GetListFCContracTemplateQuestionRefIds(null, this.templateId, null, this.translate.currentLang)
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            this.dataSource.data = resp;
            this.dataCount = resp.length;
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
            this.dataSource.paginator = this.paginator;
          },
          (err) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    } else if (this.templateType === 'student_admission' || this.templateType === 'admission_document') {
      this.isWaitingForResponse = true;
      console.log('_step', this.templateId, this.stepId);

      this.subs.sink = this.formBuilderService.getListFormBuilderQuestionRefIds().subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.dataSource.data = resp;
          this.dataCount = resp.length;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.dataSource.paginator = this.paginator;
        },
        (err) => {
          this.isWaitingForResponse = false;
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

  sortData(sort) {}

  // handle copying click event
  async onCopyToClipBoard(element: { key: string; description: string }) {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(element.key);
    }
  }
}
