import { DatePipe } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'app/service/core/core.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-legal-entity-dialog',
  templateUrl: './add-legal-entity-dialog.component.html',
  styleUrls: ['./add-legal-entity-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class AddLegalEntityDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isWaitingForResponse = false;

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  countryList;
  filteredCountry = [];

  cities = [];
  filteredCities = [];

  departments = [];
  filteredDepartments = [];

  regions = [];
  filteredRegions = [];

  countriesBank;
  countryBankList;
  filteredCountryBank = [];
  filteredBank = [];

  citiesBank = [];
  filteredCitiesBank = [];

  departmentsBank = [];
  filteredDepartmentsBank = [];

  regionsBank = [];
  filteredRegionsBank = [];

  campusList = [];
  listObjective = [];
  titles = [];
  classes = [];
  levels = [];
  scholars = [{ name: '21-22' }];
  school = [];
  currencyList = [];
  dataSchool = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  bank = [
    'BNP Paribas',
    'Credit Agricole',
    'BPCE',
    'Societe Generale',
    'Groupe Crédit Mutuel',
    'Crédit Cooperatif',
    'La Banque Postale',
    'Crédit du Nord',
    'AXA Banque',
    'Banque Palatine',
    'HSBC France',
    'CIC Banque Transatlantique',
    'BRED Banque Populaire',
  ];
  dummyData = [];
  campusData = [];
  scholarSeasonId: any;
  levelData = [];

  showForm = false;
  hideButton = false;
  showExisting = false;
  showPatchForm: boolean = false;
  listLegalEntity: any[];
  listLegalEntityCtrl = new UntypedFormControl(null);

  constructor(
    public dialogRef: MatDialogRef<AddLegalEntityDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private financeService: FinancesService,
    private cdr: ChangeDetectorRef,
    private rncpTitleService: RNCPTitlesService,
    private schoolService: SchoolService,
    private router: ActivatedRoute,
    public coreService: CoreService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.router.queryParams.subscribe((res) => {
      if (res && res.scholarSeasonId) {
        this.scholarSeasonId = res.scholarSeasonId;
      }
    });
    this.dialogRef.updateSize('750px');
    this.filteredBank = this.bank;
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list;
      this.countryList = list;
      this.countriesBank = list;
      this.countryBankList = list;
    });
    this.today = new Date();
    this.getAllDataSchool();
    this.iniVerificationForm();
    if (this.data) {
      this.hideButton = true;
      this.showForm = true;
      this.patchFormValue();
    }
    this.getAllLegalEntitiesDropdown();
  }

  patchFormValue() {
    if (this.data) {
      if (this.data.headquarter_address) {
        if (
          this.data.headquarter_address.postal_code &&
          this.data.headquarter_address.country &&
          this.data.headquarter_address.country.toLowerCase() === 'france'
        ) {
          this.subs.sink = this.rncpTitleService
            .getFilteredZipCode(this.data.headquarter_address.postal_code, this.data.headquarter_address.country)
            .subscribe(
              (addresData) => {
                this.setAddressHeadquartersDropdown(addresData);
              },
              (err) => {
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
        this.getPostcodeHeadquartersData(false);
      }
      if (this.data.bank) {
        if (this.data.bank.postal_code && this.data.bank.country && this.data.bank.country.toLowerCase() === 'france') {
          this.subs.sink = this.rncpTitleService.getFilteredZipCode(this.data.bank.postal_code, this.data.bank.country).subscribe(
            (addresData) => {
              this.setAddressBankDropdown(addresData);
            },
            (err) => {
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
        this.getPostcodeBankData(false);
      }
      const payload = {
        city: this.data.city,
        financial_representative: {
          civility: this.data.financial_representative ? this.data.financial_representative.civility : null,
          first_name: this.data.financial_representative ? this.data.financial_representative.first_name : null,
          last_name: this.data.financial_representative ? this.data.financial_representative.last_name : null,
          email: this.data.financial_representative ? this.data.financial_representative.email : null,
        },
        immatriculation: this.data.immatriculation,
        legal_representative: {
          civility: this.data.legal_representative ? this.data.legal_representative.civility : null,
          first_name: this.data.legal_representative ? this.data.legal_representative.first_name : null,
          last_name: this.data.legal_representative ? this.data.legal_representative.last_name : null,
          email: this.data.legal_representative ? this.data.legal_representative.email : null,
        },
        name: this.data.name,
        siret: this.data.siret,
        tva_number: this.data.tva_number,
        urrsaf_number: this.data.urrsaf_number,
        headquarter_address: {
          number: this.data.headquarter_address ? this.data.headquarter_address.number : null,
          street: this.data.headquarter_address ? this.data.headquarter_address.street : null,
          postal_code: this.data.headquarter_address ? this.data.headquarter_address.postal_code : null,
          country: this.data.headquarter_address ? this.data.headquarter_address.country : null,
          city: this.data.headquarter_address ? this.data.headquarter_address.city : null,
          department: this.data.headquarter_address ? this.data.headquarter_address.department : null,
          region: this.data.headquarter_address ? this.data.headquarter_address.region : null,
        },
        bank: {
          name: this.data.bank ? this.data.bank.name : null,
          iban: this.data.bank ? this.data.bank.iban : null,
          bic: this.data.bank ? this.data.bank.bic : null,
          postal_code: this.data.bank ? this.data.bank.postal_code : null,
          city: this.data.bank ? this.data.bank.city : null,
          department: this.data.bank ? this.data.bank.department : null,
          region: this.data.bank ? this.data.bank.region : null,
          address: this.data.bank ? this.data.bank.address : null,
          country: this.data.bank ? this.data.bank.country : null,
        },
      };
      // console.log(this.data);
      this.dialogRef.updateSize('1000px');
      this.identityForm.patchValue(payload);
    }
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      scholar_season_id: [this.scholarSeasonId],
      name: [null],
      immatriculation: [null],
      siret: [null],
      legal_representative: this.fb.group({
        civility: [null, Validators.required],
        first_name: [null],
        last_name: [null],
        email: [null],
      }),
      financial_representative: this.fb.group({
        civility: [null, Validators.required],
        first_name: [null],
        last_name: [null],
        email: [null],
      }),
      bank: this.fb.group({
        name: [null],
        iban: [null],
        bic: [null],
        postal_code: [null, Validators.pattern('^[0-9]*$')],
        city: [null],
        department: [null],
        region: [null],
        address: [null],
        country: ['France'],
      }),
      headquarter_address: this.fb.group({
        number: [null, Validators.pattern('^[0-9]*$')],
        street: [null],
        postal_code: [null, Validators.pattern('^[0-9]*$')],
        country: ['France'],
        city: [null],
        department: [null],
        region: [null],
      }),
      urrsaf_number: [null, Validators.pattern('^[0-9]*$')],
      tva_number: [null, Validators.pattern('^[0-9]*$')],
      city: [null],
    });
  }

  submitVerification() {
    // const dataSchool = this.dummyData.filter((list) => list.status === true).map((temp) => temp._id);
    // const dataCampus = this.campusData.filter((list) => list.status === true).map((temp) => temp.name);
    // const dataLevels = this.levelData.filter((list) => list.status === true).map((temp) => temp.name);
    // this.identityForm.get('school_id').setValue(dataSchool);
    // this.identityForm.get('campus').setValue(dataCampus);
    // this.identityForm.get('level').setValue(dataLevels);
    const payload = _.cloneDeep(this.identityForm.value);
    payload.scholar_season_id = this.scholarSeasonId;
    if (this.showExisting) {
      payload.is_from_duplicate = true;
    } else {
      payload.is_from_duplicate = false;
    }
    // console.log('this.identityForm', payload);
    if (this.data && !this.showExisting) {
      this.subs.sink = this.financeService.UpdateLegalEntity(payload, this.data._id).subscribe(
        (resp) => {
          // console.log('Edit Payment Mode', resp);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        },
        (err) => {
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
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
    } else {
      this.subs.sink = this.financeService.CreateLegalEntity(payload).subscribe(
        (resp) => {
          // console.log('Add Payment Mode', resp);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close(true);
          });
        },
        (err) => {
          this.authService.postErrorLog(err);
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('USERADD_S2.TITLE'),
              html: this.translate.instant('Name is already exists. Please use another name'),
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
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
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.identityForm.get('campus').setValue(null);
    this.identityForm.get('level').setValue(null);
    const school = this.identityForm.get('school_id').value;
    const scampusList = this.dataSchool.filter((list) => {
      if (list?._id) {
        return school.includes(list._id);
      }
    });
    const optionAll = {
      name: this.translate.instant('ALL'),
    };
    this.campusList.push(optionAll);
    scampusList.filter((campus, n) => {
      if (campus && campus.campuses && campus.campuses.length) {
        campus.campuses.filter((campuses, nex) => {
          this.campusList.push(campuses);
        });
      }
    });
    this.campusList = _.uniqBy(this.campusList, 'name');
    // console.log('Campus Option ', scampusList, this.campusList);
  }

  getDataLevel() {
    this.levels = [];
    this.identityForm.get('level').setValue(null);
    let sCampus = _.cloneDeep(this.identityForm.get('campus').value);
    sCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (sCampus && sCampus.length && (sCampus[0] === 'ALL' || sCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.campusList.filter((list) => list?.name !== 'ALL' && list?.name !== 'Tous');
      dataTemp.forEach((element) => {
        if (element?.name) {
          dataCampus.push(element.name);
        }
      });
      this.identityForm.get('campus').patchValue(dataCampus);
      const sLevelList = dataTemp;
      const optionAll = {
        name: this.translate.instant('ALL'),
      };
      this.levels.push(optionAll);
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
      this.levels = _.uniqBy(this.levels, 'name');
      // console.log('Data Levels ', this.levels, sLevelList);
    } else {
      sCampus = _.cloneDeep(this.identityForm.get('campus').value);
      const sLevelList = this.campusList.filter((list) => {
        if (list?.name) {
          return sCampus.includes(list.name);
        }
      });
      const optionAll = {
        name: this.translate.instant('ALL'),
      };
      this.levels.push(optionAll);
      sLevelList.forEach((element) => {
        element.levels.forEach((level) => {
          this.levels.push(level);
        });
      });
      this.levels = _.uniqBy(this.levels, 'name');
      // console.log('Data Levels ', this.levels, sLevelList);
    }
  }

  selectedLevel() {
    let sLevel = _.cloneDeep(this.identityForm.get('level').value);
    sLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
    if (sLevel && sLevel.length && (sLevel[0] === 'ALL' || sLevel[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.levels.filter((list) => list.name !== 'ALL' && list.name !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element.name);
      });
      this.identityForm.get('level').patchValue(dataLevel);
    }
  }

  getAllDataSchool() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.GetAllSchool().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSchool = resp;
          this.school = this.dataSchool;
          this.isWaitingForResponse = false;
          if (this.data) {
          }
        } else {
          this.isWaitingForResponse = false;
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

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  selectedWhoCall(data) {
    this.dummyData[data].status = !this.dummyData[data].status;
  }

  selectedWhoCampus(data) {
    this.campusData[data].status = !this.campusData[data].status;
  }

  selectedWhoLevel(data) {
    this.levelData[data].status = !this.levelData[data].status;
  }

  getPostcodeBankData(assign = true) {
    const country = this.identityForm.get('bank').get('country').value;
    const postCode = this.identityForm.get('bank').get('postal_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressBankDropdown(resp);

            if (assign) {
              this.identityForm.get('bank').get('city').setValue(this.citiesBank[0]);
              this.identityForm.get('bank').get('department').setValue(this.departmentsBank[0]);
              this.identityForm.get('bank').get('region').setValue(this.regionsBank[0]);
            }
          } else if (resp && !resp.length) {
            this.citiesBank = [''];
            this.departmentsBank = [''];
            this.regionsBank = [''];
            this.identityForm.get('bank').get('city').setValue(this.citiesBank[0]);
            this.identityForm.get('bank').get('department').setValue(this.departmentsBank[0]);
            this.identityForm.get('bank').get('region').setValue(this.regionsBank[0]);
            this.filteredCitiesBank = this.citiesBank;
            this.filteredDepartmentsBank = this.departmentsBank;
            this.filteredRegionsBank = this.regionsBank;
          }
        },
        (err) => {
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

  setAddressBankDropdown(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.citiesBank = _.uniq(tempCities);
      this.departmentsBank = _.uniq(tempDepartments);
      this.regionsBank = _.uniq(tempRegions);

      this.filteredCitiesBank = this.citiesBank;
      this.filteredDepartmentsBank = this.departmentsBank;
      this.filteredRegionsBank = this.regionsBank;
    }
  }

  filterBank() {
    const searchString = this.identityForm.get('bank').get('name').value.toLowerCase().trim();
    this.filteredBank = this.bank.filter((country) => country.toLowerCase().trim().includes(searchString));
  }

  filterCountryBank() {
    const searchString = this.identityForm.get('bank').get('country').value.toLowerCase().trim();
    this.filteredCountryBank = this.countriesBank.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  filterCityBank() {
    if (this.citiesBank && this.citiesBank.length) {
      const searchString = this.identityForm.get('bank').get('city').value.toLowerCase().trim();
      this.filteredCitiesBank = this.citiesBank.filter((city) => city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartmentBank() {
    if (this.departmentsBank && this.departmentsBank.length) {
      const searchString = this.identityForm.get('bank').get('department').value.toLowerCase().trim();
      this.filteredDepartmentsBank = this.departmentsBank.filter((department) => department.toLowerCase().trim().includes(searchString));
    }
  }

  filterRegionBank() {
    if (this.regionsBank && this.regionsBank.length) {
      const searchString = this.identityForm.get('bank').get('region').value.toLowerCase().trim();
      this.filteredRegionsBank = this.regionsBank.filter((region) => region.toLowerCase().trim().includes(searchString));
    }
  }

  getPostcodeHeadquartersData(assign = true) {
    const country = this.identityForm.get('headquarter_address').get('country').value;
    const postCode = this.identityForm.get('headquarter_address').get('postal_code').value;

    if (postCode && country && postCode.length > 3 && country.toLowerCase() === 'france') {
      this.subs.sink = this.rncpTitleService.getFilteredZipCode(postCode, country).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.setAddressHeadquartersDropdown(resp);

            if (assign) {
              this.identityForm.get('headquarter_address').get('city').setValue(this.cities[0]);
              this.identityForm.get('headquarter_address').get('department').setValue(this.departments[0]);
              this.identityForm.get('headquarter_address').get('region').setValue(this.regions[0]);
            }
          } else if (resp && !resp.length) {
            this.cities = [''];
            this.departments = [''];
            this.regions = [''];
            this.identityForm.get('headquarter_address').get('city').setValue(this.cities[0]);
            this.identityForm.get('headquarter_address').get('department').setValue(this.departments[0]);
            this.identityForm.get('headquarter_address').get('region').setValue(this.regions[0]);
            this.filteredCities = this.cities;
            this.filteredDepartments = this.departments;
            this.filteredRegions = this.regions;
          }
        },
        (err) => {
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

  setAddressHeadquartersDropdown(resp: any) {
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

  filterCountryHeadquarters() {
    const searchString = this.identityForm.get('headquarter_address').get('country').value.toLowerCase().trim();
    this.filteredCountry = this.countries.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  filterCityHeadquarters() {
    if (this.cities && this.cities.length) {
      const searchString = this.identityForm.get('headquarter_address').get('city').value.toLowerCase().trim();
      this.filteredCities = this.cities.filter((city) => city.toLowerCase().trim().includes(searchString));
    }
  }

  filterDepartmentHeadquarters() {
    if (this.departments && this.departments.length) {
      const searchString = this.identityForm.get('headquarter_address').get('department').value.toLowerCase().trim();
      this.filteredDepartments = this.departments.filter((department) => department.toLowerCase().trim().includes(searchString));
    }
  }

  filterRegionHeadquarters() {
    if (this.regions && this.regions.length) {
      const searchString = this.identityForm.get('headquarter_address').get('region').value.toLowerCase().trim();
      this.filteredRegions = this.regions.filter((region) => region.toLowerCase().trim().includes(searchString));
    }
  }

  openForm() {
    this.dialogRef.close('Open Form');
  }

  openSelectExisting() {
    if (!this.showExisting) {
      this.dialogRef.updateSize('750px');
    }
    this.showForm = false;
    this.showExisting = true;
  }

  getAllLegalEntitiesDropdown() {
    this.subs.sink = this.listLegalEntityCtrl.valueChanges.subscribe((res) => {
      this.identityForm.reset();
    });
    const filter = {
      online_payment_status: 'publish',
    };
    this.subs.sink = this.financeService.getAllLegalEntitiesDropdown(filter).subscribe(
      (res) => {
        if (res) {
          let responseApi = _.cloneDeep(res);
          responseApi = responseApi.filter((resp) => {
            resp.scholar_season_id = resp.scholar_season_id.map((sch) => sch && sch._id);
            return resp;
          });

          this.listLegalEntity = responseApi.filter((item) => {
            if (item.scholar_season_id.indexOf(this.scholarSeasonId) >= 0) {
              return null;
            } else {
              return item;
            }
          });
        }
      },
      (err) => {
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

  selectedLegalEntity(selectedData) {
    if (selectedData) {
      const payload = {
        scholar_season_id: this.scholarSeasonId,
      };
      this.subs.sink = this.financeService.UpdateLegalEntityNotPublish(payload, selectedData._id, false).subscribe(
        (res) => {
          if (res) {
            this.dialogRef.close(selectedData);
          }
        },
        (err) => {
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
}
