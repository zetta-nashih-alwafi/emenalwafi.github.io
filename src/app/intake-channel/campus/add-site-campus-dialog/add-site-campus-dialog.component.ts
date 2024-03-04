import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-site-campus-dialog',
  templateUrl: './add-site-campus-dialog.component.html',
  styleUrls: ['./add-site-campus-dialog.component.scss'],
})
export class AddSiteCampusDialogComponent implements OnInit {
  campusSiteForm: UntypedFormGroup;
  campusForm: UntypedFormGroup;
  private subs = new SubSink();
  campusData: any;
  listOriginSite = [];
  dataSiteList = [];

  constructor(
    public dialogRef: MatDialogRef<AddSiteCampusDialogComponent>,
    private intakeChannelService: IntakeChannelService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllSite();
    console.log('this.data', this.data);
    if (this.data && this.data.allData) {
      this.campusData = _.cloneDeep(this.data.allData);
      this.populateData(_.cloneDeep(this.data));
    }
  }

  getAllSite() {
    this.subs.sink = this.intakeChannelService.GetAllSites().subscribe((resp) => {
      if (resp && resp.length) {
        this.listOriginSite = _.cloneDeep(resp);
        if (this.data && this.data.allData && this.data.allData.sites) {
          const alreadySelectedSites = this.data.allData.sites.map((site) => site.site_id._id);
          const filtered = this.listOriginSite.filter((site) => !alreadySelectedSites.includes(site._id));
          this.dataSiteList = _.cloneDeep(
            filtered.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 0,
            ),
          );
          if (this.data.dataRow && this.data.dataRow.site_id) {
            this.dataSiteList.push(this.data.dataRow.site_id);
          }
        }
      }
    },
    (err) => {
      this.authService.postErrorLog(err)
    });
  }

  initForm() {
    this.campusSiteForm = this.fb.group({
      _id: [null, Validators.required],
    });
    this.campusForm = this.fb.group({
      sites: this.fb.array([]),
    });
  }

  campussArray(): UntypedFormArray {
    return this.campusForm.get('sites') as UntypedFormArray;
  }

  initCampus(): UntypedFormGroup {
    return this.fb.group({
      site_id: [null],
      is_main_address: [false],
    });
  }

  addCampus() {
    this.campussArray().push(this.initCampus());
  }

  removeCampus(index: number) {
    this.campussArray().removeAt(index);
  }

  populateData(data) {
    const control = this.campusForm.get('sites').value;
    const sites = _.cloneDeep(control);
    for (let i = sites.length - 1; i >= 0; i--) {
      this.removeCampus(i);
    }
    if (data && data.allData && data.allData.sites && data.allData.sites.length) {
      data.allData.sites.forEach((element) => {
        this.addCampus();
      });
      data.allData.sites = data.allData.sites.map((list) => {
        return {
          site_id: list.site_id._id,
          is_main_address: list.is_main_address,
        };
      });
    }
    console.log('data', data);
    this.campusForm.patchValue(data.allData);
    if (data.dataRow && data.dataRow.site_id) {
      this.campusSiteForm.get('_id').setValue(data.dataRow.site_id._id);
    }
    console.log('data', data, this.campusForm.value, this.campusSiteForm.value);
  }

  saveCampus() {
    if (this.campusSiteForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.campusForm.markAllAsTouched();
      return;
    }
    const payload = _.cloneDeep(this.campusForm.value);
    if (!this.data.dataRow) {
      if (this.campusSiteForm.get('_id').value) {
        const site = {
          site_id: this.campusSiteForm.get('_id').value,
          is_main_address: false,
        };
        payload.sites.push(site);
      }
    } else {
      if (this.campusSiteForm.get('_id').value) {
        const site = {
          site_id: this.campusSiteForm.get('_id').value,
          is_main_address: false,
        };
        const idx = this.data.allData.sites.findIndex((resp) => resp.site_id._id === this.data.dataRow.site_id._id);
        if (idx >= 0) {
          payload.sites[idx] = site;
        }
        console.log('idx', idx, this.data, site, payload);
      }
    }
    const siteName = this.dataSiteList.find((resp) => resp._id === this.campusSiteForm.get('_id').value);
    if (this.data.allData._id) {
      console.log(payload);
      this.subs.sink = this.intakeChannelService.UpdateCampus(payload, this.data.allData._id).subscribe(
        (resp) => {
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CAMPUS_S5.Title'),
              html: this.translate.instant('CAMPUS_S5.Text', {
                site: siteName.name,
                campus: this.data.allData.name,
              }),
              confirmButtonText: this.translate.instant('CAMPUS_S5.Button1'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close();
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err)
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
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }
}
