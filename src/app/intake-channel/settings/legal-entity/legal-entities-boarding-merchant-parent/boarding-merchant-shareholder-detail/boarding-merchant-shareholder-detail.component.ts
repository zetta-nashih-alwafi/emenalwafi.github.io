import { removeSpaces } from 'app/service/customvalidator.validator';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-boarding-merchant-shareholder-detail',
  templateUrl: './boarding-merchant-shareholder-detail.component.html',
  styleUrls: ['./boarding-merchant-shareholder-detail.component.scss'],
})
export class BoardingMerchantShareholderDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Output() cancelTab: EventEmitter<boolean> = new EventEmitter();
  @Output() previousTab: EventEmitter<number> = new EventEmitter();
  @Output() continue: EventEmitter<number> = new EventEmitter();
  @Output() updateData: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;
  @ViewChild('fileUploadDocFront', { static: false }) fileUploaderDocFront: ElementRef;
  @ViewChild('fileUploadDocBack', { static: false }) fileUploaderDocBack: ElementRef;
  shareholderForm: UntypedFormGroup;
  firstForm: any;
  @Input() legalEntityId: any;
  private subs = new SubSink();
  scholarId: any;
  listCountry;
  cities = [];
  departments = [];
  regions = [];
  dialCodeList = [];
  identitificationList = [
    { name: 'Passport', value: 'PASSPORT' },
    { name: 'Driving License', value: 'DRIVINGLICENSE' },
    { name: 'Social Security', value: 'SOCIALSECURITY' },
    { name: 'Visa', value: 'VISA' },
    { name: 'ID', value: 'ID' },
  ];
  shareholderList = [
    { name: 'Owner', value: 'Owner' },
    { name: 'Controller', value: 'Controller' },
  ];
  isWaitingForResponse = false;
  isController: boolean = false;
  filteredRefDialCode: Observable<any[]>;
  dataEntity;
  listUploadDocumentPDF: any;
  selectedType: any;
  documentBack: string;
  documentFront: string;
  documentSingle: string;
  documentNameBack: string;
  documentNameFront: string;
  documentNameSingle: string;
  selectDocumentBack = false;
  selectDocumentFront = false;
  selectDocumentSingle = false;
  constructor(
    private router: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private admisssionService: AdmissionEntrypointService,
    private rncpTitleService: RNCPTitlesService,
    private financeService: FinancesService,
    private translate: TranslateService,
    private fileUploadService: FileUploadService,
    private utilService: UtilityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getDialCode();
    this.router.queryParams.subscribe((res) => {
      console.log('_res', res);
      if (res && res.scholarSeasonId) {
        this.scholarId = res.scholarSeasonId;
      }
    });
    this.getListIdentification();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getListIdentification();
    });
    this.getCountryCode();
  }

  getListIdentification() {
    this.identitificationList = [
      { name: this.translate.instant('Passport'), value: 'PASSPORT' },
      { name: this.translate.instant('Driving License'), value: 'DRIVINGLICENSE' },
      { name: this.translate.instant('Social Security'), value: 'SOCIALSECURITY' },
      { name: this.translate.instant('Visa'), value: 'VISA' },
      { name: this.translate.instant('ID'), value: 'ID' },
    ];
    this.shareholderList = [
      { name: this.translate.instant('Owner'), value: 'Owner' },
      { name: this.translate.instant('Controller'), value: 'Controller' },
    ];
  }

  ngOnChanges() {
    if (this.legalEntityId) {
    }
  }

  onWheel(event: Event) {
    event?.preventDefault();
}

  getOneLegalEntity() {
    if (this.legalEntityId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.getOneLegalEntity(this.legalEntityId).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            if (resp.online_payment_status === 'verification_in_progress' || resp.online_payment_status === 'publish') {
              this.shareholderFormArray.at(0).get('country').disable();
              this.shareholderFormArray.at(0).get('shareholder_type').disable();
              this.shareholderFormArray.at(0).get('shareholder_personal_data').disable();
            } else {
              this.shareholderFormArray.at(0).get('country').enable();
              this.shareholderFormArray.at(0).get('shareholder_type').enable();
              this.shareholderFormArray.at(0).get('shareholder_personal_data').enable();
            }

            if (resp.documents && resp.documents.length) {
              let found = [];
              resp.documents.filter((res) => {
                if (res.owner === 'Shareholder' && res.is_latest) {
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
                    this.shareholderFormArray.at(0).get('upload_document').patchValue(this.selectedType);

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
                  this.shareholderFormArray.at(0).get('upload_document').patchValue(this.selectedType);
                }
              }
            }

            this.shareholderForm.patchValue(resp);
            this.firstForm = _.cloneDeep(this.shareholderForm.value);
            this.dataEntity = resp;
            this.checkCondition(resp);
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
          this.filteredRefDialCode = this.shareholderFormArray
            .at(0)
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

  initForm() {
    this.shareholderForm = this.fb.group({
      onboard_step: ['shareholder'],
      account_holder_code: [null],
      file_name_front: [null],
      file_name_back: [null],
      file_name_single: [null],
      account_holder_details: this.fb.group({
        business_detail: this.fb.group({
          shareholders: this.fb.array([this.initShareHolderForm()]),
        }),
      }),
    });
    this.firstForm = _.cloneDeep(this.shareholderForm.value);
  }
  initShareHolderForm() {
    return this.fb.group({
      first_name: [null, Validators.required],
      gender: [null, Validators.required],
      last_name: [null, Validators.required],
      country: ['FR', Validators.required],
      shareholder_type: [null, Validators.required],
      postal_code: [null, Validators.required],
      city: [null, Validators.required],
      department: [null, Validators.required],
      region: [null, Validators.required],
      region_name: [null, Validators.required],
      state_or_province: [null],
      house_number_or_name: [null, Validators.required],
      street: [null, Validators.required],
      email: [null, [Validators.required, CustomValidators.email]],
      dial_code: ['+33'],
      full_phone_number: [null, [Validators.required, Validators.maxLength(14)]],
      job_title: [null],
      shareholder_personal_data: this.fb.group({
        date_of_birth: [null, Validators.required],
        nationality: ['FR', Validators.required],
        document_data: this.fb.array([this.initDocumentForm()]),
      }),
      shareholder_code: [null],
      upload_document: [null, Validators.required],
    });
  }
  initDocumentForm() {
    return this.fb.group({
      expiration_date: [null, Validators.required],
      issuer_country: ['FR', Validators.required],
      number: [null, Validators.required],
      type: [null, Validators.required],
    });
  }

  get shareholderFormArray() {
    return this.shareholderForm.get('account_holder_details').get('business_detail').get('shareholders') as UntypedFormArray;
  }

  getPostcodeData() {
    const country = this.shareholderFormArray.at(0).get('country').value;
    const postCode = this.shareholderFormArray.at(0).get('postal_code').value;

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

  onCancel() {
    this.cancelTab.emit(true);
  }

  onPrevious() {
    this.previousTab.emit(1);
  }

  onNext() {
    this.continue.emit(3);
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
      this.shareholderFormArray.at(0).get('city').setValue(this.cities[0]);
    }
    if (this.departments && this.departments.length) {
      this.shareholderFormArray.at(0).get('department').setValue(this.departments[0]);
    }
    if (this.regions && this.regions.length) {
      this.shareholderFormArray.at(0).get('region').setValue(this.regions[0]);
    }
    if (tempRegionNames && tempRegionNames.length) {
      this.shareholderFormArray.at(0).get('region_name').setValue(tempRegionNames[0]);
    }
  }

  checkFormValidity(): boolean {
    if (this.shareholderForm.invalid || this.checkDocument()) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.shareholderForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  updatedLegalEntities() {

    this.selectDocumentBack = true;
    this.selectDocumentFront = true;
    this.selectDocumentSingle = true;
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload();
    const id = this.legalEntityId;
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

    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.UpdateLegalEntity(payload, id).subscribe(
      (res) => {;
        if (res && res._id) {
          this.isWaitingForResponse = false;
          this.firstForm = _.cloneDeep(this.shareholderForm.value);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.financeService.setDataMerchantBoardingSaved(true);
            this.updateData.emit(true);
            this.onNext();
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

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.shareholderForm.value);
    if (firstForm === form) {
      this.financeService.setDataMerchantBoardingSaved(true);
      return true;
    } else {
      this.financeService.setDataMerchantBoardingSaved(false);
      return false;
    }
  }
  createPayload() {
    const form = _.cloneDeep(this.shareholderForm.value);
    form.account_holder_details.business_detail.shareholders[0].state_or_province = this.shareholderFormArray.at(0).get('region').value;
    form.account_holder_details.business_detail.shareholders[0].region_name = this.shareholderFormArray.at(0).get('region_name').value;
    form.account_holder_details.business_detail.shareholders[0].shareholder_personal_data.date_of_birth = moment(
      this.shareholderFormArray.at(0).get('shareholder_personal_data').get('date_of_birth').value,
    ).format('YYYY-MM-DD');
    form.account_holder_details.business_detail.shareholders[0].shareholder_personal_data.document_data[0].expiration_date = moment(
      this.shareholderFormArray.at(0).get('shareholder_personal_data').get('document_data').get('0').get('expiration_date').value,
    ).format('YYYY-MM-DD');
    form.onboard_step = 'shareholder';
    // form.account_holder_details.business_detail.signatories = [{ signatory_job_title: 'tests' }];
    if (form.account_holder_details.business_detail.shareholders[0].shareholder_type !== 'Controller') {
      form.account_holder_details.business_detail.shareholders[0].job_title = '';
    }
    form.account_holder_details.business_detail.shareholders[0].full_phone_number =
      this.shareholderFormArray.at(0).get('dial_code').value + this.shareholderFormArray.at(0).get('full_phone_number').value.toString();
    delete form.account_holder_details.business_detail.shareholders[0].dial_code;

    // dummy file
    delete form.account_holder_details.business_detail.shareholders[0].upload_document;
    delete form.file_name_front;
    delete form.file_name_back;
    delete form.file_name_single;
    return form;
  }

  checkIfController(value) {
    if (value.name === 'Owner') {
      this.isController = false;
      this.shareholderFormArray.at(0).get('job_title').disable();
    } else {
      this.isController = true;
      this.shareholderFormArray.at(0).get('job_title').enable();
    }
  }

  checkCondition(resp) {
    if (
      resp &&
      resp.account_holder_details &&
      resp.account_holder_details.business_detail &&
      resp.account_holder_details.business_detail.shareholders.length &&
      resp.account_holder_details.business_detail.shareholders[0].shareholder_type === 'Controller'
    ) {
      this.isController = true;
    } else {
      this.isController = false;
    }
    if (
      resp &&
      resp.account_holder_details &&
      resp.account_holder_details.business_detail &&
      resp.account_holder_details.business_detail.shareholders.length &&
      resp.account_holder_details.business_detail.shareholders[0].full_phone_number
    ) {
      if (this.dialCodeList) {
        const found = this.dialCodeList.find((dial) => {
          if (resp.account_holder_details.business_detail.shareholders[0].full_phone_number.includes(dial.dial_code)) {
            return dial;
          }
        });
        if (found) {
          this.shareholderFormArray.at(0).get('dial_code').patchValue(found.dial_code);
          let phone = _.cloneDeep(resp.account_holder_details.business_detail.shareholders[0].full_phone_number);
          phone = phone.replaceAll(found.dial_code, '');
          this.shareholderFormArray.at(0).get('full_phone_number').patchValue(phone);
          this.firstForm = _.cloneDeep(this.shareholderForm.value);
        }
      }
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
    this.selectDocumentSingle = true
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
              this.documentNameBack = file.name;
              this.fileUploaderDocBack.nativeElement = '';
              if (this.selectedType === 'ID_CARD') {
                this.shareholderFormArray.at(0).get('upload_document').patchValue('ID_CARD');
              }
              if (this.selectedType === 'DRIVING_LINCENCE') {
                this.shareholderFormArray.at(0).get('upload_document').patchValue('DRIVING_LINCENCE');
              }
              this.shareholderForm.get('file_name_back').patchValue(resp.s3_file_name);
            } else if (type === 'front') {
              this.selectDocumentFront = false;
              this.documentFront = resp.s3_file_name;
              this.documentNameFront = file.name;
              this.fileUploaderDocFront.nativeElement = '';
              if (this.selectedType === 'ID_CARD') {
                this.shareholderFormArray.at(0).get('upload_document').patchValue('ID_CARD');
              }
              if (this.selectedType === 'DRIVING_LINCENCE') {
                this.shareholderFormArray.at(0).get('upload_document').patchValue('DRIVING_LINCENCE');
              }
              this.shareholderForm.get('file_name_front').patchValue(resp.s3_file_name);
            } else {
              this.selectDocumentSingle = false;
              this.documentSingle = resp.s3_file_name;
              this.fileUploaderDoc.nativeElement = '';
              this.documentNameSingle = file.name;
              this.shareholderFormArray.at(0).get('upload_document').patchValue('PASSPORT');
              this.shareholderForm.get('file_name_single').patchValue(resp.s3_file_name);
            }
            // this.getSegmentFormarray().at(index).get('acceptance_pdf').patchValue(resp.s3_file_name);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          console.log('[Response BE][Error] : ', err);
          this.authService.postErrorLog(err);
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

  ngOnDestroy() {
    this.financeService.setDataMerchantBoardingSaved(true);
    this.subs.unsubscribe();
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

  selectType(value) {
    this.documentBack = '';
    this.documentSingle = '';
    this.documentFront = '';
    this.selectedType = value;
    console.log(this.selectedType);
  }

  validationPhoneNumber(event) {
    if (event.target.value && event.target.value.length === 14) {
      return false;
    }
  }
}
