import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';

@Component({
  selector: 'ms-registration-profile-form',
  templateUrl: './registration-profile-form.component.html',
  styleUrls: ['./registration-profile-form.component.scss'],
})
export class RegistrationProfileFormComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Input() scholarSeasonId: any;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();
  addRegistrationProfileForm: UntypedFormGroup;
  currencyList = [];
  loadProgram = false;
  currencyListOri = [];
  paymentModeList: any;
  noneChoicePayment = {
    name: 'None',
    status: false,
  };

  noneChoiceAddtional = {
    name: 'None',
    status: false,
  };

  addtionalCost: any[] = [];

  disableChoicePayment = false;
  disableChoiceAddtional = false;

  isWaitingForResponse = false;

  levels: any[];
  campusList: any = [];
  isCampusOn: boolean;
  listObjective: any = [];
  realCampusList: any = [];
  sectors: any = [];
  specialities: any = [];
  school: any;
  typeOfFormation: any;
  scholarId: any;
  schoolSelected = [];
  campusSelected = [];
  levelsSelected = [];
  programsList = [];
  documentBuilders = [];
  showForm = false;
  hideButton = false;
  showExisting = false;
  showPatchForm = false;
  listRegistrationProfile: any[];
  listRegistrationProfileCtrl = new UntypedFormControl(null);
  firstForm: any;

  paymentMethods = ['check', 'credit_card', 'transfer', 'sepa', 'cash'];
  perimeter = ['admission', 'readmission'];
  isAdmission = false;
  isReadmission = false;
  selectedPaymentMethods: string[] = [];
  currentUser: any;
  isPermission: string[];
  currentUserTypeId: string;

  currencyFilter = new UntypedFormControl(null);
  isPerimeterCheckboxUnchecked: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private acadJourneyService: AcademicJourneyService,
    private admissionService: AdmissionDashboardService,
    private translate: TranslateService,
    private documentService: DocumentIntakeBuilderService,
    private userService: AuthService,
    private translateService: TranslateService,
    private intakeService: IntakeChannelService,
  ) {}

  ngOnInit() {
    // this.router.queryParams.subscribe((res) => {
    //   console.log('_res', res);
    //   if (res && res.scholarSeasonId) {
    //     this.scholarId = res.scholarSeasonId;
    //   }
    // });
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = _.cloneDeep(list);
      this.currencyListOri = _.cloneDeep(list);
    });
    if (this.data && this.data?.isEdit) {
      this.formatDataBeforePatching();
      this.addRegistrationProfileForm.patchValue(this.data?.selectedData);
      this.currencyFilter.setValue(this.data?.selectedData?.other_currency);
      this.hideButton = true;
      this.showForm = true;
    }
    this.getDataPaymentMode();
    this.getAllDocumentBuilders();
    // this.getDataForList();
    this.getDataTypeOfFormation();
    this.getDataAddtionalCost();
    this.getRegistrationProfileDropdown();
    this.firstForm = _.cloneDeep(this.addRegistrationProfileForm.value);
  }
  currencySelected(event) {
    this.addRegistrationProfileForm.get('other_currency').setValue(event);
  }

  formatDataBeforePatching() {
    if (!this.data?.selectedData) {
      return;
    }

    if (
      this.data &&
      this.data?.selectedData &&
      this.data?.selectedData?.is_down_payment &&
      this.data?.selectedData?.is_down_payment === 'no'
    ) {
      this.resetMethodPayment();
    }

    if (this.data?.selectedData?.campuses && this.data?.selectedData?.campuses?.length) {
      this.data.selectedData.campuses = this.data?.selectedData?.campuses.map((list) => list?._id);
    }
    if (this.data?.selectedData?.levels && this.data?.selectedData?.levels?.length) {
      this.data.selectedData.levels = this.data?.selectedData?.levels.map((list) => list?._id);
    }
    if (this.data?.selectedData?.payment_modes && this.data?.selectedData?.levels?.payment_modes) {
      this.data.selectedData.payment_modes = this.data?.selectedData?.payment_modes.map((list) => list?._id);
    }
    if (this.data?.selectedData?.additional_cost_ids && this.data?.selectedData?.additional_cost_ids?.payment_modes) {
      this.data.selectedData.additional_cost_ids = this.data?.selectedData?.additional_cost_ids?.map((list) => list?._id);
    }
    if (this.data?.selectedData?.programs && this.data?.selectedData?.programs?.length) {
      this.programsList = this.data?.selectedData?.programs.map((list) => list?._id);
    }
    if (this.data?.selectedData?.type_of_formation && this.data?.selectedData?.type_of_formation?._id) {
      this.data.selectedData.type_of_formation = this.data?.selectedData?.type_of_formation?._id;
    }
    if (this.data?.selectedData?.document_builder_id && this.data?.selectedData?.document_builder_id?._id) {
      this.data.selectedData.document_builder_id = this.data?.selectedData?.document_builder_id?._id;
    }
    if (this.data?.selectedData?.payment_modes && !this.data?.selectedData?.payment_modes?.length) {
      this.noneChoicePayment.status = true;
    }
    if (this.data?.selectedData?.scholar_season_id && this.data?.selectedData?.scholar_season_id?._id) {
      this.data.selectedData.scholar_season_id = this.data?.selectedData?.scholar_season_id?._id;
    }
    if (this.data?.selectedData?.additional_cost_ids && !this.data?.selectedData?.additional_cost_ids?.length) {
      this.noneChoiceAddtional.status = true;
    }
    if (
      this.data &&
      this.data?.selectedData &&
      this.data?.selectedData?.select_payment_method_available &&
      this.data?.selectedData?.select_payment_method_available.length
    ) {
      this.selectedPaymentMethods = [...this.data?.selectedData?.select_payment_method_available];
    }
    if (this.data && this.data?.selectedData && this.data?.selectedData?.is_admission) {
      this.isAdmission = true;
    }
    if (this.data && this.data?.selectedData && this.data?.selectedData?.is_readmission) {
      this.isReadmission = true;
    }
  }

  filterCurrency() {
    // if (this.addRegistrationProfileForm.get('other_currency').value !== null) {
    //   const searchString = this.addRegistrationProfileForm.get('other_currency').value.toLowerCase().trim();
    //   this.currencyList = this.currencyListOri.filter((country) => country.code.toLowerCase().trim().includes(searchString));
    //   console.log(this.addRegistrationProfileForm.get('other_currency').value, searchString, this.currencyList);
    // }
    const searchString = this.currencyFilter.value.toLowerCase().trim();
    this.currencyList = this.currencyListOri.filter((country) => country.code.toLowerCase().trim().includes(searchString));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  initForm() {
    this.addRegistrationProfileForm = this.fb.group({
      name: [null, Validators.required],
      description: [null],
      discount_on_full_rate: [null, [Validators.required, Validators.max(100)]],
      is_down_payment: [null, Validators.required],
      other_currency: [null],
      other_amount: [null, Validators.min(0)],
      type_of_formation: [null, Validators.required],
      payment_modes: [null],
      additional_cost_ids: [null],
      school_ids: [null],
      campuses: [null],
      levels: [null],
      specialities: [null],
      sectors: [null],
      program: [[]],
      dp_additional_cost_currency: [null],
      dp_additional_cost_amount: [null],
      scholar_season_id: [this.scholarSeasonId],
      document_builder_id: [null, Validators.required],
      select_payment_method_available: [[], Validators.required],
      is_admission: [null],
      is_readmission: [null],
    });
  }

  getDataPaymentMode() {
    const filter = { scholar_season_id: this.scholarSeasonId ? this.scholarSeasonId : '' };
    this.subs.sink = this.intakeService.getAllPaymentModes(filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          const dataPayment = _.cloneDeep(students);
          this.paymentModeList = dataPayment.map((list) => {
            if (this.data && this.data?.isEdit) {
              const formPayment = this.addRegistrationProfileForm.get('payment_modes').value;
              return {
                _id: list._id,
                name: list.name,
                status: formPayment && formPayment.length ? (formPayment.some((e) => e._id === list._id) ? true : false) : false,
              };
            } else {
              return {
                _id: list._id,
                name: list.name,
                status: false,
              };
            }
          });
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
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
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  selectedIndexData(indexData) {
    this.noneChoicePayment.status = false;
    this.paymentModeList[indexData].status = !this.paymentModeList[indexData].status;
    let foundSelected = this.paymentModeList.filter((res) => res.status);
    foundSelected = foundSelected.map((res) => res._id);
    this.addRegistrationProfileForm.get('payment_modes').setValue(foundSelected);
  }

  selectedIndexNone() {
    if (this.paymentModeList && this.paymentModeList.length) {
      this.paymentModeList = this.paymentModeList.map((res) => {
        res.status = false;
        return res;
      });
    }
    this.noneChoicePayment.status = !this.noneChoicePayment.status;
    this.disableChoicePayment = !this.disableChoicePayment;
    this.addRegistrationProfileForm.get('payment_modes').setValue([]);
  }

  selectedIndexAddtionalData(indexData) {
    this.noneChoiceAddtional.status = false;
    this.addtionalCost[indexData].status = !this.addtionalCost[indexData].status;
    let foundSelected: any = this.addtionalCost.filter((res) => res.status);
    foundSelected = foundSelected.map((res) => res._id);
    this.addRegistrationProfileForm.get('additional_cost_ids').setValue(foundSelected);
  }

  selectedIndexAddtionalNone() {
    if (this.addtionalCost && this.addtionalCost.length) {
      this.addtionalCost = this.addtionalCost.map((res) => {
        res.status = false;
        return res;
      });
    }
    this.noneChoiceAddtional.status = !this.noneChoiceAddtional.status;
    this.disableChoiceAddtional = !this.disableChoiceAddtional;
    this.addRegistrationProfileForm.get('additional_cost_ids').setValue([]);
  }

  getAllDocumentBuilders() {
    const filter = {
      status: true,
      document_type: 'registration_certificate',
    };
    this.subs.sink = this.documentService.getAllDocumentsDropdown(filter).subscribe(
      (resp) => {
        if (resp) {
          this.documentBuilders = resp;
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
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
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  // getDataForList() {
  //   const name = [];
  //   this.subs.sink = this.admissionService.GetAllSchoolScholar(name, this.scholarId, this.currentUserTypeId).subscribe((resp) => {
  //     if (resp) {
  //       console.log('Data Import => ', resp);
  //       this.listObjective = resp;
  //       this.school = this.listObjective;
  //       if (this.data && this.data?.isEdit) {
  //         this.getDataCampus(true);
  //         this.getDataLevel(true);
  //       }
  //     }
  //   }, (error) => {
  //     Swal.fire({
  //       type: 'info',
  //       title: this.translate.instant('SORRY'),
  //       text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
  //       confirmButtonText: this.translateService.instant('OK'),
  //     });
  //   })
  // }

  // getDataCampus(isFromEdit?) {
  //   this.levels = [];
  //   this.campusList = [];
  //   this.campusSelected = [];
  //   this.levelsSelected = [];
  //   if (!isFromEdit) {
  //     this.addRegistrationProfileForm.get('campuses').setValue(null);
  //     this.addRegistrationProfileForm.get('levels').setValue(null);
  //   }
  //   this.isCampusOn = true;
  //   const school = this.addRegistrationProfileForm.get('school_ids').value;
  //   const scampusList = this.listObjective.filter((list) => {
  //     return school.includes(list._id);
  //   });
  //   const optionAll = {
  //     _id: 'ALL',
  //     name: this.translate.instant('ALL'),
  //   };
  //   this.campusList.push(optionAll);
  //   scampusList.filter((campus, n) => {
  //     if (campus.campuses && campus.campuses.length) {
  //       campus.campuses.filter((campuses, nex) => {
  //         this.campusList.push(campuses);
  //         this.realCampusList.push(campuses);
  //       });
  //     }
  //   });
  //   this.campusList = _.uniqBy(this.campusList, '_id');
  //   this.realCampusList = _.uniqBy(this.realCampusList, '_id');
  //   const selected = _.cloneDeep(scampusList);
  //   this.schoolSelected = selected.map((res) => res.short_name);
  //   console.log('Campus Option ', scampusList, this.campusList, this.schoolSelected);
  // }

  // getDataLevel(isFromEdit?) {
  //   this.levels = [];
  //   this.levelsSelected = [];
  //   if (!isFromEdit) {
  //     this.addRegistrationProfileForm.get('levels').setValue(null);
  //   }
  //   let sCampus = _.cloneDeep(this.addRegistrationProfileForm.get('campuses').value);
  //   sCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
  //   if (sCampus && sCampus.length && (sCampus[0] === 'ALL' || sCampus[0] === 'Tous')) {
  //     const dataCampus = [];
  //     const dataTemp = this.realCampusList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
  //     dataTemp.forEach((element) => {
  //       dataCampus.push(element._id);
  //     });
  //     this.addRegistrationProfileForm.get('campuses').patchValue(dataCampus);
  //     const sLevelList = dataTemp;
  //     const optionAll = {
  //       _id: 'ALL',
  //       name: this.translate.instant('ALL'),
  //     };
  //     this.levels.push(optionAll);
  //     sLevelList.forEach((element) => {
  //       element.levels.forEach((level) => {
  //         this.levels.push(level);
  //       });
  //     });
  //     this.levels = _.uniqBy(this.levels, '_id');
  //     console.log('Data Levels ', this.levels, sLevelList);
  //   } else {
  //     sCampus = _.cloneDeep(this.addRegistrationProfileForm.get('campuses').value);
  //     const sLevelList = this.realCampusList.filter((list) => {
  //       return sCampus.includes(list._id);
  //     });
  //     const optionAll = {
  //       _id: 'ALL',
  //       name: this.translate.instant('ALL'),
  //     };
  //     this.levels.push(optionAll);
  //     sLevelList.forEach((element) => {
  //       element.levels.forEach((level) => {
  //         this.levels.push(level);
  //       });
  //     });
  //     this.levels = _.uniqBy(this.levels, 'name');
  //     this.campusSelected = sCampus;
  //     console.log('Data Levels ', this.levels, sLevelList, this.campusList, sCampus);
  //   }
  // }

  // levelSelected() {
  //   this.addRegistrationProfileForm.get('specialities').patchValue(null);
  //   let sLevel = _.cloneDeep(this.addRegistrationProfileForm.get('levels').value);
  //   sLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
  //   if (sLevel && sLevel.length && (sLevel[0] === 'ALL' || sLevel[0] === 'Tous')) {
  //     const dataLevel = [];
  //     const dataTemp = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
  //     dataTemp.forEach((element) => {
  //       dataLevel.push(element._id);
  //     });
  //     this.levelsSelected = dataLevel;
  //     this.addRegistrationProfileForm.get('levels').patchValue(dataLevel);
  //   }
  //   this.levelsSelected = this.addRegistrationProfileForm.get('levels').value;
  //   this.getDataProgram();
  //   this.getSpecialities();
  //   console.log(this.addRegistrationProfileForm.controls);
  // }

  flattenArray(arr: any[]) {
    // used to flatten array inside of array into just a single array using merging method
    return arr.reduce((acc, val) => acc.concat(val), []);
  }

  sortNameAlphabetically(arr: any[], key: string) {
    return arr.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
  }

  getSpecialities() {
    if (this.addRegistrationProfileForm.get('levels').value && this.addRegistrationProfileForm.get('levels').value.length) {
      const selectedLevels = this.levels.filter(
        (level) => level && this.addRegistrationProfileForm.get('levels').value.includes(level._id),
      );
      // first get the mapped object of campuses from each school
      // then flatten the array to get only a single list of campuses
      // then sort it alphabetically
      this.specialities = this.sortNameAlphabetically(
        _.uniqBy(this.flattenArray(selectedLevels.map((level) => level.specialities)), '_id'),
        'name',
      );
    }
  }

  onSpecialitySelect() {
    // reset sector if specialities is changed
    this.addRegistrationProfileForm.get('sectors').patchValue(null);
    this.getSectors();
  }

  getSectors() {
    if (this.addRegistrationProfileForm.get('specialities').value && this.addRegistrationProfileForm.get('specialities').value.length) {
      const selectedSpecialities = this.specialities.filter(
        (speciality) => speciality && this.addRegistrationProfileForm.get('specialities').value.includes(speciality._id),
      );
      this.sectors = this.sortNameAlphabetically(
        _.uniqBy(this.flattenArray(selectedSpecialities.map((speciality) => speciality.sectors)), '_id'),
        'name',
      );
    }
  }

  // clearLevel() {
  //   this.getDataCampus();
  // }

  // clearCampus() {
  //   this.campusList = [];
  //   this.realCampusList = [];
  // }

  // handleRemoveSchool() {
  //   const school = this.addRegistrationProfileForm.get('school_ids').value;
  //   console.log('_sch', school);
  //   if (school.length === 0) {
  //     this.clearCampus();
  //   }
  // }

  // handleRemoveCampus() {
  //   const campus = this.addRegistrationProfileForm.get('campuses').value;
  //   console.log('_cam', campus);
  //   if (campus.length === 0) {
  //     this.clearLevel();
  //   }
  // }

  checkFormValidity(): boolean {
    if (this.addRegistrationProfileForm.invalid || (!this.addRegistrationProfileForm.get('is_admission')?.value && !this.addRegistrationProfileForm.get('is_readmission')?.value)) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.addRegistrationProfileForm.markAllAsTouched();
      this.isPerimeterCheckboxUnchecked = true;
      return true;
    } else if (this.addRegistrationProfileForm.get('is_down_payment').value === 'other') {
      if (this.currencyFilter.value === 'EUR') {
        this.addRegistrationProfileForm.get('other_currency').setValue('EUR');
        return false;
      } else if (this.data && this.currencyFilter.value === this.data?.selectedData?.other_currency) {
        this.addRegistrationProfileForm.get('other_currency').setValue(this.data?.selectedData?.other_currency);
        return false;
      } else if (this.currencyList && this.currencyList.length === 1) {
        this.addRegistrationProfileForm.get('other_currency').setValue(this.currencyList[0].code);
        return false;
      } else {
        const curr = this.currencyList.filter((list) => list.code === this.currencyFilter.value);
        if (curr && curr.length === 1) {
          return false;
        } else {
          if (this.addRegistrationProfileForm.get('is_down_payment').value === 'yes') {
            return false;
          } else {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('ADDITIONAL_S2.TITLE'),
              html: this.translate.instant('ADDITIONAL_S2.TEXT'),
              confirmButtonText: this.translate.instant('ADDITIONAL_S2.BUTTON'),
            });
            this.addRegistrationProfileForm.markAllAsTouched();
            return true;
          }
        }
      }
    }
  }

  onValidate() {
    if (this.checkFormValidity()) {
      return;
    }
    const payload = this.createPayload(this.addRegistrationProfileForm.value);
    // const program = this.createProgram();
    delete payload.campuses;
    delete payload.school_ids;
    delete payload.levels;
    delete payload.program;
    payload['programs'] = this.programsList;
    // payload.scholar_season_id = this.scholarId;
    if (this.showExisting) {
      payload.is_from_duplicate = true;
    } else {
      payload.is_from_duplicate = false;
    }

    if (payload && !payload.payment_modes) {
      payload.payment_modes = [];
      this.addRegistrationProfileForm.get('payment_modes').setValue([]);
      this.noneChoicePayment.status = true;
    }

    if (payload && !payload.additional_cost_ids) {
      payload.additional_cost_ids = [];
      this.addRegistrationProfileForm.get('additional_cost_ids').setValue([]);
      this.noneChoiceAddtional.status = true;
    }
    payload.other_amount = payload.other_amount ? parseFloat(payload.other_amount) : null;
    payload.discount_on_full_rate = payload.discount_on_full_rate ? parseFloat(payload.discount_on_full_rate) : 0;

    if (this.addtionalCost && this.addtionalCost.length) {
      if (payload.is_down_payment === 'dp_additional_cost') {
        let additional = [];
        payload.dp_additional_cost_currency = 'EUR';
        this.addtionalCost.forEach((element) => {
          payload.additional_cost_ids.forEach((res) => {
            if ((typeof res === 'object' && res?._id === element?._id) || res === element?._id) {
              additional.push(element);
            }
          });
        });
        if (additional && additional.length) {
          additional = additional.filter((s) => s && s.amount).map((list) => list.amount);
          payload.dp_additional_cost_amount = additional.reduce((res, a) => res + a);
        } else {
          payload.dp_additional_cost_currency = null;
          payload.dp_additional_cost_amount = null;
        }
      } else {
        payload.dp_additional_cost_currency = null;
        payload.dp_additional_cost_amount = null;
      }
    }

    if (this.data && this.data?.isEdit && !this.showExisting) {
      this.isWaitingForResponse = true;
      if (payload && payload.payment_modes && payload.payment_modes.length > 0) {
        if (payload.payment_modes[0].name) {
          payload.payment_modes = payload.payment_modes.map((res) => res._id);
        }
      }
      if (payload && payload.additional_cost_ids && payload.additional_cost_ids.length > 0) {
        if (payload.additional_cost_ids[0].additional_cost) {
          payload.additional_cost_ids = payload.additional_cost_ids.map((res) => res._id);
        }
      }

      this.subs.sink = this.admissionService.updateProfilRate(this.data?.selectedData?._id, payload).subscribe(
        (res) => {
          if (res) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.closeForm();
            });
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
            });
          } else if (err['message'] === 'GraphQL error: name already exist') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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
      this.isWaitingForResponse = true;
      this.subs.sink = this.admissionService.createProfilRate(payload).subscribe(
        (res) => {
          if (res) {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.closeForm();
            });
          }
        },
        (err) => {
          // Record error log
          this.userService.postErrorLog(err);
          this.isWaitingForResponse = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.userService.handlerSessionExpired();
            return;
          }
          if (err['message'] === 'GraphQL error: Name already exists!') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
            });
          } else if (err['message'] === 'GraphQL error: name already exist') {
            Swal.fire({
              title: this.translate.instant('Uniquename_S1.TITLE'),
              text: this.translate.instant('Uniquename_S1.TEXT'),
              type: 'info',
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
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

  createProgram() {
    const listProgram = [];
    let labelSub = '';
    let campusSub = '';
    let levelSub = '';
    this.schoolSelected.forEach((sch) => {
      if (sch) {
        this.campusSelected.forEach((camp) => {
          this.levelsSelected.forEach((lvl) => {
            labelSub = sch.substring(0, 3).toUpperCase();
            campusSub = camp.substring(0, 3).toUpperCase();
            levelSub = lvl.toUpperCase();
            listProgram.push(`${labelSub + campusSub} ${levelSub}`);
          });
        });
      }
    });
    return listProgram;
  }

  createPayload(formData) {
    const payload = formData;
    payload.campuses = _.uniqBy(payload.campuses);
    return payload;
  }

  getDataTypeOfFormation() {
    this.subs.sink = this.intakeService.getAllTypeOfInformationDropdown().subscribe(
      (res) => {
        if (res) {
          this.typeOfFormation = res;
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
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
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  getDataAddtionalCost() {
    this.subs.sink = this.intakeService.getAllAdditionalCostsDropdown().subscribe(
      (res) => {
        if (res) {
          const dataAddtional = _.cloneDeep(res);
          this.addtionalCost = dataAddtional.map((list) => {
            if (this.data && this.data?.isEdit) {
              const formAddtional = this.addRegistrationProfileForm.get('additional_cost_ids').value;
              return {
                _id: list._id,
                name: list.additional_cost,
                amount: list.amount,
                status: formAddtional && formAddtional?.length ? (formAddtional.some((e) => e._id === list._id) ? true : false) : false,
              };
            } else {
              return {
                _id: list._id,
                name: list.additional_cost,
                amount: list.amount,
                status: false,
              };
            }
          });
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
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
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  openForm() {
    this.showForm = true;
    this.showExisting = false;
    this.addRegistrationProfileForm.reset();
    this.showPatchForm = false;
  }

  openSelectExisting() {
    this.showForm = false;
    this.showExisting = true;
  }

  getRegistrationProfileDropdown() {
    this.subs.sink = this.listRegistrationProfileCtrl.valueChanges.subscribe(() => {
      this.addRegistrationProfileForm.reset();
    });
    this.subs.sink = this.admissionService.getAllProfilRatesDropdown().subscribe(
      (res) => {
        if (res) {
          this.listRegistrationProfile = res;
        }
      },
      (error) => {
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
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  selectedRegistrationProfile(selectedData) {
    if (selectedData) {
      const data = _.cloneDeep(selectedData);
      data.additional_cost_ids = null;
      data.payment_modes = null;
      data.school_ids = null;
      data.scholar_season_id = data?.scholar_season_id && data?.scholar_season_id._id ? data?.scholar_season_id._id : '';
      data.type_of_formation = null;
      this.data = {
        isEdit: true,
        selectedData: data,
      };
      this.addRegistrationProfileForm.patchValue(data);
      this.showPatchForm = true;
      this.getDataPaymentMode();
      // this.getDataForList();
      this.getDataAddtionalCost();
    } else {
      this.addtionalCost = this.addtionalCost.map((res) => {
        res.status = false;
        return res;
      });
      this.paymentModeList = this.paymentModeList.map((res) => {
        res.status = false;
        return res;
      });
    }
  }
  // getDataProgram() {
  //   this.loadProgram = true;
  //   const schoolSelected = this.addRegistrationProfileForm.get('school_ids').value;
  //   const campusSelected = this.addRegistrationProfileForm.get('campuses').value;
  //   const levelsSelected = this.addRegistrationProfileForm.get('levels').value;
  //   this.subs.sink = this.financeService.getAllProgramForProfile(this.scholarId, schoolSelected, campusSelected, levelsSelected).subscribe(
  //     (resp) => {
  //       if (resp && resp.length) {
  //         this.loadProgram = false;
  //         this.programsList = resp.map((list) => list._id);
  //       } else {
  //         this.loadProgram = false;
  //       }
  //     },
  //     (err) => {
  //       this.loadProgram = false;
  //       Swal.fire({
  //         type: 'info',
  //         title: this.translate.instant('SORRY'),
  //         text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
  //         confirmButtonText: this.translateService.instant('OK'),
  //       });
  //     },
  //   );
  // }

  comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.addRegistrationProfileForm.value);
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  }

  onSelectPerimeter(event: MatCheckboxChange, type: string) {
    if (type === 'admission') {
      if (event.checked) {
        this.addRegistrationProfileForm.get('is_admission').setValue(true);
        this.isPerimeterCheckboxUnchecked = false;
      } else {
        this.addRegistrationProfileForm.get('is_admission').setValue(false);
      }
    }

    if (type === 'readmission') {
      if (event.checked) {
        this.addRegistrationProfileForm.get('is_readmission').setValue(true);
        this.isPerimeterCheckboxUnchecked = false;
      } else {
        this.addRegistrationProfileForm.get('is_readmission').setValue(false);
      }
    }

    this.addRegistrationProfileForm.updateValueAndValidity();

    if (this.addRegistrationProfileForm.get('is_admission').touched && this.addRegistrationProfileForm.get('is_admission').touched && !this.addRegistrationProfileForm.get('is_admission')?.value && !this.addRegistrationProfileForm.get('is_readmission')?.value) {
      this.isPerimeterCheckboxUnchecked = true;
    }
  }

  onSelectPaymentMethod(checked: boolean, index: number) {
    const methodIndex = this.selectedPaymentMethods ? this.selectedPaymentMethods.indexOf(this.paymentMethods[index]) : null;
    if (methodIndex >= 0) {
      this.selectedPaymentMethods = this.selectedPaymentMethods.filter((method) => method !== this.paymentMethods[index]);
      this.addRegistrationProfileForm.controls['select_payment_method_available'].patchValue(
        this.selectedPaymentMethods.filter((method) => method !== this.paymentMethods[index]),
      );
    } else {
      this.selectedPaymentMethods.push(this.paymentMethods[index]);
      this.addRegistrationProfileForm.controls['select_payment_method_available'].patchValue(this.selectedPaymentMethods);
    }
    this.addRegistrationProfileForm.updateValueAndValidity();
  }

  addValidator() {
    this.addRegistrationProfileForm.controls['select_payment_method_available'].setValidators(Validators.required);
    this.addRegistrationProfileForm.controls['select_payment_method_available'].updateValueAndValidity();
  }

  resetMethodPayment() {
    this.selectedPaymentMethods = [];
    this.addRegistrationProfileForm.controls['select_payment_method_available'].setValue([]);
    this.addRegistrationProfileForm.controls['select_payment_method_available'].clearValidators();
    this.addRegistrationProfileForm.controls['select_payment_method_available'].updateValueAndValidity();
  }

  formattingDiscount(event: any) {
    const reg = /^-?\d{0,3}$/;
    const regEx = /^-?\d{0,2}[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (input.includes('.')) {
      if (!regEx.test(input)) {
        event.preventDefault();
      }
    } else {
      if (!reg.test(input)) {
        event.preventDefault();
      }
    }
    const disc = this.addRegistrationProfileForm?.get('discount_on_full_rate')?.value;
    if (parseInt(disc) < 100) {
      this.addRegistrationProfileForm.get('payment_modes').setValidators([Validators.required]);
      this.addRegistrationProfileForm.get('payment_modes').updateValueAndValidity();
    } else {
      this.addRegistrationProfileForm.get('payment_modes').clearValidators();
      this.addRegistrationProfileForm.get('payment_modes').updateValueAndValidity();
    }
  }

  decimalFilter(event: any) {
    const reg = /^-?\d{0,6}$/;
    const regEx = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (input.includes('.')) {
      if (!regEx.test(input)) {
        event.preventDefault();
      }
    } else {
      if (!reg.test(input)) {
        event.preventDefault();
      }
    }
  }

  dissallowZero(event) {
    const greaterThanZero = parseFloat(parseFloat(event.target.value).toFixed(2)) > 0;
    if (!greaterThanZero || event.target.value === '0' || event.target.value === '.') {
      event.target.value = null;
      this.addRegistrationProfileForm.get('other_amount').patchValue(null);
    }
  }

  closeForm() {
    this.close.emit(true);
  }
}
