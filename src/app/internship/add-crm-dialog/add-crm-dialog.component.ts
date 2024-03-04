import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  templateUrl: './add-crm-dialog.component.html',
  styleUrls: ['./add-crm-dialog.component.scss'],
})
export class AddCrmDialogComponent implements OnInit {
  private subs = new SubSink();
  companyRelationForm: UntypedFormGroup;
  companyRelationMember = new UntypedFormControl(null);

  crmList: any;
  campusList: any;
  schoolList: any;

  constructor(
    public dialogRef: MatDialogRef<AddCrmDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private candidatesService: CandidatesService,
  ) {}

  ngOnInit() {
    // console.log('dialog data', this.data);
    this.getCandidateCampuses();
  }

  getCandidateCampuses() {
    this.campusList = [];
    this.schoolList = [];
    this.crmList = [];
    if (this.data && this.data.length) {
      const tmpCampuses = [];
      this.data.forEach((item) => {
        if (item && item.student_id && item.student_id.candidate_campus) {
          tmpCampuses.push(item.student_id.candidate_campus);
        }
      });
      this.campusList = _.uniqBy(tmpCampuses);
      // console.log('campuses', this.campusList);

      const tmpSchools = [];
      this.data.forEach((item) => {
        if (item && item.student_id && item.student_id.candidate_school) {
          tmpSchools.push(item.student_id.candidate_school);
        }
      });
      this.schoolList = _.uniqBy(tmpSchools);
      // console.log('schools', this.schoolList);

      if (this.campusList && this.campusList.length) {
        this.getDataUserCRM();
      }
    } else if (this.data) {
      const tmpCampuses = [];
      tmpCampuses.push(this.data.student_id.candidate_campus);
      this.campusList = tmpCampuses;

      const tmpSchools = [];
      tmpSchools.push(this.data.student_id.candidate_school);
      this.schoolList = tmpSchools;

      if (this.campusList && this.campusList.length) {
        this.getDataUserCRM();
      }
    }
  }

  getDataUserCRM() {
    const crm = ['617f64ec5a48fe2228518815'];
    this.subs.sink = this.candidatesService.GetAllUsersCRMDropdown(crm, this.campusList, this.schoolList).subscribe(
      (res) => {
        // console.log(res);
        if (res) {
          this.crmList = res;
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

  validate() {
    const selectedUser = this.crmList.find((member) => member._id === this.companyRelationMember.value);
    // console.log(this.companyRelationMember.value);
    const payload = this.createPayload();
    const civility = selectedUser.civility !== 'neutral' ? this.translate.instant(selectedUser.civility) : '';
    // console.log(payload);
    Swal.fire({
      type: 'question',
      text: this.translate.instant('INTERNSHIP_012_S3.TEXT', {
        selectedUser: (civility ? civility + ' ' : '') + `${selectedUser.first_name} ${selectedUser.last_name}`,
      }),
      confirmButtonText: this.translate.instant('INTERNSHIP_012_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_012_S3.BUTTON_2'),
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((action) => {
      if (!action.value) {
        return;
      }
      this.subs.sink = this.candidatesService.changeCompanyRelationMemberofStudents(payload).subscribe(
        (res) => {
          // console.log(res);
          if (res) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.triggerNotificationN5(this.data);
            });
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
    });
  }

  createPayload() {
    if (this.data.length) {
      const dataMultiple = this.data;
      const payload = dataMultiple.map((res) => {
        return {
          _id: res._id,
          company_relation_member_id: this.companyRelationMember.value,
        };
      });
      return payload;
    } else {
      const dataSingle = this.data;
      const payload = {
        _id: this.data._id,
        company_relation_member_id: this.companyRelationMember.value,
      };
      return payload;
    }
  }

  triggerNotificationN5(data) {
    // console.log(data);
    if (data && data.length) {
      const dataMultiple = data;

      let old_CRM_id = '';
      const new_CRM_id = this.companyRelationMember.value;
      const internship_ids = [];
      dataMultiple.map((res) => {
        internship_ids.push(res._id);
        old_CRM_id = res.company_relation_member_id && res.company_relation_member_id._id ? res.company_relation_member_id._id : null;
      });
      // console.log('payload nya', old_CRM_id, new_CRM_id, internship_ids);
      this.subs.sink = this.candidatesService.TriggerNotificationINTERNSHIP_N5(old_CRM_id, new_CRM_id, internship_ids).subscribe(
        (resp) => {
          // console.log('response', resp);
          this.dialogRef.close(true);
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
  }
}
