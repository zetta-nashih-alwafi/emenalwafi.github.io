import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { data } from 'jquery';
import { InternshipService } from 'app/service/internship/internship.service';
import { CompanyService } from 'app/service/company/company.service';
import { forkJoin, Observable } from 'rxjs';
// import { AddCompanyDialogCountryComponent } from 'app/company-file/add-company-dialog-country/add-company-dialog-country.component';

@Component({
  selector: 'ms-fourth-aggrement-form',
  templateUrl: './fourth-aggrement-form.component.html',
  styleUrls: ['./fourth-aggrement-form.component.scss'],
  providers: [ParseStringDatePipe],
})
export class FourthAggrementFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() dataModify: any;
  @Input() companyData;
  @Input() isCreateNew;
  @Input() internshipId;
  @Input() selectedCountry;
  @ViewChild('images', { static: false }) uploadInput: any;
  @Output() onCancelEdit = new EventEmitter<null>();
  @Output() onReload = new EventEmitter<null>();
  myIdentityForm: UntypedFormGroup;
  private subs = new SubSink();
  today: Date;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  companyDetailForm: UntypedFormGroup;
  originalForm: object;
  listImages = [];
  isWaitingForResponse = false;
  isEntityCompany = false;
  internshipData: any;
  isHaveCompany = false;
  currSelectedCompanyId = '';
  currSelectedCompanyData: any;
  countries;
  countryList;
  filteredCountry = [];
  countriesSecond;
  countryListSecond;
  filteredCountrySecond = [];
  countryListFilter: Observable<any[]>;
  countriesFinance;
  countryListFinance;
  filteredCountryFinance = [];
  franceCountry = {
    code: 'FR',
    name: 'France',
  };
  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private internshipService: InternshipService,
    private schoolService: SchoolService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private companyService: CompanyService,
  ) {}

  ngOnInit() {
    this.initRegistrationForm();
    // this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      const dataCountry = _.cloneDeep(list);
      const indexFr = list.findIndex((lists) => lists.name === 'France');
      dataCountry.splice(indexFr, 1);
      dataCountry.unshift(this.franceCountry);
      this.countries = dataCountry;
      this.countryList = this.countries;
      this.countriesSecond = this.countries;
      this.countryListSecond = this.countries;
      this.countryListFilter = this.countries;
      this.filteredCountrySecond = this.countries;
    });
    this.getDataInternship();
  }

  filterCountrySecond() {
    if (this.companyDetailForm.get('country').value) {
      const searchString = this.companyDetailForm.get('country').value.toLowerCase().trim();
      this.filteredCountrySecond = this.countriesSecond.filter((country) => country.name.toLowerCase().trim().includes(searchString));
    } else {
      this.filteredCountrySecond = this.countriesSecond;
    }
  }

  // if the country selected is FR, disable all the uneditable fields(based on spec)
  disableNonEditableFieldsForFR() {
    console.log('disabling fields');
    const uneditableFormFieldList = [
      'country',
      'company_name',
      'no_RC',
      'type_of_industry',
      'capital',
      'type_of_company',
      'no_of_employee_in_france',
      'activity',
      'company_addresses',
    ];
    for (const field of uneditableFormFieldList) {
      this.companyDetailForm.get(field).disable();
    }
  }

  getDataInternship() {
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            if (resp.company_branch_id && resp.company_branch_id._id) {
              const activeCompany = this.internshipData.company_branch_id;
              this.currSelectedCompanyId = activeCompany ? activeCompany._id : null;
              this.currSelectedCompanyData = activeCompany ? activeCompany : null;
              if (this.currSelectedCompanyData && !this.currSelectedCompanyData.country) {
                this.currSelectedCompanyData.country = 'France';
              }

              if (
                activeCompany &&
                activeCompany.company_entity_id &&
                activeCompany.company_entity_id._id &&
                activeCompany.company_entity_id._id === activeCompany._id
              ) {
                this.isEntityCompany = true;
              }
              const control = this.companyAddressControls;
              for (let i = control.length - 1; i >= 0; i--) {
                this.deleteAddress(i);
              }
              for (let i = 0; i < this.currSelectedCompanyData.company_addresses.length; i++) {
                this.addAddress();
              }
              this.companyDetailForm.patchValue(this.currSelectedCompanyData);
              if (this.companyDetailForm.get('country').value === 'France' || this.isEntityCompany) {
                this.disableNonEditableFieldsForFR();
              }
            }
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
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
  initRegistrationForm() {
    this.companyDetailForm = this.fb.group({
      country: [null],
      company_name: [null, Validators.required],
      no_RC: [null],
      type_of_industry: [null, Validators.required],
      capital: [null],
      type_of_company: [null],
      no_of_employee_in_france: [null],
      activity: [null],
      description: [null],
      twitter_link: [null],
      instagram_link: [null],
      facebook_link: [null],
      youtube_link: [null],
      website_link: [null],
      video_link: [null],
      images: [null],
      company_addresses: this.fb.array([]),
    });
    this.addAddress();
    if (this.selectedCountry) {
      this.companyDetailForm.get('country').patchValue(this.selectedCountry.country);
    }
  }

  addAddress() {
    const addressForm = this.fb.group({
      address: ['', Validators.required],
      postal_code: ['', Validators.required],
      city: ['', Validators.required],
      department: ['', Validators.required],
      region: ['', Validators.required],
      country: [''],
      is_main_address: [false],
    });
    this.companyAddressControls.push(addressForm);
  }

  get companyAddressControls() {
    return this.companyDetailForm.controls['company_addresses'] as UntypedFormArray;
  }

  deleteImage(imageIndex) {
    this.listImages.splice(imageIndex, 1);
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  onFileChange(event) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        this.isWaitingForResponse = true;
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            if (resp) {
              this.isWaitingForResponse = false;
              console.log(resp);
              this.listImages.push({ s3_file_name: resp.file_url });
            } else {
              this.isWaitingForResponse = false;
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('ok'),
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            console.log('[Response BE][Error] : ', err);
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
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  filterCountry() {
    const searchString = this.myIdentityForm.get('country').value.toLowerCase().trim();
    this.filteredCountry = this.countries.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  identitySave() {
    console.log(this.companyDetailForm.value);
  }

  isFormChanged() {
    if (JSON.stringify(this.originalForm) !== JSON.stringify(this.companyDetailForm.value)) {
      this.internshipService.areChildrenFormValid = false;
      return false;
    }
    this.internshipService.areChildrenFormValid = true;
    return true;
  }

  cancelEdit() {
    this.isFormChanged() ? this.showUnsavedDataSwal() : this.onCancelEdit.emit();
  }

  deleteAddress(i) {
    this.companyAddressControls.removeAt(i);
  }

  showUnsavedDataSwal() {
    // warn user of unsaved form here
  }

  ngOnDestroy() {
    // this.subs.unsubscribe();
  }

  save() {
    this.companyDetailForm.get('images').patchValue(this.listImages);
    if (this.companyDetailForm.value) {
      // we format the address form array items to match the payload as it has not included several variables
      this.formatFormAddressList();
      const payload = this.companyDetailForm.getRawValue();

      if (!this.isCreateNew) {
        // Swal.fire({
        //   type: 'question',
        //   html: this.translate.instant('COMPANY_S5.TEXT'),
        //   confirmButtonText: this.translate.instant('COMPANY_S5.BUTTON_1'),
        //   cancelButtonText: this.translate.instant('COMPANY_S5.BUTTON_2'),
        //   showCancelButton: true,
        //   allowEscapeKey: false,
        //   allowOutsideClick: false,
        // }).then((action) => {
        //   if (action.value) {
        this.updateCompany(payload);
        // } else if (action.dismiss === Swal.DismissReason.cancel) {
        //   return;
        // }
        // });
      } else {
        this.createCompany(payload);
      }
      console.log('payload nya?', payload);
    }
  }

  formatFormAddressList() {
    // add the fields 'country' and 'is_main_address' to all the form group value of address
    const newAddressArray = this.companyDetailForm.get('company_addresses').value.map((address, index) => {
      const newEntry = Object.assign({}, address);
      newEntry.country = this.companyDetailForm.get('country').value;
      newEntry.postal_code = newEntry.postal_code ? newEntry.postal_code.toString() : '';
      newEntry.is_main_address = index === 0 ? true : false;
      return newEntry;
    });
    this.companyAddressControls.patchValue(newAddressArray);
  }

  createCompany(payload) {
    if (payload) {
      Swal.fire({
        type: 'question',
        html: this.translate.instant('INTERNSHIP_S5.TEXT', {
          company: payload.company_name ? payload.company_name : '',
          city:
            payload && payload.company_addresses && payload.company_addresses.length && payload.company_addresses[0].city
              ? payload.company_addresses[0].city
              : '',
          postcode:
            payload && payload.company_addresses && payload.company_addresses.length && payload.company_addresses[0].postal_code
              ? payload.company_addresses[0].postal_code
              : '',
        }),
        confirmButtonText: this.translate.instant('INTERNSHIP_S5.BUTTON_1'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S5.BUTTON_2'),
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((action) => {
        if (action.value) {
          payload['no_of_employee_in_france'] = payload.no_of_employee_in_france ? payload.no_of_employee_in_france.toString() : '';
          // this.subs.sink = this.companyService.createCompanyNonFrance(payload).subscribe(
          //   (resp) => {
          //     if (resp) {
          //       const type = 'create';
          //       console.log('create company non france', resp);
          //       this.connectingCompany(resp);
          //     }
          //   },
          //   (err) => {
          //     this.isWaitingForResponse = false;
          //     console.log('[Response BE][Error] : ', err);
          //     Swal.fire({
          //       type: 'info',
          //       title: this.translate.instant('SORRY'),
          //       text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          //       confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          //     });
          //   },
          // );
        }
      });
    }
  }

  updateCompany(payload) {
    if (payload) {
      payload['no_of_employee_in_france'] = payload.no_of_employee_in_france ? payload.no_of_employee_in_france.toString() : '';
      if (this.isEntityCompany) {
        // const requests = [this.companyService.updateCompanyEntity(this.currSelectedCompanyId, payload)];
        // this.subs.sink = forkJoin(requests).subscribe(
        //   (resp) => {
        //     if (resp) {
        //       Swal.fire({
        //         type: 'success',
        //         title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
        //         text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
        //         confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
        //         allowOutsideClick: false,
        //       }).then(() => {
        //         this.onReload.emit();
        //         this.candidateService.setStatusStepFour(true);
        //       });
        //     }
        //   },
        //   (err) => {
        //     this.isWaitingForResponse = false;
        //     console.log('[Response BE][Error] : ', err);
        //     Swal.fire({
        //       type: 'info',
        //       title: this.translate.instant('SORRY'),
        //       text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        //       confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        //     });
        //   },
        // );
      } else {
        const requests = [this.companyService.updateCompany(this.currSelectedCompanyId, payload)];
        this.subs.sink = forkJoin(requests).subscribe(
          (resp) => {
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
                text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
                confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
                allowOutsideClick: false,
              }).then(() => {
                this.onReload.emit();
                this.candidateService.setStatusStepFour(true);
              });
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            console.log('[Response BE][Error] : ', err);
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

  selectCountry(datas) {
    if (datas === 'France' && this.isCreateNew) {
      this.openDialogAddCompanyCountry();
    }
  }

  openDialogAddCompanyCountry() {
    // const dialogRef = this.dialog.open(AddCompanyDialogCountryComponent, {
    //   width: '600px',
    //   minHeight: '100px',
    //   data: {
    //     country: this.countries,
    //     isInternship: true,
    //     internshipData: this.internshipData,
    //   },
    //   autoFocus: false,
    //   disableClose: true,
    // });
    // dialogRef.afterClosed().subscribe((res: { country: string; case?: string; company_data?: any }) => {
    //   console.log(res);
    //   if (res) {
    //     if (res.country !== 'France') {
    //     } else {
    //       switch (res.case) {
    //         case 'case 1':
    //           this.candidateService.setStatusStepFour(true);
    //           break;
    //         case 'case 2':
    //           this.candidateService.setStatusStepFour(true);
    //           break;
    //         // continue adding case here if there is an action to do after swal closed...
    //         // ...
    //         case 'no_case':
    //           Swal.fire({
    //             type: 'success',
    //             title: this.translate.instant('COMPANY_S6.TITLE'),
    //             text: this.translate.instant('COMPANY_S6.TEXT'),
    //             confirmButtonText: this.translate.instant('COMPANY_S6.BUTTON_1'),
    //             allowEnterKey: false,
    //             allowEscapeKey: false,
    //             allowOutsideClick: false,
    //           }).then((action) => {
    //             if (action.value) {
    //               this.candidateService.setStatusStepFour(true);
    //               this.getDataInternship();
    //             }
    //           });
    //           break;
    //         case 'case_6':
    //           this.candidateService.setStatusStepFour(true);
    //           this.getDataInternship();
    //           break;
    //         default:
    //           break;
    //       }
    //     }
    //   }
    // });
  }

  // *************** Function to connecting school to company
  connectingCompany(datas) {
    // console.log('MAsuk sini?', datas, this.internshipData);
    if (
      this.internshipData &&
      this.internshipData.student_id &&
      this.internshipData.student_id.school &&
      this.internshipData.student_id.school._id
    ) {
      const schoolId = [this.internshipData.student_id.school._id];
      let activeCompany = null;
      if (this.internshipData.company_branch_id && this.internshipData.company_branch_id._id) {
        activeCompany = this.internshipData.company_branch_id;
      }
      this.subs.sink = this.companyService
        .connectSchoolToCompany(activeCompany ? activeCompany._id : datas.company._id, schoolId)
        .subscribe(
          (resp) => {
            // console.log(resp);
            this.updateStudent(datas);
          },
          (err) => {
            // console.log('[Company Data][Error] : ', err);
            if (err['message'].includes('GraphQL error: some school already connected.')) {
              this.updateStudent(datas);
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
    } else {
      this.updateStudent(datas);
    }
  }

  updateStudent(dataa) {
    // validation for main address
    const lang = this.translate.currentLang.toLowerCase();
    if (dataa && dataa.company && dataa.company._id) {
      const comp = {
        company: dataa.company._id,
        internship_id: this.internshipData._id,
        status: 'active',
        is_active: true,
      };
      const payload = {
        companies: [comp],
      };
      // console.log('Payload => ', comp);
      this.subs.sink = this.schoolService.updateStudent(this.internshipData.student_id._id, payload, lang).subscribe(
        (resp) => {
          if (resp) {
            const payloadIntern = {
              company_branch_id: dataa.company._id,
            };
            this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
              (resps) => {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('INTERNSHIPS_S4.TITLE'),
                  text: this.translate.instant('INTERNSHIPS_S4.TEXT'),
                  confirmButtonText: this.translate.instant('INTERNSHIPS_S4.BUTTON'),
                  allowOutsideClick: false,
                }).then(() => {
                  this.onReload.emit();
                  this.candidateService.setStatusStepFour(true);
                });
              },
              (err) => {
                // console.log('[Response BE][Error] : ', err);
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          }
        },
        (err) => {
          // console.log('[Response BE][Error] : ', err);
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
