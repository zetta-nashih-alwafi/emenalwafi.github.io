import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-boarding-merchant-signatory-detail',
  templateUrl: './boarding-merchant-signatory-detail.component.html',
  styleUrls: ['./boarding-merchant-signatory-detail.component.scss'],
})
export class BoardingMerchantSignatoryDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() legalEntityId: any;
  @Output() continue: EventEmitter<number> = new EventEmitter();
  @Output() previousTab: EventEmitter<number> = new EventEmitter();
  @Output() cancelTab: EventEmitter<boolean> = new EventEmitter();
  @Output() updateData: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @ViewChild('fileUploadDocFront', { static: false }) fileUploaderDocFront: ElementRef;
  @ViewChild('fileUploadDocBack', { static: false }) fileUploaderDocBack: ElementRef;

  private subs = new SubSink();

  signatoryForm: UntypedFormGroup;
  firstForm: any;
  scholarId: any;
  listCountry;
  cities = [];
  departments = [];
  regions = [];
  isWaitingForResponse = false;
  dialCodeList = [];
  filteredRefDialCode: Observable<any[]>;
  dataEntity: any;
  isSaved: boolean;
  listUploadDocumentPDF: any;
  selectedType: any;
  documentBack: string;
  documentFront: string;
  documentSingle: string;
  documentNameSingle: any;
  documentNameFront: any;
  documentNameBack: any;
  passExpiredDate: boolean = true;
  selectDocumentBack = false;
  selectDocumentFront = false;
  selectDocumentSingle = false;

  constructor(
    private admisssionService: AdmissionEntrypointService,
    private route: Router,
    private router: ActivatedRoute,
    private rncpTitleService: RNCPTitlesService,
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    private fileUploadService: FileUploadService,
    private utilService: UtilityService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getDialCode();
    this.router.queryParams.subscribe((res) => {
      if (res && res.scholarSeasonId) {
        this.scholarId = res.scholarSeasonId;
      }
    });
    this.getCountryCode();
  }

  ngOnChanges() {
    if (this.legalEntityId) {
      this.getDialCode();
    }
  }

  getOneLegalEntity() {
    if (this.legalEntityId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.getOneLegalEntity(this.legalEntityId).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            if (resp.online_payment_status === 'verification_in_progress' || resp.online_payment_status === 'publish') {
              this.signatoryFormArray.at(0).get('nationality').disable();
              this.signatoryFormArray.at(0).get('signatory_address').get('country').disable();
              this.signatoryFormArray.at(0).get('signatory_personal_data').get('date_of_birth').disable();
            } else {
              this.signatoryFormArray.at(0).get('nationality').enable();
              this.signatoryFormArray.at(0).get('signatory_address').get('country').enable();
              this.signatoryFormArray.at(0).get('signatory_personal_data').get('date_of_birth').enable();
            }

            if (resp.documents && resp.documents.length) {
              let found = [];
              resp.documents.filter((res) => {
                if (res.owner === 'Signatory' && res.is_latest) {
                  found.push(res);
                }
              });
              if (found) {
                if (found.length > 1 && found.length === 2) {
                  if (
                    found[0].document_type === 'ID_CARD_FRONT' ||
                    found[0].document_type === 'DRIVING_LICENCE_FRONT' ||
                    found[0].document_type === 'ID_CARD_BACK' ||
                    found[0].document_type === 'DRIVING_LICENCE_BACK'
                  ) {
                    if (found[0].document_type === 'ID_CARD_FRONT' || found[0].document_type === 'ID_CARD_BACK') {
                      this.selectedType = 'ID_CARD';
                    }
                    if (found[0].document_type === 'DRIVING_LICENCE_FRONT' || found[0].document_type === 'DRIVING_LICENCE_BACK') {
                      this.selectedType = 'DRIVING_LINCENCE';
                    }
                    this.signatoryFormArray.at(0).get('upload_document').patchValue(this.selectedType);
                    if (found[0].document_type === 'ID_CARD_FRONT' || found[0].document_type === 'DRIVING_LICENCE_FRONT') {
                      this.documentFront = found[0].s3_file_name;
                      this.documentNameFront = found[0].s3_file_name;
                    }

                    if (found[1].document_type === 'ID_CARD_FRONT' || found[1].document_type === 'DRIVING_LICENCE_FRONT') {
                      this.documentFront = found[1].s3_file_name;
                      this.documentNameFront = found[1].s3_file_name;
                    }

                    if (found[0].document_type === 'ID_CARD_BACK' || found[0].document_type === 'DRIVING_LICENCE_BACK') {
                      this.documentBack = found[0].s3_file_name;
                      this.documentNameBack = found[0].s3_file_name;
                    }

                    if (found[1].document_type === 'ID_CARD_BACK' || found[1].document_type === 'DRIVING_LICENCE_BACK') {
                      this.documentBack = found[1].s3_file_name;
                      this.documentNameBack = found[1].s3_file_name;
                    }
                  }
                }

                if (found.length === 1) {
                  this.selectedType = 'PASSPORT';
                  this.documentNameSingle = found[0].s3_file_name;
                  this.documentSingle = found[0].s3_file_name;
                  this.signatoryFormArray.at(0).get('upload_document').patchValue(this.selectedType);
                }
              }
            }

            this.signatoryForm.patchValue(resp);
            this.firstForm = _.cloneDeep(this.signatoryForm.value);
            this.dataEntity = resp;
            if (
              resp &&
              resp.account_holder_details &&
              resp.account_holder_details.business_detail &&
              resp.account_holder_details.business_detail.signatories.length &&
              resp.account_holder_details.business_detail.signatories[0].signatory_address.full_phone_number
            ) {
              this.isSaved = true;
              if (this.dialCodeList) {
                const found = this.dialCodeList.find((dial) => {
                  if (
                    resp.account_holder_details.business_detail.signatories[0].signatory_address.full_phone_number.includes(dial.dial_code)
                  ) {
                    return dial;
                  }
                });
                if (found) {
                  this.signatoryFormArray.at(0).get('signatory_address').get('dial_code').patchValue(found.dial_code);
                  let phone = _.cloneDeep(resp.account_holder_details.business_detail.signatories[0].signatory_address.full_phone_number);
                  phone = phone.replaceAll(found.dial_code, '');
                  this.signatoryFormArray.at(0).get('signatory_address').get('full_phone_number').patchValue(phone);
                  this.firstForm = _.cloneDeep(this.signatoryForm.value);
                }
              }
            }

            if (resp.pci_expired_date && resp.pci_expired_date.date) {
              this.checkExpiredDate();
            } else {
              this.passExpiredDate = true;
            }
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
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
    this.signatoryForm = this.fb.group({
      onboard_step: ['signatory'],
      account_holder_code: [null],
      file_name_front: [null],
      file_name_back: [null],
      file_name_single: [null],
      account_holder_details: this.fb.group({
        business_detail: this.fb.group({
          signatories: this.fb.array([this.initSignatoriesForm()]),
        }),
      }),
    });
    this.firstForm = _.cloneDeep(this.signatoryForm.value);
  }

  initSignatoriesForm() {
    return this.fb.group({
      signatory_code: [null],
      signatory_personal_data: this.fb.group({
        date_of_birth: [null, Validators.required],
      }),
      department: [null, Validators.required],
      nationality: ['FR', Validators.required],
      signatory_job_title: [null, Validators.required],
      signatory_address: this.fb.group({
        country: ['FR', Validators.required],
        postal_code: [null, Validators.required],
        city: [null, Validators.required],
        state_or_province: [null],
        region_name: [null],
        street: [null, Validators.required],
        dial_code: ['+33'],
        full_phone_number: [null, Validators.required],
        email: [null, Validators.required],
        house_number_or_name: [null, Validators.required],
      }),
      signatory_name: this.fb.group({
        first_name: [null, Validators.required],
        gender: [null, Validators.required],
        last_name: [null, Validators.required],
      }),
      upload_document: [null, Validators.required],
    });
  }
  get signatoryFormArray() {
    return this.signatoryForm.get('account_holder_details').get('business_detail').get('signatories') as UntypedFormArray;
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

  getDialCode() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getDialCodeNumber().subscribe(
      (res) => {
        if (res) {
          this.dialCodeList = res;
          this.getOneLegalEntity();
          this.filteredRefDialCode = this.signatoryFormArray
            .at(0)
            .get('signatory_address')
            .get('dial_code')
            .valueChanges.pipe(
              startWith(''),
              map((searchTxt: string) =>
                this.dialCodeList.filter((data) => {
                  if (searchTxt) {
                    if (data && data.dial_code) {
                      return data.dial_code.includes(searchTxt);
                    } else {
                      return true;
                    }
                  }
                  return true;
                }),
              ),
            );
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

  getPostcodeData() {
    const country = this.signatoryFormArray.at(0).get('signatory_address').get('country').value;
    const postCode = this.signatoryFormArray.at(0).get('signatory_address').get('postal_code').value;

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
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.region_code);
        tempRegionNames.push(address.province);
      });
    }

    this.cities = _.uniq(tempCities);
    this.departments = _.uniq(tempDepartments);
    this.regions = _.uniq(tempRegions);
    tempRegionNames = _.uniq(tempRegionNames);
    if (this.cities && this.cities.length) {
      this.signatoryFormArray.at(0).get('signatory_address').get('city').setValue(this.cities[0]);
    }
    if (this.departments && this.departments.length) {
      this.signatoryFormArray.at(0).get('department').setValue(this.departments[0]);
    }
    if (this.regions && this.regions.length) {
      this.signatoryFormArray.at(0).get('signatory_address').get('state_or_province').setValue(this.regions[0]);
    }
    if (tempRegionNames && tempRegionNames.length) {
      this.signatoryFormArray.at(0).get('signatory_address').get('region_name').setValue(tempRegionNames[0]);
    }
  }

  onCancel() {
    this.cancelTab.emit(true);
  }

  unpublished() {
    const payload = this.createPayload();
    const id = this.legalEntityId;
    this.isWaitingForResponse = true;
    payload.online_payment_status = 'not_submit';
    if (this.selectedType === 'PASSPORT') {
      const dataDocument = {
        s3_file_name: this.documentSingle,
        document_name: this.documentNameSingle,
        document_type: 'PASSPORT',
      };
      let document = [];
      document.push(dataDocument);
      payload.upload_document = document;
    } else {
      const dataDocumentFront = {
        s3_file_name: this.documentFront,
        document_name: this.documentNameFront,
      };
      const dataDocumentBack = {
        s3_file_name: this.documentBack,
        document_name: this.documentNameBack,
      };
      let resultFront = {};
      let resultBack = {};
      let document = [];
      if (this.selectedType === 'ID_CARD') {
        resultFront = { ...dataDocumentFront, document_type: 'ID_CARD_FRONT' };
        resultBack = { ...dataDocumentBack, document_type: 'ID_CARD_BACK' };
        document.push(resultFront);
        document.push(resultBack);
      }
      if (this.selectedType === 'DRIVING_LINCENCE') {
        resultFront = { ...dataDocumentFront, document_type: 'DRIVING_LICENCE_FRONT' };
        resultBack = { ...dataDocumentBack, document_type: 'DRIVING_LICENCE_BACK' };
        document.push(resultFront);
        document.push(resultBack);
      }
      payload.upload_document = document;
    }
    this.subs.sink = this.financeService.UpdateLegalEntity(payload, id).subscribe(
      (res) => {
        if (res && res._id) {
          this.isWaitingForResponse = false;
          this.firstForm = _.cloneDeep(this.signatoryForm.value);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.financeService.setDataMerchantBoardingSaved(true);
            this.onCancel();
          });
        } else {
          this.isWaitingForResponse = false;
          let listOfIssue = '';
          if (res && res.error && res.error.length) {
            listOfIssue += '<ul style="text-align: start; margin-left: 20px">';
            res.error = _.uniqBy(res.error, 'error_description');
            res.error.forEach((block) => {
              if (block && block && block.error_description) {
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
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  checkFormValidity(): boolean {
    if (this.signatoryForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.signatoryForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  updatedLegalEntities(isContinue?: boolean) {
    this.selectDocumentBack = true;
    this.selectDocumentFront = true;
    this.selectDocumentSingle = true;
    if (this.checkFormValidity() && this.checkDocument()) {
      return;
    }
    const payload = this.createPayload();
    const id = this.legalEntityId;
    this.isWaitingForResponse = true;
    payload.online_payment_status = 'pci_not_complete';
    if (this.selectedType === 'PASSPORT') {
      const dataDocument = {
        s3_file_name: this.documentSingle,
        document_name: this.documentNameSingle,
        document_type: 'PASSPORT',
      };
      let document = [];
      document.push(dataDocument);
      payload.upload_document = document;
    } else {
      const dataDocumentFront = {
        s3_file_name: this.documentFront,
        document_name: this.documentNameFront,
      };
      const dataDocumentBack = {
        s3_file_name: this.documentBack,
        document_name: this.documentNameBack,
      };
      let resultFront = {};
      let resultBack = {};
      let document = [];
      if (this.selectedType === 'ID_CARD') {
        resultFront = { ...dataDocumentFront, document_type: 'ID_CARD_FRONT' };
        resultBack = { ...dataDocumentBack, document_type: 'ID_CARD_BACK' };
        document.push(resultFront);
        document.push(resultBack);
      }
      if (this.selectedType === 'DRIVING_LINCENCE') {
        resultFront = { ...dataDocumentFront, document_type: 'DRIVING_LICENCE_FRONT' };
        resultBack = { ...dataDocumentBack, document_type: 'DRIVING_LICENCE_BACK' };
        document.push(resultFront);
        document.push(resultBack);
      }
      payload.upload_document = document;
    }
    this.subs.sink = this.financeService.UpdateLegalEntity(payload, id).subscribe(
      (res) => {
        if (res && res._id) {
          this.isWaitingForResponse = false;
          this.firstForm = _.cloneDeep(this.signatoryForm.value);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.financeService.setDataMerchantBoardingSaved(true);
            this.isSaved = true;
            if (isContinue) {
              this.continue.emit(4);
            }
          });
        } else {
          this.isWaitingForResponse = false;
          let listOfIssue = '';
          if (res && res.error && res.error.length) {
            listOfIssue += '<ul style="text-align: start; margin-left: 20px">';
            res.error = _.uniqBy(res.error, 'error_description');
            res.error.forEach((block) => {
              if (block && block && block.error_description) {
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
        this.authService.postErrorLog(err);
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
    const form = JSON.stringify(this.signatoryForm.value);
    if (firstForm === form) {
      this.financeService.setDataMerchantBoardingSaved(true);
      return true;
    } else {
      this.financeService.setDataMerchantBoardingSaved(false);
      return false;
    }
  }

  createPayload() {
    const form = _.cloneDeep(this.signatoryForm.value);
    form.account_holder_details.business_detail.signatories[0].signatory_personal_data.date_of_birth = moment(
      this.signatoryFormArray.at(0).get('signatory_personal_data').get('date_of_birth').value,
    ).format('YYYY-MM-DD');
    form.account_holder_details.business_detail.signatories[0].signatory_address.full_phone_number =
      this.signatoryFormArray.at(0).get('signatory_address').get('dial_code').value +
      this.signatoryFormArray.at(0).get('signatory_address').get('full_phone_number').value;
    delete form.account_holder_details.business_detail.signatories[0].signatory_address.dial_code;
    console.log('_form', form);
    form.onboard_step = 'signatory';
    delete form.account_holder_details.business_detail.signatories[0].upload_document;
    delete form.file_name_front;
    delete form.file_name_back;
    delete form.file_name_single;
    return form;
  }

  submitVerification() {
    if (this.checkFormValidity() && this.checkDocument()) {
      return;
    }
    this.isWaitingForResponse = true;
    let return_url = window.location.href;

    if (return_url.includes('&openLegalEntities=true')) {
      return_url = window.location.href;
    } else if (return_url.includes('legalEntityId')) {
      const urlReplace = return_url.replace(`&legalEntityId=${this.legalEntityId}`, '&openLegalEntities=true');
      return_url = urlReplace;
    } else {
      return_url = return_url + '&openLegalEntities=true';
    }

    const payload = {
      online_payment_status: 'verification_in_progress',
    };
    const payloadPCI = {
      account_holder_code: this.firstForm.account_holder_code,
      return_url,
    };

    if (this.passExpiredDate) {
      this.subs.sink = this.financeService.UpdateLegalEntityNotPublish(payload, this.legalEntityId, false).subscribe((res) => {
        if (res) {
          this.subs.sink = this.financeService.GetPCIQuestionairUrl(payloadPCI).subscribe(
            (resp) => {
              if (resp) {
                this.isWaitingForResponse = false;
                window.open(resp.redirect_url, '_blank');
                this.onCancel();
              } else {
                this.isWaitingForResponse = false;
                let listOfIssue = '';
                if (resp && resp.error && resp.error.length) {
                  listOfIssue += '<ul style="text-align: start; margin-left: 20px">';
                  resp.error = _.uniqBy(resp.error, 'error_description');
                  resp.error.forEach((block) => {
                    if (block && block && block.error_description) {
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
              this.authService.postErrorLog(err);
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      });
    } else {
      const payload = this.createPayload();
      payload.online_payment_status = 'verification_in_progress';
      if (this.selectedType === 'PASSPORT') {
        const dataDocument = {
          s3_file_name: this.documentSingle,
          document_name: this.documentNameSingle,
          document_type: 'PASSPORT',
        };
        let document = [];
        document.push(dataDocument);
        payload.upload_document = document;
      } else {
        const dataDocumentFront = {
          s3_file_name: this.documentFront,
          document_name: this.documentNameFront,
        };
        const dataDocumentBack = {
          s3_file_name: this.documentBack,
          document_name: this.documentNameBack,
        };
        let resultFront = {};
        let resultBack = {};
        let document = [];
        if (this.selectedType === 'ID_CARD') {
          resultFront = { ...dataDocumentFront, document_type: 'ID_CARD_FRONT' };
          resultBack = { ...dataDocumentBack, document_type: 'ID_CARD_BACK' };
          document.push(resultFront);
          document.push(resultBack);
        }
        if (this.selectedType === 'DRIVING_LINCENCE') {
          resultFront = { ...dataDocumentFront, document_type: 'DRIVING_LICENCE_FRONT' };
          resultBack = { ...dataDocumentBack, document_type: 'DRIVING_LICENCE_BACK' };
          document.push(resultFront);
          document.push(resultBack);
        }
        payload.upload_document = document;
      }
      this.subs.sink = this.financeService.UpdateLegalEntity(payload, this.legalEntityId).subscribe(
        (res) => {
          if (res && res._id) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.financeService.setDataMerchantBoardingSaved(true);
              this.onCancel();
            });
          } else {
            this.isWaitingForResponse = false;
            let listOfIssue = '';
            if (res && res.error && res.error.length) {
              listOfIssue += '<ul style="text-align: start; margin-left: 20px">';
              res.error = _.uniqBy(res.error, 'error_description');
              res.error.forEach((block) => {
                if (block && block && block.error_description) {
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
          this.authService.postErrorLog(err);
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

  openUploadWindowFront() {
    this.selectDocumentFront = true;
    this.fileUploaderDocFront.nativeElement.click();
  }

  openUploadWindowBack() {
    this.selectDocumentBack = true;
    this.fileUploaderDocBack.nativeElement.click();
  }

  openUploadWindow() {
    this.selectDocumentSingle = true;
    this.fileUploaderDoc.nativeElement.click();
  }

  chooseFile(fileInput: Event, type) {
    const acceptable = ['pdf', 'jpg'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
    if (acceptable.includes(fileType)) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            if (type === 'back') {
              this.selectDocumentBack = false;
              this.documentBack = resp.s3_file_name;
              this.fileUploaderDocBack.nativeElement = '';
              this.documentNameBack = file.name;
              this.fileUploaderDocBack.nativeElement = '';
              if (this.selectedType === 'ID_CARD') {
                this.signatoryFormArray.at(0).get('upload_document').patchValue('ID_CARD');
              }
              if (this.selectedType === 'DRIVING_LINCENCE') {
                this.signatoryFormArray.at(0).get('upload_document').patchValue('DRIVING_LINCENCE');
              }
              this.signatoryForm.get('file_name_single').patchValue(resp.s3_file_name);
            } else if (type === 'front') {
              this.selectDocumentFront = false;
              this.documentFront = resp.s3_file_name;
              this.fileUploaderDocFront.nativeElement = '';
              this.documentNameFront = file.name;
              if (this.selectedType === 'ID_CARD') {
                this.signatoryFormArray.at(0).get('upload_document').patchValue('ID_CARD');
              }
              if (this.selectedType === 'DRIVING_LINCENCE') {
                this.signatoryFormArray.at(0).get('upload_document').patchValue('DRIVING_LINCENCE');
              }
              this.signatoryForm.get('file_name_single').patchValue(resp.s3_file_name);
            } else {
              this.selectDocumentSingle = false;
              this.documentSingle = resp.s3_file_name;
              this.fileUploaderDoc.nativeElement = '';
              this.documentNameSingle = file.name;
              this.signatoryFormArray.at(0).get('upload_document').patchValue('PASSPORT');
              this.signatoryForm.get('file_name_single').patchValue(resp.s3_file_name);
            }
            // this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(resp.s3_file_name);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          console.log('[Response BE][Error] : ', err);
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

  deleteBack() {
    this.selectDocumentBack = true;
    this.documentBack = '';
  }

  deleteFront() {
    this.selectDocumentFront = true;
    this.documentFront = '';
  }

  deleteSingle() {
    this.selectDocumentSingle = true;
    this.documentSingle = '';
  }

  selectType(value) {
    this.documentBack = '';
    this.documentSingle = '';
    this.documentFront = '';
    this.selectedType = value;
    console.log(this.selectedType);
  }

  checkDocument() {
    if (this.selectedType === 'PASSPORT') {
      if (this.documentSingle && this.documentNameSingle) {
        return false;
      } else {
        return true;
      }
    } else if (this.selectedType === 'ID_CARD' || this.selectedType === 'DRIVING_LINCENCE') {
      if (this.documentFront && this.documentBack && this.documentNameBack && this.documentNameFront) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  checkExpiredDate() {
    const expiredDate = moment(this.dataEntity.pci_expired_date.date, 'DD/MM/YYYY');
    const todayDate = moment(new Date(), 'DD/MM/YYYY');
    if (todayDate.isBefore(expiredDate)) {
      this.passExpiredDate = false;
    } else {
      this.passExpiredDate = true;
    }
  }

  onPrevious() {
    this.previousTab.emit(2);
  }

  ngOnDestroy() {
    this.financeService.setDataMerchantBoardingSaved(true);
    this.subs.unsubscribe();
  }
}
