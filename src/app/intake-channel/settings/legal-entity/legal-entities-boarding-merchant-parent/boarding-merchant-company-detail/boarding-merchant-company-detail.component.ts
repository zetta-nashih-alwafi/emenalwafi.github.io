import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SubSink } from 'subsink';
import _ from 'lodash';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CustomValidators } from 'ng2-validation';
import { validatorOnlyContainsSpaceorEnterOnly } from 'app/service/customvalidator.validator';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-boarding-merchant-company-detail',
  templateUrl: './boarding-merchant-company-detail.component.html',
  styleUrls: ['./boarding-merchant-company-detail.component.scss'],
})
export class BoardingMerchantCompanyDetailComponent implements OnInit, OnDestroy, OnChanges {
  private subs = new SubSink();
  @Output() cancelTab: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<number> = new EventEmitter();
  @Output() addLegalId: EventEmitter<number> = new EventEmitter();
  @Output() updateData: EventEmitter<boolean> = new EventEmitter();
  @Input() legalEntityId: any;

  listCountry;
  formCompanyDetail: UntypedFormGroup;
  firstForm: any;
  cities = [];
  departments = [];
  regions = [];
  scholarId;
  isWaitingForResponse = false;
  dialCodeList = [];
  filteredRefDialCode: Observable<any[]>;
  dataEntity;
  filteredRegions: any;
  isNeedUploadLive: boolean = false;
  constructor(
    private admisssionService: AdmissionEntrypointService,
    private rncpTitleService: RNCPTitlesService,
    private fb: UntypedFormBuilder,
    private financeService: FinancesService,
    private translate: TranslateService,
    private router: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.router.queryParams.subscribe((res) => {
      console.log('_res', res);
      if (res && res.scholarSeasonId) {
        this.scholarId = res.scholarSeasonId;
      }
    });
    this.getOneLegalEntity();
    this.getCountryCode();
  }

  ngOnChanges() {
    // if (this.legalEntityId) {
    //   this.getOneLegalEntity();
    // }
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
            this.getDialCode(resp);
            this.dataEntity = resp;
            if (resp.is_need_upload_live) {
              this.isNeedUploadLive = resp.is_need_upload_live;
            } else {
              this.isNeedUploadLive = false;
            }
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
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  patchValue(form) {
    if (this.dialCodeList.length) {
      const findDialCode = this.dialCodeList.find((res) => res.code === form.account_holder_details.phone_number.phone_country_code);
      const payload = {
        onboard_step: 'company',
        immatriculation: form.immatriculation,
        official_website: form.account_holder_details.web_address,
        email: form.account_holder_details.email,
        siret: form.account_holder_details.business_detail.registration_number,
        legal_business_name: form.account_holder_details.business_detail.legal_business_name,
        country: form.account_holder_details.account_holder_address.country,
        phone_number: form.account_holder_details.phone_number.phone_number,
        legal_entities: form.legal_entity_name,
        type: form.legal_entity,
        street: form.account_holder_details.account_holder_address.street,
        number: form.account_holder_details.account_holder_address.house_number_or_name,
        postal_code: form.account_holder_details.account_holder_address.postal_code,
        city: form.account_holder_details.account_holder_address.city,
        department: form.account_holder_details.account_holder_address.department,
        region: form.account_holder_details.account_holder_address.state_or_province,
        region_name: form.account_holder_details.account_holder_address.region_name,
        scholar_season_id: this.scholarId,
        dial_code: findDialCode.dial_code,
        account_holder_code: form.account_holder_code,
      };
      if (this.dataEntity.online_payment_status === 'verification_in_progress' || this.dataEntity.online_payment_status === 'publish') {
        this.formCompanyDetail.get('country').disable();
      } else {
        this.formCompanyDetail.get('country').enable();
      }
      this.formCompanyDetail.patchValue(payload);
      this.firstForm = _.cloneDeep(this.formCompanyDetail.value);
      this.isWaitingForResponse = false;
    }
  }

  initForm() {
    this.formCompanyDetail = this.fb.group({
      legal_entities: ['', Validators.required],
      type: [null, Validators.required],
      siret: [null, Validators.required],
      immatriculation: [null, Validators.required],
      email: [null, [Validators.required, CustomValidators.email]],
      phone_number: [null, [Validators.required, Validators.maxLength(14)]],
      official_website: [null, Validators.required],
      street: ['', [Validators.required, validatorOnlyContainsSpaceorEnterOnly]],
      number: [null, Validators.required],
      postal_code: [null, Validators.required],
      country: ['FR', Validators.required],
      city: [null, Validators.required],
      department: [null, Validators.required],
      region_name: [null, Validators.required],
      region: [null],
      scholar_season_id: [this.scholarId],
      legal_business_name: [null],
      dial_code: ['+33'],
      account_holder_code: [null],
    });
    this.firstForm = _.cloneDeep(this.formCompanyDetail.value);
  }

  onCancel() {
    this.cancelTab.emit(true);
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
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  getDialCode(resp) {
    this.subs.sink = this.financeService.getDialCodeNumber().subscribe(
      (res) => {
        if (res) {
          this.dialCodeList = res;
          this.patchValue(resp);
          this.filteredRefDialCode = this.formCompanyDetail.get('dial_code').valueChanges.pipe(
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
    const country = this.formCompanyDetail.get('country').value;
    const postCode = this.formCompanyDetail.get('postal_code').value;

    if (postCode && postCode.length > 3 && country && country.toLowerCase() === 'fr') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, 'france').subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressDropdown(resp);
          }
        },
        (error) => {
          this.authService.postErrorLog(error);
          if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          }
        },
      );
    }
  }

  checkFormValidity(): boolean {
    if (this.formCompanyDetail.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.formCompanyDetail.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  getDataCompanyBySiret() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    const siret = this.formCompanyDetail.get('siret').value.toString();
    this.subs.sink = this.financeService.getSchoolAddressBySiretNumber(siret).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          this.formCompanyDetail.get('legal_business_name').setValue(resp.company_name);
          this.createLegalEntities();
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Siret number not found') {
          Swal.fire({
            title: this.translate.instant('MERCHANT_S1.TITLE'),
            html: this.translate.instant('MERCHANT_S1.TEXT'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('MERCHANT_S1.BUTTON'),
          });
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
      this.formCompanyDetail.get('city').setValue(this.cities[0]);
    }
    if (this.departments && this.departments.length) {
      this.formCompanyDetail.get('department').setValue(this.departments[0]);
    }
    if (this.regions && this.regions.length) {
      this.formCompanyDetail.get('region').setValue(this.regions[0]);
    }
    if (tempRegionNames && tempRegionNames.length) {
      this.formCompanyDetail.get('region_name').setValue(tempRegionNames[0]);
    }

    this.filteredRegions = this.regions[0];
  }

  createLegalEntities() {
    const payload = this.createPayload();
    // temporary update for checking PCI add isNeedUploadLive
    if (this.dataEntity && this.dataEntity.is_need_upload_live) {
      payload['is_need_upload_live'] = this.dataEntity.is_need_upload_live;
      payload['account_code'] = this.dataEntity.account_code;
    }
    if (this.legalEntityId && !this.isNeedUploadLive) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.UpdateLegalEntity(payload, this.legalEntityId).subscribe(
        (res) => {
          if (res && res._id) {
            this.isWaitingForResponse = false;
            this.addLegalId.emit(res._id);
            this.firstForm = _.cloneDeep(this.formCompanyDetail.value);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.updateData.emit(true);
              this.onNext();
              this.financeService.setDataMerchantBoardingSaved(true);
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
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    } else {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.CreateLegalEntity(payload).subscribe(
        (res) => {
          if (res && res._id) {
            this.isWaitingForResponse = false;
            this.addLegalId.emit(res._id);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.updateData.emit(true);
              this.onNext();
              this.financeService.setDataMerchantBoardingSaved(true);
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
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.formCompanyDetail.value);
    if (firstForm === form) {
      this.financeService.setDataMerchantBoardingSaved(true);
      return true;
    } else {
      this.financeService.setDataMerchantBoardingSaved(false);
      return false;
    }
  }

  createPayload() {
    const form = _.cloneDeep(this.formCompanyDetail.value);
    const websiteName = this.checkWebsiteName(form.official_website);
    const payload = {
      onboard_step: 'company',
      legal_entity_name: form.legal_entities,
      immatriculation: form.immatriculation,
      account_holder_details: {
        full_phone_number: form.dial_code + form.phone_number.toString(),
        web_address: websiteName,
        email: form.email,
        business_detail: {
          registration_number: form.siret.toString(),
          legal_business_name: form.legal_business_name,
        },
        account_holder_address: {
          country: form.country,
          city: form.city,
          department: form.department,
          postal_code: form.postal_code,
          street: form.street,
          state_or_province: form.region,
          region_name: form.region_name,
          house_number_or_name: form.number,
        },
      },
      scholar_season_id: this.scholarId,
      legal_entity: form.type,
      account_holder_code: form.account_holder_code,
      online_payment_status: 'not_submit',
    };
    console.log('_pay', payload);
    return payload;
  }

  checkWebsiteName(value) {
    const hasHttps = value.substr(0, 8) === 'https://';
    const formatHttps = 'https://';
    if (hasHttps) {
      return value;
    } else {
      return formatHttps + value;
    }
  }

  onNext() {
    this.continue.emit(1);
  }

  validationPhoneNumber(event) {
    if (event.target.value && event.target.value.length === 14) {
      return false;
    }
  }

  ngOnDestroy() {
    this.financeService.setDataMerchantBoardingSaved(true);
    this.subs.unsubscribe();
  }
}
