import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { StudentDetailService } from 'app/service/student-detail-service/student-detail.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-student-documents',
  templateUrl: './student-documents.component.html',
  styleUrls: ['./student-documents.component.scss'],
})
export class StudentDocumentsComponent implements OnInit {
  private subs = new SubSink();
  documentsList = [];

  constructor(private studentDetailService: StudentDetailService, private translate: TranslateService) {}

  ngOnInit() {
    this.subs.sink = this.studentDetailService.getDocuments().subscribe((documentList: any[]) => {
      this.documentsList = documentList;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
