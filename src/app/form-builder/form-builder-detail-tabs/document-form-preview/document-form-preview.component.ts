import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import * as _ from 'lodash';
import { SubSink } from 'subsink';


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

  constructor(private formBuilderService: FormBuilderService, public sanitizer: DomSanitizer, private authService: AuthService) {}

  fetchStepData(stepId) {
    this.subs.sink = this.formBuilderService.getOneFormBuilderStep(this.stepId).subscribe((step) => {
      if (step) {
        const data = _.cloneDeep(step);
        this.formData = data;
        // console.log(step);
        this.isWaitingForResponse = false;
        this.populateDocumentTables(step);
      }
    }, (err) => {
      this.authService.postErrorLog(err);
    });
  }

  ngOnInit() {
    if (!this.stepId) {
      this.initStepContractFormListener();
    }
  }

  initStepContractFormListener() {
    this.subs.sink = this.formBuilderService.stepData$.subscribe((formData) => {
      if (formData) {
        this.isWaitingForResponse = false;
        this.formData = formData;
        this.populateDocumentTables(this.formData);
      }
    });
  }

  populateDocumentTables(formData) {
    // console.log(formData);
    if (!formData || !formData.segments || !formData.segments.length || !formData.segments[0] || !formData.segments[0].segment_title) {
      return;
    }
    this.displayedColumn[0] = formData.segments[0].segment_title || '';
    const documents = formData.segments.map((segment) => segment.questions).flat();
    // console.log(documents);
    this.dataSource = documents;
    this.dataSource.paginator = this.paginator;
    this.paginator.length = documents && documents.length ? documents.length : 0;
    this.dataCount = documents && documents.length ? documents.length : 0;
    this.noData = documents && documents.length === 0 ? true : false;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
