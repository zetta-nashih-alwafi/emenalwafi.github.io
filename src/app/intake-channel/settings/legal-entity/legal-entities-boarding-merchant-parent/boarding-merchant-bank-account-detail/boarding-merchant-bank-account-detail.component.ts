import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import Swal from 'sweetalert2';
import { FinancesService } from 'app/service/finance/finance.service';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-boarding-merchant-bank-account-detail',
  templateUrl: './boarding-merchant-bank-account-detail.component.html',
  styleUrls: ['./boarding-merchant-bank-account-detail.component.scss'],
})
export class BoardingMerchantBankAccountDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Output() cancelTab: EventEmitter<boolean> = new EventEmitter();
  @Output() previousTab: EventEmitter<number> = new EventEmitter();
  @Output() continue: EventEmitter<number> = new EventEmitter();
  @Output() updateData: EventEmitter<boolean> = new EventEmitter();
  @Input() legalEntityId: any;
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  private subs = new SubSink();
  bankAccountForm: UntypedFormGroup;
  firstForm: any;
  scholarId: any;
  listCountry;
  cities = [];
  departments = [];
  regions = [];
  isWaitingForResponse = false;
  dataEntity: any;
  listUploadDocumentPDF: any;
  selectedType: any;
  dataDocument = [];
  selectUploadDocumentPDF = false;

  constructor(
    private fb: UntypedFormBuilder,
    private router: ActivatedRoute,
    private admisssionService: AdmissionEntrypointService,
    private rncpTitleService: RNCPTitlesService,
    private financeService: FinancesService,
    private translate: TranslateService,
    private fileUploadService: FileUploadService,
    private utilService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.router.queryParams.subscribe((res) => {
      if (res && res.scholarSeasonId) {
        this.scholarId = res.scholarSeasonId;
      }
    });
    this.getCountryCode();
    this.getOneLegalEntity();
  }

  ngOnChanges() {
    if (this.legalEntityId) {
      this.getOneLegalEntity();
    }
  }

  getOneLegalEntity() {
    // console.log('legalEntityId', this.legalEntityId);
    if (this.legalEntityId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.getOneLegalEntity(this.legalEntityId).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            if (
              resp.online_payment_status &&
              (resp.online_payment_status === 'verification_in_progress' || resp.online_payment_status === 'publish')
            ) {
              this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('currency_code').disable();
              this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('country_code').disable();
            } else {
              this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('currency_code').enable();
              this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('country_code').enable();
            }
            if (resp.documents && resp.documents.length) {
              let found;
              resp.documents.find((res) => {
                if (res.owner === 'Bank' && res.is_latest) {
                  found = res;
                }
              });
              if (found) {
                this.dataDocument = [];
                this.selectedType = found?.document_type;
                this.bankAccountForm.get('upload_document').patchValue(this.selectedType);
                this.bankAccountForm.get('file_name').patchValue(found?.s3_file_name);
                this.listUploadDocumentPDF = found?.s3_file_name;
                const dataDocument = {
                  s3_file_name: found?.s3_file_name,
                  document_name: found?.document_name,
                  document_type: 'BANK_STATEMENT',
                };
                this.dataDocument.push(dataDocument);
              }
            }
            this.bankAccountForm.patchValue(resp);
            this.firstForm = _.cloneDeep(this.bankAccountForm.value);
            this.dataEntity = resp;
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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

  initForm() {
    this.bankAccountForm = this.fb.group({
      onboard_step: ['bank_account'],
      account_holder_code: [null],
      account_holder_details: this.fb.group({
        bank_account_details: this.fb.array([this.initBankForm()]),
      }),
      urrsaf_number: [null, Validators.required],
      urrsaf_city: [null, Validators.required],
      tva_number: [null, Validators.required],
      bic: [null, Validators.required],
      upload_document: [null, Validators.required],
      file_name: [null],
    });
    this.firstForm = _.cloneDeep(this.bankAccountForm.value);
  }

  initBankForm() {
    return this.fb.group({
      owner_name: [null, Validators.required],
      country_code: ['FR', Validators.required],
      currency_code: ['EUR', Validators.required],
      iban: [null, [Validators.required, this.noWhitespaceValidator]],
      bank_name: [null, Validators.required],
      postal_code: [null, Validators.required],
      city: [null, Validators.required],
      department: [null, Validators.required],
      region: [null, Validators.required],
      region_name: [null, Validators.required],
      owner_gender: [null, Validators.required],
      bank_address: [null, Validators.required],
      owner_country_code: ['FR', Validators.required],
      bank_account_uuid: [null],
    });
  }

  get bankFormArray() {
    return this.bankAccountForm.get('account_holder_details').get('bank_account_details') as UntypedFormArray;
  }

  getCountryCode() {
    this.subs.sink = this.admisssionService.getAllCountryCodes().subscribe(
      (res) => {
        if (res) {
          this.listCountry = res;
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }
  onCancel() {
    this.cancelTab.emit(true);
  }

  onPrevious() {
    this.previousTab.emit(0);
  }

  onNext() {
    this.continue.emit(2);
  }
  getPostcodeData() {
    const country = this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('country_code').value;
    const postCode = this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('postal_code').value;

    if (postCode && postCode.length > 3 && country && country.toLowerCase() === 'fr') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, 'france').subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp);
          }
        },
        (error) => {
          this.authService.postErrorLog(error);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        },
      );
    }
  }

  setAddressDropdown(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];
    let tempRegionNames = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        if (address && address.city) {
          tempCities.push(address.city);
        }
        if (address && address.department) {
          tempDepartments.push(address.department);
        }
        if (address && address.region_code) {
          tempRegions.push(address.region_code);
        }
        if (address && address.province) {
          tempRegionNames.push(address.province);
        }
      });
    }

    this.cities = _.uniq(tempCities);
    this.departments = _.uniq(tempDepartments);
    this.regions = _.uniq(tempRegions);
    tempRegionNames = _.uniq(tempRegionNames);
    if (this.cities && this.cities.length) {
      this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('city').setValue(this.cities[0]);
    }
    if (this.departments && this.departments.length) {
      this.bankAccountForm
        .get('account_holder_details')
        .get('bank_account_details')
        .get('0')
        .get('department')
        .setValue(this.departments[0]);
    }
    if (this.regions && this.regions.length) {
      this.bankAccountForm.get('account_holder_details').get('bank_account_details').get('0').get('region').setValue(this.regions[0]);
    }
    if (tempRegionNames && tempRegionNames.length) {
      this.bankAccountForm
        .get('account_holder_details')
        .get('bank_account_details')
        .get('0')
        .get('region_name')
        .setValue(tempRegionNames[0]);
    }
  }

  checkFormValidity(): boolean {
    if (this.bankAccountForm.invalid || !this.listUploadDocumentPDF) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.bankAccountForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  updatedLegalEntities() {
    this.selectUploadDocumentPDF = true;
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    payload.onboard_step = 'bank_account';
    payload.online_payment_status = 'not_submit';
    payload.upload_document = this.dataDocument;
    const id = this.legalEntityId;
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.UpdateLegalEntity(payload, id).subscribe(
      (res) => {
        if (res && res._id) {
          this.isWaitingForResponse = false;
          this.firstForm = _.cloneDeep(this.bankAccountForm.value);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.updateData.emit(true);
            this.financeService.setDataMerchantBoardingSaved(true);
            this.onNext();
          });
        } else {
          this.isWaitingForResponse = false;
          let listOfIssue = '';
          if (res && res.error && res.error.length) {
            listOfIssue += '<ul style="text-align: start; margin-left: 20px">';
            res.error = _.uniqBy(res.error, 'error_description');
            res.error.forEach((block) => {
              if (block && block && block.error_description && block.field_name) {
                listOfIssue += `<li> ${block.field_name} : ${block.error_description} </li>`;
              }
            });
            listOfIssue += '</ul>';
            Swal.fire({
              type: 'info',
              title: this.translate.instant('MERCHANT_S2.TITLE'),
              html: this.translate.instant('MERCHANT_S2.TEXT', { listOfIssue: listOfIssue }),
              confirmButtonText: this.translate.instant('MERCHANT_S2.BUTTON'),
            });
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

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.bankAccountForm.value);
    if (firstForm === form) {
      this.financeService.setDataMerchantBoardingSaved(true);
      return true;
    } else {
      this.financeService.setDataMerchantBoardingSaved(false);
      return false;
    }
  }
  createPayload() {
    const form = _.cloneDeep(this.bankAccountForm.value);
    form.owner_country_code = form.country_code;
    delete form.upload_document;
    delete form.file_name;
    // console.log('_form', form);
    return form;
  }

  ngOnDestroy() {
    this.financeService.setDataMerchantBoardingSaved(true);
    this.subs.unsubscribe();
  }

  openUploadWindow() {
    this.selectUploadDocumentPDF = true;
    this.fileUploaderDoc.nativeElement.click();
  }

  chooseFile(fileInput: Event) {
    const acceptable = ['pdf', 'jpg'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    this.dataDocument = [];

    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.selectUploadDocumentPDF = false;
            this.listUploadDocumentPDF = '';
            // this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(resp.s3_file_name);
            // console.log('tfoor 0',this.addDiplomaForm.getRawValue());
            const dataDocument = {
              s3_file_name: resp.s3_file_name,
              document_name: file.name,
              document_type: 'BANK_STATEMENT',
            };
            this.dataDocument.push(dataDocument);
            this.listUploadDocumentPDF = resp.s3_file_name;
            this.bankAccountForm.get('upload_document').patchValue('BANK_STATEMENT');
            this.bankAccountForm.get('file_name').patchValue(resp.s3_file_name);
            this.fileUploaderDoc.nativeElement = '';
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: 'OK',
          });
        },
      );
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png, .pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  noWhitespaceValidator(control: UntypedFormControl) {
    if (control.value !== null) {
      if ((control.value as string).indexOf(' ') >= 0) {
        return { whitespace: true };
      }
    }
    return null;
  }

  deletePDF() {
    this.selectUploadDocumentPDF = true;
    this.listUploadDocumentPDF = '';
  }

  selectType(value) {
    this.selectedType = value;
    // console.log(this.selectedType);
  }
}
