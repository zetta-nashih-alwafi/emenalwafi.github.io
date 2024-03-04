import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CompanyService } from 'app/service/company/company.service';
import { InternshipService } from 'app/service/internship/internship.service';
import { SchoolService } from 'app/service/schools/school.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-add-company-internship-fr-dialog',
  templateUrl: './add-company-internship-fr-dialog.component.html',
  styleUrls: ['./add-company-internship-fr-dialog.component.scss'],
})
export class AddCompanyInternshipFrDialogComponent implements OnInit {
  @ViewChild('siret', { static: false }) siretInput: ElementRef;
  private subs = new SubSink();
  addNewCompanyCountryDialog: UntypedFormGroup;

  countryListFilter: Observable<any[]>;
  showSiret = true;
  optionDefault = {
    code: 'all',
    name: 'All',
  };

  firsTime = true;
  isUserOperator = false;
  isUserAcadir = false;
  isUserCRM = false;
  franceCountry = {
    code: 'FR',
    name: 'France',
  };
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<AddCompanyInternshipFrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private companyServ: CompanyService,
    private permissions: NgxPermissionsService,
    private utilService: UtilityService,
    private schoolService: SchoolService,
    private userService: AuthService,
    private internshipService: InternshipService,
    public translate: TranslateService,
  ) {}

  ngOnInit() {
    if (this.data && this.data.isInternship) {
      const indexFr = this.data.country.findIndex((list) => list.name === 'France');
      this.data.country.splice(indexFr, 1);
      this.data.country.unshift(this.franceCountry);
      console.log(this.data);
    } else {
      const indexFr = this.data.findIndex((list) => list.name === 'France');
      this.data.splice(indexFr, 1);
      this.data.unshift(this.franceCountry);
      console.log(this.data);
    }
    this.firsTime = true;
    this.isUserAcadir = !!this.permissions.getPermission('Academic Director');
    this.isUserOperator = this.utilService.isUserEntityOPERATOR();
    this.currentUser = this.getCurrentUser();
    console.log(this.currentUser);
    this.initForm();
    this.initFilter();
  }

  getCurrentUser() {
    return this.userService.getLocalStorageUser();
  }

  initForm() {
    this.addNewCompanyCountryDialog = this.fb.group({
      country: ['France', Validators.required],
      siret: [null, [Validators.required, Validators.minLength(14), Validators.maxLength(14), Validators.pattern('^[0-9]*$')]],
    });
  }

  initFilter() {
    this.countryListFilter = this.addNewCompanyCountryDialog.get('country').valueChanges.pipe(
      startWith(''),
      map((searchText) => {
        if (this.firsTime) {
          searchText = searchText ? searchText : 'France';
          this.firsTime = false;
          if (this.data && this.data.isInternship) {
            return this.data.country;
          } else {
            return this.data;
          }
        } else {
          if (this.data && this.data.isInternship) {
            return this.data.country
              .filter((country) => (country ? country.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
          } else {
            return this.data
              .filter((country) => (country ? country.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
          }
        }
      }),
    );
  }

  countrySelected(value) {
    if (value.code === 'FR') {
      this.showSiret = true;
      this.addNewCompanyCountryDialog
        .get('siret')
        .setValidators([Validators.required, Validators.minLength(14), Validators.maxLength(14), Validators.pattern('^[0-9]*$')]);
      this.addNewCompanyCountryDialog.updateValueAndValidity();
    } else {
      this.showSiret = false;
      this.addNewCompanyCountryDialog.get('siret').setErrors(null);
      this.addNewCompanyCountryDialog.get('siret').clearValidators();
      this.addNewCompanyCountryDialog.updateValueAndValidity();
      const payload = {
        country: this.addNewCompanyCountryDialog.get('country').value,
        case: 'non_fr',
      };
      this.dialogRef.close(payload);
    }
  }

  save() {
    if (this.showSiret) {
      const payload = {
        country: 'France',
        form: this.addNewCompanyCountryDialog.value,
      };
      // this.siretInput.nativeElement.focus();
      // call api to check siret
      // this.subs.sink = this.companyServ.validateCompanyInternshipFrench(payload.form.siret, 'france', false).subscribe((res) => {
      //   console.log('_result', res);
      //   if (res) {
      //     switch (res.message) {
      //       case 'case 1': {
      //         this.showBranchAlreadyInDBConfirmationSwal(res, payload);
      //         break;
      //       }
      //       case 'case 2':
      //       case 'case 3':
      //       case 'case 4':
      //         this.showBranchAlreadyInDBConfirmationSwal(res, payload);
      //         break;
      //       case 'case 5':
      //         Swal.fire({
      //           type: 'warning',
      //           text: this.translate.instant('ADD_COMPANY_SWAL.COMPANY_S3.TEXT'),
      //           confirmButtonText: this.translate.instant('ADD_COMPANY_SWAL.COMPANY_S3.BUTTON_1'),
      //           allowEnterKey: false,
      //           allowEscapeKey: false,
      //           allowOutsideClick: false,
      //         }).then(() => {
      //           return;
      //         });
      //         break;
      //       case 'case 6':
      //         this.showBranchAlreadyInDBConfirmationSwal(res, payload);
      //         break;
      //       default:
      //         this.showBranchAlreadyInDBConfirmationSwal(res, payload);
      //         break;
      //     }
      //   }
      // });
    } else {
      const payload = {
        country: this.addNewCompanyCountryDialog.get('country').value,
      };
      // this.dialogRef.close(payload);
    }
  }

  // *************** Function to connecting school to company
  connectingCompany(data) {
    console.log('masuk kesini atau enggak?', this.data);
    if (
      this.data &&
      this.data.internshipData &&
      this.data.internshipData.student_id &&
      this.data.internshipData.student_id.school &&
      this.data.internshipData.student_id.school._id
    ) {
      const schoolId = [this.data.internshipData.student_id.school._id];
      let activeCompany = null;
      if (this.data.internshipData.company_branch_id && this.data.internshipData.company_branch_id._id) {
        activeCompany = this.data.internshipData.company_branch_id;
      }
      this.subs.sink = this.companyServ
        .connectSchoolToCompany(activeCompany ? activeCompany._id : data.company_data._id, schoolId)
        .subscribe(
          (resp) => {
            // console.log(resp);
            this.updateCompany(data);
          },
          (err) => {
            // console.log('[Company Data][Error] : ', err);
            if (err['message'].includes('GraphQL error: some school already connected.')) {
              this.updateCompany(data);
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              }).then(() => {
                this.dialogRef.close(data);
              });
            }
          },
        );
    } else {
      this.updateCompany(data);
    }
  }

  updateCompany(data) {
    // validation for main address
    const lang = this.translate.currentLang.toLowerCase();
    if (data && data.company_data && data.company_data._id) {
      const comp = {
        company: data.company_data._id,
        internship_id: this.data.internshipData._id,
        status: 'active',
        is_active: true,
      };
      const payload = {
        companies: [comp],
      };
      // console.log('Payload => ', comp);
      this.subs.sink = this.schoolService.updateStudent(this.data.internshipData.student_id._id, payload, lang).subscribe(
        (resp) => {
          if (resp) {
            const payloadIntern = {
              company_branch_id: data.company_data._id,
            };
            this.subs.sink = this.internshipService.updateInternship(this.data.internshipData._id, payloadIntern).subscribe(
              (resps) => {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('COMPANY_S6.TITLE'),
                  text: this.translate.instant('COMPANY_S6.TEXT'),
                  confirmButtonText: this.translate.instant('COMPANY_S6.BUTTON_1'),
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogRef.close(data);
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
          console.log('[Response BE][Error] : ', err);
          const payloadIntern = {
            company_branch_id: data.company_data._id,
          };
          this.subs.sink = this.internshipService.updateInternship(this.data.internshipData._id, payloadIntern).subscribe(
            (resps) => {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('COMPANY_S6.TITLE'),
                text: this.translate.instant('COMPANY_S6.TEXT'),
                confirmButtonText: this.translate.instant('COMPANY_S6.BUTTON_1'),
                allowOutsideClick: false,
              }).then(() => {
                this.dialogRef.close(data);
              });
            },
            (erer) => {
              // console.log('[Response BE][Error] : ', erer);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        },
      );
    } else {
      this.dialogRef.close(data);
    }
  }

  showConnectSchoolToCompanyConfirmationSwal(company_data: object, payload) {
    Swal.fire({
      type: 'question',
      html: this.translate.instant('ADD_COMPANY_SWAL.COMPANY_S2.TEXT', {
        company_name: company_data['company_name'] ? company_data['company_name'] : company_data['companies']['company_name'],
      }),
      confirmButtonText: this.translate.instant('ADD_COMPANY_SWAL.COMPANY_S2.BUTTON_1'),
      cancelButtonText: this.translate.instant('ADD_COMPANY_SWAL.COMPANY_S2.BUTTON_2'),
      showCancelButton: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((action) => {
      if (action.value) {
        this.saveCompany(payload.form.siret);
      } else if (action.dismiss === Swal.DismissReason.cancel) {
        const invalidControl = this.siretInput.nativeElement;
        if (invalidControl) {
          invalidControl.focus();
        }
        return;
      }
    });
  }

  showBranchAlreadyInDBConfirmationSwal(company_data: any, payload) {
    console.log('company_data', payload, company_data);
    const addresses = company_data.companies && company_data.companies.length ? true : false;
    Swal.fire({
      type: 'question',
      html: this.translate.instant('INTERNSHIP_S5.TEXT', {
        company: company_data['company_name'] ? company_data['company_name'] : addresses ? company_data.companies[0].company_name : '',
        city:
          addresses &&
          company_data.companies[0].company_addresses &&
          company_data.companies[0].company_addresses.length &&
          company_data.companies[0].company_addresses[0].city
            ? company_data.companies[0].company_addresses[0].city
            : '',
        postcode:
          addresses &&
          company_data.companies[0].company_addresses &&
          company_data.companies[0].company_addresses.length &&
          company_data.companies[0].company_addresses[0].postal_code
            ? company_data.companies[0].company_addresses[0].postal_code
            : '',
      }),
      confirmButtonText: this.translate.instant('INTERNSHIP_S5.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_S5.BUTTON_2'),
      showCancelButton: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((action) => {
      if (action.value) {
        this.saveCompany(payload.form.siret);
      } else if (action.dismiss === Swal.DismissReason.cancel) {
        const invalidControl = this.siretInput.nativeElement;
        if (invalidControl) {
          invalidControl.focus();
        }
        return;
      }
    });
  }

  saveCompany(payload) {
    // this.subs.sink = this.companyServ.validateCompanyInternshipFrench(payload, 'france', true).subscribe((res) => {
    //   if (res) {
    //     const data = {
    //       country: this.addNewCompanyCountryDialog.get('country').value,
    //       case: 'no_case',
    //       company_data: res.companies[0],
    //     };
    //     if (this.data && this.data.isInternship) {
    //       this.connectingCompany(data);
    //     } else {
    //       this.dialogRef.close(data);
    //     }
    //   }
    // });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
