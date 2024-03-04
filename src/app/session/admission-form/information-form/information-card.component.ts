import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChild, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AdmissionService } from 'app/service/admission/admission.service';
import * as moment from 'moment';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ApplicationUrls } from 'app/shared/settings';
import { EventEmitter } from '@angular/core';
import { StudentsService } from 'app/service/students/students.service';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ms-information-card',
  templateUrl: './information-card.component.html',
  styleUrls: ['./information-card.component.scss'],
})
export class InformationCardComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('fileUpload', { static: false }) uploadInput: any;
  @Input() candidateId = '';
  @Input() selectedIndex = 0;
  @Input() identityEditMode;
  @Output() moveToTab = new EventEmitter<string>();
  private subs = new SubSink();
  candidateData: any;
  isWaitingForResponse = false;
  today = new Date();
  isLoadingUpload = false;
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  isForLegalRepresentative = false;
  countries = [];
  nationalities = [];
  // Service
  constructor(
    private fileUploadService: FileUploadService,
    private admissionService: AdmissionService,
    private studentService: StudentsService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
  ) {}

  ngOnInit() {
    this.getOneCandidate();
    this.subs.sink = this.studentService
      .getAllCountries()
      .pipe(take(1))
      .subscribe((list) => {
        this.countries = list;
      });
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalities = response;
      });
  }

  ngOnChanges() {
    if (this.selectedIndex === 1) {
      this.getOneCandidate();
    }
  }

  getOneCandidate() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.getCandidateInformation(this.candidateId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.candidateData = resp;
        this.isForLegalRepresentative = this.candidateData.is_adult === false && this.candidateData.is_emancipated_minor === false;
        if (resp.photo) {
          this.is_photo_in_s3 = true;
          this.photo = resp.photo;
          this.photo_s3_path = resp.photo;
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

  editIdentity() {
    this.admissionService.setStatusEditMode(true);
  }

  async identityUpdated() {
    if (!(await this.checkAdmissionStatusValidity())) {
      return;
    }
    if (!this.validateCountryAndNationality()) {
      this.editIdentity();
      return;
    }
    const payload = this.createPayload(_.cloneDeep(this.candidateData));
    const isMinorStudent = payload.is_adult === false && payload.is_emancipated_minor === true;

    delete payload._id;
    delete payload.date_of_birth;

    if (payload.emancipated_document_proof_id) {
      payload.emancipated_document_proof_id = payload.emancipated_document_proof_id._id;
    }

    if (!isMinorStudent) {
      payload.personal_information = 'done';
    }

    this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload, isMinorStudent).subscribe(
      (resp) => {
        this.openPopUpValidation(2, 'stepValidation');
      },
      (err) => {
        if (
          err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
          err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LEGAL_S5.Title'),
            text: this.translate.instant('LEGAL_S5.Text'),
            confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
          });
        } else if (
          err['message'] === 'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
          err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
            html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
            confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
          });
        } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('IBAN_S1.Title'),
            text: this.translate.instant('IBAN_S1.Text'),
            confirmButtonText: this.translate.instant('IBAN_S1.Button'),
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            if (res.value) {
              const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
              if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                const tabValid = errorTab.replace('Cannot edit data outside current step, please complete form on current step: ', '');
                this.moveToTab.emit(tabValid);
                console.log(tabValid);
              }
            }
          });
        }
      },
    );
  }

  async checkAdmissionStatusValidity(): Promise<boolean> {
    if (
      this.validationConfirm() ||
      this.candidateData.candidate_admission_status === 'engaged' ||
      this.candidateData.candidate_admission_status === 'registered'
    ) {
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('Incomplete Information'),
        html: this.translate.instant('Please complete your information first'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.editIdentity();
      return false;
    } else {
      return true;
    }
  }

  validateCountryAndNationality() {
    const validCountry = this.studentService.checkCountryValidity(this.countries, this.candidateData?.country);
    const validCountryOfBirth = this.studentService.checkCountryValidity(this.countries, this.candidateData?.country_of_birth, true);
    const validNationality = this.studentService.checkNationalityValidity(this.nationalities, this.candidateData?.nationality);
    const validSecondNationality = this.studentService.checkNationalityValidity(
      this.nationalities,
      this.candidateData?.nationality_second,
      true,
    );
    const valid = validCountry && validCountryOfBirth && validNationality && validSecondNationality;
    if (!valid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Incomplete Information'),
        html: this.translate.instant('Please complete your information first'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    }
    return valid;
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
          data: this.candidateData,
          step: data,
          candidateId: this.candidateData._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        console.log('Masuk Sini Harus', resp);
        if (resp.type === 'cancel') {
          this.admissionService.setStatusStepOne(true);
          this.admissionService.setStatusEditMode(false);
        } else {
          console.log('Masuk Sini Harus');
          this.admissionService.setStatusStepOne(true);
          this.admissionService.setStatusEditMode(false);
          this.admissionService.setIndexStep(2);
        }
      });
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }
  handleInputChange(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.isWaitingForResponse = true;
      const fileType = this.utilService.getFileExtension(file.name);
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (res) => {
            this.isWaitingForResponse = false;
            this.photo = res.s3_file_name;
            this.is_photo_in_s3 = true;
            this.candidateData.photo = res.s3_file_name;

            const payload = {};
            payload['email'] = this.candidateData.email;
            payload['photo'] = res.s3_file_name;
            payload['first_name'] = this.candidateData.first_name;
            payload['last_name'] = this.candidateData.last_name;
            this.subs.sink = this.admissionService.UpdateCandidateForm(this.candidateData._id, payload).subscribe(
              (resp) => {
                if (resp) {
                  console.log('photo Updated!!');
                }
              },
              (err) => {
                this.isWaitingForResponse = false;
                if (
                  err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' ||
                  err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('LEGAL_S5.Title'),
                    text: this.translate.instant('LEGAL_S5.Text'),
                    confirmButtonText: this.translate.instant('LEGAL_S5.Button'),
                  });
                } else if (
                  err['message'] ===
                    'GraphQL error: Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit' ||
                  err['message'].includes('Sorry This IBAN is related to an account outside Euro Zone not allowing SEPA Direct Debit')
                ) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('EUROPEAN_COUNTRIES.TITLE'),
                    html: this.translate.instant('EUROPEAN_COUNTRIES.TEXT'),
                    confirmButtonText: this.translate.instant('EUROPEAN_COUNTRIES.BUTTON'),
                  });
                } else if (err['message'].includes('is invalid. Please enter a valid IBAN.')) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('IBAN_S1.Title'),
                    text: this.translate.instant('IBAN_S1.Text'),
                    confirmButtonText: this.translate.instant('IBAN_S1.Button'),
                  });
                } else {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  }).then((ress) => {
                    if (ress?.value) {
                      const errorTab = err && err['message'] ? err['message'].replaceAll('GraphQL error: ', '') : err;
                      if (errorTab.includes('Cannot edit data outside current step, please complete form on current step: ')) {
                        const tabValid = errorTab.replace(
                          'Cannot edit data outside current step, please complete form on current step: ',
                          '',
                        );
                        this.moveToTab.emit(tabValid);
                        console.log(tabValid);
                      }
                    }
                  });
                }
              },
            );
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
        this.isWaitingForResponse = false;
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

  validationConfirm() {
    let disable = false;
    if (
      this.candidateData &&
      (!this.candidateData.civility ||
        !this.candidateData.first_name ||
        !this.candidateData.first_name_used ||
        !this.candidateData.last_name ||
        !this.candidateData.last_name_used ||
        !this.candidateData.email ||
        !this.candidateData.date_of_birth ||
        !this.candidateData.city_of_birth ||
        !this.candidateData.country_of_birth ||
        !this.candidateData.post_code_of_birth ||
        !this.candidateData.nationality ||
        !this.candidateData.address ||
        !this.candidateData.post_code ||
        !this.candidateData.city ||
        !this.candidateData.country ||
        !this.candidateData.telephone ||
        !this.candidateData?.photo ||
        this.candidateData?.is_adult === null
        )
    ) {
      disable = true;
    }
    return disable;
  }

  createPayload(payload) {
    if (payload && payload._id) {
      delete payload._id;
    }
    if (payload && payload.campus) {
      payload.campus = payload.campus._id;
    }
    if (payload && payload.intake_channel) {
      payload.intake_channel = payload.intake_channel._id;
    }
    if (payload && payload.scholar_season) {
      payload.scholar_season = payload.scholar_season._id;
    }
    if (payload && payload.level) {
      payload.level = payload.level._id;
    }
    if (payload && payload.school) {
      payload.school = payload.school._id;
    }
    if (payload && payload.sector) {
      payload.sector = payload.sector._id;
    }
    if (payload && payload.speciality) {
      payload.speciality = payload.speciality._id;
    }
    if (payload && payload.registration_profile) {
      payload.registration_profile = payload.registration_profile._id;
    }
    if (payload && payload.admission_member_id) {
      payload.admission_member_id = payload.admission_member_id._id;
    }
    if (payload?.user_id) {
      delete payload?.user_id;
    }
    return payload;
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  translateDate(date) {
    return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
