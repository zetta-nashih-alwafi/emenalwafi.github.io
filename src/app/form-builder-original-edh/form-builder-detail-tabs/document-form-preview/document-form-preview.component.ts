import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-document-form-preview',
  templateUrl: './document-form-preview.component.html',
  styleUrls: ['./document-form-preview.component.scss'],
})
export class DocumentFormPreviewComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  _stepId;
  dataSource = new MatTableDataSource([]);
  displayedColumn = [];
  noData: boolean = true;
  isWaitingForResponse = true;
  dataCount = 0;
  formData: any;
  private subs = new SubSink();

  @Input() currentStepIndex: number;
  @Input() set stepId(value: string) {
    if (value) {
      this._stepId = value;
      this.fetchStepData(value);
    }
  }

  get stepId(): string {
    return this._stepId;
  }

  constructor(private formBuilderService: FormBuilderService, private translate: TranslateService) {}

  fetchStepData(stepId) {
    this.subs.sink = this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe(
      (step) => {
        if (step) {
          console.log('step', step);
          this.formData = step;
          this.isWaitingForResponse = false;
          this.populateDocumentTables(step);
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  ngOnInit() {
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  initStepContractFormListener() {
    this.formBuilderService.stepData$.subscribe((formData) => {
      if (formData) {
        this.isWaitingForResponse = false;
        this.formData = formData;
        console.log('formData', this.formData);
        this.populateDocumentTables(this.formData);
      }
    });
  }

  populateDocumentTables(formData) {
    console.log(formData);
    if (!formData || !formData.segments || !formData.segments.length || !formData.segments[0] || !formData.segments[0].segment_title) {
      return;
    }
    this.displayedColumn[0] = formData.segments[0].segment_title || '';
    const documents = formData.segments.map((segment) => segment.questions).flat();
    console.log(documents);
    this.dataSource = documents;
    this.dataSource.paginator = this.paginator;
    this.paginator.length = documents && documents.length ? documents.length : 0;
    this.dataCount = documents && documents.length ? documents.length : 0;
    this.noData = documents && documents.length === 0 ? true : false;
  }
}
