import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { RegistrationDialogComponent } from 'app/candidates/registration-dialog/registration-dialog.component';
import { STYLE } from 'app/title-rncp/conditions/class-condition/score/second-step-score/condition-score-preview/pdf-styles';
import { environment } from 'environments/environment';
import { TranscriptBuilderService } from 'app/service/transcript-builder/transcript-builder.service';
import { InternshipService } from 'app/service/internship/internship.service';
import { UserService } from 'app/service/user/user.service';
import { CoreService } from 'app/service/core/core.service';

@Component({
  selector: 'ms-manager-step-aggrement',
  templateUrl: './manager-step-aggrement.component.html',
  styleUrls: ['./manager-step-aggrement.component.scss'],
})
export class ManagerStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('autoCountry', { static: false }) matAutocomplete: MatAutocomplete;
  @Input() candidateId = '';
  @Input() internshipId = '';
  @Input() dataModify: any;
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() isUserMember: any;
  isAddMentor = false;
  isHaveSign = false;
  isAddMember = false;
  memberCompanyList = [];
  private subs = new SubSink();
  detailForm: UntypedFormGroup;
  today = new Date();
  isLoadingUpload = false;
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  paymentForm: UntypedFormGroup;
  creditForm: UntypedFormGroup;
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  question = [];
  specialization_input = new UntypedFormControl('');
  mentorEntity = {
    entity_name: 'company',
    companies: [],
    type: '612f46cf6530c01ff411d767',
  };
  companyMemberEntity = {
    entity_name: 'company',
    companies: [],
    type: '6110d01d08f82f5d8c8f7d5c',
  };
  @Output() currentIndex = new EventEmitter<any>();
  typeMentorId = '612f46cf6530c01ff411d767';
  isWaitingForResponse = false;
  internshipData: any;
  currSelectedCompanyId = '';
  currSelectedCompanyData: any;
  originalMentors: any;
  mentors: any;
  currentUser: any;
  currentUserTypeId 

  constructor(
    private userService: UserService,
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
    private internshipService: InternshipService,
    private transcriptBuilderService: TranscriptBuilderService,
    public coreService: CoreService,
  ) {}
  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initForm();
    this.getDataInternship();
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.originalMentors && this.originalMentors.length) {
        // console.log('mentorSelected 1', this.originalMentors);
        const mentorSelected = _.cloneDeep(this.detailForm.get('mentor_selected').value);
        this.detailForm.get('mentor_selected').patchValue(null);
        this.originalMentors = this.originalMentors.map((list) => {
          return {
            _id: list._id,
            first_name: list.first_name,
            last_name: list.last_name,
            civility: list.civility,
            email: list.email,
            full_name: list.full_name,
            name:
              (list.civility && list.civility !== 'neutral' ? this.translate.instant(list.civility) : '') +
              ' ' +
              list.first_name +
              ' ' +
              list.last_name,
          };
        });
        this.mentors = this.originalMentors;
        if (mentorSelected) {
          // console.log('mentorSelected', mentorSelected);
          this.detailForm.get('mentor_selected').patchValue(mentorSelected);
          this.displayMentor(mentorSelected);
        }
      }
    });
  }

  getDataInternship() {
    // console.log('Mentor Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            if (resp.company_branch_id && resp.company_branch_id._id) {
              const activeCompany = this.internshipData.company_branch_id;
              this.currSelectedCompanyId = activeCompany ? activeCompany._id : null;
              this.currSelectedCompanyData = activeCompany ? activeCompany : null;
            } else {
              this.currSelectedCompanyId = null;
              this.currSelectedCompanyData = null;
            }
            this.getMentor();
            if (this.internshipData.company_members && this.internshipData.company_members.length) {
              this.memberCompanyList = this.internshipData.company_members.map((list) => list.company_member_id);
            }
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
  }

  filterMentor(event) {
    const searchString = this.detailForm.get('mentor_selected').value.toLowerCase().trim();
    // console.log(searchString, event, this.detailForm.get('mentor_selected').value);
    this.mentors = this.originalMentors.filter((country) => country.name.toLowerCase().trim().includes(searchString));
  }

  initForm() {
    this.detailForm = this.fb.group({
      mentor_selected: [''],
      mentor: this.fb.group({
        first_name: [''],
        last_name: [''],
        civility: [''],
        email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])],
        position: [''],
        portable_phone: ['', [Validators.pattern('^[0-9]*$')]],
      }),
      member: this.fb.group({
        first_name: [''],
        last_name: [''],
        civility: [''],
        email: [''],
        position: [''],
        is_should_sign_aggreement: [false],
      }),
    });
  }

  mentorValidation() {
    let enable = false;
    const value = this.detailForm.get('mentor').value;
    const control = this.detailForm.get('mentor').get('portable_phone').valid;
    if (
      value &&
      value.first_name &&
      value.civility &&
      value.last_name &&
      value.email &&
      value.position &&
      value.portable_phone &&
      control
    ) {
      enable = true;
    }
    return enable;
  }
  memberValidation() {
    let enable = false;
    const value = this.detailForm.get('member').value;
    if (value && value.first_name && value.civility && value.last_name && value.email && value.position) {
      enable = true;
    }
    return enable;
  }

  displayMentor(id): string {
    if (id && this.mentors && this.mentors.length) {
      const mentor = this.mentors.find((list) => list._id === id);
      if (mentor) {
        return mentor.name;
      }
    } else {
      return '';
    }
  }
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  openPopUp(data, type) {
    this.subs.sink = this.dialog
      .open(RegistrationDialogComponent, {
        width: '355px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: type,
          data: data,
          candidateId: this.candidateId,
          modify: this.dataModify,
        },
      })
      .afterClosed()
      .subscribe((resp) => {});
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
      .subscribe((resp) => {});
  }

  logOut() {
    this.authService.logOut();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  addMentor() {
    this.isAddMentor = true;
  }
  cancelAddMentor() {
    this.isAddMentor = false;
    this.detailForm.get('mentor').reset();
  }
  addMember() {
    this.isAddMember = true;
  }
  cancelAddMember() {
    this.isAddMember = false;
  }

  deleteMember(index) {
    this.memberCompanyList.splice(index, 1);
  }

  addSpecialization() {
    if (this.question.length <= 4) {
      if (this.specialization_input.value && this.specialization_input.value !== '') {
        this.question.push(this.specialization_input.value);
        this.specialization_input.setValue('');
      }
    }
  }
  remoteSpecialization(index: number) {
    this.question.splice(index, 1);
  }
  submitStepThree() {
    this.detailForm.get('question').setValue(this.question);
    this.candidateService.setDataJobThree(this.detailForm.value);
    // console.log('Payload Step Three', this.detailForm.value);
    this.candidateService.setIndexStep(3);
    this.candidateService.setStatusStepThree(true);
  }
  skipStepThree() {
    this.candidateService.setIndexStep(3);
    this.candidateService.setStatusStepThree(true);
  }
  editIdentity() {
    this.candidateService.setStatusEditModeFive(true);
  }

  connectMentorWithStudent() {
    const payload = {
      civility: this.internshipData.student_id.civility,
      first_name: this.internshipData.student_id.first_name,
      last_name: this.internshipData.student_id.last_name,
      last_name_used: this.internshipData.student_id.last_name_used,
      first_name_used: this.internshipData.student_id.first_name_used,
      nationality: this.internshipData.student_id.nationality,
      nationality_second: this.internshipData.student_id.nationality_second,
      photo: this.internshipData.student_id.photo,
      tele_phone: this.internshipData.student_id.tele_phone,
      email: this.internshipData.student_id.email,
      home_telephone: this.internshipData.student_id.home_telephone,
      student_address: this.internshipData.student_id.student_address,
      companies: this.internshipData.student_id.companies,
    };
    if (this.internshipData.student_id.companies && this.internshipData.student_id.companies.length) {
      const comIndex = this.internshipData.student_id.companies.find((resp) => resp.company._id === this.currSelectedCompanyId);
      if (comIndex && payload.companies[comIndex]) {
        const company = payload.companies[comIndex];
        company.mentor = this.detailForm.get('mentor_selected').value;
        payload.companies[comIndex] = company;
      }
    }
    this.subs.sink = this.schoolService.updateStudent(this.internshipData.student_id._id, payload, this.translate.currentLang).subscribe(
      (resp) => {
        if (resp) {
          this.identityUpdated();
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

  identityUpdated() {
    const payloadIntern = {
      internship_creation_step: 'internship',
      company_manager_id: this.detailForm.get('mentor_selected').value,
    };
    if (
      (this.internshipData.internship_creation_step !== 'pdf' &&
        this.internshipData.internship_creation_step !== 'conditions' &&
        this.internshipData.internship_creation_step !== 'internship') ||
      !this.internshipData.internship_creation_step
    ) {
      payloadIntern.internship_creation_step = 'internship';
    } else {
      delete payloadIntern.internship_creation_step;
    }
    this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
      (resps) => {
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
          confirmButtonText: 'OK',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.candidateService.setStatusStepTen(true);
        });
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

  getMentor() {
    if (this.currSelectedCompanyId && this.typeMentorId) {
      this.subs.sink = this.schoolService.getMentorInternship(this.typeMentorId, this.currSelectedCompanyId).subscribe(
        (resp) => {
          if (resp && resp.length) {
            const mentorSelected = _.cloneDeep(this.detailForm.get('mentor_selected').value);
            if (this.internshipData.company_manager_id && this.internshipData.company_manager_id._id) {
              if (mentorSelected) {
                this.detailForm.get('mentor_selected').setValue(mentorSelected);
              } else {
                this.detailForm.get('mentor_selected').setValue(this.internshipData.company_manager_id._id);
              }
              this.displayMentor(this.internshipData.company_manager_id._id);
            } else if (mentorSelected) {
              this.detailForm.get('mentor_selected').setValue(mentorSelected);
            }
            this.originalMentors = resp.map((list) => {
              return {
                _id: list._id,
                first_name: list.first_name,
                last_name: list.last_name,
                civility: list.civility,
                email: list.email,
                full_name: list.full_name,
                name:
                  (list.civility && list.civility !== 'neutral' ? this.translate.instant(list.civility) : '') +
                  ' ' +
                  list.first_name +
                  ' ' +
                  list.last_name,
              };
            });
            this.mentors = this.originalMentors;
          } else {
            this.mentors = [];
            this.originalMentors = [];
          }
        },
        (err) => {
          this.mentors = [];
          this.originalMentors = [];
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.mentors = [];
      this.originalMentors = [];
    }
  }

  selectUser(event) {
    this.isAddMentor = false;
  }
  saveMentor() {
    const payload = _.cloneDeep(this.detailForm.get('mentor').value);
    this.mentorEntity.companies = [this.currSelectedCompanyId];
    payload.entities = [this.mentorEntity];
    const userId = this.currentUser && this.currentUser._id ? this.currentUser._id : null;
    this.subs.sink = this.userService.registerUser(payload, userId,this.currentUserTypeId).subscribe(
      (resp) => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('USER_S9.TITLE'),
          text: this.translate.instant('USER_S9.TEXT', {
            civility: resp.civility !== 'neutral' ? this.translate.instant(resp.civility) : '',
            lastName: resp.first_name,
            firstName: resp.last_name,
          }),
          confirmButtonText: this.translate.instant('USER_S9.OK'),
        });
        this.detailForm.get('mentor_selected').patchValue(resp._id);
        this.detailForm.get('mentor').reset();
        this.isAddMentor = false;
        this.getMentor();
        this.isWaitingForResponse = false;
      },
      (err) => {
        // console.log('err => ', err, err['message']);
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
          Swal.fire({
            title: this.translate.instant('USER_S15.TITLE'),
            html: this.translate.instant('USER_S15.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S15.OK'),
          });
        } else if (err['message'] === 'GraphQL error: Email Exist') {
          Swal.fire({
            title: this.translate.instant('USER_S16.TITLE'),
            html: this.translate.instant('USER_S16.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S16.OK'),
          });
        } else if (err['message'] === 'GraphQL error: Selected title Already Have Certifier Admin') {
          Swal.fire({
            title: this.translate.instant('USERADD_S2.TITLE'),
            html: this.translate.instant('USERADD_S2.TEXT'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
          });
        } else if (err['message'] === 'GraphQL error: Invalid Email') {
          Swal.fire({
            title: this.translate.instant('Incorrect Email'),
            html: this.translate.instant('Invalid email format'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('OK'),
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

  saveCompanyMember() {
    this.memberCompanyList.push(this.detailForm.get('member').value);
    const payload = _.cloneDeep(this.detailForm.get('member').value);
    this.companyMemberEntity.companies = [this.currSelectedCompanyId];
    payload.entities = [this.companyMemberEntity];
    delete payload.is_should_sign_aggreement;
    const userId = this.currentUser ? this.currentUser._id : null;
    this.subs.sink = this.userService.registerUser(payload, userId,this.currentUserTypeId).subscribe(
      (resp) => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('USER_S9.TITLE'),
          text: this.translate.instant('USER_S9.TEXT', {
            civility: resp.civility !== 'neutral' ? this.translate.instant(resp.civility) : '',
            lastName: resp.first_name,
            firstName: resp.last_name,
          }),
          confirmButtonText: this.translate.instant('USER_S9.OK'),
        });
        this.detailForm.get('member').get('first_name').setValue('');
        this.detailForm.get('member').get('last_name').setValue('');
        this.detailForm.get('member').get('civility').setValue('');
        this.detailForm.get('member').get('email').setValue('');
        this.detailForm.get('member').get('position').setValue('');
        this.detailForm.get('member').get('is_should_sign_aggreement').setValue(false);
        this.isAddMember = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        // console.log('err => ', err, err['message']);
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Selected Class Already Have Academic Director') {
          Swal.fire({
            title: this.translate.instant('USER_S15.TITLE'),
            html: this.translate.instant('USER_S15.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S15.OK'),
          });
        } else if (err['message'] === 'GraphQL error: Email Exist') {
          Swal.fire({
            title: this.translate.instant('USER_S16.TITLE'),
            html: this.translate.instant('USER_S16.TEXT'),
            type: 'info',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S16.OK'),
          });
        } else if (err['message'] === 'GraphQL error: Selected title Already Have Certifier Admin') {
          Swal.fire({
            title: this.translate.instant('USERADD_S2.TITLE'),
            html: this.translate.instant('USERADD_S2.TEXT'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
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
