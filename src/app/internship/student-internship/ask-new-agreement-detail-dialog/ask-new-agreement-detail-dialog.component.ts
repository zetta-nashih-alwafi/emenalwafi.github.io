import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'app/service/company/company.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-ask-new-agreement-detail-dialog',
  templateUrl: './ask-new-agreement-detail-dialog.component.html',
  styleUrls: ['./ask-new-agreement-detail-dialog.component.scss'],
})
export class AskNewAgreementDetailDialogComponent implements OnInit {
  @ViewChild('images', { static: false }) uploadInput: any;
  private subs = new SubSink();
  companyDetailForm: UntypedFormGroup;
  listImages = [];
  isWaitingForResponse = false;
  isFRSelected = false;

  countryListFilter: Observable<any[]>;
  optionDefault = {
    code: 'all',
    name: 'All',
  };

  firstTime = true;

  constructor(
    public dialogRef: MatDialogRef<AskNewAgreementDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private fileUploadService: FileUploadService,
    private translate: TranslateService,
    private companyServ: CompanyService,
    private utilService: UtilityService,
  ) {}

  ngOnInit() {
    this.firstTime = true;
    this.initForm();
    this.initFilter();
    if (this.data.isEdit && this.data.hasOwnProperty('branch_data')) {
      this.patchFormValues();
      this.checkIfFR();
      if (this.isFRSelected) {
        this.disableNonEditableFieldsForFR();
      }
    }
  }

  initForm() {
    this.companyDetailForm = this.fb.group({
      country: [this.data.countrySelect],
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
      video_link: [null],
      images: [null],
      company_addresses: this.fb.array([]),
    });
    this.addAddress();
  }

  //check if country selected is FR
  checkIfFR() {
    this.isFRSelected = this.utilService.simplifyRegex(this.data.countrySelect) === 'france' || this.data.branch_data.no_RC;
  }

  //if the country selected is FR, disable all the uneditable fields(based on spec)
  disableNonEditableFieldsForFR() {
    if (this.isFRSelected) {
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
  }

  get companyAddressControls() {
    return this.companyDetailForm.controls['company_addresses'] as UntypedFormArray;
  }

  addAddress() {
    const addressForm = this.fb.group({
      address: [''],
      postal_code: [''],
      city: [''],
      department: [''],
      region: [''],
      country: [''],
      is_main_address: [false],
    });
    this.companyAddressControls.push(addressForm);
  }

  deleteAddress(addressIndex: number) {
    this.companyAddressControls.removeAt(addressIndex);
  }

  initFilter() {
    // console.log('coutry list are:', this.data.list);
    this.countryListFilter = this.companyDetailForm.get('country').valueChanges.pipe(
      startWith(''),
      map((searchText) => {
        if (this.firstTime) {
          searchText = searchText ? searchText : this.data.countrySelect;
          this.firstTime = false;
        }
        return this.data.list
          .filter((country) => (country && country.name ? country.name.toLowerCase().includes(searchText.toLowerCase()) : false))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      }),
    );
  }

  patchFormValues() {
    this.companyDetailForm.patchValue(this.data.branch_data);
  }

  countrySelected(value) {
    // console.log(value);
    if (value.code === 'FR') {
      this.dialogRef.close('FR');
    }
  }

  save() {
    this.companyDetailForm.get('images').patchValue(this.listImages);
    if (this.companyDetailForm.value) {
      //we format the address form array items to match the payload as it has not included several variables
      this.formatFormAddressList();
      const payload = this.companyDetailForm.value;

      if (this.data.isEdit && this.data.hasOwnProperty('branch_data')) {
        this.updateCompany(payload);
      } else {
        this.createCompany(payload);
      }
      // console.log('payload nya?', payload);
    }
  }

  formatFormAddressList() {
    //add the fields 'country' and 'is_main_address' to all the form group value of address
    const newAddressArray = this.companyAddressControls.value.map((address, index) => {
      let newEntry = Object.assign({}, address);
      newEntry.country = this.companyDetailForm.get('country').value;
      newEntry.is_main_address = index === 0 ? true : false;
      return newEntry;
    });
    this.companyAddressControls.patchValue(newAddressArray);
  }

  createCompany(payload: object) {
    if (payload) {
      // this.subs.sink = this.companyServ.createCompanyNonFrance(payload).subscribe(
      //   (resp) => {
      //     if (resp) {
      //       console.log('create company non france', resp);
      //       this.dialogRef.close(resp);
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
  }

  updateCompany(payload: object) {
    if (payload) {
      this.subs.sink = this.companyServ.updateCompany(this.data.branch_data._id, payload).subscribe(
        (resp) => {
          if (resp) {
            this.dialogRef.close(resp);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
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

  closeDialog() {
    this.dialogRef.close();
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  onFileChange(event) {
    // console.log(event);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        this.isWaitingForResponse = true;
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (resp) => {
            if (resp) {
              this.uploadInput.nativeElement.value = '';
              this.isWaitingForResponse = false;
              // console.log(resp);
              this.listImages.push({ s3_file_name: resp.file_url });
            } else {
              this.isWaitingForResponse = false;
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
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

  deleteImage(imageIndex) {
    this.listImages.splice(imageIndex, 1);
  }
}
