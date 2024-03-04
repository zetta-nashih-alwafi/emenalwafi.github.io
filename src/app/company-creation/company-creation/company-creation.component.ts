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
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
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

@Component({
  selector: 'ms-company-creation',
  templateUrl: './company-creation.component.html',
  styleUrls: ['./company-creation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
    ParseStringDatePipe,
  ],
})
export class CompanyCreationComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  name: string;
  email: string;
  password: string;
  private subs = new SubSink();
  @ViewChild('stepperForm', { static: false }) stepperForm: MatStepper;

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
  ) {}

  ngOnInit() {
    const candidateIds = this.route.snapshot.queryParamMap.get('candidate');
    console.log('Candidate ID', candidateIds);
    if (candidateIds) {
      this.candidateId = candidateIds;
    }
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.initStepper();
    // this.getPromotionData();

    this.subs.sink = this.candidateService.statusStepOne.subscribe((val) => {
      if (val) {
        this.isLinear = false;
        this.firstStepDone = val;
        this.firstFormGroup.get('firstCtrl').setValue('Test');
        this.selectedIndex = 1;
      }
    });

    this.subs.sink = this.candidateService.statusStepTwo.subscribe((val) => {
      if (val) {
        this.secondStepDone = val;
        this.secondFormGroup.get('secondCtrl').setValue('Testets');
        this.selectedIndex = 2;
        // this.stepperForm.next();
        console.log('data step 2 updated', this.selectedIndex, this.stepperForm);
      }
    });

    this.subs.sink = this.candidateService.statusEditMode.subscribe((val) => {
      if (val) {
        this.selectedIndex = 0;
      }
    });
    this.subs.sink = this.candidateService.dataCompany.subscribe((val) => {
      if (val) {
        this.dataStepOne = val;
        console.log('data step 1 updated', val);
      }
    });

    // this.subs.sink = this.candidateService.indexStep.subscribe((val) => {
    //   this.selectedIndex = val;
    // });
  }

  ngOnChanges() {}

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
  }

  register(value) {}

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 103;
    return this.myInnerHeight;
  }

  selectionChange(event) {
    let validate = true;
    if (this.selectedIndex === 1) {
      if (!this.firstFormGroup.get('firstCtrl').value) {
        validate = false;
      }
    } else if (this.selectedIndex === 2) {
      if (!this.secondFormGroup.get('secondCtrl').value) {
        validate = false;
      }
    }
    this.selectedIndex = event.selectedIndex;
    this.candidateService.setIndexStep(this.selectedIndex);
    this.identityEditMode = false;
    console.log(event);
  }

  selectionValidation(event) {}
  currentIndex(data) {
    console.log('Index Now', data);
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
