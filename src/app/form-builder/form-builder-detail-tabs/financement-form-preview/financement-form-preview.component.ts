import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-financement-form-preview',
  templateUrl: './financement-form-preview.component.html',
  styleUrls: ['./financement-form-preview.component.scss'],
})
export class FinancementFormPreviewComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  _stepId: string;
  @Input() currentStepIndex: number;
  stepData: any;
  @Input() set stepId(value: string) {
    this._stepId = value;
    this.fetchStepData();
  }

  get stepId(): string {
    return this._stepId;
  }

  displayedColumns: string[] = ['type', 'organization', 'rate_hour', 'hours', 'total', 'document', 'status', 'action'];

  dummyData = [
    {
      type: 'OPCO',
      organization_name: 'Zettabyte',
      rate_per_hours: 12,
      hours: 15,
      total: 180,
      status: 'added_by_student',
      document: 'http://eprints.unm.ac.id/4319/1/RISTAWATI.pdf', //dummy
      is_financement_validated: true,
    },
    {
      type: 'OPCO',
      organization_name: 'Zettabyte',
      rate_per_hours: 10,
      hours: 20,
      total: 200,
      status: 'accepted',
      document: 'http://eprints.unm.ac.id/4319/1/RISTAWATI.pdf', //dummy
      is_financement_validated: false,
    },
  ];

  dataSource = new MatTableDataSource([]);
  isLoading = false;
  noData: any;
  dataCount: any;

  constructor(
    public sanitizer: DomSanitizer,
    private formBuilderService: FormBuilderService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    setTimeout(() => {
      this.dataSource.data = this.dummyData;
      this.dataCount = this.dummyData.length;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      this.isLoading = false;
    }, 100);

    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  fetchStepData() {
    this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe(
      (step) => {
        if (step) {
          this.stepData = step;
        }
      },
      (err) => {
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

  initStepContractFormListener() {
    this.formBuilderService.stepData$.subscribe((formData) => {
      if (formData) {
        this.stepData = formData;
      }
    });
  }

  formatDecimal(value) {
    return parseFloat(value).toFixed(2);
  }
}
