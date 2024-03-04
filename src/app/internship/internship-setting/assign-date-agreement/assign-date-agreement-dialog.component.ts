import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import _ from 'lodash';
import { SubSink } from 'subsink';

@Component({
  templateUrl: './assign-date-agreement-dialog.component.html',
  styleUrls: ['./assign-date-agreement-dialog.component.scss']
})
export class AssignDateAgreementDialogComponent implements OnInit {
  studentDate = {internDate: '10/08/2021', mentorDate: '10/09/2021'}
  internshipDate = new UntypedFormControl(null);
  mentorDate = new UntypedFormControl(null);
  campusList = ['Paris', 'Toulouse'];
  levelList = ['1', '2', '3', '4', '5'];
  schoolSelected = 'EFAP';
  formCampus = new UntypedFormControl(null);
  formLevel = new UntypedFormControl(null);
  formCondition = new UntypedFormControl(null);
  selectedCampusList = [];
  selectedLevelList = [];

  today = new Date();

  constructor(
    public dialogRef: MatDialogRef<AssignDateAgreementDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    console.log('dialog data', this.data);
  }

  updateDate($event, type: string) {
  }

  selectCampus(event) {
    this.formCampus.setValue(null);
    this.selectedCampusList.push(event);
    this.selectedCampusList = _.uniqBy(this.selectedCampusList);
  }
  selectLevel(event) {
    this.formLevel.setValue(null);
    let levelName = event;
    if (parseInt(event)) {
      levelName = 'GE' + ' ' + event;
    } else {
      levelName = event;
    }
    this.selectedLevelList.push(levelName);
    this.selectedLevelList = _.uniqBy(this.selectedLevelList);
  }
  deleteCampus(i) {
    this.selectedCampusList.splice(i, 1);
  }
  deleteLevel(i) {
    this.selectedLevelList.splice(i, 1);
  }
}
