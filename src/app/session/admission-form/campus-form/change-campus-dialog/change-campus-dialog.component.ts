import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'ms-change-campus-dialog',
  templateUrl: './change-campus-dialog.component.html',
  styleUrls: ['./change-campus-dialog.component.scss'],
})
export class ChangeCampusDialogComponent implements OnInit {
  private subs = new SubSink();
  isWaitingForResponse = false;
  candidateId = '';
  candidateData;
  step = '';
  campusForm: UntypedFormGroup;
  campusesList: any[] = [];
  private intVal;
  private timeOutVal;
  selectedCampusData;

  filteredValues = {
    scholar_season_ids: null,
    school: null,
    sector: null,
    level: null,
    speciality: null,
    is_speciality_null: null,
  };
  constructor(
    public dialogRef: MatDialogRef<ChangeCampusDialogComponent>,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.candidateId = this.data.candidateId;
      this.candidateData = this.data.data;
      this.step = this.data.step;
    }
    console.log('candidateData', this.candidateData)
    this.initFormCtrl();
    this.getAllCampus();
  }

  initFormCtrl() {
    this.campusForm = this.fb.group({
      campus: [null, Validators.required],
    });
  }

  getAllCampus() {
    this.isWaitingForResponse = true;
    this.filteredValues = {
      scholar_season_ids: this.candidateData.scholar_season._id,
      school: this.candidateData.school.short_name,
      level: this.candidateData.level.name,
      sector: this.candidateData.sector ? this.candidateData.sector._id : null,
      speciality: this.candidateData.speciality ? this.candidateData.speciality._id : null,
      is_speciality_null: this.candidateData.speciality ? false : true,

    }
    const filter = this.cleanFilterData();
    this.subs.sink = this.candidateService.getIntakeChannelCampusDropdown(filter).subscribe((res) => {
      console.log('_campuses', res);
      if (res && res.length) {
        const intakeList = _.cloneDeep(res);
        // this.campusesList = res.map((list) => list.campus);
        this.campusesList = intakeList.filter((intake) => intake._id !== this.candidateData.intake_channel._id);
        this.isWaitingForResponse = false;
      }
    },
    (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
    console.log('campus list', this.campusesList);
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    console.log('filterData', filterData);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'scholar_season_ids') {
          filterQuery = filterQuery + ` ${key}:["${filterData[key]}"]`;
        } else if (key === 'school') {
          filterQuery = filterQuery + ` ${key}:["${filterData[key]}"]`;
        } else if (key === 'sector') {
          filterQuery = filterQuery + ` ${key}:["${filterData[key]}"]`;
        } else if (key === 'speciality') {
          filterQuery = filterQuery + ` ${key}:["${filterData[key]}"]`;
        } else if (key === 'level') {
          filterQuery = filterQuery + ` ${key}:["${filterData[key]}"]`;
        } else if (key === 'is_speciality_null') {
          filterQuery = filterQuery + ` ${key}: ${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  submit() {
    this.isWaitingForResponse = true;
    const campus = this.selectedCampusData.campus;
    let timeDisabled = 3;
    Swal.fire({
      type: 'question',
      title: this.translate.instant('TRANSFER_S3.Title'),
      text: this.translate.instant('TRANSFER_S3.Text', { campusName: campus }),
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('TRANSFER_S3.Button 1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('TRANSFER_S3.Button 2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        this.intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('TRANSFER_S3.Button 1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('TRANSFER_S3.Button 1');
          Swal.enableConfirmButton();
          clearInterval(this.intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((resp) => {
      clearTimeout(this.timeOutVal);
      if (resp.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((res) => {
          if (res.value) {
            this.isWaitingForResponse = false;
            this.dialogRef.close(this.campusForm.controls['campus'].value);
          } else {
            this.isWaitingForResponse = false;
          }
        });
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  selectedCampus(data) {
    console.log(data);
    this.selectedCampusData = data;
    console.log(this.campusForm.controls['campus'].value);
  }

  closeDialog() {
    this.dialogRef.close('cancel');
  }
}
