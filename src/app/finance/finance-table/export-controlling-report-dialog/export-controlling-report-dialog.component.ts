import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';

@Component({
  selector: 'ms-export-controlling-report-dialog',
  templateUrl: './export-controlling-report-dialog.component.html',
  styleUrls: ['./export-controlling-report-dialog.component.scss']
})
export class ExportControllingReportDialogComponent implements OnInit {
  isWaitingForResponse = false;
  scholarList: any = [];
  private subs = new SubSink();
  reportForm: UntypedFormGroup;
  school = [];
  currentUser: any;
  isPermission: any;
  currentUserTypeId: any;
  scholarFilter = new UntypedFormControl(null,Validators.required);
  schoolsFilter = new UntypedFormControl(null,Validators.required);

  constructor(
    private authService: AuthService,
    private candidateService: CandidatesService,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<ExportControllingReportDialogComponent>,
    public translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();    
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initForm();
    this.getScholarSeason();
  }

  initForm() {
    this.reportForm = this.fb.group({
      scholar_season: [null, Validators.required],
      schools: [null, Validators.required]
    });
  }

  scholarSelect() {
    const scholarSeasonSelected = this.scholarFilter.value;
    this.reportForm.get('scholar_season').markAsTouched();
    if (scholarSeasonSelected && scholarSeasonSelected) {
      this.school = [];
      this.schoolsFilter.setValue(null);
      this.reportForm.get('schools').patchValue(null);
      this.reportForm.get('scholar_season').patchValue(scholarSeasonSelected);
      // *************** Call cascade school
      this.getDataForList(scholarSeasonSelected);
    }
  }


  schoolSelect() {
    const form = this.schoolsFilter.value;
    this.reportForm.get('schools').markAsTouched();
    if (form && form.length) {
      this.schoolsFilter.patchValue(form);
      this.reportForm.get('schools').patchValue(form);
    } else {
      this.schoolsFilter.patchValue(null);
      this.reportForm.get('schools').patchValue(null);
    }
  }

  clearSchool() {
    this.school = [];
    this.schoolsFilter.patchValue(null);
    this.reportForm.get('schools').patchValue(null);
    this.reportForm.get('schools').markAsTouched();
  }

  isAllDropdownSelected(type) {    
    if (type === 'school') {
      const selected = this.schoolsFilter.value;      
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.school.length;
      
      return isAllSelected;
    } 
  }

  isSomeDropdownSelected(type) {
    if (type === 'school') {
      const selected = this.schoolsFilter.value;;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.school.length;      
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {    
    if (type === 'school') {
      if (event.checked) {
        const schoolData = this.school.map((el) => el?._id);
        this.schoolsFilter.patchValue(schoolData, { emitEvent: false });
      } else {
        this.schoolsFilter.patchValue(null, { emitEvent: false });
      }
    }
  }

  getScholarSeason() {
    this.isWaitingForResponse = true;
    const filter = {
      is_published: true,
    };
    this.subs.sink = this.candidateService.getAllScholarSeasons(filter).subscribe(
      (res) => {
        if (res) {
          this.scholarList = res;
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err);
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDataForList(data?) {
    this.isWaitingForResponse = true;
    const name = data ? data : '';
    const filter = 'filter: { scholar_season_id:' + `"${name}"` + '}';
    this.subs.sink = this.candidateService.GetAllSchoolFilter(name, filter, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {          
          if (
            this.currentUser &&
            this.currentUser.entities &&
            this.currentUser.entities.length &&
            this.currentUser.app_data &&
            this.currentUser.app_data.school_package &&
            this.currentUser.app_data.school_package.length
          ) {
            const schoolsList = [];
            this.currentUser.app_data.school_package.forEach((element) => {
              schoolsList.push(element.school);
            });            
            this.school = schoolsList;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          } else {            
            this.school = resp;
            this.school = this.school.sort((a, b) => (a.short_name > b.short_name ? 1 : b.short_name > a.short_name ? -1 : 0));
          }
        }
        this.isWaitingForResponse = false;
      },
      (err) => {    
        this.isWaitingForResponse = false;    
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {          
          return;
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  onValidate() {
    if (this.reportForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.reportForm.markAllAsTouched();
      this.scholarFilter.markAllAsTouched()
      this.schoolsFilter.markAllAsTouched()
      return true;
    } else {
      this.dialogRef.close(this.reportForm.value);
    }
  }

}
