import {
  AfterContentChecked,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AuthService } from '../../service/auth-service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { StepperSelectionEvent, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { StudentsService } from 'app/service/students/students.service';
import { SchoolService } from 'app/service/schools/school.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStep } from '@angular/material/stepper';
import { ApplicationUrls } from 'app/shared/settings';
import Swal from 'sweetalert2';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { PromoExternalService } from 'app/service/promo-external/promo-external.service';
import { MatStepper } from '@angular/material/stepper';
import { InternshipService } from 'app/service/internship/internship.service';

@Component({
  selector: 'ms-internship-aggrement',
  templateUrl: './internship-aggrement.component.html',
  styleUrls: ['./internship-aggrement.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
    ParseStringDatePipe,
  ],
})
export class InternshipAggrementComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  name: string;
  email: string;
  password: string;
  private subs = new SubSink();
  // @ViewChild('stepperForm', { static: false }) stepperForm: MatStepper;

  slideConfig = { slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, dots: false, arrows: false };
  myInnerHeight = 600;
  sessionSlider: any[] = [
    {
      image_upload: 'assets/img/login-slider1.jpg',
      title: 'Francisco Abbott',
      sub_title: 'CEO-Gene',
      story:
        "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.",
    },
    {
      image_upload: 'assets/img/login-slider2.jpg',
      title: 'Samona Brown',
      sub_title: 'Designer',
      story:
        "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.",
    },
    {
      image_upload: 'assets/img/login-slider3.jpg',
      title: 'Anna Smith',
      sub_title: 'Managing Director',
      story:
        "Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.",
    },
  ];
  firstFormGroup: UntypedFormGroup;
  secondFormGroup: UntypedFormGroup;
  thirdFormGroup: UntypedFormGroup;
  fourthFormGroup: UntypedFormGroup;
  fiveFormGroup: UntypedFormGroup;
  sixFormGroup: UntypedFormGroup;
  sevenFormGroup: UntypedFormGroup;
  eightFormGroup: UntypedFormGroup;
  nineFormGroup: UntypedFormGroup;
  tenFormGroup: UntypedFormGroup;
  myIdentityForm: UntypedFormGroup;
  paymentForm: UntypedFormGroup;
  paymentSelected: any;
  methodOne = true;
  methodTwo = true;
  methodThree = true;
  downloadCondition = true;
  agreeCondition = true;
  paymentMethod: any;
  nextProcessPayment = false;
  identityEditMode = false;
  identityEditModeTwo = false;
  identityEditModeThree = false;
  identityEditModeFour = false;
  identityEditModeFive = false;
  identityEditModeSix = false;
  identityEditModeSeven = false;
  identityEditModeEighth = false;
  selectOptionTwo = false;
  scrollDone = false;
  selectCandidate = {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mrs',
    first_name: 'Cindy',
    last_name: 'Lacour',
    weight: 8546321232,
    priority: 'low',
  };
  // sessionSlider: any[] = [];
  showSessionSlider = true;
  candidateId = '';
  internshipId = '';
  candidateData: any;
  // stepper: MatStepper;
  today = new Date();
  @ViewChild('fileUpload', { static: false }) uploadInput: any;

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;
  nationalitiesListSecond = [];
  nationalListSecond = [];
  nationalitySelectedSecond: string;
  countries;
  countryList;
  filteredCountry = [];
  countriesSecond;
  countryListSecond;
  filteredCountrySecond = [];
  countriesFinance;
  countryListFinance;
  filteredCountryFinance = [];
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  paymentImg = '../../../../../assets/img/payment.png';
  transferPayment = '../../../../../assets/img/transfer-payment.png';
  successPayment = '../../../../../assets/img/payment-success.png';
  selectedIndex = 0;
  isLoadingUpload = false;
  firstStepDone = false;
  secondStepDone = false;
  thirdStepDone = false;
  fourthStepDone = false;
  fiveStepDone = false;
  sixhStepDone = false;
  sevenStepDone = false;
  eightStepDone = false;
  nineStepDone = false;
  tenStepDone = false;
  paymentChoiced = false;
  paymentFinalStep = false;
  paymentDone = false;
  paymentBalance = [
    {
      time: '1',
      balance: '7 960',
      payment: [
        {
          date: '27/01/2020',
          balance: '7 960',
        },
      ],
    },
    {
      time: '3',
      balance: '7 960',
      payment: [
        {
          date: '27/01/2020',
          balance: '2 653',
        },
        {
          date: '27/03/2020',
          balance: '2 653',
        },
        {
          date: '27/05/2020',
          balance: '2 654',
        },
      ],
    },
  ];

  // First Step Configuration
  dataModify: any;
  fullDataCandidate: any;
  isLinear = true;
  dataStepOne: any;
  internshipDataStatus: any;
  open: any;
  openAmendment = false;
  openPdf = false;
  isUserStudent = false;
  isUserMentor = false;
  isUserMember = false;
  isUserCRM = false;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private parseStringDatePipe: ParseStringDatePipe,
    private dateAdapter: DateAdapter<Date>,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private promoExternalService: PromoExternalService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router,
    private internshipService: InternshipService,
  ) {}

  ngOnInit() {
    const candidateIds = this.route.snapshot.queryParamMap.get('candidate');
    const internshipId = this.route.snapshot.queryParamMap.get('internshipId');
    const identity = this.route.snapshot.queryParamMap.get('identity');
    // console.log('Candidate ID', candidateIds);
    if (candidateIds) {
      this.candidateId = candidateIds;
    }
    if (internshipId) {
      this.internshipId = internshipId;
      this.getDataInternships();
      if (identity) {
        switch (identity) {
          case 'student':
            this.isUserStudent = true;
            break;
          case 'mentor':
            this.isUserMentor = true;
            break;
          case 'member':
            this.isUserMember = true;
            break;
          default:
            this.isUserCRM = true;
        }
      } else {
        this.isUserCRM = true;
      }
    }
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.initStepper();

    this.subs.sink = this.candidateService.statusStepOne.subscribe((val) => {
      if (val) {
        this.firstStepDone = val;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.selectedIndex = 1;
      }
    });

    this.subs.sink = this.candidateService.statusStepTwo.subscribe((val) => {
      if (val) {
        // this.isLinear = false;
        // console.log('_clicked masuk step 2');

        this.secondStepDone = val;
        this.secondFormGroup.get('secondCtrl').setValue('Testets');
        this.selectedIndex = 2;
        // this.stepperForm.next();
        // console.log('data step 2 updated', this.selectedIndex, this.stepperForm);
      }
    });

    // this.subs.sink = this.candidateService.statusStepThree.subscribe((val) => {
    //   if (val) {
    //     // this.isLinear = true;
    //     this.thirdStepDone = val;
    //     this.thirdFormGroup.get('thirdCtrl').setValue('registered');
    //     this.selectedIndex = 3;
    //   }
    // });

    this.subs.sink = this.candidateService.statusStepFour.subscribe((val) => {
      if (val) {
        // this.isLinear = true;
        this.fourthStepDone = val;
        this.fourthFormGroup.get('fourthCtrl').setValue('registered');
        this.selectedIndex = 3;
      }
    });

    this.subs.sink = this.candidateService.statusStepFive.subscribe((val) => {
      if (val) {
        // this.isLinear = true;
        this.fiveStepDone = val;
        this.fiveFormGroup.get('fiveCtrl').setValue('registered');
        this.selectedIndex = 4;
      }
    });

    this.subs.sink = this.candidateService.statusStepSix.subscribe((val) => {
      if (val) {
        // this.isLinear = true;
        this.sixhStepDone = val;
        this.sixFormGroup.get('sixCtrl').setValue('registered');
        this.selectedIndex = 6;
      }
    });

    // this.subs.sink = this.candidateService.statusStepSeven.subscribe((val) => {
    //   if (val) {
    //     // this.isLinear = true;
    //     this.sevenStepDone = val;
    //     this.sevenFormGroup.get('sevenCtrl').setValue('registered');
    //     this.selectedIndex = 7;
    //   }
    // });

    this.subs.sink = this.candidateService.statusStepEight.subscribe((val) => {
      if (val) {
        // this.isLinear = true;
        console.log(val);
        this.selectedIndex = 7;
        this.eightStepDone = true;
        this.eightFormGroup.get('eightCtrl').setValue('Test');
      }
    });

    this.subs.sink = this.candidateService.statusStepNine.subscribe((val) => {
      if (val) {
        // this.isLinear = true;
        this.nineStepDone = val;
        this.nineFormGroup.get('nineCtrl').setValue('registered');
        this.selectedIndex = 8;
      }
    });

    this.subs.sink = this.candidateService.statusStepTen.subscribe((val) => {
      if (val) {
        // this.isLinear = true;
        this.tenStepDone = val;
        this.tenFormGroup.get('tenCtrl').setValue('registered');
        this.selectedIndex = 5;
      }
    });

    this.subs.sink = this.candidateService.statusEditMode.subscribe((val) => {
      this.identityEditMode = val;
    });

    this.subs.sink = this.candidateService.statusEditModeTwo.subscribe((val) => {
      this.identityEditModeTwo = val;
    });

    this.subs.sink = this.candidateService.statusEditModeThree.subscribe((val) => {
      this.identityEditModeThree = val;
    });

    this.subs.sink = this.candidateService.statusEditModeFour.subscribe((val) => {
      this.identityEditModeFour = val;
    });

    this.subs.sink = this.candidateService.statusEditModeFive.subscribe((val) => {
      this.identityEditModeFive = val;
    });

    this.subs.sink = this.candidateService.statusEditModeSix.subscribe((val) => {
      this.identityEditModeSix = val;
    });

    this.subs.sink = this.candidateService.statusEditModeSeven.subscribe((val) => {
      this.identityEditModeSeven = val;
    });

    this.subs.sink = this.candidateService.statusEditModeEight.subscribe((val) => {
      this.identityEditModeEighth = val;
    });
    this.subs.sink = this.candidateService.dataJobOfferOne.subscribe((val) => {
      if (val) {
        this.dataStepOne = val;
        // console.log('data step 1 updated', val);
      }
    });

    this.subs.sink = this.candidateService.indexStep.subscribe((val) => {
      this.selectedIndex = val;
    });
    this.open = this.route.snapshot.queryParamMap.get('open');
    if (this.open === 'amendment') {
      this.openAmendment = true;
      this.selectedIndex = 8;
      // console.log('param', this.open, this.selectedIndex);
    } else if (this.open === 'pdf') {
      this.openPdf = true;
      this.selectedIndex = 7;
    }
  }

  updateStatusAgreement() {
    const payloadIntern = {
      agreement_status: 'waiting_for_signature',
    };
    this.subs.sink = this.internshipService.updateInternship(this.internshipId, payloadIntern).subscribe(
      (resps) => {
        if (resps) {
          // console.log('Status Agreement Updated');
        }
      },
      (err) => {
        // console.log('Status Agreement Fail Updated');
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  ngOnChanges() {
    this.open = this.route.snapshot.queryParamMap.get('open');
    // console.log('param', this.open);
    if (this.open === 'amendment') {
      this.openAmendment = true;
      this.selectedIndex = 8;
    } else if (this.open === 'pdf') {
      this.openPdf = true;
      this.selectedIndex = 7;
    }
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getOneCandidate() {}

  initStepper() {
    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required],
    });
    this.thirdFormGroup = this.fb.group({
      thirdCtrl: ['', Validators.required],
    });
    this.fourthFormGroup = this.fb.group({
      fourthCtrl: ['', Validators.required],
    });
    this.fiveFormGroup = this.fb.group({
      fiveCtrl: ['', Validators.required],
    });
    this.sixFormGroup = this.fb.group({
      sixCtrl: ['', Validators.required],
    });
    this.sevenFormGroup = this.fb.group({
      sevenCtrl: ['', Validators.required],
    });
    this.eightFormGroup = this.fb.group({
      eightCtrl: ['', Validators.required],
    });
    this.nineFormGroup = this.fb.group({
      nineCtrl: ['', Validators.required],
    });
    this.tenFormGroup = this.fb.group({
      tenCtrl: ['', Validators.required],
    });
  }

  register(value) {}

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }

  tabStatusValidation(data) {
    switch (data) {
      case 'intern':
        return 0;
      case 'school':
        return 1;
      case 'company':
        return 2;
      case 'mentor':
        return 3;
      case 'company_manager':
        return 4;
      case 'internship':
        return 5;
      case 'conditions':
        return 6;
      case 'pdf':
        return 7;
      default:
        return 0;
    }
  }

  selectionTab(event) {
    // console.log('Selection Change', event);
    if (event && event.srcElement && event.srcElement.innerText) {
      if (
        event.srcElement.innerText === 'Intern' ||
        event.srcElement.innerText === 'Stagiaire' ||
        event.srcElement.innerText === 'done\nIntern' ||
        event.srcElement.innerText === 'done\nStagiaire'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (0 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 0;
          }
        }
      } else if (
        event.srcElement.innerText === 'School' ||
        event.srcElement.innerText === 'Ecole' ||
        event.srcElement.innerText === 'done\nSchool' ||
        event.srcElement.innerText === 'done\nEcole'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (1 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 1;
          }
        }
      } else if (
        event.srcElement.innerText === 'Company' ||
        event.srcElement.innerText === 'Entreprise' ||
        event.srcElement.innerText === 'done\nCompany' ||
        event.srcElement.innerText === 'done\nEntreprise'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (2 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 2;
          }
        }
      } else if (
        event.srcElement.innerText === 'Mentor' ||
        event.srcElement.innerText === 'Tuteur' ||
        event.srcElement.innerText === 'done\nMentor' ||
        event.srcElement.innerText === 'done\nTuteur'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (3 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 3;
          }
        }
      } else if (
        event.srcElement.innerText === 'Company Manager' ||
        event.srcElement.innerText === 'Responsable entreprise' ||
        event.srcElement.innerText === 'done\nCompany Manager' ||
        event.srcElement.innerText === 'done\nResponsable entreprise'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (4 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 4;
          }
        }
      } else if (
        event.srcElement.innerText === 'Internship' ||
        event.srcElement.innerText === 'Stage' ||
        event.srcElement.innerText === 'done\nInternship' ||
        event.srcElement.innerText === 'done\nStage'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (5 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 5;
          }
        }
      } else if (
        event.srcElement.innerText === 'Summary' ||
        event.srcElement.innerText === 'Résumé' ||
        event.srcElement.innerText === 'done\nSummary' ||
        event.srcElement.innerText === 'done\nRésumé'
      ) {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (6 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 6;
          }
        }
      } else if (event.srcElement.innerText === 'PDF' || event.srcElement.innerText === 'done\nPDF') {
        if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
          if (7 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
            // console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
            this.isLinear = false;
            this.selectedIndex = 7;
          }
        }
      }
    }
  }

  selectionChange(event: StepperSelectionEvent) {
    this.isLinear = true;
    // console.log('Selection Change', event);
    // this.selectedIndex = event.selectedIndex;
    if (event && event.selectedStep && (event.selectedStep.label === 'Summary' || event.selectedStep.label === 'Mon CV')) {
      this.generatePDF();
    }
    this.identityEditMode = false;
    this.identityEditModeTwo = false;
    this.identityEditModeThree = false;
    this.identityEditModeFour = false;
    this.identityEditModeFive = false;
    this.identityEditModeSix = false;
    this.identityEditModeSeven = false;
    this.identityEditModeEighth = false;
    this.candidateService.setStatusEditModeFour(false);
    // console.log(event);

    this.selectedIndex = event.selectedIndex;

    // if (event && event.selectedStep && event.selectedStep.label) {
    //   if (event.selectedStep.label === 'Intern' || event.selectedStep.label === 'Stagiaire') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (0 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'School' || event.selectedStep.label === 'Ecole') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (1 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'Company' || event.selectedStep.label === 'Entreprise') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (2 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'Mentor' || event.selectedStep.label === 'Tuteur') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (3 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'Company Manager' || event.selectedStep.label === 'Responsable entreprise') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (4 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'Internship' || event.selectedStep.label === 'Stage') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (5 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'Summary' || event.selectedStep.label === 'Résumé') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (6 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   } else if (event.selectedStep.label === 'PDF') {
    //     if (this.internshipDataStatus && this.internshipDataStatus.internship_creation_step) {
    //       if (7 <= this.tabStatusValidation(this.internshipDataStatus.internship_creation_step)) {
    //         console.log('Selection', this.tabStatusValidation(this.internshipDataStatus.internship_creation_step));
    //         this.selectedIndex = event.selectedIndex;
    //       } else {
    //         this.selectedIndex = event.previouslySelectedIndex;
    //       }
    //     }
    //   }
    // }
    // this.candidateService.setIndexStep(this.selectedIndex);
  }

  generatePDF() {
    // console.log('Generate PDF Tab', this.internshipId);
    let is_CRM = false;
    if (this.isUserCRM) {
      is_CRM = true;
    } else {
      is_CRM = false;
    }
    if (this.internshipId) {
      this.subs.sink = this.internshipService.generateAgreementPDF(this.internshipId, is_CRM).subscribe(
        (resp) => {
          if (resp) {
            // console.log(resp);
            this.savePDF(resp);
          }
        },
        (err) => {
          // console.log(err);
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

  savePDF(pdfUrl) {
    const payload = {
      pdf_file_name: pdfUrl,
    };
    this.subs.sink = this.internshipService.updateInternship(this.internshipId, payload).subscribe(
      (resps) => {
        if (resps) {
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  selectionValidation(event) {}

  currentIndex(data) {
    // console.log('Index Now', data);
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getDataInternships() {
    // console.log('Internship Tab', this.internshipId);
    if (this.internshipId) {
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.internshipDataStatus = _.cloneDeep(resp);
            if (resp.internship_creation_step) {
              this.configStep(resp.internship_creation_step);
            }
            if (!resp.agreement_status || resp.agreement_status === 'no_agreement') {
              this.updateStatusAgreement();
            }
          }
        },
        (err) => {
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

  configStep(data) {
    // console.log('Latest Step', data);
    // this.selectedIndex = 0;
    switch (data) {
      case 'intern':
        // this.firstStepDone = true;
        // this.firstFormGroup.get('firstCtrl').setValue('Test');
        break;
      case 'school':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        // this.secondStepDone = true;
        // this.secondFormGroup.get('secondCtrl').setValue('Test');
        break;
      case 'company':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.secondStepDone = true;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
        // this.fourthStepDone = true;
        // this.fourthFormGroup.get('fourthCtrl').setValue('Test');
        break;
      case 'mentor':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.secondStepDone = true;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
        this.fourthStepDone = true;
        this.fourthFormGroup.get('fourthCtrl').setValue('Test');
        // this.fiveStepDone = true;
        // this.fiveFormGroup.get('fiveCtrl').setValue('Test');
        break;
      case 'company_manager':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.secondStepDone = true;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
        this.fourthStepDone = true;
        this.fourthFormGroup.get('fourthCtrl').setValue('Test');
        this.fiveStepDone = true;
        this.fiveFormGroup.get('fiveCtrl').setValue('Test');
        // this.tenStepDone = true;
        // this.tenFormGroup.get('tenCtrl').setValue('Test');
        break;
      case 'internship':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.secondStepDone = true;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
        this.fourthStepDone = true;
        this.fourthFormGroup.get('fourthCtrl').setValue('Test');
        this.fiveStepDone = true;
        this.fiveFormGroup.get('fiveCtrl').setValue('Test');
        // this.sixhStepDone = true;
        // this.sixFormGroup.get('sixCtrl').setValue('Test');
        this.tenStepDone = true;
        this.tenFormGroup.get('tenCtrl').setValue('Test');
        break;
      case 'conditions':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.secondStepDone = true;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
        this.fourthStepDone = true;
        this.fourthFormGroup.get('fourthCtrl').setValue('Test');
        this.fiveStepDone = true;
        this.fiveFormGroup.get('fiveCtrl').setValue('Test');
        this.sixhStepDone = true;
        this.sixFormGroup.get('sixCtrl').setValue('Test');
        // this.eightStepDone = true;
        // this.eightFormGroup.get('eightCtrl').setValue('Test');
        this.tenStepDone = true;
        this.tenFormGroup.get('tenCtrl').setValue('Test');
        break;
      case 'pdf':
        this.firstStepDone = true;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.secondStepDone = true;
        this.secondFormGroup.get('secondCtrl').setValue('Test');
        this.fourthStepDone = true;
        this.fourthFormGroup.get('fourthCtrl').setValue('Test');
        this.fiveStepDone = true;
        this.fiveFormGroup.get('fiveCtrl').setValue('Test');
        this.sixhStepDone = true;
        this.sixFormGroup.get('sixCtrl').setValue('Test');
        this.eightStepDone = true;
        this.eightFormGroup.get('eightCtrl').setValue('Test');
        this.nineStepDone = true;
        this.nineFormGroup.get('nineCtrl').setValue('Test');
        this.tenStepDone = true;
        this.tenFormGroup.get('tenCtrl').setValue('Test');
        break;
      default:
        this.selectedIndex = 0;
    }
    if (this.internshipDataStatus && this.internshipDataStatus.is_published) {
      this.firstStepDone = true;
      this.firstFormGroup.get('firstCtrl').setValue('Test');
      this.secondStepDone = true;
      this.secondFormGroup.get('secondCtrl').setValue('Test');
      this.fourthStepDone = true;
      this.fourthFormGroup.get('fourthCtrl').setValue('Test');
      this.fiveStepDone = true;
      this.fiveFormGroup.get('fiveCtrl').setValue('Test');
      this.sixhStepDone = true;
      this.sixFormGroup.get('sixCtrl').setValue('Test');
      this.eightStepDone = true;
      this.eightFormGroup.get('eightCtrl').setValue('Test');
      this.nineStepDone = true;
      this.nineFormGroup.get('nineCtrl').setValue('Test');
      this.tenStepDone = true;
      this.tenFormGroup.get('tenCtrl').setValue('Test');
    }
    if (this.openAmendment) {
      this.selectedIndex = 8;
    }
    if (this.openPdf) {
      this.selectedIndex = 7;
    }
  }
}
