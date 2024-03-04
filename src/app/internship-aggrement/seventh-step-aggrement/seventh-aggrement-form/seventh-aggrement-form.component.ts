import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-seventh-aggrement-form',
  templateUrl: './seventh-aggrement-form.component.html',
  styleUrls: ['./seventh-aggrement-form.component.scss'],
  providers: [ParseStringDatePipe],
})
export class SeventhAggrementFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() dataModify: any;
  myIdentityForm: UntypedFormGroup;
  private subs = new SubSink();
  today: Date;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

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
    public coreService: CoreService,
  ) {}

  ngOnInit() {
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
    console.log('this.dataModify', this.dataModify);
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
}
