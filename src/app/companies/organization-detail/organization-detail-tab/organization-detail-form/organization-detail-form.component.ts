import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AdmissionService } from 'app/service/admission/admission.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import * as moment from 'moment';
import { CustomValidators } from 'ng2-validation';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { ApplicationUrls } from 'app/shared/settings';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { UserManagementService } from 'app/user-management/user-management.service';
import { CoreService } from 'app/service/core/core.service';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-organization-detail-form',
  templateUrl: './organization-detail-form.component.html',
  styleUrls: ['./organization-detail-form.component.scss'],
})
export class OrganizationDetailFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() orgId: string;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  typeList = ['OPCO', 'CPF', 'Transition Pro', 'Pôle Emploi', 'Région'];
  identityForm: UntypedFormGroup;

  today: Date;

  isWaitingForResponse = false;
  countries;
  countryList;
  filteredCountry: any[] = [];
  cities: string[] = [];
  filteredCities: string[] = [];
  departments: string[] = []; // in API, this field called "academy"
  filteredDepartments: string[] = [];
  regions: string[] = []; // in API, this field called "province"
  filteredRegions: string[] = [];

  myInnerHeight = 1920;

  private intVal: any;
  private timeOutVal: any;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private rncpTitleService: RNCPTitlesService,
    private translate: TranslateService,
    private schoolService: SchoolService,
    public permissionService: PermissionService,
    private dateAdapter: DateAdapter<Date>,
    private formFillingService: FormFillingService,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list.map((ls) => ls?.name);
    });
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.today = new Date();
    this.initForm();
    console.log('_can', this.orgId);
  }

  ngOnChanges() {
    this.initForm();
    // this.resetData();
    this.getOneOrganization();
  }

  getOneOrganization() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneOrganizationForCardList(this.orgId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.identityForm.patchValue(resp);
      },
      (err) => {
        this.isWaitingForResponse = false;
        console.log(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getAutomaticHeight() {
    if (this.router.url === '/my-file' || this.router.url.includes('previous-course')) {
      this.myInnerHeight = window.innerHeight - 193;
      return this.myInnerHeight;
    } else {
      this.myInnerHeight = window.innerHeight - 369;
      return this.myInnerHeight;
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  resetData() {
    this.countries = [];
    this.filteredCountry = [];
    this.cities = [];
    this.filteredCities = [];
    this.departments = [];
    this.filteredDepartments = [];
    this.regions = [];
    this.filteredRegions = [];
  }

  initForm() {
    this.identityForm = this.fb.group({
      organization_type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      organization_id: [''],
      pole_emploi_region: [''],
      region: [''],
      address: [null],
      postal_code: [null],
      country: [null],
      city: [null],
      department: [null],
    });
  }

  getPostcodeData() {
    const country = this.identityForm.get('country').value;
    const postCode = this.identityForm.get('postal_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe((resp) => {
        if (resp && resp.length) {
          this.setAddressDropdown(resp);
          this.identityForm.get('city').setValue(this.cities[0]);
          this.identityForm.get('department').setValue(this.departments[0]);
          this.identityForm.get('region').setValue(this.regions[0]);
        }
      }, (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
    }
  }

  setAddressDropdown(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.cities = _.uniq(tempCities);
      this.departments = _.uniq(tempDepartments);
      this.regions = _.uniq(tempRegions);

      this.filteredCities = this.cities;
      this.filteredDepartments = this.departments;
      this.filteredRegions = this.regions;
    }
  }

  filterCountry() {
    if (!this.identityForm.get('country').value) {
      return;
    }
    const searchString = this.identityForm.get('country').value.toLowerCase().trim();
    this.filteredCountry = this.countries.filter((country) => country && country.toLowerCase().trim().includes(searchString));
  }

  filterCity() {
    if (this.cities && this.cities.length && this.identityForm.get('city').value) {
      const searchString = this.identityForm.get('city').value.toLowerCase().trim();
      this.filteredCities = this.cities.filter((city) => city && city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartment() {
    if (this.departments && this.departments.length && this.identityForm.get('department').value) {
      const searchString = this.identityForm.get('department').value.toLowerCase().trim();
      this.filteredDepartments = this.departments.filter(
        (department) => department && department.toLowerCase().trim().includes(searchString),
      );
    }
  }

  filterRegion() {
    if (this.regions && this.regions.length && this.identityForm.get('region').value) {
      const searchString = this.identityForm.get('region').value.toLowerCase().trim();
      this.filteredRegions = this.regions.filter((region) => region && region.toLowerCase().trim().includes(searchString));
    }
  }

  createPayload() {
    const payload = _.cloneDeep(this.identityForm.value);
    return payload;
  }

  async updateUser() {
    if (!(await this.checkFormValidity())) {
      return;
    }
    this.isWaitingForResponse = true;
    const payload = this.createPayload();
    // delete payload.region;
    this.subs.sink = this.formFillingService.updateOrganization(this.orgId, payload).subscribe((res) => {
      if (res) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.getOneOrganization();
          this.isWaitingForResponse = false;
          this.formFillingService.triggerRefresh(true);
          this.reloadData.emit(true);
        });
      }
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  async checkFormValidity(): Promise<boolean> {
    // isWaitingForResponse || checkComparison() || identityForm.invalid
    if (this.identityForm.invalid) {
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.markAllFieldsAsTouched(this.identityForm);
      return false;
    } else {
      return true;
    }
  }

  // make all field as touched so error can show
  markAllFieldsAsTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.markAllFieldsAsTouched(control);
      } else if (control instanceof UntypedFormArray) {
        for (const childControl of control.controls) {
          childControl.markAllAsTouched();
        }
      }
    });
  }
}
