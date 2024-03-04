import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ms-first-step-company-creation',
  templateUrl: './first-step-company-creation.component.html',
  styleUrls: ['./first-step-company-creation.component.scss'],
  providers: [ParseStringDatePipe],
})
export class FirstStepCompanyCreationComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() dataModify: any;
  private subs = new SubSink();
  today = new Date();
  isLoadingUpload = false;
  photo: string;
  companyForm: UntypedFormGroup;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  companyImage = 'https://i.imgur.com/uCLo8Ek.jpg';
  background =
    'https://images.unsplash.com/photo-1528484701073-2b22dc76649e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80';
  @ViewChild('fileUpload', { static: false }) uploadInput: any;
  @ViewChild('fileUploadBackground', { static: false }) fileUploadBackground: any;
  datePipe: DatePipe;

  countriesFinance;
  countryListFinance;
  candidateSchool = [];
  filteredCountryFinance = [];
  @Output() currentIndex = new EventEmitter<any>();
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  isLocationSelected = false;
  isDateSelected = false;
  isStipendSelected = false;
  currencyList = ['Euro', 'USD', 'AUD', 'IDR', 'NZD'];
  paidList = ['Every week', 'Every 2 weeks', 'Every month', 'End of the internship'];

  formValue = {
    location: '',
    presence: '',
    level: '',
    stipend: null,
    currency: '',
    amount: '',
    from: '',
    to: '',
    paid: '',
    ongoing: null,
  };

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countriesFinance = list;
      this.countryListFinance = list;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
    this.iniForm();
    this.subs.sink = this.candidateService.dataCompany.subscribe((val) => {
      if (val) {
        if (val.logo) {
          this.photo = val.logo;
        }
        this.companyForm.patchValue(val);
      }
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  iniForm() {
    this.companyForm = this.fb.group({
      company_name: ['', Validators.required],
      brand: ['', Validators.required],
      industry: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      logo: [null],
      background: [null],
      website: [''],
      linkedin: [''],
      facebook: [''],
      youtube: [''],
      twitter: [''],
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  translateDate(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  openPopUpValidation(data, type) {
    this.subs.sink = this.dialog
      .open(RegistrationDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: type,
          data: this.dataModify,
          step: data,
          candidateId: this.dataModify._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        console.log('Masuk Sini Harus', resp);
        if (resp.type === 'cancel') {
        } else {
          console.log('Masuk Sini Harus');
          this.candidateService.setStatusEditMode(false);
          this.candidateService.setIndexStep(1);
          this.currentIndex.emit(1);
        }
      });
  }

  saveCompany() {
    this.candidateService.setDataCompany(this.companyForm.value);
    this.candidateService.setStatusStepOne(true);
    this.candidateService.setIndexStep(1);
    this.currentIndex.emit(1);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  openUploadBackgroundWindow() {
    const file = this.fileUploadBackground.nativeElement.click();
  }

  handleInputChange(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.isLoadingUpload = true;
      const fileType = this.utilService.getFileExtension(file.name);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (res) => {
            this.isLoadingUpload = false;
            this.photo = res.s3_file_name;
            this.companyForm.get('logo').setValue(res.s3_file_name);
          },
          (err) => {
            this.isLoadingUpload = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.isLoadingUpload = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
    this.resetFileState();
  }

  handleInputBackgroundChange(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.isLoadingUpload = true;
      const fileType = this.utilService.getFileExtension(file.name);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (res) => {
            this.isLoadingUpload = false;
            this.companyForm.get('background').setValue(res.s3_file_name);
          },
          (err) => {
            this.isLoadingUpload = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.isLoadingUpload = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
    this.resetFileStates();
  }

  resetFileStates() {
    this.fileUploadBackground.nativeElement.value = '';
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  filterCountrys() {
    const searchString = this.companyForm.get('country').value.toLowerCase().trim();
    this.filteredCountryFinance = this.countriesFinance.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }
}
