import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { ApplicationUrls } from 'app/shared/settings';
import { NgxPermissionsService } from 'ngx-permissions';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { ImportObjectiveDialogComponent } from 'app/import-registration/import-objective-dialog/import-objective-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import * as moment from 'moment';
import { ImageBase64 } from 'app/transcript-builder/transcript-builder/image-base64';
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-finance-import-import-payment',
  templateUrl: './finance-import-import-payment.component.html',
  styleUrls: ['./finance-import-import-payment.component.scss'],
})
export class FinanceImportImportPaymentComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subs = new SubSink();
  @Input() schoolId: string;
  @Input() selectedRncpTitleId: string;
  @Input() selectedClassId: string;
  importForm: UntypedFormGroup;
  importDummyForm: UntypedFormGroup;
  tutorialIcon = '../../assets/img/tutorial.png';
  @ViewChild('importFile', { static: false }) importFile: any;
  path: string;
  fileName: string;
  file: any;
  fileType: any;
  templateCSVDownloadName = 'comma';
  currentUser: any;
  server = ApplicationUrls.baseApi;
  isAcadir = false;
  isClose = false;
  isWaitingForResponse = false;
  campusList = [];
  listObjective = [];
  titles = [];
  classes = [];
  levels = [];
  scholars = [];
  school = [];
  imageStamp = ImageBase64.stampDummy;
  billingEntities = [];
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

  delimeter = [
    { key: 'COMMA [ , ]', value: ',' },
    { key: 'SEMICOLON [ ; ]', value: ';' },
    { key: 'TAB [ ]', value: 'tab' },
  ];
  private intVal: any;
  private timeOutVal: any;
  isDelimeterOn = false;
  isLevelOn = false;
  isSchoolOn = false;
  isCampusOn = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  templateDonwloaded = false;
  isPermission: string[];
  currentUserTypeId: any;

  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private titleService: RNCPTitlesService,
    private translate: TranslateService,
    private userService: AuthService,
    private httpClient: HttpClient,
    private fileUploadService: FileUploadService,
    private candidateService: CandidatesService,
    private pageTitleService: PageTitleService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private financeService: FinancesService,
    private permissionsService: NgxPermissionsService,
    public coreService: CoreService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    let paramtext = '';
    let importText = '';
    this.initImportForm();
    this.initDummyImportForm();
    this.getScholarSeasons();
    this.getDataForList();
    this.getBillingEntities();
    if (this.translate.currentLang === 'fr') {
      this.importForm.get('delimiter').setValue(';');
    } else {
      this.importForm.get('delimiter').setValue(',');
    }
    paramtext = this.translate.instant('NAV.PARAMETERS.PLATFORM');
    importText = this.translate.instant('Import of Registration Objectives');

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      paramtext = this.translate.instant('NAV.PARAMETERS.PLATFORM');
      importText = this.translate.instant('Import of Registration Objectives');
      if (this.translate.currentLang === 'fr') {
        this.importForm.get('delimiter').setValue(';');
      } else {
        this.importForm.get('delimiter').setValue(',');
      }
    });
    this.currentUser = this.userService.getLocalStorageUser();
    this.dataIsChanged();
  }

  toggleSidebar() {
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }

  onScholarClear() {
    if (!this.importForm.get('scholar_season_id').value) {
      this.billingEntities = [];
    }
  }
  getScholarSeasons() {
    this.isWaitingForResponse = true;
    this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.scholars = resp;
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
        }
      },
    );
  }

  getBillingEntities() {
    // get dropdown for billing entities
    this.isWaitingForResponse = true;
    this.importForm.get('billing_entity').patchValue(null);
    if (!this.importForm.get('scholar_season_id').value) {
      this.isWaitingForResponse = false;
      this.billingEntities = [];
      return;
    }
    this.financeService.getAllLegalEntityByScholar(this.importForm.get('scholar_season_id').value).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.billingEntities = resp;
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
        }
      },
    );
  }

  getDataForList() {
    if (this.isDirectorAdmission) {
      const name =
        this.currentUser && this.currentUser.entities && this.currentUser.entities[0] ? this.currentUser.entities[0].candidate_school : '';
      this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            console.log('Data Import => ', resp);
            this.listObjective = resp;
          }
        },
        (err) => {
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
      const name = '';
      this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
        (resp) => {
          if (resp) {
            console.log('Data Import => ', resp);
            this.listObjective = resp;
          }
        },
        (err) => {
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

  initImportForm() {
    this.importForm = this.fb.group({
      billing_entity: [null, Validators.required],
      scholar_season_id: [null, Validators.required],
      bank_name: [null, Validators.required],
      delimiter: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  initDummyImportForm() {
    this.importDummyForm = this.fb.group({
      billing_entity: [null, Validators.required],
      bank_name: [null, Validators.required],
      delimiter: ['', Validators.required],
      date: ['', Validators.required],
    });
  }
  openUploadWindow() {
    this.importFile.nativeElement.click();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getDataCampus() {
    // this.levels = [];
    // this.campusList = [];
    // this.importForm.get('campuses').setValue(null);
    // this.importForm.get('levels').setValue(null);
    // this.isDelimeterOn = false;
    // this.isCampusOn = true;
    // const school = this.importForm.get('schools').value;
    // const scampusList = this.listObjective.filter((list) => {
    //   return school.includes(list.short_name);
    // });
    // scampusList.filter((campus, n) => {
    //   campus.campuses.filter((campuses, nex) => {
    //     this.campusList.push(campuses);
    //   });
    // });
    // this.campusList = _.uniqBy(this.campusList, 'name');
    // console.log('Campus Option ', scampusList, this.campusList);
  }

  getDataBank(event) {
    console.log(event);
    this.importForm.get('bank_name').setValue(null);
    // this.isSchoolOn = true;
    // this.school = [];
    // this.campusList = [];
    // this.levels = [];
    // this.isDelimeterOn = false;

    if (event && event.banks) {
      this.bank = event.banks;
    }
  }

  getDataDelimeter() {
    this.isDelimeterOn = true;
  }

  resetImport() {
    // this.importForm.get('schools').setValue(null);
    // this.importForm.get('campuses').setValue(null);
    // this.importForm.get('scholarSeasons').setValue(null);
    // this.importForm.get('levels').setValue(null);
    this.importForm.get('billing_entity').setValue(null);
    this.importForm.get('bank_name').setValue(null);
    this.importForm.get('delimiter').setValue('');
    this.importForm.get('date').setValue('');
    this.path = '';
    this.fileName = '';
    this.templateDonwloaded = false;
  }

  viewTutorial(data) {
    window.open(
      `https://docs.google.com/presentation/d/1F-3BKfSi3s38iQVs3R9wu2dMjScRZrIewRA512vizIY/edit#slide=id.g409c3d55db_0_0`,
      '_blank',
    );
  }

  onCancelImport() {}

  handleInputChange(fileInput: Event) {
    this.dataIsChanged();
    this.isWaitingForResponse = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.file = (<HTMLInputElement>fileInput.target).files[0];
    console.log('this.file', this.file);
    this.path = '';
    this.fileName = '';
    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.path = resp.file_url;
            this.fileName = resp.file_name;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('IMPORT_RECON_S1.Title'),
              html: this.translate.instant('IMPORT_RECON_S1.Text'),
              confirmButtonText: this.translate.instant('IMPORT_RECON_S1.Button'),
            });
          }
        },
        (err) => {
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
              title: 'Error !',
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then((res) => {
              console.log('[BE Message] Error is : ', err);
            });
          }
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.importFile.nativeElement.value = '';
  }

  submitImport() {
    this.isWaitingForResponse = true;
    const payload = _.cloneDeep(this.importForm.value);
    console.log('Payload ', payload);
    const data = {
      billing_entity: payload.billing_entity,
      bank_name: payload.bank_name,
      date: moment(payload.date).format('DD-MM-YYYY'),
      file_delimeter: payload.delimiter,
    };
    this.subs.sink = this.candidateService.ImportReconciliationAndLetterage(data, this.file).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          console.log('Import Success ', resp);
          this.financeService.setStatusStepOne(true);
          this.financeService.setCurrentStep(1);
          // manually add student_ids field in step 2 data
          resp.confirm_reconciliation.forEach((dt) => {
            dt.student_ids = [dt.student_id];
          });
          this.financeService.setReconciliationImport(data);
          this.financeService.setDataStepTwo(resp.confirm_reconciliation);
          this.financeService.setDataStepThree(resp.assign_reconciliation);
          Swal.fire({
            type: 'success',
            title: 'Bravo !',
            text: this.translate.instant('Reconciliation done successfully'),
          });
          this.resetImport();
        }
      },
      (err) => {
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
        if (err['message'] === 'GraphQL error: some school / campus / level not found') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('REJECT_IMPORT.TITLE'),
            text: this.translate.instant('REJECT_IMPORT.TEXT'),
          });
        } else if (err['message'] === 'GraphQL error: Some Date In CSV Not Match With Parameter') {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('RECON_MATCH.TITLE'),
            text: this.translate.instant('RECON_MATCH.TEXT'),
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

  csvTypeSelection() {
    const payload = _.cloneDeep(this.importForm.value);
    console.log('Payload ', payload);
    const opening = moment(this.importForm.get('date').value, 'DD-MM-YYYY').format('DD-MM-YYYY');
    this.financeService.downloadImportReconciliationCSV(payload.delimiter, opening);
  }

  dataIsChanged() {}

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
