import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { TeacherContractService } from '../teacher-contract.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CustomValidators } from 'ng2-validation';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SendingPreContractFormDialogComponent } from '../contract-management-table/sending-pre-contract-form-dialog/sending-pre-contract-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FinancesService } from 'app/service/finance/finance.service';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, debounceTime, map, startWith, take, tap } from 'rxjs/operators';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CountryService } from 'app/shared/services/country.service';

@Component({
  selector: 'ms-contract-process-form',
  templateUrl: './contract-process-form.component.html',
  styleUrls: ['./contract-process-form.component.scss'],
  providers: [ParseUtcToLocalPipe, ParseLocalToUtcPipe],
})
export class ContractProcessFormComponent implements OnInit, OnDestroy {
  @ViewChild('legalSelect', { static: false }) private legalSelect?: NgSelectComponent;
  subs = new SubSink();

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  countryCodeList: any[];
  dialCodeControl = new UntypedFormControl(null);
  phoneNumberControl = new UntypedFormControl(null);
  // *************** END OF property to store data of country dial code

  interventionType = [
    { value: 'face_to_face', name: 'Face to Face' },
    { value: 'face_to_face_2', name: 'Face to Face 2' },
    { value: 'face_to_face_3', name: 'Face to Face 3' },
    { value: 'face_to_face_4', name: 'Face to Face 4' },
    { value: 'jury', name: 'Jury' },
    { value: 'coaching', name: 'Coaching' },
    { value: 'conference', name: 'Conference' },
    { value: 'correction_of_files', name: 'Correction of Files' },
    { value: 'correction_of_copies', name: 'Correction of Copies' },
    { value: 'making_subjects', name: 'Making Subjects' },
  ];
  contract_type = ['cddu', 'convention'];
  contract_manage = [];
  legal_representative = [];
  filteredLegalRepresentative: Observable<any[]>;
  public inputLegalRepresent$ = new Subject<string | null>();
  email_sign = [];
  subjects = [];
  programs = [];
  originPrograms = [];
  legalEntities = [];
  scholars = [];

  contractForm: UntypedFormGroup;
  isSentForm = false;
  t = '';
  today: any;

  totalPeriod: number;
  trialPeriod: number;

  _id = '';
  data = false;
  isReadOnly = false;
  isWaitingForResponse = false;
  isWaitingForProgramResponse = false;
  isLoadingFilter = false;
  currentUserTypeId: any;
  currentUser: any;
  isPermission: any;
  dataContractProcess: any;

  fromFollowUp = false;
  initialForm: any;
  newContract = false;

  teacherSubjectIdfromEdit = [];
  campusList = [];
  // campusDropdown: Observable<any[]>;
  campusDropdown = [];
  filterCampus = new UntypedFormControl(null);

  constructor(
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private contractService: TeacherContractService,
    private route: ActivatedRoute,
    private router: Router,
    private parseToLocal: ParseUtcToLocalPipe,
    private parseToUTC: ParseLocalToUtcPipe,
    private pageTitleService: PageTitleService,
    private userService: AuthService,
    private financeService: FinancesService,
    private utilService: UtilityService,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.getAllCountryCodes();
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    let name = this.translate.instant('CONTRACT_MANAGEMENT.Contract Process');
    this.pageTitleService.setTitle(name);

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      name = this.translate.instant('CONTRACT_MANAGEMENT.Contract Process');
      this.pageTitleService.setTitle(name);
      this.sortCountryCode();
    });
    this.today = new Date();
    this.initForm();
    this.getDropdownCampus();

    if (this.route.snapshot.paramMap.get('id') != null || this.route.snapshot.queryParamMap.get('fromContractManagement') === 'true') {
      if (this.route.snapshot.queryParamMap.get('fromContractManagement') === 'true') {
        this._id = this.route?.snapshot?.queryParamMap?.get('contractId');
      } else {
        this._id = this.route.snapshot.paramMap.get('id');
      }
      this.getContractProcess(this._id);
    } else if (this.route.snapshot.queryParamMap.get('fromFollowup') === 'true') {
      this.fromFollowUp = true;
      this.generateTeacherContractProcess();
    } else {
      this.newContract = true;
    }
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  selectionDialCode(event) {
    this.contractForm?.get('phone_number_indicative')?.reset();
    this.contractForm?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getDropdownCampus() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllCampuses(this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          this.campusList = _.cloneDeep(resp);
          this.campusDropdown = resp.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
      },
    );
  }
  filterDropdown() {
    if (this.filterCampus.value) {
      const search = this.filterCampus.value.toLowerCase();
      this.campusDropdown = this.campusList.filter((campus) => campus.name.toLowerCase().includes(search));
    } else {
      this.campusDropdown = _.cloneDeep(this.campusList);
    }
    this.contractForm.get('campus_id').patchValue(null);
  }
  selectCampus(id) {
    if (id) {
      this.contractForm.get('campus_id').patchValue(id);
    } else {
      this.contractForm.get('campus_id').patchValue(null);
      this.filterCampus.patchValue(null);
    }
  }

  generateTeacherContractProcess() {
    const subjectIds = JSON.parse(localStorage.getItem('teacherSubjectIds'));
    console.log('subjectIds', subjectIds);

    if (!subjectIds) {
      this.router.navigate(['teacher-management/follow-up']);
      return;
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.generateTeacherContractProcess(subjectIds).subscribe(
      (resp) => {
        if (resp) {
          console.log('resp generate', resp);
          this.isWaitingForResponse = false;
          this.data = true;
          this.dataContractProcess = _.cloneDeep(resp);
          this.populateFormFolUp(_.cloneDeep(resp));
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

  populateFormFolUp(data) {
    if (data.contract_manager && data.contract_manager._id) {
      data.contract_manager = data.contract_manager._id;
    }
    if (data.scholar_season && data.scholar_season._id) {
      data.scholar_season = data.scholar_season._id;
    }
    if (data.legal_entity && data.legal_entity._id) {
      data.legal_entity = data.legal_entity._id;
    }
    let startDate = '';
    let endDate = '';
    let startTime = '';
    let endTime = '';
    if (data?.interventions && data?.interventions.length) {
      if (
        data.interventions[0].program_sequence_id &&
        data.interventions[0].program_sequence_id.start_date &&
        data.interventions[0].program_sequence_id.start_date.date
      ) {
        startDate = data.interventions[0].program_sequence_id.start_date.date;
        startTime = data.interventions[0].program_sequence_id.start_date.time;
      } else if (
        data.interventions[0].sequence_id &&
        data.interventions[0].sequence_id.start_date &&
        data.interventions[0].sequence_id.start_date.date
      ) {
        startDate = data.interventions[0].sequence_id.start_date.date;
        startTime = data.interventions[0].sequence_id.start_date.time;
      }
      const lastIndex = data.interventions.length - 1;
      if (
        data.interventions[lastIndex].program_sequence_id &&
        data.interventions[lastIndex].program_sequence_id.end_date &&
        data.interventions[lastIndex].program_sequence_id.end_date.date
      ) {
        endDate = data.interventions[lastIndex].program_sequence_id.end_date.date;
        endTime = data.interventions[lastIndex].program_sequence_id.end_date.time;
      } else if (
        data.interventions[lastIndex].sequence_id &&
        data.interventions[lastIndex].sequence_id.end_date &&
        data.interventions[lastIndex].sequence_id.end_date.date
      ) {
        endDate = data.interventions[lastIndex].sequence_id.end_date.date;
        endTime = data.interventions[lastIndex].sequence_id.end_date.time;
      }
    }
    if (data.campus_id && data.campus_id._id) {
      data.campus_id = data.campus_id._id;
      this.filterCampus.setValue(data.campus_id.name);
    }
    if (data.level_name) {
      data.level_name = data.level_name;
    }
    if (data.echelon) {
      data.echelon = data.echelon;
    }
    this.t = data.contract_type;
    if (this.t === 'convention') {
      if (data.interventions && data.interventions.length) {
        data.interventions = data.interventions.map((int) => {
          const intervention = {
            type_intervention: int.type_intervention,
            program: int?.program?._id,
            subject_id: int?.program_subject_id?._id ? int?.program_subject_id?._id : int?.course_subject_id?._id,
            hourly_rate: int.hourly_rate ? int?.hourly_rate : 0,
            total_hours: int?.total_hours ? int?.total_hours : 0,
          };
          this.getDataManualSubjectDropdown();
          this.interventionsArray().push(this.newIntervention());
          return intervention;
        });
      }
    } else {
      if (data.interventions && data.interventions.length) {
        data.interventions = data.interventions.map((int) => {
          const intervention = {
            type_intervention: int.type_intervention,
            program: int?.program?._id,
            subject_id: int?.program_subject_id?._id ? int?.program_subject_id?._id : int?.course_subject_id?._id,
            hourly_rate: int?.hourly_rate ? int?.hourly_rate : 0,
            total_hours: int?.total_hours ? int?.total_hours : 0,
            paid_leave_allowance_rate: int?.paid_leave_allowance_rate ? int?.paid_leave_allowance_rate : 0,
            induced_hours_coefficient: int?.induced_hours_coefficient ? int?.induced_hours_coefficient : 0,
          };
          this.getDataManualSubjectDropdown();
          this.interventionsArray().push(this.newIntervention());
          return intervention;
        });
      }
    }
    this.contractForm.patchValue(data);
    this.contractForm.get('start_date').patchValue(this.parseToLocal.transformDateToJavascriptDate(startDate, startTime));
    this.contractForm.get('end_date').patchValue(this.parseToLocal.transformDateToJavascriptDate(endDate, endTime));

    this.subs.sink = this.countryService.isAllCountryAlreadyPopulated$.subscribe((resp) => {
      if(resp) {
        if(data?.phone_number_indicative) {
          const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === data?.phone_number_indicative);
          let tempCountry = this.countryCodeList[findIdx] ? this.countryCodeList[findIdx] : null;
          this.dialCodeControl?.patchValue(tempCountry);
        };
      }
    })

    if(data?.portable_phone) {
      this.phoneNumberControl?.patchValue(data?.portable_phone);
    }

    // recalculate hourly rate and total hours value;
    if (this.t !== 'convention') {
      const form = this.interventionsArray().controls;
      if (form && form.length) {
        this.interventionsArray().controls.forEach((val, index) => {
          const hourly_rate = val.get('hourly_rate').value;
          const total_hours = val.get('total_hours').value;
          this.getHourlyRateValue(hourly_rate, index);
          this.getTotalHoursValue(total_hours, index);
        });
      }
    }

    this.setTotalAmount();
    this.initialForm = this.contractForm.getRawValue();
    this.contractForm.get('civility').disable();
    this.contractForm.get('first_name').disable();
    this.contractForm.get('last_name').disable();
    this.contractForm.get('email').disable();
    this.contractForm.get('portable_phone').disable();
    this.contractForm.get('phone_number_indicative').disable();
    this.dialCodeControl.disable();
    this.phoneNumberControl.disable();
    this.contractForm.get('legal_entity').disable();
    this.contractForm.get('scholar_season').disable();
    this.contractForm.get('contract_type').disable();
    this.contractForm.get('total_amount').disable();

    // disable related controls in array;
    const form = this.interventionsArray().controls;
    if (form && form.length) {
      this.interventionsArray().controls.forEach((val, index) => {
        this.interventionsArray().at(index).get('type_intervention').disable();
        this.interventionsArray().at(index).get('program').disable();
        this.interventionsArray().at(index).get('subject_id').disable();
        this.interventionsArray().at(index).get('hourly_rate').disable();
        this.interventionsArray().at(index).get('total_hours').disable();
        if (this.t === 'cddu') {
          this.interventionsArray().at(index).get('trial_period').disable();
          this.interventionsArray().at(index).get('paid_leave_allowance_rate').disable();
          this.interventionsArray().at(index).get('rate_excluding_paid_leave_allowance').disable();
          this.interventionsArray().at(index).get('compensation_paid_vacation').disable();
          this.interventionsArray().at(index).get('total_period').disable();
          this.interventionsArray().at(index).get('induced_hours_coefficient').disable();
          this.interventionsArray().at(index).get('volume_hours_induced').disable();
          this.interventionsArray().at(index).get('total_hours_volume_hours_induced').disable();
        }
      });
    }
    console.log('final form', this.contractForm.getRawValue());
    // this.getSubjectDropdown(data.program._id);
  }

  getContractProcess(_id) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getContractProcessForm(_id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.data = true;
        this.dataContractProcess = _.cloneDeep(resp);

        this.dataContractProcess = {
          ...this.dataContractProcess,
          user_id: {
            _id: this.dataContractProcess?.teacher_subject_id?.length ? this.dataContractProcess?.teacher_subject_id[0]?.teacher_id?._id : null,
          }
        } 
        delete this.dataContractProcess?.teacher_subject_id?.teacher_id;

        if (resp.teacher_subject_id && resp.teacher_subject_id.length) {
          resp.teacher_subject_id.forEach((subject) => {
            this.teacherSubjectIdfromEdit.push(subject._id);
          });
          console.log('this.teacherSubjectIdfromEdit', this.teacherSubjectIdfromEdit);
        } else {
          this.teacherSubjectIdfromEdit = [];
        }
        this.populateForm(_.cloneDeep(resp));
        this.setTotalAmount();
        if (resp && resp.form_builder_id && resp.form_builder_id._id) {
          this.contractForm.disable();
          this.filterCampus.disable();
        }
      },
      (err) => {
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

  populateForm(data, type?) {
    if (data && data.start_date && data.start_time) {
      data.start_date = this.parseToLocal.transformDateToJavascriptDate(data.start_date, data.start_time);
    }
    if (data && data.end_date && data.end_time) {
      data.end_date = this.parseToLocal.transformDateToJavascriptDate(data.end_date, data.end_time);
    }
    if (data.contract_manager && data.contract_manager._id) {
      data.contract_manager = data.contract_manager._id;
    }
    if (data.legal_entity && data.legal_entity._id) {
      data.legal_entity = data.legal_entity._id;
    }
    if (data.school && data.school._id) {
      data.school = data.school._id;
    }
    if (data.scholar_season && data.scholar_season._id) {
      data.scholar_season = data.scholar_season._id;
    }
    if (data.schools_id && data.schools_id.length) {
      data.schools_id = data.schools_id.map((list) => list._id);
    }
    if (data.teacher_subject_id && data.teacher_subject_id.length) {
      // We take index 0 because validation teacher name/legal entites/program/subject should be same
      if (
        data.teacher_subject_id[0] &&
        data.teacher_subject_id[0].legal_representative &&
        data.teacher_subject_id[0].legal_representative._id
      ) {
        data.legal_representative = data.teacher_subject_id[0].legal_representative._id;
        const userName =
          data.teacher_subject_id[0].legal_representative.last_name + ' ' + data.teacher_subject_id[0].legal_representative.first_name;
        this.getLegalRepresentativeDropdown(userName);
      }
      if (data.teacher_subject_id[0] && data.teacher_subject_id[0].campus_id && data.teacher_subject_id[0].campus_id._id) {
        data.campus_id = data.teacher_subject_id[0].campus_id._id;
        this.filterCampus.setValue(data.teacher_subject_id[0].campus_id.name);
      }
      if (data.teacher_subject_id[0] && data.teacher_subject_id[0].level_name) {
        data.level_name = data.teacher_subject_id[0].level_name;
      }
      if (data.teacher_subject_id[0] && data.teacher_subject_id[0].echelon) {
        data.echelon = data.teacher_subject_id[0].echelon;
      }
    }

    this.t = data.contract_type;

    if (data && data.interventions.length) {
      for (let i = 0; i < data.interventions.length; i++) {
        if (!type) {
          this.addIntervention();
        }
        if (data.interventions[i].program_subject_id && data.interventions[i].program_subject_id._id) {
          data.interventions[i].subject_id = data.interventions[i].program_subject_id._id;
        } else if (data.interventions[i].subject_id && data.interventions[i].subject_id._id) {
          data.interventions[i].subject_id = data.interventions[i].subject_id._id;
        }
        if (data.interventions[i].program && data.interventions[i].program._id) {
          data.interventions[i].program = data.interventions[i].program._id;
        }
        this.getDataManualSubjectDropdown();
      }
    }

    this.isReadOnly = true;
    this.contractForm.patchValue(data);
    this.contractForm.disable();
    this.filterCampus.disable();
    this.initialForm = this.contractForm.getRawValue();
  }

  typeChange(v) {
    if (v) {
      this.interventionsArray().clear();
      if (this.interventionsArray().length === 0) {
        this.t = v;
        this.addIntervention();
        this.contractForm.get('total_amount').setValue(0);
      }
    }
  }

  initForm() {
    this.contractForm = this.fb.group({
      civility: [null, Validators.required],
      first_name: [null, Validators.required],
      last_name: [null, Validators.required],
      email: [null, [Validators.required, CustomValidators.email]],
      portable_phone: [null],
      phone_number_indicative: [null],
      contract_type: [null, Validators.required],
      start_date: [null, Validators.required],
      end_date: [null, Validators.required],
      contract_manager: [null, Validators.required],
      school: [null],
      schools_id: [null, Validators.required],
      total_amount: [null, Validators.required],
      legal_entity: [null, Validators.required],
      scholar_season: [null, Validators.required],
      legal_representative: [null, Validators.required],
      interventions: this.fb.array([]),
      campus_id: [null, Validators.required],
      level_name: [null, Validators.required],
      echelon: [null, Validators.required],
    });

    // this.getSubjectDropdown();
    this.getDataScholarSeasons();
    this.getProgramDropdown();
    this.getLegalDropdown();
    this.getSignalementEmailDropdown();
    this.getContractManagerDropdown();
    this.getLegalRepresentativeDropdown();

    this.contractForm.controls.end_date.valueChanges.subscribe((data) => {
      const startDate = _.cloneDeep(this.contractForm.controls.start_date.value);
      const endDate = _.cloneDeep(data);
      let difference = 0;
      if (startDate && endDate) {
        difference = Math.floor(
          (Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) -
            Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) /
            (1000 * 60 * 60 * 24),
        );
      }

      // calc for total period and trial period
      let term1 = difference / 7;
      const term2 = Math.round((term1 - Math.floor(term1)) * 10);
      if (term2 === 0) {
        term1 = term1;
      } else {
        if (term2 < 5) {
          term1 = Math.floor(term1) + 0.5;
        } else {
          term1 = Math.floor(term1) + 1;
        }
      }
      let term3 = term1;
      if (term1 > 14) {
        term3 = 14;
      }

      this.totalPeriod = term1;
      this.trialPeriod = term3;

      for (let i = 0; i < this.interventionsArray().length; i++) {
        if (this.interventionsArray().controls[i].get('total_period') && this.interventionsArray().controls[i].get('trial_period')) {
          this.interventionsArray().controls[i].get('total_period').setValue(this.totalPeriod);
          this.interventionsArray().controls[i].get('trial_period').setValue(this.trialPeriod);
        }
      }
    });
    this.initialForm = this.contractForm.getRawValue();
  }

  interventionsArray(): UntypedFormArray {
    return this.contractForm.get('interventions') as UntypedFormArray;
  }

  newIntervention(): UntypedFormGroup {
    if (this.t === 'convention') {
      return this.fb.group({
        type_intervention: [null, Validators.required],
        program: [null, Validators.required],
        subject_id: [null, Validators.required],
        total_hours: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
        hourly_rate: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
      });
    } else {
      return this.fb.group({
        type_intervention: [null, Validators.required],
        program: [null, Validators.required],
        subject_id: [null, Validators.required],
        total_hours: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
        hourly_rate: [null, [Validators.required, Validators.pattern('^(?:\\d*(?:[.,]\\d{1,2})?|[.,]\\d{1,2})$')]],
        paid_leave_allowance_rate: [null, Validators.required],
        rate_excluding_paid_leave_allowance: [null, Validators.required],
        compensation_paid_vacation: [null, Validators.required],
        total_period: [null, Validators.required],
        trial_period: [null, Validators.required],
        induced_hours_coefficient: [null, Validators.required],
        volume_hours_induced: [null, Validators.required],
        total_hours_volume_hours_induced: [null, Validators.required],
      });
    }
  }

  addIntervention() {
    this.interventionsArray().push(this.newIntervention());
    for (let i = 0; i < this.interventionsArray().length; i++) {
      if (this.interventionsArray().controls[i].get('total_period') && this.interventionsArray().controls[i].get('trial_period')) {
        this.interventionsArray().controls[i].get('total_period').setValue(this.totalPeriod);
        this.interventionsArray().controls[i].get('trial_period').setValue(this.trialPeriod);
      }
    }
  }

  removeIntervention(index: number) {
    this.interventionsArray().removeAt(index);
    this.setTotalAmount();
  }
  getSubjectFromProgram(event) {
    console.log('program selected 2', event);
    if (event && event._id) {
      this.getSubjectDropdown(event._id);
    }
  }
  programSelected(event, index) {
    console.log('program selected', event);
    if (event) {
      this.isWaitingForProgramResponse = true;
      this.subs.sink = this.contractService.GetProgramSelected(event._id).subscribe(
        (resp) => {
          this.isWaitingForProgramResponse = false;
          if (resp && resp.paid_leave_allowance_rate) {
            this.interventionsArray().controls[index].get('paid_leave_allowance_rate').setValue(resp.paid_leave_allowance_rate);
          } else {
            this.interventionsArray().controls[index].get('paid_leave_allowance_rate').setValue(0);
          }
          if (resp && resp.induced_hours_coefficient) {
            this.interventionsArray().controls[index].get('induced_hours_coefficient').setValue(resp.induced_hours_coefficient);
          } else {
            this.interventionsArray().controls[index].get('induced_hours_coefficient').setValue(0);
          }
          if (resp && resp.paid_leave_allowance_rate) {
            const hourlyRate = this.interventionsArray().controls[index].get('hourly_rate').value;
            this.getHourlyRateValue(hourlyRate, index);
          } else {
            this.interventionsArray().controls[index].get('hourly_rate').setValue(0);
            this.interventionsArray().controls[index].get('rate_excluding_paid_leave_allowance').setValue(0);
            this.interventionsArray().controls[index].get('compensation_paid_vacation').setValue(0);
          }
          if (resp && resp.induced_hours_coefficient) {
            const totalHours = this.interventionsArray().controls[index].get('total_hours').value;
            this.getTotalHoursValue(totalHours, index);
          } else {
            this.interventionsArray().controls[index].get('total_hours').setValue(0);
            this.interventionsArray().controls[index].get('volume_hours_induced').setValue(0);
            this.interventionsArray().controls[index].get('total_hours_volume_hours_induced').setValue(0);
          }
          if (resp && resp._id) {
            this.getSubjectDropdown(resp._id);
          }
        },
        (err) => {
          this.isWaitingForProgramResponse = false;
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
      this.interventionsArray().controls[index].get('paid_leave_allowance_rate').setValue(0);
      this.interventionsArray().controls[index].get('induced_hours_coefficient').setValue(0);
      this.interventionsArray().controls[index].get('rate_excluding_paid_leave_allowance').setValue(0);
      this.interventionsArray().controls[index].get('volume_hours_induced').setValue(0);
    }
  }

  getHourlyRateValue(value, index) {
    if (this.t === 'cddu') {
      const paid = this.interventionsArray().controls[index].get('paid_leave_allowance_rate').value;
      let rate = value / paid;
      let compensation = value - rate;
      const sRate = rate && rate.toFixed(2) ? rate.toFixed(2) : '0';
      const sCompensation = compensation && compensation.toFixed(2) ? compensation.toFixed(2) : '0';
      rate = sRate ? parseFloat(sRate) : 0;
      compensation = sCompensation ? parseFloat(sCompensation) : 0;
      this.interventionsArray()
        .controls[index].get('rate_excluding_paid_leave_allowance')
        .setValue(isFinite(rate) ? rate : null);
      this.interventionsArray()
        .controls[index].get('compensation_paid_vacation')
        .setValue(isFinite(compensation) ? compensation : null);
    }
    this.setTotalAmount();
  }

  getTotalHoursValue(value, index) {
    if (this.t === 'cddu') {
      const induced = this.interventionsArray().controls[index].get('induced_hours_coefficient').value;
      let volume = value * induced;
      let total = +value + volume;
      const sVolume = volume && volume.toFixed(2) ? volume.toFixed(2) : '0';
      const sTotal = total && total.toFixed(2) ? total.toFixed(2) : '0';
      volume = sVolume ? parseFloat(sVolume) : 0;
      total = sTotal ? parseFloat(sTotal) : 0;
      this.interventionsArray().controls[index].get('volume_hours_induced').setValue(volume);
      this.interventionsArray().controls[index].get('total_hours_volume_hours_induced').setValue(total);
    }
    this.setTotalAmount();
  }

  setTotalAmount() {
    const data = _.cloneDeep(this.interventionsArray().value);
    let totalAmount = 0;
    if (data && data.length) {
      data.forEach((element) => {
        if (element.total_hours && element.hourly_rate) {
          totalAmount = totalAmount + element.total_hours * element.hourly_rate;
        }
      });
    }
    if (totalAmount) {
      this.contractForm.get('total_amount').setValue(totalAmount.toFixed(2));
    }
    this.initialForm = this.contractForm.getRawValue();
  }

  getSubjectDropdown(id?) {
    this.isWaitingForResponse = true;
    const filter = {
      program_id: id ? id : null,
    };
    this.subjects = [];
    this.subs.sink = this.contractService.getAllProgramSubjects(filter).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.subjects.push(...resp);
          this.subjects = _.sortBy(this.subjects, 'name');
        }
      },
      (err) => {
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

  getDataManualSubjectDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllProgramSubjectDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.subjects.push(...resp);
          this.subjects = _.sortBy(this.subjects, 'name');
        }
      },
      (err) => {
        // Record error log
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
            type: 'error',
            title: 'Error',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  filterProgram() {
    const scholar = this.contractForm.get('scholar_season').value;
    if (scholar) {
      this.programs = this.originPrograms.filter((list) => list.scholar_season_id._id === scholar);
      this.programs = this.programs.map((list) => {
        return {
          program: list.scholar_season_id.scholar_season + ' - ' + list.program,
          _id: list._id,
        };
      });
    } else {
      this.programs = this.originPrograms;
      this.programs = this.programs.map((list) => {
        return {
          program: list.scholar_season_id.scholar_season + ' - ' + list.program,
          _id: list._id,
        };
      });
    }
    const type = this.contractForm.get('contract_type').value ? this.contractForm.get('contract_type').value : '';
    this.typeChange(type);
  }

  getProgramDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.GetAllProgramsDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.programs = resp.sort((a: any, b: any) => a.program.localeCompare(b.program));
          this.originPrograms = resp.sort((a: any, b: any) => a.program.localeCompare(b.program));
          this.programs = this.programs.map((list) => {
            return {
              program: list.scholar_season_id.scholar_season + ' - ' + list.program,
              _id: list._id,
            };
          });
          console.log(this.programs);
        }
      },
      (err) => {
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

  getLegalDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.GetAllLegalDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.legalEntities = resp.sort((a: any, b: any) => a.legal_entity_name.localeCompare(b.legal_entity_name));
          console.log(this.legalEntities);
        }
      },
      (err) => {
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

  getSignalementEmailDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllSignalementEmailDropdown(this.currentUserTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.email_sign = resp.filter((list) => list.signalement_email);
        }
      },
      (err) => {
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

  getContractManagerDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllContractManagerDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          const contractManager = _.cloneDeep(resp);
          this.contract_manage = _.sortBy(contractManager, 'last_name');
        }
      },
      (err) => {
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

  getLegalRepresentativeDropdown(username?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllLegalRepresentativeDropdown(username ? username : '').subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          const legalRepresentative = _.cloneDeep(resp);
          this.legal_representative = _.sortBy(legalRepresentative, 'last_name');
          this.initTypeAhead();
        }
      },
      (err) => {
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

  initTypeAhead() {
    this.filteredLegalRepresentative = concat(
      of([]),
      this.inputLegalRepresent$.pipe(
        startWith(''),
        debounceTime(500),
        concatMap((searchTxt) => {
          if (searchTxt) {
            this.isLoadingFilter = true;
            return concat(
              of([]), // To reset dropdown
              this.contractService.getAllLegalRepresentativeDropdown(searchTxt).pipe(
                take(1),
                tap(() => {
                  this.isLoadingFilter = false;
                }),
                catchError((err) => {
                  this.isLoadingFilter = false;
                  return of([]);
                }),
              ),
            );
          } else {
            return of(this.legal_representative);
          }
        }),
        map((val) => {
          console.log('dropdown', val);
          return val;
        }),
      ),
    );
  }

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        // console.log(resp);
        if (resp && resp.length) {
          this.scholars = resp;
          this.scholars = this.scholars.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
          // this.scholarFilter.setValue(this.scholars[0]._id);
        }
      },
      (err) => {
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

  onSave() {
    console.log('form', this.contractForm.value);
    if (this.contractForm.invalid || this.filterCampus.invalid) {
      this.contractForm.markAllAsTouched();
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      const teacherSubjectId = JSON.parse(localStorage.getItem('teacherSubjectIds'));
      const formattedData = {
        ...this.contractForm.getRawValue(),
        start_date: this.contractForm.value.start_date
          ? this.parseToUTC.transformDate(this.contractForm.value.start_date.toLocaleDateString('en-GB'), '15:59')
          : '',
        start_time: '15:59',
        end_date: this.contractForm.value.end_date
          ? this.parseToUTC.transformDate(this.contractForm.value.end_date.toLocaleDateString('en-GB'), '15:59')
          : '',
        end_time: '15:59',
        total_amount: parseFloat(this.contractForm.getRawValue().total_amount),
        teacher_subject_id: teacherSubjectId ? teacherSubjectId : '',
      };
      if (this.fromFollowUp) {
        formattedData.teacher_subject_id = teacherSubjectId;
      } else {
        if (this.teacherSubjectIdfromEdit.length) {
          formattedData.teacher_subject_id = this.teacherSubjectIdfromEdit;
        } else {
          delete formattedData.teacher_subject_id;
        }
      }
      if (formattedData && formattedData.interventions && formattedData.interventions.length) {
        formattedData.interventions = formattedData.interventions.map((list) => {
          return {
            program: list.program,
            subject_id: list.subject_id,
            type_intervention: list.type_intervention,
            hourly_rate: parseFloat(list.hourly_rate),
            total_hours: parseFloat(list.total_hours),
            paid_leave_allowance_rate: list.paid_leave_allowance_rate ? parseFloat(list.paid_leave_allowance_rate) : null,
            rate_excluding_paid_leave_allowance: list.rate_excluding_paid_leave_allowance
              ? parseFloat(list.rate_excluding_paid_leave_allowance)
              : null,
            compensation_paid_vacation: list.compensation_paid_vacation ? parseFloat(list.compensation_paid_vacation) : null,
            total_period: list.total_period ? parseFloat(list.total_period) : null,
            trial_period: list.trial_period ? parseFloat(list.trial_period) : null,
            induced_hours_coefficient: list.induced_hours_coefficient ? parseFloat(list.induced_hours_coefficient) : null,
            volume_hours_induced: list.volume_hours_induced ? parseFloat(list.volume_hours_induced) : null,
            total_hours_volume_hours_induced: list.total_hours_volume_hours_induced
              ? parseFloat(list.total_hours_volume_hours_induced)
              : null,
          };
        });
      }
      formattedData.user_id = this.dataContractProcess?.user_id?._id;
      console.log('Payload', formattedData);
      console.log('contract form after formation', this.contractForm.value);
      if (this._id) {
        this.updateContract(formattedData);
      } else {
        this.createNewContract(formattedData);
      }
    }
  }

  updateContract(formattedData) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.updateContractProcess(this._id, formattedData).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.initialForm = this.contractForm.getRawValue();
          Swal.fire({
            type: 'success',
            title: this.translate.instant('Bravo!'),
            confirmButtonText: this.translate.instant('OK'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.router.navigate(['teacher-contract/contract-management']);
          });
        }
      },
      (err) => {
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

  createNewContract(formattedData) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.createContractProcess(formattedData).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        console.log('contract form after new creation', this.contractForm.value);
        if (resp) {
          this.initialForm = this.contractForm.getRawValue();
          Swal.fire({
            type: 'success',
            title: this.translate.instant('InterCont_S7.Title'),
            html: this.translate.instant('InterCont_S7.Text'),
            confirmButtonText: this.translate.instant('InterCont_S7.Button'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.router.navigate(['teacher-contract/contract-management']);
          });
        }
      },
      (err) => {
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

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    let input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
  onSendingPreContract() {
    this.contractForm.markAllAsTouched();
    const teacherSubjectId = JSON.parse(localStorage.getItem('teacherSubjectIds'));
    const formattedData = {
      ...this.contractForm.getRawValue(),
      start_date: this.contractForm.value.start_date
        ? this.parseToUTC.transformDate(this.contractForm.value.start_date.toLocaleDateString('en-GB'), '15:59')
        : '',
      start_time: '15:59',
      end_date: this.contractForm.value.end_date
        ? this.parseToUTC.transformDate(this.contractForm.value.end_date.toLocaleDateString('en-GB'), '15:59')
        : '',
      end_time: '15:59',
      total_amount: parseFloat(this.contractForm.getRawValue().total_amount),
      teacher_subject_id: teacherSubjectId ? teacherSubjectId : '',
    };
    if (this.fromFollowUp) {
      formattedData.teacher_subject_id = teacherSubjectId;
    } else {
      if (this.teacherSubjectIdfromEdit.length) {
        formattedData.teacher_subject_id = this.teacherSubjectIdfromEdit;
      } else {
        delete formattedData.teacher_subject_id;
      }
    }
    if (formattedData && formattedData.interventions && formattedData.interventions.length) {
      formattedData.interventions = formattedData.interventions.map((list) => {
        return {
          program: list.program,
          subject_id: list.subject_id,
          type_intervention: list.type_intervention,
          hourly_rate: parseFloat(list.hourly_rate),
          total_hours: parseFloat(list.total_hours),
          paid_leave_allowance_rate:
            list.paid_leave_allowance_rate !== null
              ? isFinite(list.paid_leave_allowance_rate)
                ? parseFloat(list.paid_leave_allowance_rate)
                : 0
              : null,
          rate_excluding_paid_leave_allowance:
            list.rate_excluding_paid_leave_allowance !== null
              ? isFinite(list.rate_excluding_paid_leave_allowance)
                ? parseFloat(list.rate_excluding_paid_leave_allowance)
                : 0
              : null,
          compensation_paid_vacation:
            list.compensation_paid_vacation !== null
              ? isFinite(list.compensation_paid_vacation)
                ? parseFloat(list.compensation_paid_vacation)
                : 0
              : null,
          total_period: list.total_period !== null ? (isFinite(list.total_period) ? parseFloat(list.total_period) : 0) : null,
          trial_period: list.trial_period !== null ? (isFinite(list.trial_period) ? parseFloat(list.trial_period) : 0) : null,
          induced_hours_coefficient:
            list.induced_hours_coefficient !== null
              ? isFinite(list.induced_hours_coefficient)
                ? parseFloat(list.induced_hours_coefficient)
                : 0
              : null,
          volume_hours_induced:
            list.volume_hours_induced !== null ? (isFinite(list.volume_hours_induced) ? parseFloat(list.volume_hours_induced) : 0) : null,
          total_hours_volume_hours_induced:
            list.total_hours_volume_hours_induced !== null
              ? isFinite(list.total_hours_volume_hours_induced)
                ? parseFloat(list.total_hours_volume_hours_induced)
                : 0
              : null,
        };
      });
    }
    formattedData.user_id = this.dataContractProcess?.user_id?._id;
    if (this._id && this.dataContractProcess && this.dataContractProcess._id && !this.contractForm.invalid) {
      this.isWaitingForProgramResponse = true;
      this.subs.sink = this.contractService.updateContractProcess(this._id, formattedData).subscribe(
        (ressp) => {
          this.isWaitingForProgramResponse = false;
          this.subs.sink = this.dialog
            .open(SendingPreContractFormDialogComponent, {
              width: '800px',
              panelClass: 'certification-rule-pop-up',
              disableClose: true,
              data: {
                type: 'single',
                process: this.dataContractProcess,
                selection: [this.dataContractProcess],
                selectAll: false,
                filter: null,
              },
            })
            .afterClosed()
            .subscribe((resp) => {
              if (resp) {
                this.router.navigate(['teacher-contract/contract-management']);
              }
            });
        },
        (err) => {
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
    } else if (!this._id && !this.contractForm.invalid) {
      this.isWaitingForProgramResponse = true;
      this.subs.sink = this.contractService.createContractProcessAndSend(formattedData).subscribe(
        (ressp) => {
          this.isWaitingForProgramResponse = false;
          this.isSentForm = true;
          this.subs.sink = this.dialog
            .open(SendingPreContractFormDialogComponent, {
              width: '800px',
              panelClass: 'certification-rule-pop-up',
              disableClose: true,
              data: {
                type: 'single',
                process: {
                  ...ressp,
                  user_id: {
                    _id: this.dataContractProcess?.user_id?._id,
                  }
                },
                selection: [ressp],
                selectAll: false,
                filter: null,
              },
            })
            .afterClosed()
            .subscribe((resp) => {
              if (resp) {
                this.router.navigate(['teacher-contract/contract-management']);
              } else {
                this.isSentForm = false;
                this.isWaitingForResponse = true;
                this.subs.sink = this.contractService.deleteContractProcess(ressp._id).subscribe(
                  (responseDelete) => {
                    this.isWaitingForResponse = false;
                  },
                  (err) => {
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
                // **************** Commented because the approach need to delete the contract if it is created because open dialog
                // this.router
                //   .navigateByUrl('/', { skipLocationChange: true })
                //   .then(() => this.router.navigate([`/teacher-contract/contract-process/${ressp._id}`]));
              }
            });
        },
        (err) => {
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
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    }
  }

  isFormUnchanged() {
    const initialForm = JSON.stringify(this.initialForm);
    const currentForm = JSON.stringify(this.contractForm.getRawValue());
    if (initialForm === currentForm || this.isSentForm) {
      return true;
    } else {
      return false;
    }
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (!this.isFormUnchanged()) {
      return new Promise((resolve, reject) => {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('TMTC_S01.TITLE'),
          text: this.translate.instant('TMTC_S01.TEXT'),
          confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
          showCancelButton: true,
          cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.value) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } else {
      return true;
    }
  }

  getDataLegal() {
    let legalData;
    if (this.legalEntities && this.legalEntities.length) {
      const resultLegalData = this.legalEntities.find((legal) => legal._id === this.contractForm.get('legal_entity').value);
      legalData = resultLegalData && resultLegalData.legal_entity_name ? resultLegalData.legal_entity_name : '';
    }
    return legalData;
  }

  getDataScholar() {
    let scholarData;
    if (this.scholars && this.scholars.length) {
      const resultScholarData = this.scholars.find((scholar) => scholar._id === this.contractForm.get('scholar_season').value);
      scholarData = resultScholarData && resultScholarData.scholar_season ? resultScholarData.scholar_season : '';
    }
    return scholarData;
  }

  getDataPrograms(index) {
    let programData;
    if (this.programs && this.programs.length) {
      const resultProgramData = this.programs.find(
        (program) => program._id === this.interventionsArray().controls[index].get('program').value,
      );
      programData = resultProgramData && resultProgramData.program ? resultProgramData.program : '';
    }
    return programData;
  }

  getDataSubjects(index) {
    let subjectData;
    if (this.subjects && this.subjects.length) {
      const resultSubjectData = this.subjects.find(
        (subject) => subject._id === this.interventionsArray().controls[index].get('subject_id').value,
      );
      subjectData = resultSubjectData && resultSubjectData.name ? resultSubjectData.name : '';
    }
    return subjectData;
  }

  getDataUserLegalRepresentative() {
    let userName = '';
    if (this.legal_representative && this.legal_representative.length) {
      const userId = this.contractForm.get('legal_representative').value;
      const resultUser = this.legal_representative.find((user) => user._id === userId);
      if (resultUser) {
        const civility = resultUser.civility === 'neutral' ? '' : ' ' + this.translate.instant(resultUser.civility);
        userName = resultUser.last_name.toUpperCase() + ' ' + resultUser.first_name + civility;
      }
    }
    return userName;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    // this is to remove teacher subject id that saved in local storage if this component is Destroyed
    localStorage.removeItem('teacherSubjectIds');
  }
}