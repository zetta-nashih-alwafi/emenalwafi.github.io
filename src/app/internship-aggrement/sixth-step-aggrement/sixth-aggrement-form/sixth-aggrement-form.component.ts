import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  AfterViewChecked,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
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
import { debounceTime } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
// import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';

@Component({
  selector: 'ms-sixth-aggrement-form',
  templateUrl: './sixth-aggrement-form.component.html',
  styleUrls: ['./sixth-aggrement-form.component.scss'],
  providers: [ParseStringDatePipe],
})
export class SixthAggrementFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() dataModify: any;
  myIdentityForm: UntypedFormGroup;
  private subs = new SubSink();
  today: Date;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @ViewChild('fileUploadDoc', { static: false }) fileUploaderDoc: ElementRef;

  nationalitiesList = [];
  nationalList = [];
  detailForm: UntypedFormGroup;
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
  // Second Step Configuration
  public Editor = DecoupledEditor;
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
  pdfIcon = '../../../assets/img/pdf.png';
  imageUploaded = [];
  skill = [];
  specialization_input = new UntypedFormControl('');
  question = [];
  specialization_inputs = new UntypedFormControl('');
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
    this.detailForm = this.fb.group({
      title: [''],
      description: [''],
      profile: [''],
      image: [''],
      skill: [''],
      location: [''],
      period: [''],
      level: [''],
      stipend: [''],
      number_opening: [''],
    });
    this.initRegistrationForm();
    this.today = new Date();
    // this.dateAdapter.setLocale(this.translate.currentLang);
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      this.countries = list;
      this.countryList = list;
      this.countriesSecond = list;
      this.countryListSecond = list;
    });
    this.nationalitiesList = this.studentService.getNationalitiesList();
    this.nationalitiesListSecond = this.studentService.getNationalitiesList();
    // console.log('this.dataModify', this.dataModify);
  }
  initRegistrationForm() {
    this.myIdentityForm = this.fb.group({
      civility: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      last_name_used: ['', Validators.required],
      first_name_used: ['', Validators.required],
      country: [''],
      city: [''],
      address: [''],
      school: [''],
      campus: [''],
      additional_address: [''],
      post_code: [''],
      date_of_birth: [''],
      country_of_birth: ['', Validators.required],
      city_of_birth: ['', Validators.required],
      post_code_of_birth: ['', Validators.required],
      nationality: ['', Validators.required],
      nationality_second: [''],
      photo: [''],
      telephone: ['', Validators.required],
      fixed_phone: [''],
      email: [''],
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  filterNationality() {
    const searchString = this.myIdentityForm.get('nationality').value.toLowerCase().trim();
    this.nationalList = this.nationalitiesList.filter((nationalities) =>
      nationalities.countryName.toLowerCase().trim().includes(searchString),
    );
  }

  filterNationalitySecond() {
    const searchString = this.myIdentityForm.get('nationality_second').value.toLowerCase().trim();
    this.nationalListSecond = this.nationalitiesListSecond.filter((nationalities) =>
      nationalities.countryName.toLowerCase().trim().includes(searchString),
    );
  }

  filterCountry() {
    const searchString = this.myIdentityForm.get('country').value.toLowerCase().trim();
    this.filteredCountry = this.countries.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  filterCountrySecond() {
    const searchString = this.myIdentityForm.get('country_of_birth').value.toLowerCase().trim();
    this.filteredCountrySecond = this.countriesSecond.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  displayNationality(country): string {
    console.log(country);
    if (this.translate && country) {
      const nationality = this.translate.instant('NATIONALITY.' + country);
      console.log(nationality);
      if (!nationality.includes('NATIONALITY')) {
        return nationality;
      } else {
        return country;
      }
    } else {
      return country;
    }
  }

  displayCountry(country): string {
    console.log(country);
    if (this.translate && country) {
      const nationality = this.translate.instant(country);
      console.log(nationality);
      if (!nationality.includes('NATIONALITY')) {
        return nationality;
      } else {
        return country;
      }
    } else {
      return country;
    }
  }

  identitySave() {
    this.candidateService.setStatusStepOne(true);
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
          data: this.myIdentityForm.value,
          step: data,
          candidateId: this.dataModify._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp.type === 'cancel') {
        } else {
          this.candidateService.setStatusEditMode(false);
          this.candidateService.setIndexStep(1);
        }
      });
  }
  ngOnDestroy() {
    // this.subs.unsubscribe();
  }

  // 002 - Start Second Step Function
  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  openUploadWindow() {
    this.fileUploaderDoc.nativeElement.click();
  }

  uploadFile(fileInput: Event) {
    const file = (<HTMLInputElement>fileInput.target).files[0];
    console.log(file);

    // *************** Accept Reject File Upload outside allowed accept
    const acceptable = ['pdf'];
    const fileType = this.utilService.getFileExtension(file.name);
    console.log(fileType);
    if (acceptable.includes(fileType)) {
      // this.file = (<HTMLInputElement>fileInput.target).files[0];
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          if (resp) {
            const data = {
              name: 'Capture - ' + (this.imageUploaded.length ? this.imageUploaded.length + 1 : '1'),
              s3_file_name: resp.s3_file_name,
            };
            this.imageUploaded.push(data);
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
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
        text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.pdf' }),
        allowEscapeKey: false,
        allowOutsideClick: false,
        allowEnterKey: false,
      });
    }
  }

  openVoiceRecog() {
    this.dialog
      .open(SpeechToTextDialogComponent, {
        width: '800px',
        minHeight: '300px',
        panelClass: 'candidate-note-record',
        disableClose: true,
        data: '',
      })
      .afterClosed()
      .subscribe((text) => {
        if (text) {
          this.detailForm.get('description').patchValue(text);
        }
      });
  }

  openImage(img) {
    const url = `${environment.apiUrl}/fileuploads/${img}`.replace('/graphql', '');
    window.open(url, '_blank');
  }
  resetImage() {
    this.imageUploaded = [];
  }
  addSpecialization() {
    if (this.specialization_input.value && this.specialization_input.value !== '') {
      this.skill.push(this.specialization_input.value);
      this.specialization_input.setValue('');
    }
  }

  remoteSpecialization(index: number) {
    this.skill.splice(index, 1);
  }

  addSpecializations() {
    if (this.question.length <= 4) {
      if (this.specialization_inputs.value && this.specialization_inputs.value !== '') {
        this.question.push(this.specialization_inputs.value);
        this.specialization_inputs.setValue('');
      }
    }
  }
  remoteSpecializations(index: number) {
    this.question.splice(index, 1);
  }
}
