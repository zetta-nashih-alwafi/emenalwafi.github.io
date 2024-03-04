import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { StudentDetailService } from 'app/service/student-detail-service/student-detail.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-student-subject-certification',
  templateUrl: './student-subject-certification.component.html',
  styleUrls: ['./student-subject-certification.component.scss']
})
export class StudentSubjectCertificationComponent implements OnInit {
  private subs = new SubSink();
  subjectsList = [];

  constructor(private studentDetailService: StudentDetailService, private translate: TranslateService) { }

  ngOnInit() {
    this.subs.sink = this.studentDetailService.getSubjects().subscribe((subjectList: any[]) => {
      this.subjectsList = subjectList;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    })
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
