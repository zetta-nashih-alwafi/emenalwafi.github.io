import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import swal from 'sweetalert2';
import { UrgentMessageService } from 'app/service/urgent-message/urgent-message.service';
import { SubSink } from 'subsink';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'apollo-link';
import { removeSpaces } from 'app/service/customvalidator.validator';
import { UserService } from 'app/service/user/user.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

export interface UserType {
  id: string;
  text: string;
}
enum ReturnType {
  LABEL = 'LABEL',
  VALUE = 'VALUE',
  OBJECT = 'OBJECT',
}
interface InputType {
  label: string;
  value: string;
}

@Component({
  selector: 'ms-mail-to-group-dialog',
  templateUrl: './mail-to-group-dialog.component.html',
  styleUrls: ['./mail-to-group-dialog.component.scss'],
})
export class MailToGroupDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  sendEmailForm: UntypedFormGroup;
  public Editor = DecoupledEditor;
  showCC = false;
  showBCC = false;
  userTypes: UserType[] = [];
  checked;
  isWaitingForResponse = false;
  isWaitingForResponseScholar = false;
  isWaitingForResponseSchool = false;
  isWaitingForResponseSector = false;
  isWaitingForResponseSpeciality = false;

  currentUser: any;
  userTypesList: any;
  userList: any;
  userRecipientList: any;
  originalUserTypesList: any;
  originalUserList: any;
  titleReady = false;
  userReady = false;
  userTypeReady = false;
  titles = [];
  mailData: any;
  autocompleteUsers = [];
  autocompleteUserTypes = [];
  filteredTitles: Observable<string[]>;
  filteredUsers: Observable<string[]>;
  filteredUserTypes: Observable<string[]>;
  selectedTitleId: string[] = [];
  selectedScholarSeasonId: string[] = [];
  selectedSchoolId: string[] = [];
  selectedLevelId: string[] = [];
  selectedCampusId: string[] = [];
  selectedSectorId: string[] = [];
  selectedSpecialityId: string[] = [];
  selectedUserTypeId: string[] = [];
  scholars: any[] = [];
  school: any[] = [];
  levels: any[] = [];
  campusList: any[] = [];
  sectorList: any[] = [];
  specialityList: any[] = [];
  listObjective: any[] = [];
  currentUserTypeId: any;
  realCampusList: any = [];
  originalListSectors: any = [];
  originalListSpeciality: any = [];
  isSelectAllCampus = false;
  isSelectAllLevel = false;
  isSelectAllSector = false;
  isSelectAllSpeciality = false;
  composeMailMessage: string;
  selectedEmailTo = [];
  selectedEmailCc = [];
  selectedEmailBcc = [];

  selectedRecepientsList = [];
  ccselectedRecepientsList = [];
  bccselectedRecepientsList = [];

  recepientsList: Observable<Array<string>>;
  ccrecepientsList: Observable<Array<string>>;
  bccrecepientsList: Observable<Array<string>>;

  emailAddressesListTo = [];
  emailAddressesListCc = [];
  emailAddressesListBcc = [];
  filteredOptions: Observable<string[]>;
  @ViewChild('languagesInput', { static: false }) languagesInput: ElementRef<HTMLInputElement>;
  @ViewChild('recipientCc', { static: false }) recipientCc: ElementRef<HTMLInputElement>;
  @ViewChild('recipientBcc', { static: false }) recipientBcc: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('myInput', { static: false }) currentFile: any;

  public isDraftMail = false;
  public DraftData: any = [];
  attachmnetsPaths = [];
  visible = true;
  showCCInput = false;
  showBCCInput = false;
  selectable = true;
  removable = true;
  addOnBlur = true;
  addOnBlurCc = true;
  addOnBlurBcc = true;
  @Input() allowOther = false;
  @Input() returnType: ReturnType = ReturnType.LABEL;
  @Output() optionSelected: EventEmitter<(string | InputType)[]> = new EventEmitter();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  separatorKeysCodesCc: number[] = [ENTER, COMMA];
  separatorKeysCodesBcc: number[] = [ENTER, COMMA];
  languagesCtrl = new UntypedFormControl();
  filteredLanguages: Observable<(string | InputType)[]>;
  languages: (string | InputType)[] = [];
  allLanguages: (string | InputType)[];
  inputOptionsArray: (string | InputType)[];
  recpList = [];
  recpListCc = [];
  recpListBcc = [];
  userTypeList = [];
  isPermission: any;
  public currentMailData = [];
  public config = {
    toolbar: [
      'heading',
      '|',
      'fontsize',
      '|',
      'bold',
      'italic',
      'Underline',
      'strikethrough',
      'highlight',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
    ],
  };
  @ViewChild('chipList') chipList;
  isWarningTo: boolean = false;

  constructor(
    public translate: TranslateService,
    public dialogref: MatDialogRef<MailToGroupDialogComponent>,
    private fb: UntypedFormBuilder,
    private urgentMessageService: UrgentMessageService,
    private userService: UserService,
    private autService: AuthService,
    private fileUploadService: FileUploadService,
    private mailboxService: MailboxService,
    private financeService: FinancesService,
    private candidateService: CandidatesService,
  ) {}

  ngOnInit() {
    this.isPermission = this.autService.getPermission();
    this.currentUser = this.autService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.initFormField();
    this.mailSignature();
    // this.getTitleList();
    this.getUserTypeList();
    this.CheckforDraft();
    this.getDataScholarSeasons();
    this.getDataForList();
    this.getDataForSectors();
  }

  getDataScholarSeasons() {
    this.isWaitingForResponseScholar = true;
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        this.isWaitingForResponseScholar = false;
        if (resp && resp.length) {
          this.scholars = resp;
        }
      },
      (err) => {
        this.autService.postErrorLog(err);
        this.isWaitingForResponseScholar = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataForList() {
    const name = '';
    this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          this.listObjective = resp;
        }
      },
      (err) => {
        this.autService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataCampus() {
    this.levels = [];
    this.campusList = [];
    this.realCampusList = [];
    this.sectorList = [];
    this.specialityList = [];
    this.sendEmailForm.get('campuses').setValue(null);
    this.sendEmailForm.get('levels').setValue(null);
    this.sendEmailForm.get('sectors').setValue(null);
    this.sendEmailForm.get('specialities').setValue(null);
    let school = this.sendEmailForm.get('school_id').value;
    if (school && school.length && (school === 'ALL' || school === 'Tous')) {
      const scholarSeasonSelected = this.sendEmailForm.get('scholar_season_id').value;
      let listSchoolsBasedOnScholarSeason;
      listSchoolsBasedOnScholarSeason = this.listObjective.filter((res) =>
        res.scholar_season_id.find((sch) => sch._id === scholarSeasonSelected),
      );
      const dataSchool = [];
      if (listSchoolsBasedOnScholarSeason.length > 0) {
        const dataTemp = listSchoolsBasedOnScholarSeason.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
        if (dataTemp.length > 0) {
          dataTemp.forEach((element) => {
            dataSchool.push(element._id);
          });
          this.sendEmailForm.get('school_id').patchValue(dataSchool);
          const sCampusList = dataTemp;
          const optionAll = {
            _id: 'ALL',
            name: 'AllS',
          };
          this.campusList.push(optionAll);
          sCampusList.forEach((element) => {
            if (element && element.campuses && element.campuses.length) {
              element.campuses.forEach((campuses) => {
                this.campusList.push(campuses);
                this.realCampusList.push(campuses);
              });
            }
          });
          this.campusList = _.uniqBy(this.campusList, '_id');
        } else {
          this.campusList = [];
          this.realCampusList = [];
        }
      } else {
        this.campusList = [];
        this.realCampusList = [];
      }
    } else {
      school = _.cloneDeep(this.sendEmailForm.get('school_id').value);
      const sSchools = this.listObjective.filter((list) => {
        return school.includes(list._id);
      });
      const optionAll = {
        _id: 'ALL',
        name: 'AllS',
      };
      this.campusList.push(optionAll);
      sSchools.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
            this.realCampusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, '_id');
    }
  }

  getDataSchool() {
    this.sendEmailForm.get('school_id').setValue(null);
    this.sendEmailForm.get('campuses').setValue(null);
    this.sendEmailForm.get('levels').setValue(null);
    this.sendEmailForm.get('sectors').setValue(null);
    this.sendEmailForm.get('specialities').setValue(null);
    this.school = [];
    this.campusList = [];
    this.levels = [];
    this.specialityList = [];
    this.sectorList = [];
    const scholarSeasonIdSelected = this.sendEmailForm.get('scholar_season_id').value;
    // Filter listobjective list and find scholar season that had been selected
    const sSchools = this.listObjective.filter((res) => res.scholar_season_id.find((sch) => sch._id === scholarSeasonIdSelected));
    if (sSchools.length > 0) {
      this.school.push(...sSchools);
    } else {
      this.school = [];
    }
  }

  getDataLevel(type) {
    this.levels = [];
    this.sendEmailForm.get('levels').setValue(null);
    this.sendEmailForm.get('sectors').setValue(null);
    this.sendEmailForm.get('specialities').setValue(null);
    let sCampus = _.cloneDeep(this.sendEmailForm.get('campuses').value);
    const ssCampus = sCampus.filter((list) => list === 'ALL' || list === 'Tous');
    if (ssCampus && ssCampus.length && (ssCampus[0] === 'ALL' || ssCampus[0] === 'Tous')) {
      const dataCampus = [];
      const dataTemp = this.realCampusList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataCampus.push(element._id);
      });
      this.sendEmailForm.get('campuses').patchValue(['ALL', ...dataCampus]);
      const sLevelList = dataTemp;
      const optionAll = {
        _id: 'ALL',
        name: 'AllS',
      };
      this.levels.push(optionAll);
      sLevelList.forEach((element) => {
        if (element && element.levels && element.levels.length) {
          element.levels.forEach((level) => {
            this.levels.push(level);
          });
        }
      });
      this.levels = _.uniqBy(this.levels, '_id');
    } else {
      sCampus = _.cloneDeep(this.sendEmailForm.get('campuses').value);
      if (sCampus && sCampus.length) {
        const sLevelList = this.realCampusList.filter((list) => {
          return sCampus.includes(list._id);
        });
        const optionAll = {
          _id: 'ALL',
          name: 'AllS',
        };
        this.levels.push(optionAll);
        sLevelList.forEach((element) => {
          if (element && element.levels && element.levels.length) {
            element.levels.forEach((level) => {
              this.levels.push(level);
            });
          }
        });
        this.levels = _.uniqBy(this.levels, '_id');
      } else {
        this.levels = [];
      }
    }
    if (sCampus && sCampus.length && (sCampus.includes('ALL') || sCampus.includes('Tous'))) {
      this.isSelectAllCampus = true;
      if (!this.isSelectAllCampus) {
        const dataTemps = sCampus.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.sendEmailForm.get('campuses').setValue(dataTemps);
      } else if (
        type &&
        type.value &&
        type.value.length &&
        (type.value.includes('ALL') || type.value.includes('Tous')) &&
        type.value.length === this.realCampusList.length
      ) {
        const dataTemps = sCampus.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.sendEmailForm.get('campuses').setValue(dataTemps);
      }
    } else {
      if (this.realCampusList.length !== 1 && this.realCampusList.length === sCampus.length) {
        if (this.isSelectAllCampus) {
          this.isSelectAllCampus = false;
        }
      }
    }
  }

  clickCampus(type) {
    const sCampus = _.cloneDeep(this.sendEmailForm.get('campuses').value);
    if (type === 'ALL' && this.realCampusList.length === sCampus.length) {
      this.isSelectAllCampus = false;
      this.sendEmailForm.get('campuses').setValue(null);
    }
  }
  clickLevel(type) {
    const sLevels = _.cloneDeep(this.sendEmailForm.get('levels').value);
    const dataTemps = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
    // console.log('level', type, dataTemps.length, sLevels.length);
    if (type === 'ALL' && dataTemps.length === sLevels.length) {
      this.isSelectAllLevel = false;
      this.sendEmailForm.get('levels').setValue(null);
    }
  }
  clickSector(type) {
    const sSectors = _.cloneDeep(this.sendEmailForm.get('sectors').value);
    const dataTemps = this.sectorList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
    if (type === 'ALL' && dataTemps.length === sSectors.length) {
      this.isSelectAllSector = false;
      this.sendEmailForm.get('sectors').setValue(null);
    }
  }
  clickSpeciality(type) {
    const sSpecialities = _.cloneDeep(this.sendEmailForm.get('specialities').value);
    const dataTemps = this.specialityList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
    if (type === 'ALL' && dataTemps.length === sSpecialities.length) {
      this.isSelectAllSpeciality = false;
      this.sendEmailForm.get('specialities').setValue(null);
    }
  }

  getDataForSectors() {
    this.isWaitingForResponseSector = true;
    this.subs.sink = this.financeService.GetAllSectorsDropdownWithoutFilter().subscribe(
      (res) => {
        this.isWaitingForResponseSector = false;
        if (res) {
          this.originalListSectors = res.map((data) => {
            const school = data.school_id.map((sch) => sch._id);
            const campus = data.campus_id.map((cam) => cam._id);
            const level = data.level_id.map((lvl) => lvl._id);
            const scholar_season_id = data && data.scholar_season_id && data.scholar_season_id._id ? data.scholar_season_id._id : null;
            return {
              _id: data._id,
              name: data.name,
              school_id: school,
              level_id: level,
              campus_id: campus,
              scholar_season_id: scholar_season_id,
            };
          });
        }
      },
      (err) => {
        this.autService.postErrorLog(err);
        this.isWaitingForResponseSector = false;
        this.originalListSectors = [];
      },
    );
  }

  getSectors(type) {
    this.sendEmailForm.get('sectors').setValue(null);
    this.sendEmailForm.get('specialities').setValue(null);
    this.sectorList = [];

    const sLevel = _.cloneDeep(this.sendEmailForm.get('levels').value);
    const ssLevel = sLevel.filter((list) => list === 'ALL' || list === 'Tous');
    if (ssLevel && ssLevel.length && (ssLevel[0] === 'ALL' || ssLevel[0] === 'Tous')) {
      const dataLevel = [];
      const dataTemp = this.levels.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataLevel.push(element._id);
      });
      this.sendEmailForm.get('levels').patchValue(['ALL', ...dataLevel]);
    }
    if (sLevel && sLevel.length && (sLevel.includes('ALL') || sLevel.includes('Tous'))) {
      this.isSelectAllLevel = !this.isSelectAllLevel;
      if (!this.isSelectAllLevel) {
        const dataTemps = sLevel.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.sendEmailForm.get('levels').setValue(dataTemps);
      }
    } else {
      this.isSelectAllLevel = false;
    }

    const scholarSeason = this.sendEmailForm.get('scholar_season_id').value;

    const campuses = this.sendEmailForm.get('campuses').value;
    const levels = this.sendEmailForm.get('levels').value;
    const filter = {
      scholar_season_id: scholarSeason,
      candidate_school_ids: this.sendEmailForm.get('school_id').value,
      campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
    };

    const optionAll = {
      _id: 'ALL',
      name: 'AllS',
    };

    if (this.originalListSectors.length > 0) {
      let listOriginal = this.originalListSectors.filter((sec) => {
        const school = sec.school_id.includes(filter.candidate_school_ids) ? filter.candidate_school_ids : null;
        const campus = filter.campuses.some((camp) => sec.campus_id && sec.campus_id.includes(camp));
        const level = filter.levels.some((lvl) => sec.level_id.includes(lvl));
        const scholar_season_id = filter.scholar_season_id === sec.scholar_season_id;
        if (school && campus && level && scholar_season_id) {
          return sec;
        }
      });

      if (listOriginal.length > 0) {
        this.sectorList.push(optionAll);
        listOriginal = listOriginal.map((list) => {
          return {
            _id: list._id,
            name: list.name,
          };
        });
        listOriginal.forEach((element) => {
          this.sectorList.push(element);
        });
      } else {
        this.sectorList = [];
      }
    } else {
      this.sectorList = [];
    }
  }

  getSpeciality(type) {
    this.sendEmailForm.get('specialities').setValue(null);
    this.specialityList = [];

    const sSectors = _.cloneDeep(this.sendEmailForm.get('sectors').value);
    const ssSectors = sSectors.filter((list) => list === 'ALL' || list === 'Tous');
    if (ssSectors && ssSectors.length && (ssSectors[0] === 'ALL' || ssSectors[0] === 'Tous')) {
      const dataSectors = [];
      const dataTemp = this.sectorList.filter((list) => list._id !== 'ALL' && list._id !== 'Tous');
      dataTemp.forEach((element) => {
        dataSectors.push(element._id);
      });
      this.sendEmailForm.get('sectors').patchValue(['ALL', ...dataSectors]);
    }
    if (sSectors && sSectors.length && (sSectors.includes('ALL') || sSectors.includes('Tous'))) {
      this.isSelectAllSector = !this.isSelectAllSector;
      if (!this.isSelectAllSector) {
        const dataTemps = sSectors.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.sendEmailForm.get('sectors').setValue(dataTemps);
      }
    } else {
      this.isSelectAllSector = false;
    }

    const scholarSeason = this.sendEmailForm.get('scholar_season_id').value;
    const campuses = this.sendEmailForm.get('campuses').value;
    const levels = this.sendEmailForm.get('levels').value;
    const sectors = this.sendEmailForm.get('sectors').value;
    const speciality = this.sendEmailForm.get('specialities').value;
    const filter = {
      scholar_season_id: scholarSeason,
      candidate_school_ids: this.sendEmailForm.get('school_id').value,
      campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
    };

    this.selectedSpeciality('');
    const optionAll = {
      _id: 'ALL',
      name: 'AllS',
    };
    this.isWaitingForResponseSector = true;
    this.subs.sink = this.candidateService.GetAllSpecializationsByScholar(filter).subscribe(
      (res) => {
        this.isWaitingForResponseSector = false;
        if (res) {
          this.originalListSpeciality = _.cloneDeep(res);
          if (this.originalListSpeciality.length > 0) {
            this.specialityList = [];
            let listOriginal = this.originalListSpeciality;
            if (listOriginal.length > 0) {
              this.specialityList.push(optionAll);
              listOriginal = listOriginal.map((list) => {
                return {
                  _id: list._id,
                  name: list.name,
                };
              });
              listOriginal.forEach((element) => {
                this.specialityList.push(element);
              });
            } else {
              this.specialityList = [];
            }
          } else {
            this.specialityList = [];
          }
        }
      },
      (err) => {
        this.autService.postErrorLog(err);
        this.isWaitingForResponseSector = false;
        this.specialityList = [];
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectSpeciality(type) {
    let speciality = this.sendEmailForm.get('specialities').value;
    if (type === 'None') {
      if (speciality && speciality.length < 1) {
        this.sendEmailForm.get('specialities').setValue(null);
      } else {
        this.sendEmailForm.get('specialities').setValue(['None']);
      }
    } else {
      if (speciality && speciality.length) {
        speciality = speciality.filter((list) => list !== 'None');
        this.sendEmailForm.get('specialities').setValue(speciality);
      }
    }
  }

  selectedSpeciality(type) {
    this.userReady = false;
    const sSpeciality = _.cloneDeep(this.sendEmailForm.get('specialities').value);
    if (sSpeciality && sSpeciality.length && (sSpeciality.includes('ALL') || sSpeciality.includes('Tous'))) {
      const dataSpeciality = [];
      const dataTemp = this.specialityList.filter((list) => list !== 'ALL' && list !== 'Tous');
      dataTemp.forEach((element) => {
        dataSpeciality.push(element._id);
      });
      this.sendEmailForm.get('specialities').patchValue(['ALL', ...dataSpeciality]);
      this.isSelectAllSpeciality = !this.isSelectAllSpeciality;
      if (!this.isSelectAllSpeciality) {
        const dataTemps = sSpeciality.filter((list) => list !== 'ALL' && list !== 'Tous');
        this.sendEmailForm.get('specialities').setValue(dataTemps);
      }
    } else {
      this.isSelectAllSpeciality = false;
    }
    if (!this.sendEmailForm.get('categoryChecked').value) {
      // do nothing...
    } else {
      const selectedUserType = this.sendEmailForm.get('originalUserTypes').value;
      if (selectedUserType === '5fe98eeadb866c403defdc6c') {
        const campuses = this.sendEmailForm.get('campuses').value;
        const levels = this.sendEmailForm.get('levels').value;
        const sectors = this.sendEmailForm.get('sectors').value;
        const speciality = this.sendEmailForm.get('specialities').value;
        const filter = {
          school: this.sendEmailForm.get('school_id').value,
          campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
        };
        this.userService.getAllCandidates(filter).subscribe(
          (resp) => {
            this.userRecipientList = resp;
          },
          (err) => {
            this.autService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.userService.getUserTypesByEntityEdh().subscribe(
          (resp) => {
            this.userRecipientList = resp;
          },
          (err) => {
            this.autService.postErrorLog(err);
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

  initFormField() {
    this.sendEmailForm = this.fb.group({
      to: ['', [Validators.required, removeSpaces]],
      cc: ['', [removeSpaces]],
      bcc: ['', [removeSpaces]],
      subject: ['', [Validators.required, removeSpaces]],
      message: ['', Validators.required],
      categoryChecked: [false],
      userTypes: [[]],
      originalUserTypes: [''],
      school_id: [null, Validators.required],
      campuses: [null, Validators.required],
      scholar_season_id: [null, Validators.required],
      levels: [null, Validators.required],
      sectors: [null, Validators.required],
      specialities: [null],
    });
  }

  handleInputChange(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            this.attachmnetsPaths.push({
              path: resp.file_url,
              name: resp.file_name,
            });
          }
        },
        (err) => {
          this.autService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: 'OK',
          });
        },
      );
    }
    this.resetFileState();
  }

  removeAttachment(file) {
    this.attachmnetsPaths.splice(this.attachmnetsPaths.indexOf(file), 1);
  }

  resetFileState() {
    this.currentFile.nativeElement.value = '';
  }
  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  setSelectedEmail(emails: string[], formControl: any) {
    formControl.setValue(emails);
  }

  closeDialog(): void {
    swal
      .fire({
        title: this.translate.instant('MailBox.composeMail.DRAFT.TITLE'),
        html: this.translate.instant('MailBox.composeMail.DRAFT.TEXT'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('MailBox.composeMail.DRAFT.CONFIRMBTN'),
        cancelButtonText: this.translate.instant('MailBox.composeMail.DRAFT.DECBTN'),
      })
      .then((result) => {
        if (result.value) {
          this.saveDraft();
          this.dialogref.close();
        } else {
          this.dialogref.close();
        }
      });
  }

  categoryChange(event) {
    if (event.checked) {
      this.sendEmailForm.get('userTypes').setValidators([Validators.required]);
      this.sendEmailForm.get('userTypes').updateValueAndValidity();
    } else {
      this.sendEmailForm.get('userTypes').patchValue(null);
      this.sendEmailForm.get('userTypes').updateValueAndValidity();
      this.sendEmailForm.get('userTypes').clearValidators();
      this.sendEmailForm.get('userTypes').updateValueAndValidity();
    }
    this.resetRecipientList();
    // console.log('Event : ', event, this.sendEmailForm.controls);
  }

  saveDraft() {
    if (this.isDraftMail) {
      this.isWaitingForResponse = true;
      const formValues = this.sendEmailForm.value;
      if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
        const receiversArray = [];
        this.mailData = {};
        const recipient = this.recpList;
        const recipientCc = this.recpListCc;
        const recipientBcc = this.recpListBcc;
        this.currentUser = this.autService.getLocalStorageUser();
        const senderArray = {
          sender: this.currentUser.email,
          is_read: false,
          mail_type: 'draft',
        };
        if (recipient) {
          const str_array = recipient.toString().split(',');

          for (let i = 0; i < str_array.length; i++) {
            str_array[i] = str_array[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array[i])) {
              receiversArray.push({ recipients: [str_array[i]], rank: 'a', is_read: false, mail_type: 'draft' });
            }
          }
        }

        if (recipientCc) {
          const str_array_cc = recipientCc.toString().split(',');
          for (let i = 0; i < str_array_cc.length; i++) {
            str_array_cc[i] = str_array_cc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_cc[i])) {
              receiversArray.push({ recipients: [str_array_cc[i]], rank: 'cc', is_read: false, mail_type: 'draft' });
            }
          }
        }

        if (recipientBcc) {
          const str_array_bcc = recipientBcc.toString().split(',');
          for (let i = 0; i < str_array_bcc.length; i++) {
            str_array_bcc[i] = str_array_bcc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_bcc[i])) {
              receiversArray.push({ recipients: [str_array_bcc[i]], rank: 'c', is_read: false, mail_type: 'draft' });
            }
          }
        }
        const MailAttachment = [];
        const MailAttachment1 = [];
        const campuses = this.sendEmailForm.get('campuses').value;
        const levels = this.sendEmailForm.get('levels').value;
        const sectors = this.sendEmailForm.get('sectors').value;
        const speciality = this.sendEmailForm.get('specialities').value;

        this.attachmnetsPaths.forEach((files) => {
          const obj = {
            file_name: files.name,
            path: files.path,
          };
          MailAttachment1.push(files.name);
          MailAttachment.push(obj);
        });
        this.mailData.sender_property = senderArray;
        this.mailData.recipient_properties = receiversArray;
        this.mailData.subject = formValues.subject;
        this.mailData.message = formValues.message;
        this.mailData.is_sent = false;
        this.mailData.status = 'active';
        this.mailData.is_urgent_mail = false;
        this.mailData.attachments = MailAttachment1;
        this.mailData.file_attachments = MailAttachment;
        this.mailData.tags = ['draft'];

        this.mailData.is_group_parent = true;
        this.mailData.user_type_selection = this.sendEmailForm.get('categoryChecked').value;
        this.mailData.group_detail = {
          user_types: this.sendEmailForm.get('originalUserTypes').value,
          school_id: this.sendEmailForm.get('school_id').value,
          campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          scholar_season_id: this.sendEmailForm.get('scholar_season_id').value,
          levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          specialities:
            speciality && speciality.length ? speciality.filter((list) => list !== 'ALL' && list !== 'Tous' && list !== 'None') : [],
        };

        this.subs.sink = this.mailboxService.updateSingleMail(this.DraftData['_id'], this.mailData).subscribe(
          (data: any) => {
            this.isWaitingForResponse = false;
            swal.fire({
              type: 'info',
              title: this.translate.instant('MailBox.MESSAGES.DRAFTMSG'),
              text: '',
              confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
            });
          },
          (err) => {
            this.autService.postErrorLog(err);
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
    } else {
      this.isWaitingForResponse = true;
      const formValues = this.sendEmailForm.value;
      if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
        const receiversArray = [];
        this.mailData = {};
        const recipient = this.recpList;
        const recipientCc = this.recpListCc;
        const recipientBcc = this.recpListBcc;
        this.currentUser = this.autService.getLocalStorageUser();
        const senderArray = {
          sender: this.currentUser.email,
          is_read: false,
          mail_type: 'draft',
        };
        if (recipient) {
          const str_array = recipient.toString().split(',');

          for (let i = 0; i < str_array.length; i++) {
            str_array[i] = str_array[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array[i])) {
              receiversArray.push({ recipients: [str_array[i]], rank: 'a', is_read: false, mail_type: 'draft' });
            }
          }
        }

        if (recipientCc) {
          const str_array_cc = recipientCc.toString().split(',');
          for (let i = 0; i < str_array_cc.length; i++) {
            str_array_cc[i] = str_array_cc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_cc[i])) {
              receiversArray.push({ recipients: [str_array_cc[i]], rank: 'cc', is_read: false, mail_type: 'draft' });
            }
          }
        }

        if (recipientBcc) {
          const str_array_bcc = recipientBcc.toString().split(',');
          for (let i = 0; i < str_array_bcc.length; i++) {
            str_array_bcc[i] = str_array_bcc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_bcc[i])) {
              receiversArray.push({ recipients: [str_array_bcc[i]], rank: 'c', is_read: false, mail_type: 'draft' });
            }
          }
        }
        const MailAttachment = [];
        const MailAttachment1 = [];
        const campuses = this.sendEmailForm.get('campuses').value;
        const levels = this.sendEmailForm.get('levels').value;
        const sectors = this.sendEmailForm.get('sectors').value;
        const speciality = this.sendEmailForm.get('specialities').value;
        this.attachmnetsPaths.forEach((files) => {
          const obj = {
            file_name: files.name,
            path: files.path,
          };
          MailAttachment1.push(files.name);
          MailAttachment.push(obj);
        });
        this.mailData.sender_property = senderArray;
        this.mailData.recipient_properties = receiversArray;
        this.mailData.subject = formValues.subject;
        this.mailData.message = formValues.message;
        this.mailData.is_sent = false;
        this.mailData.status = 'active';
        this.mailData.is_urgent_mail = false;
        this.mailData.attachments = MailAttachment1;
        this.mailData.file_attachments = MailAttachment;
        this.mailData.tags = ['draft'];

        this.mailData.is_group_parent = true;
        this.mailData.user_type_selection = this.sendEmailForm.get('categoryChecked').value;
        this.mailData.group_detail = {
          user_types: this.sendEmailForm.get('userTypes').value,
          school_id: this.sendEmailForm.get('school_id').value,
          campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          scholar_season_id: this.sendEmailForm.get('scholar_season_id').value,
          levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          specialities:
            speciality && speciality.length ? speciality.filter((list) => list !== 'ALL' && list !== 'Tous' && list !== 'None') : [],
        };

        this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
          (data: any) => {
            this.isWaitingForResponse = false;
            swal.fire({
              type: 'info',
              title: this.translate.instant('MailBox.MESSAGES.DRAFTMSG'),
              text: '',
              confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
            });
          },
          (err) => {
            this.autService.postErrorLog(err);
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
  }

  sendMail() {
    if (this.isDraftMail) {
      this.isWaitingForResponse = true;
      const formValues = this.sendEmailForm.value;
      if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
        const receiversArray = [];
        this.mailData = {};
        const recipient = this.recpList;
        const recipientCc = this.recpListCc;
        const recipientBcc = this.recpListBcc;
        this.currentUser = this.autService.getLocalStorageUser();
        const senderArray = {
          sender: this.currentUser.email,
          is_read: false,
          mail_type: 'sent',
        };
        if (recipient) {
          const str_array = recipient.toString().split(',');

          for (let i = 0; i < str_array.length; i++) {
            str_array[i] = str_array[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array[i])) {
              receiversArray.push({ recipients: [str_array[i]], rank: 'a', is_read: false, mail_type: 'inbox' });
            }
          }
        }

        if (recipientCc) {
          const str_array_cc = recipientCc.toString().split(',');
          for (let i = 0; i < str_array_cc.length; i++) {
            str_array_cc[i] = str_array_cc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_cc[i])) {
              receiversArray.push({ recipients: [str_array_cc[i]], rank: 'cc', is_read: false, mail_type: 'inbox' });
            }
          }
        }

        if (recipientBcc) {
          const str_array_bcc = recipientBcc.toString().split(',');
          for (let i = 0; i < str_array_bcc.length; i++) {
            str_array_bcc[i] = str_array_bcc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_bcc[i])) {
              receiversArray.push({ recipients: [str_array_bcc[i]], rank: 'c', is_read: false, mail_type: 'inbox' });
            }
          }
        }
        const MailAttachment = [];
        const MailAttachment1 = [];
        const campuses = this.sendEmailForm.get('campuses').value;
        const levels = this.sendEmailForm.get('levels').value;
        const sectors = this.sendEmailForm.get('sectors').value;
        const speciality = this.sendEmailForm.get('specialities').value;
        if (this.selectedUserTypeId && this.selectedUserTypeId.length) {
          this.mailData.user_type_selection = true;
          this.mailData.group_detail = {
            user_types: this.selectedUserTypeId,
            school_id: this.sendEmailForm.get('school_id').value,
            campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
            scholar_season_id: this.sendEmailForm.get('scholar_season_id').value,
            levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
            sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
            specialities:
              speciality && speciality.length ? speciality.filter((list) => list !== 'ALL' && list !== 'Tous' && list !== 'None') : [],
          };
        }
        this.attachmnetsPaths.forEach((files) => {
          const obj = {
            file_name: files.name,
            path: files.path,
          };
          MailAttachment1.push(files.name);
          MailAttachment.push(obj);
        });
        this.mailData.sender_property = senderArray;
        this.mailData.recipient_properties = receiversArray;
        this.mailData.subject = formValues.subject;
        this.mailData.message = formValues.message;
        this.mailData.is_sent = true;
        this.mailData.status = 'active';
        this.mailData.is_urgent_mail = false;
        this.mailData.attachments = MailAttachment1;
        this.mailData.file_attachments = MailAttachment;
        this.mailData.tags = ['sent'];

        this.mailData.is_group_parent = true;
        this.mailData.user_type_selection = this.sendEmailForm.get('categoryChecked').value;

        this.subs.sink = this.mailboxService.updateSingleMail(this.DraftData['_id'], this.mailData).subscribe(
          (data: any) => {
            this.isWaitingForResponse = false;
            this.dialogref.close();
            swal.fire({
              title: this.translate.instant('MailBox.composeMail.MESSAGES.TITLE'),
              text: this.translate.instant('MailBox.composeMail.MESSAGES.TEXT'),
              allowEscapeKey: true,
              type: 'success',
              confirmButtonText: this.translate.instant('MailBox.composeMail.MESSAGES.CONFIRMBTN'),
            });
          },
          (err) => {
            this.autService.postErrorLog(err);
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
    } else {
      this.isWaitingForResponse = true;
      const formValues = this.sendEmailForm.value;
      if (formValues.subject !== '' || (formValues.message !== '' && formValues.message !== undefined)) {
        const receiversArray = [];
        this.mailData = {};
        const recipient = this.recpList;
        const recipientCc = this.recpListCc;
        const recipientBcc = this.recpListBcc;
        this.currentUser = this.autService.getLocalStorageUser();
        const senderArray = {
          sender: this.currentUser.email,
          is_read: false,
          mail_type: 'sent',
        };
        if (recipient) {
          const str_array = recipient.toString().split(',');

          for (let i = 0; i < str_array.length; i++) {
            str_array[i] = str_array[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array[i])) {
              receiversArray.push({ recipients: [str_array[i]], rank: 'a', is_read: false, mail_type: 'inbox' });
            }
          }
        }

        if (recipientCc) {
          const str_array_cc = recipientCc.toString().split(',');
          for (let i = 0; i < str_array_cc.length; i++) {
            str_array_cc[i] = str_array_cc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_cc[i])) {
              receiversArray.push({ recipients: [str_array_cc[i]], rank: 'cc', is_read: false, mail_type: 'inbox' });
            }
          }
        }

        if (recipientBcc) {
          const str_array_bcc = recipientBcc.toString().split(',');
          for (let i = 0; i < str_array_bcc.length; i++) {
            str_array_bcc[i] = str_array_bcc[i].replace(/^\s*/, '').replace(/\s*$/, '');

            if (this.validateEmail(str_array_bcc[i])) {
              receiversArray.push({ recipients: [str_array_bcc[i]], rank: 'c', is_read: false, mail_type: 'inbox' });
            }
          }
        }
        const MailAttachment = [];
        const MailAttachment1 = [];
        const campuses = this.sendEmailForm.get('campuses').value;
        const levels = this.sendEmailForm.get('levels').value;
        const sectors = this.sendEmailForm.get('sectors').value;
        const speciality = this.sendEmailForm.get('specialities').value;
        this.attachmnetsPaths.forEach((files) => {
          const obj = {
            file_name: files.name,
            path: files.path,
          };
          MailAttachment1.push(files.name);
          MailAttachment.push(obj);
        });
        this.mailData.sender_property = senderArray;
        this.mailData.recipient_properties = receiversArray;
        this.mailData.subject = formValues.subject;
        this.mailData.message = formValues.message;
        this.mailData.is_sent = true;
        this.mailData.status = 'active';
        this.mailData.attachments = MailAttachment1;
        this.mailData.file_attachments = MailAttachment;
        this.mailData.tags = ['sent'];

        this.mailData.is_group_parent = true;
        this.mailData.user_type_selection = this.sendEmailForm.get('categoryChecked').value;
        this.mailData.group_detail = {
          user_types: this.sendEmailForm.get('userTypes').value,
          school_id: this.sendEmailForm.get('school_id').value,
          campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          scholar_season_id: this.sendEmailForm.get('scholar_season_id').value,
          levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          sectors: sectors && sectors.length ? sectors.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
          specialities:
            speciality && speciality.length ? speciality.filter((list) => list !== 'ALL' && list !== 'Tous' && list !== 'None') : [],
        };

        this.subs.sink = this.mailboxService.createMail(this.mailData).subscribe(
          (data: any) => {
            this.dialogref.close();
            this.isWaitingForResponse = false;
            swal.fire({
              title: this.translate.instant('MailBox.composeMail.MESSAGES.TITLE'),
              text: this.translate.instant('MailBox.composeMail.MESSAGES.TEXT'),
              allowEscapeKey: true,
              type: 'success',
              confirmButtonText: this.translate.instant('MailBox.composeMail.MESSAGES.CONFIRMBTN'),
            });
          },
          (err) => {
            this.autService.postErrorLog(err);
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
  }

  getUserTypeList() {
    this.subs.sink = this.userService.getUserTypesGroupMail().subscribe(
      (userTypes) => {
        this.userTypesList = userTypes;
        this.originalUserTypesList = userTypes;
        this.subs.sink = this.sendEmailForm
          .get('userTypes')
          .valueChanges.pipe(debounceTime(400))
          .subscribe((searchString) => {
            if (!Array.isArray(searchString)) {
              this.userTypesList = this.originalUserTypesList.filter((com) =>
                com.name
                  .toLowerCase()
                  .trim()
                  .includes(searchString && searchString.length ? searchString.toLowerCase() : ''),
              );
            }
          });
      },
      (err) => {
        this.autService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectedUserType(selectedUserType) {
    this.userReady = false;
    // if selected user type is student, call API getUserTypeStudent
    if (selectedUserType === '5fe98eeadb866c403defdc6c') {
      const campuses = this.sendEmailForm.get('campuses').value;
      const levels = this.sendEmailForm.get('levels').value;
      const sectors = this.sendEmailForm.get('sectors').value;
      const speciality = this.sendEmailForm.get('specialities').value;
      const filter = {
        school: this.sendEmailForm.get('school_id').value,
        campuses: campuses && campuses.length ? campuses.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
        levels: levels && levels.length ? levels.filter((list) => list !== 'ALL' && list !== 'Tous') : [],
      };
      this.userService.getAllCandidates(filter).subscribe((resp) => {
        this.userRecipientList = resp;
      });
    } else {
      this.userService.getUserTypesByEntityEdh().subscribe((resp) => {
        this.userRecipientList = resp;
      });
    }
    this.selectedUserTypeId = [selectedUserType];
  }
  keyupUser(event) {
    this.userReady = true;
  }
  keyupUserType(event) {
    this.userTypeReady = true;
  }
  keyupTitle(event) {
    this.titleReady = true;
  }

  resetRecipientList() {
    this.recpList = [];
    this.recpListCc = [];
    this.recpListBcc = [];
    this.selectedEmailTo = [];
    this.selectedEmailCc = [];
    this.selectedEmailBcc = [];
    this.selectedRecepientsList = [];
    this.ccselectedRecepientsList = [];
    this.bccselectedRecepientsList = [];
    this.sendEmailForm.get('bcc').setValue('');
    this.sendEmailForm.get('cc').setValue('');
    this.sendEmailForm.get('to').setValue('');
  }

  valueChange(event) {
    if (event === 'title') {
      this.titleReady = false;
    } else if (event === 'user') {
      this.userReady = false;
    } else if (event === 'type') {
      this.userTypeReady = false;
    }
    // console.log('button active : ', this.titleReady, this.userReady, this.userTypeReady);
  }

  emitSelectedLanguagesTo() {
    if (this.returnType === ReturnType.OBJECT) {
      this.optionSelected.emit(this.selectedEmailTo);
    } else if (this.returnType === ReturnType.VALUE) {
      this.optionSelected.emit(this.selectedEmailTo.map((o: InputType) => o.value));
    } else {
      this.optionSelected.emit(this.selectedEmailTo.map((o: InputType) => o.label));
    }
  }
  emitSelectedLanguagesCc() {
    if (this.returnType === ReturnType.OBJECT) {
      this.optionSelected.emit(this.selectedEmailCc);
    } else if (this.returnType === ReturnType.VALUE) {
      this.optionSelected.emit(this.selectedEmailCc.map((o: InputType) => o.value));
    } else {
      this.optionSelected.emit(this.selectedEmailCc.map((o: InputType) => o.label));
    }
  }
  emitSelectedLanguagesBcc() {
    if (this.returnType === ReturnType.OBJECT) {
      this.optionSelected.emit(this.selectedEmailBcc);
    } else if (this.returnType === ReturnType.VALUE) {
      this.optionSelected.emit(this.selectedEmailBcc.map((o: InputType) => o.value));
    } else {
      this.optionSelected.emit(this.selectedEmailBcc.map((o: InputType) => o.label));
    }
  }

  removeTo(language: InputType): void {
    const index = this.selectedEmailTo.findIndex((i: InputType) => i === language);
    const globalIndex = this.selectedRecepientsList.findIndex((i: InputType) => i === language);

    if (index >= 0) {
      this.selectedEmailTo.splice(index, 1);
    }
    if (globalIndex >= 0) {
      this.selectedRecepientsList.splice(globalIndex, 1);
    }
    this.emitSelectedLanguagesTo();
  }

  removeCc(language: InputType): void {
    const index = this.selectedEmailCc.findIndex((i: InputType) => i === language);
    const globalIndex = this.selectedRecepientsList.findIndex((i: InputType) => i === language);

    if (index >= 0) {
      this.selectedEmailCc.splice(index, 1);
    }
    if (globalIndex >= 0) {
      this.selectedRecepientsList.splice(globalIndex, 1);
    }
    this.emitSelectedLanguagesCc();
  }

  removeBcc(language: InputType): void {
    const index = this.selectedEmailBcc.findIndex((i: InputType) => i === language);
    const globalIndex = this.selectedRecepientsList.findIndex((i: InputType) => i === language);

    if (index >= 0) {
      this.selectedEmailBcc.splice(index, 1);
    }
    if (globalIndex >= 0) {
      this.selectedRecepientsList.splice(globalIndex, 1);
    }
    this.emitSelectedLanguagesBcc();
  }
  addTo(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;
      const dataEmailSelect = value.split(' ');
      let emailSelect = '';
      dataEmailSelect.forEach((data) => {
        emailSelect = data;
      });
      const sel = emailSelect.replace('<', '');
      const se = sel.replace('>', '');
      if (this.validateEmail(se)) {
        // Add our language
        if ((value || '').trim() && this.allowOther) {
          this.selectedEmailTo.push({ label: value.trim(), value: value.trim() });
        }
      } //else {
      //   console.log('Error not email type!! : ', value);
      // }

      const dirtyTouched = this.sendEmailForm.get('to').dirty || this.sendEmailForm.get('to').touched;
      const selectedEmailToLength = !this.selectedEmailTo.length;
      if (selectedEmailToLength && dirtyTouched) {
        this.isWarningTo = true;
        this.chipList.errorState = true;
      } else {
        this.isWarningTo = false;
        this.chipList.errorState = false;
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sendEmailForm.get('to').setValue(null);
      this.sendEmailForm.get('to').setValue('');
    }
    this.emitSelectedLanguagesTo();
  }

  addCc(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;
      const dataEmailSelect = value.split(' ');
      let emailSelect = '';
      dataEmailSelect.forEach((data) => {
        emailSelect = data;
      });
      const sel = emailSelect.replace('<', '');
      const se = sel.replace('>', '');
      if (this.validateEmail(se)) {
        // Add our language
        if ((value || '').trim() && this.allowOther) {
          this.selectedEmailCc.push({ label: value.trim(), value: value.trim() });
        }
      } // else {
      //   console.log('Error not email type!! : ', value);
      // }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sendEmailForm.get('cc').setValue(null);
      this.sendEmailForm.get('cc').setValue('');
    }
    this.emitSelectedLanguagesCc();
  }

  addBcc(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.chipInput.inputElement;
      const value = event.value;
      const dataEmailSelect = value.split(' ');
      let emailSelect = '';
      dataEmailSelect.forEach((data) => {
        emailSelect = data;
      });
      const sel = emailSelect.replace('<', '');
      const se = sel.replace('>', '');
      if (this.validateEmail(se)) {
        // Add our language
        if ((value || '').trim() && this.allowOther) {
          this.selectedEmailBcc.push({ label: value.trim(), value: value.trim() });
        }
      } // else {
      //   console.log('Error not email type!! : ', value);
      // }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sendEmailForm.get('bcc').setValue(null);
      this.sendEmailForm.get('bcc').setValue('');
    }
    this.emitSelectedLanguagesBcc();
  }

  validateTo(event: MatChipInputEvent): void {
    const input = event?.chipInput?.inputElement;
    const value = event?.value;
  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  setSelectedEmailTo(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    const dataEmailSelect = value.split(' ');
    let emailSelect = '';
    dataEmailSelect.forEach((data) => {
      emailSelect = data;
    });
    const sel = emailSelect.replace('<', '');
    const se = sel.replace('>', '');
    if (this.validateEmail(se)) {
      this.selectedEmailTo.push(value);
      this.selectedRecepientsList.push(value);
    } // else {
    //   console.log('Eror');
    // }
    const dataEmail = value.split(' ');
    let newEmail = '';
    dataEmail.forEach((data) => {
      newEmail = data;
    });
    const ne = newEmail.replace('<', '');
    const e = ne.replace('>', '');
    this.recpList.push(e);
    this.languagesInput.nativeElement.value = '';
    this.sendEmailForm.get('to').setValue(null);
    // this.sendEmailForm.get('to').setValue('');

    this.emitSelectedLanguagesTo();
  }

  setSelectedEmailCc(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    const dataEmailSelect = value.split(' ');
    let emailSelect = '';
    dataEmailSelect.forEach((data) => {
      emailSelect = data;
    });
    const sel = emailSelect.replace('<', '');
    const se = sel.replace('>', '');
    if (this.validateEmail(se)) {
      this.selectedEmailCc.push(value);
      this.selectedRecepientsList.push(value);
    } // else {
    //   console.log('Eror');
    // }
    const dataEmail = value.split(' ');
    let newEmail = '';
    dataEmail.forEach((data) => {
      newEmail = data;
    });
    const ne = newEmail.replace('<', '');
    const e = ne.replace('>', '');
    this.recpListCc.push(e);
    this.recipientCc.nativeElement.value = '';
    this.sendEmailForm.get('cc').patchValue('', { emitEvent: true });
    this.sendEmailForm.get('cc').setValue('');
  }

  setSelectedEmailBcc(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    const dataEmailSelect = value.split(' ');
    let emailSelect = '';
    dataEmailSelect.forEach((data) => {
      emailSelect = data;
    });
    const sel = emailSelect.replace('<', '');
    const se = sel.replace('>', '');
    if (this.validateEmail(se)) {
      this.selectedEmailBcc.push(value);
      this.selectedRecepientsList.push(value);
    } // else {
    //   console.log('Eror');
    // }
    const dataEmail = value.split(' ');
    let newEmail = '';
    dataEmail.forEach((data) => {
      newEmail = data;
    });
    const ne = newEmail.replace('<', '');
    const e = ne.replace('>', '');
    this.recpListBcc.push(e);
    this.sendEmailForm.get('bcc').setValue(null);
    this.sendEmailForm.get('bcc').setValue('');
    this.recipientBcc.nativeElement.value = '';
  }

  resetValueTo() {
    this.sendEmailForm.get('to').patchValue('', { emitEvent: true });
  }

  resetValueCc() {
    this.sendEmailForm.get('cc').patchValue('', { emitEvent: true });
  }

  resetValueBcc() {
    this.sendEmailForm.get('bcc').patchValue('', { emitEvent: true });
  }

  getRecipientsData(titleId) {
    this.subs.sink = this.sendEmailForm
      .get('to')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((full_name) => {
        this.emailAddressesListTo = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingNameForGroup(full_name.toString(), titleId).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListTo.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.autService.postErrorLog(err);
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
    this.subs.sink = this.sendEmailForm
      .get('cc')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((full_name) => {
        this.emailAddressesListCc = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingNameForGroup(full_name.toString(), titleId).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListCc.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.autService.postErrorLog(err);
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
    this.subs.sink = this.sendEmailForm
      .get('bcc')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((full_name) => {
        this.emailAddressesListBcc = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingNameForGroup(full_name.toString(), titleId).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListBcc.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.autService.postErrorLog(err);
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
  }

  getRecipientsDataWithType(titleId, typeId) {
    this.subs.sink = this.sendEmailForm
      .get('to')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((full_name) => {
        this.emailAddressesListTo = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingNameAndTypeForGroup(full_name.toString(), titleId, typeId).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListTo.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.autService.postErrorLog(err);
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
    this.subs.sink = this.sendEmailForm
      .get('cc')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((full_name) => {
        this.emailAddressesListCc = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingNameAndTypeForGroup(full_name.toString(), titleId, typeId).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListCc.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.autService.postErrorLog(err);
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
    this.subs.sink = this.sendEmailForm
      .get('bcc')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((full_name) => {
        this.emailAddressesListBcc = [];
        if (full_name && full_name.length) {
          this.subs.sink = this.mailboxService.getRecipientDataUsingNameAndTypeForGroup(full_name.toString(), titleId, typeId).subscribe(
            (mailList: any[]) => {
              if (mailList && mailList.length) {
                const difference = mailList
                  .filter(
                    (mail) =>
                      !this.selectedRecepientsList.includes(
                        (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                          mail.first_name +
                          ' ' +
                          mail.last_name +
                          ' ' +
                          '<' +
                          mail.email +
                          '>',
                      ),
                  )
                  .concat(
                    this.selectedRecepientsList.filter(
                      (mail) =>
                        !this.selectedRecepientsList.includes(
                          (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                            mail.first_name +
                            ' ' +
                            mail.last_name +
                            ' ' +
                            '<' +
                            mail.email +
                            '>',
                        ),
                    ),
                  );
                difference.forEach((mail) => {
                  if (mail.email !== undefined) {
                    this.emailAddressesListBcc.push(
                      (mail.civility && mail.civility !== 'neutral' ? this.translate.instant(mail.civility) + ' ' : '') +
                        mail.first_name +
                        ' ' +
                        mail.last_name +
                        ' ' +
                        '<' +
                        mail.email +
                        '>',
                    );
                  }
                });
              }
            },
            (err) => {
              this.autService.postErrorLog(err);
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
  }
  // Mail Signature
  mailSignature() {
    const civility = this.currentUser.civility !== 'neutral' ? this.currentUser.civility : '';
    this.composeMailMessage = '<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>';
    this.composeMailMessage += this.translate.instant(civility) + ' ' + this.currentUser.first_name + ' ' + this.currentUser.last_name;
    const entity = this.currentUser.entities.filter((ent) => ent.type.name === this.isPermission[0]);
    const dataUnix = _.uniqBy(entity, 'school.short_name');
    this.composeMailMessage +=
      this.currentUser?.position ? ',<br>' + this.currentUser?.position : '';
    this.composeMailMessage +=
      dataUnix && dataUnix.length && dataUnix[0].school && dataUnix[0].school.short_name ? ',<br>' + dataUnix[0].school.short_name : '';

    this.sendEmailForm.get('message').setValue(this.composeMailMessage);
  }
  CheckforDraft() {
    if (this.isDraftMail) {
      if (this.DraftData && this.DraftData['_id']) {
        this.sendEmailForm.get('subject').setValue(this.DraftData['subject']);
        this.composeMailMessage = this.DraftData['message'];
        this.sendEmailForm.get('message').setValue(this.composeMailMessage);
        this.selectedEmailTo = [];
        this.selectedEmailCc = [];
        this.selectedEmailBcc = [];
        if (this.DraftData['recipient_properties']) {
          const receivers = this.DraftData.recipient_properties;
          this.LoadRecepient(receivers, ['a', 'c', 'cc']);
        }
        this.LoadAttachments(this.DraftData['attachments']);
        if (this.DraftData.is_group_parent) {
          this.sendEmailForm.get('categoryChecked').setValue(this.DraftData['user_type_selection']);
          this.computeGroupDetails(this.DraftData);
        }
      }
    }
  }
  computeGroupDetails(data) {
    // console.log('Group Detail => ', data.group_detail);
    const rncp_titles: any[] = data.group_detail.rncp_titles.map((rncpItem) => {
      let id: any;
      id = rncpItem._id;
      return id;
    });
    const user_types: any[] = data.group_detail.user_types.map((user_type_item) => {
      let id: any;
      id = user_type_item._id;
      return id;
    });
    const rncp_titles_name: any[] = data.group_detail.rncp_titles.map((rncpItem) => {
      let id: any;
      id = rncpItem.short_name;
      return id;
    });
    const user_types_name: any[] = data.group_detail.user_types.map((user_type_item) => {
      let id: any;
      id = user_type_item.name;
      return id;
    });
    this.sendEmailForm.get('userTypes').setValue(user_types_name);
    this.sendEmailForm.get('originalRncpTitle').setValue(rncp_titles);
    this.sendEmailForm.get('originalUserTypes').setValue(user_types);
  }
  LoadAttachments(attachments) {
    if (attachments && Array.isArray(attachments)) {
      const self = this;
      attachments.forEach((file) => {
        self.attachmnetsPaths.push({
          path: file,
          name: self.getFileName(file),
        });
      });
    }
  }

  getFileName(fileName: String): string {
    if (fileName) {
      return fileName.substring(fileName.lastIndexOf('/') + 1);
    }
    return '';
  }
  LoadRecepient(receivers, RecAry, isSenderReq = false) {
    if (Array.isArray(receivers)) {
      receivers.forEach((element) => {
        this.subs.sink = this.mailboxService.getRecipientDataEmail(element.recipients[0].email.toString()).subscribe(
          (mailList) => {
            if (element.rank === 'a') {
              if (mailList && mailList.length) {
                this.recpList.push(mailList.email);
                this.selectedEmailTo.push(
                  (mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) + ' ' : '') +
                    mailList.first_name +
                    ' ' +
                    mailList.last_name +
                    ' ' +
                    '<' +
                    mailList.email +
                    '>',
                );
              } else if (element && element.recipients[0]) {
                this.recpList.push(element.recipients[0].email);
                this.selectedEmailTo.push(
                  (element.recipients[0].civility && element.recipients[0].civility !== 'neutral'
                    ? this.translate.instant(element.recipients[0].civility)
                    : '') +
                    ' ' +
                    element.recipients[0].first_name +
                    ' ' +
                    element.recipients[0].last_name +
                    ' ' +
                    '<' +
                    element.recipients[0].email +
                    '>',
                );
              }
            }
            if (element.rank === 'c') {
              this.recpListBcc.push(mailList.email);
              this.showBCC = true;
              this.selectedEmailBcc.push(
                (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) + ' ' : '') +
                  mailList.first_name +
                  ' ' +
                  mailList.last_name +
                  ' ' +
                  '<' +
                  mailList.email +
                  '>',
              );
            }
            if (element.rank === 'cc') {
              this.recpListCc.push(mailList.email);
              this.showCC = true;
              this.selectedEmailCc.push(
                (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) + ' ' : '') +
                  mailList.first_name +
                  ' ' +
                  mailList.last_name +
                  ' ' +
                  '<' +
                  mailList.email +
                  '>',
              );
            }
            if (element.rank === null) {
              this.recpList.push(mailList.email);
              this.selectedEmailTo.push(
                (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) + ' ' : '') +
                  mailList.first_name +
                  ' ' +
                  mailList.last_name +
                  ' ' +
                  '<' +
                  mailList.email +
                  '>',
              );
            }
          },
          (err) => {
            this.autService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      });

      if (isSenderReq) {
        const sender = this.currentMailData['sender_property'].sender;
        this.selectedRecepientsList.push({
          email: sender,
        });
      }
    } else {
      this.subs.sink = this.mailboxService.getRecipientDataEmail(receivers.recipients[0].email.toString()).subscribe(
        (mailList) => {
          if (receivers.rank === 'a') {
            if (mailList && mailList.length) {
              this.recpList.push(mailList.email);
              this.selectedEmailTo.push(
                (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) + ' ' : '') +
                  mailList.first_name +
                  ' ' +
                  mailList.last_name +
                  ' ' +
                  '<' +
                  mailList.email +
                  '>',
              );
            } else if (receivers && receivers.recipients[0]) {
              this.recpList.push(receivers.recipients[0].email);
              this.selectedEmailTo.push(
                (receivers.recipients[0].civility && receivers.recipients[0].civility !== 'neutral'
                  ? this.translate.instant(receivers.recipients[0].civility)
                  : '') +
                  ' ' +
                  receivers.recipients[0].first_name +
                  ' ' +
                  receivers.recipients[0].last_name +
                  ' ' +
                  '<' +
                  receivers.recipients[0].email +
                  '>',
              );
            }
          }
          if (receivers.rank === 'c') {
            this.recpListBcc.push(mailList.email);
            this.showBCC = true;
            this.selectedEmailBcc.push(
              (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) : '') +
                ' ' +
                mailList.first_name +
                ' ' +
                mailList.last_name +
                ' ' +
                '<' +
                mailList.email +
                '>',
            );
          }
          if (receivers.rank === 'cc') {
            this.recpListCc.push(mailList.email);
            this.showCC = true;
            this.selectedEmailCc.push(
              (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) : '') +
                ' ' +
                mailList.first_name +
                ' ' +
                mailList.last_name +
                ' ' +
                '<' +
                mailList.email +
                '>',
            );
          }
          if (receivers.rank === null) {
            this.recpList.push(mailList.email);
            this.selectedEmailTo.push(
              (mailList.civility && mailList.civility !== 'neutral' ? this.translate.instant(mailList.civility) : '') +
                ' ' +
                mailList.first_name +
                ' ' +
                mailList.last_name +
                ' ' +
                '<' +
                mailList.email +
                '>',
            );
          }
        },
        (err) => {
          this.autService.postErrorLog(err);
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
