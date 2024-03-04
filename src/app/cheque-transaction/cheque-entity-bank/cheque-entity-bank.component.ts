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
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-cheque-entity-bank',
  templateUrl: './cheque-entity-bank.component.html',
  styleUrls: ['./cheque-entity-bank.component.scss'],
})
export class ChequeEntityBankComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subs = new SubSink();
  @Input() schoolId: string;
  @Input() selectedRncpTitleId: string;
  @Input() selectedClassId: string;
  importForm: UntypedFormGroup;
  importDummyForm: UntypedFormGroup;
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
  tutorialIcon = '../../assets/img/tutorial.png';

  billingEntities = [
    // {
    //   name: 'EFAP PARIS',
    //   bank: [
    //     {
    //       short_name: 'CIC',
    //     },
    //   ],
    // },
    // {
    //   name: 'ICART BORDEAUX',
    //   bank: [
    //     {
    //       short_name: 'Societe Generale',
    //     },
    //   ],
    // },
    // {
    //   name: 'BRASSART PARIS',
    //   bank: [
    //     {
    //       short_name: 'CIC',
    //     },
    //   ],
    // },
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

  private intVal: any;
  private timeOutVal: any;
  isDelimeterOn = false;
  isLevelOn = false;
  isSchoolOn = false;
  isCampusOn = false;
  isDirectorAdmission = false;
  isMemberAdmission = false;
  templateDonwloaded = false;
  initialForm: any;
  isFormChanged: boolean = false;

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
    this.isDirectorAdmission = !!this.permissionsService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.permissionsService.getPermission('Member Admission');
    this.initImportForm();
    this.initDummyImportForm();
    this.getScholarSeasons();
    // this.getBillingEntities();
    this.currentUser = this.userService.getLocalStorageUser();
    this.dataIsChanged();
    this.subs.sink = this.financeService.dataChequeEnitty.subscribe((val) => {
      if (val) {
        this.importForm.patchValue(val);
      }
      this.initialForm = this.importForm.value;
    });
    this.subs.sink = this.importForm.valueChanges.subscribe((resp) => this.compareForm());
  }

  compareForm() {
    JSON.stringify(this.initialForm) === JSON.stringify(this.importForm.value)
      ? (this.financeService.childrenFormValidationStatus = true)
      : (this.financeService.childrenFormValidationStatus = false);
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

  onScholarClear() {
    if (!this.importForm.get('scholar_season_id').value) {
      this.billingEntities = [];
    }
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

  initImportForm() {
    this.importForm = this.fb.group({
      scholar_season_id: [null, Validators.required],
      billing_entity: [null, Validators.required],
      bank_name: [null, Validators.required],
      date: ['', Validators.required],
      accounting_account: [''],
      bordereau_number: [null, Validators.required],
      legal_id: ['', Validators.required],
    });
  }

  initDummyImportForm() {
    this.importDummyForm = this.fb.group({
      billing_entity: [null, Validators.required],
      bank_name: [null, Validators.required],
      accounting_account: [''],
      bordereau_number: [null, Validators.required],
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
    // // console.log('Campus Option ', scampusList, this.campusList);
  }

  getDataBank(event) {
    console.log('_ev', event);
    this.importForm.get('bank_name').setValue(null);
    if (event) {
      this.importForm.get('accounting_account').setValue(event.account_code);
      this.importForm.get('legal_id').setValue(event._id);
    }
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
    this.importForm.get('accounting_account').setValue(null);
    this.importForm.get('date').setValue('');
    this.importForm.get('bordereau_number').setValue(null);
    this.path = '';
    this.fileName = '';
    this.templateDonwloaded = false;
  }

  onCancelImport() {}

  submitImport() {
    this.isWaitingForResponse = true;
    const payload = this.importForm.value;
    this.financeService.setDataEntityCheque(payload);
    const filter =
      'filter: { legal_entity: "' +
      (payload.billing_entity ? payload.billing_entity : '') +
      '", scholar_season_id:"' +
      (payload.scholar_season_id ? payload.scholar_season_id : '') +
      '"}';
    this.subs.sink = this.financeService.getAllBillingForCheque(filter).subscribe(
      (list) => {
        this.isWaitingForResponse = false;
        if (list && list.length) {
          this.financeService.setDataBilling(list);
        }
        this.financeService.childrenFormValidationStatus = true;
        Swal.fire({
          type: 'success',
          title: 'Bravo !',
        }).then((res) => {
          this.financeService.setStatusStepOneCheque(true);
          this.financeService.setCurrentStep(1);
        });
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

  csvTypeSelection() {
    const payload = _.cloneDeep(this.importForm.value);
    // console.log('Payload ', payload);
    const opening = moment(this.importForm.get('date').value, 'DD-MM-YYYY').format('DD-MM-YYYY');
    this.financeService.downloadImportReconciliationCSV(payload.delimiter, opening);
  }

  dataIsChanged() {}

  toggleSidebar() {
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
