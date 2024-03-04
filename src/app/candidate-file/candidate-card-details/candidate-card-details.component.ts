import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { MailCanidateDialogComponent } from 'app/candidates/mail-candidates-dialog/mail-candidates-dialog.component';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { StudentUrgentDialogComponent } from '../student-urgent-dialog/student-urgent-dialog.component';
import { UsersService } from 'app/service/users/users.service';
import { AdmissionService } from 'app/service/admission/admission.service';
import { StudentChangeStatusDialogComponent } from '../student-commentaries-tab/student-change-status-dialog/student-change-status-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserService } from 'app/service/user/user.service';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { CountryService } from 'app/shared/services/country.service';

@Component({
  selector: 'ms-candidate-card-details',
  templateUrl: './candidate-card-details.component.html',
  styleUrls: ['./candidate-card-details.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class CandidateCardDetailsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() candidateId = {};
  @Input() tab;
  @Input() subTab;
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('candidateMatGroup', { static: false }) candidateMatGroup: MatTabGroup;
  @ViewChild('admissionStatus', { static: false }) matMenuTrigger: MatMenuTrigger;
  mailStudentsDialog: MatDialogRef<MailCanidateDialogComponent>;
  studentUrgentMailDialog: MatDialogRef<StudentUrgentDialogComponent>;
  candidate: any = {};
  callSms = false;
  private subs = new SubSink();
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'edit-tab': 'Modifications',
    'evolution-tab': 'Evolution',
  };

  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  selectedIndex = 0;
  userData = [];
  personalSituation = false;
  restrictiveCondition = false;
  studentStatusList = [];
  listStatusAdmitted = [
    { value: 'resigned', key: 'Resign' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusResigned = [
    { value: 'admission_in_progress', key: 'Admitted' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusAdmittedFC = [
    { value: 'resigned', key: 'Resign' },
    { value: 'financement_validated', key: 'Financement valided' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusEngaged = [
    { value: 'resigned_after_engaged', key: 'Resign after engaged' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusEngagedFC = [
    { value: 'resigned_after_engaged', key: 'Resign after engaged' },
    { value: 'financement_validated', key: 'Financement valided' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusRegistered = [
    { value: 'resigned_after_registered', key: 'Resign after registered' },
    { value: 'report_inscription', key: 'Report Inscription +1' },
    { value: 'resignation_missing_prerequisites', key: 'resignation_missing_prerequisites' },
    { value: 'resign_after_school_begins', key: 'resign_after_school_begins' },
    { value: 'no_show', key: 'no_show' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusPostphone = [
    { value: 'registered', key: 'Registered' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusResignBegins = [{ value: 'registered', key: 'Registered' }];

  listStatusBillValidatedFC = [
    { value: 'financement_validated', key: 'Financement valided' },
    { value: 'resigned', key: 'Resign' },
  ];

  listStatusFinancementValidated = [
    { value: 'resigned', key: 'Resign' },
    { value: 'report_inscription', key: 'Report Inscription +1' },
    { value: 'registered', key: 'Registered' },
    // { value: 'admission_in_progress', key: 'Admitted' },
    // { value: 'bill_validated', key: 'Bill validated' },
    // { value: 'engaged', key: 'Engaged' },
  ];

  listStatusInScholarship = [{ value: 'resigned', key: 'Resign' }];
  listStatusForResignRegistered = [{ value: 'registered', key: 'Registered' }];
  listStatusForResignEngaged = [{ value: 'admission_in_progress', key: 'Admitted' }];

  currentUser: any;
  isLoading: boolean = true;
  showFinancement: any;
  timeOutVal: any;
  @Input() candidateUniqueNumber;
  studentId;
  isAdultDummy = false;
  isEmancipatedDummy = true;

  _studentDomainBaseUrl: string = environment.studentEnvironment;
  listProgram: any = [];
  isWaitingForResponse: boolean = true;

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code
  constructor(
    private candidateService: CandidatesService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private admissionService: AdmissionService,
    private usersService: UsersService,
    private authService: AuthService,
    public permissionService: PermissionService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private permissions: NgxPermissionsService,
    private userService: UserService,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.getAllCountryCodes();
    this.getAllUsers();
    this.moveToTab(this.tab);
    if ((this.tab === 'Student' && this.subTab === 'Financement')) {
      this.showFinancement = true;
    } else {
      this.showFinancement = false;
    }

    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }
  
  ngAfterViewInit() {
    this.moveToTab(this.tab);
  }
  ngOnChanges() {
    this.isLoading = true;

    this.getOneCandidate();
    this.getAllCandidateComment();
    this.currentUser = this.authService.getCurrentUser();
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  get studentDomain() {
    return `${this._studentDomainBaseUrl}/session/login`;
  }

  getOneCandidate() {
    // make sure if candidateUniqueNumber that passed from parent (candidate-file-component) populated correctly
    if (this.candidateUniqueNumber) {
      const filter = {
        candidate_unique_number_exact: this.candidateUniqueNumber ? this.candidateUniqueNumber : '',
        readmission_status: 'all_candidates',
      };
      // change getOneCandidate to getAllCandidate query to get all of the student program. and, filter the registered one
      // *************** Resetting student id everytime user change into another student card
      this.isWaitingForResponse = true;
      this.studentId = '';
      this.listProgram = [];
      const currentUser = this.utilService.getCurrentUser();
      const userTypesList = currentUser?.app_data?.user_type_id ? currentUser?.app_data?.user_type_id : [];
      this.subs.sink = this.candidateService.getAllCandidatesTabStudent(filter, userTypesList).subscribe(
        (resp) => {
          this.listProgram = _.cloneDeep(resp);
          let candidateData = _.cloneDeep(resp)
          if (candidateData) {
            let candidateDataBasedOnActiveScholarSeason = candidateData.find((data) => {
              if (
                !data?.scholar_season?.from?.date_utc ||
                !data?.scholar_season?.from?.time_utc ||
                !data?.scholar_season?.to?.date_utc ||
                !data?.scholar_season?.to?.time_utc
              ) {
                return false
              }
              const currentDateTime = moment()
              const startDate = this.parseUtcToLocalPipe.transformDateToJavascriptDate(
                data.scholar_season.from.date_utc,
                data.scholar_season.from.time_utc
              )
              const endDate = this.parseUtcToLocalPipe.transformDateToJavascriptDate(
                data.scholar_season.to.date_utc,
                data.scholar_season.to.time_utc
              )
              return currentDateTime.isBetween(startDate, endDate)
            })
            if (candidateDataBasedOnActiveScholarSeason) {
              if (candidateDataBasedOnActiveScholarSeason?.candidate_admission_status === 'admitted' && candidateDataBasedOnActiveScholarSeason?.readmission_status === 'assignment_table') {
                const candidateDataRegistered = candidateData?.find((data) => data?.candidate_admission_status === 'registered');
                candidateData = candidateDataRegistered || candidateDataBasedOnActiveScholarSeason;
              } else {
                candidateData = candidateDataBasedOnActiveScholarSeason;
              }
            } else {
              candidateData = candidateData[0];
            }
            const isFC =
              candidateData &&
              candidateData.type_of_formation_id &&
              candidateData.type_of_formation_id.type_of_formation &&
              candidateData.type_of_formation_id.type_of_formation &&
              candidateData.type_of_formation_id.type_of_formation !== 'classic'
                ? true
                : false;
            if (candidateData?.type_of_formation_id?.type_of_formation) {
              this.showFinancement = candidateData.type_of_formation_id.type_of_formation !== 'classic' ? true : false;
            } else {
              this.showFinancement = false;
            }
            this.candidate = _.cloneDeep(candidateData);
            // ********* implement behaviour subject setCandidateOneStduent service
            this.candidateService.setCandidateOneStduent(this.candidate)
            this.studentId = this.candidate?.student_id?._id;
            if (this.candidate && this.candidate.telephone) {
              this.candidate.telephone = this.candidate.telephone;
            }
            if (this.candidate && this.candidate.fixed_phone) {
              this.candidate.fixed_phone = this.candidate.fixed_phone;
            }
            if (
              (candidateData &&
                candidateData.candidate_admission_status &&
                candidateData.candidate_admission_status === 'admission_in_progress') ||
              candidateData.candidate_admission_status === 'admitted' ||
              candidateData.candidate_admission_status === 'resigned'
            ) {
              if (isFC) {
                this.studentStatusList = this.listStatusAdmittedFC;
              } else {
                if (candidateData && candidateData.candidate_admission_status && candidateData.candidate_admission_status === 'resigned') {
                  this.studentStatusList = this.listStatusResigned;
                } else {
                  this.studentStatusList = this.listStatusAdmitted;
                }
              }
            } else if (candidateData && candidateData.candidate_admission_status && candidateData.candidate_admission_status === 'engaged') {
              if (isFC) {
                this.studentStatusList = this.listStatusEngagedFC;
              } else {
                this.studentStatusList = this.listStatusEngaged;
              }
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'registered'
            ) {
              this.studentStatusList = this.listStatusRegistered;
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'report_inscription'
            ) {
              this.studentStatusList = this.listStatusPostphone;
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'resign_after_school_begins'
            ) {
              this.studentStatusList = this.listStatusResignBegins;
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'bill_validated'
            ) {
              this.studentStatusList = this.listStatusBillValidatedFC;
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'financement_validated'
            ) {
              this.studentStatusList = this.listStatusFinancementValidated;
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'resigned_after_registered'
            ) {
              this.studentStatusList = this.listStatusForResignRegistered;
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'resignation_missing_prerequisites'
            ) {
              this.studentStatusList = [];
            } else if (
              candidateData &&
              candidateData.candidate_admission_status &&
              candidateData.candidate_admission_status === 'resigned_after_engaged'
            ) {
              if (isFC) {
                this.studentStatusList = [];
              } else {
                this.studentStatusList = this.listStatusForResignEngaged;
              }
            } else {
              this.studentStatusList = [];
            }
          }

          this.isWaitingForResponse = false;
        },
        (err) => {
          this.studentStatusList = [];
          this.isWaitingForResponse = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.authService.handlerSessionExpired();
            return;
          }
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
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  getAllCandidateComment() {
    this.isLoading = true;
    const filter = {
      candidate_id: this.candidateId,
      subject: '',
      comment_body: '',
      created_by: '',
      date_comment_created: '',
      category: '',
    };
    this.subs.sink = this.candidateService.GetAllCandidateComments(filter).subscribe(
      (resp) => {
        if (!resp.length) {
          this.personalSituation = false;
          this.restrictiveCondition = false;
          this.isLoading = false;
          return;
        } else {
          console.log(resp);
          const tmpData = _.cloneDeep(resp);
          const rootComment = tmpData.filter((comment) => comment.is_reply === false);
          if (rootComment && rootComment.length) {
            console.log('root comment found', rootComment);
            this.personalSituation = rootComment[0].is_personal_situation;
            this.restrictiveCondition = rootComment[0].is_restrictive_conditions;
          } else {
            this.personalSituation = false;
            this.restrictiveCondition = false;
          }
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getAllUsers() {
    this.userData = [];
    this.subs.sink = this.usersService.getAllUserNote().subscribe(
      (respAdmtc) => {
        this.userData = respAdmtc;
      },
      (err) => {
        this.userData = [];
        this.isLoading = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'Identity':
          this.selectedIndex = 1;
          break;
        case 'Commentaries':
          this.selectedIndex = 2;
          break;
        case 'Mailbox':
          this.selectedIndex = 3;
          break;
        case 'Tags':
          this.selectedIndex = 4;
          break;
        // case 'Documents':
        //   this.selectedIndex = this.permissionService.studentCardTagShowPerm() === true ? 7 : 6;
        //   break;
        // case 'Financement':
        //   this.selectedIndex = this.permissionService.studentCardTagShowPerm() === true ? 8 : 7;
        //   break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  nextStep(value) {
    console.log('_val', value);
    if (value) {
      this.moveToTab(value);
    }
  }

  reloadData(value) {
    if (value) {
      this.candidate = null;
      this.getOneCandidate();
      this.reload.emit(true);
    }
  }
  reloadDataDetail(value) {
    if (value) {
      this.candidate = null;
      this.getOneCandidate();
    }
  }

  loadingData(value) {
    this.loading.emit(value);
  }
  sendMail(student) {
    console.log('_send', student);

    if (student) {
      const mappedData = {
        candidate_id: {
          candidate_admission_status: student?.candidate_admission_status,
          civility: student?.civility,
          email: student?.email,
          emailDefault: student?.school_mail,
          first_name: student?.first_name,
          last_name: student?.last_name,
        },
        financial_supports: student?.payment_supports,
        fromCandidate: true,
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {});
    }
  }

  openWhatsapp(element) {
    const whatsAppUrl = 'https://api.whatsapp.com/send?phone=' + element.telephone + '&text=';
    const whatsAppText = this.translate.instant('whatsapp message', {
      name: element.first_name,
      dev:
        (this.candidate && this.candidate.civility && this.candidate.civility !== 'neutral'
          ? `${this.translate.instant(this.candidate.civility)} `
          : '') + `${this.candidate.first_name} ${this.candidate.last_name}`,
      school: element.school.short_name,
      campus: element.campus.name,
      position: element.position ? element.position : '',
    });
    console.log('curernt ', this.candidate);
    console.log('whatsAppText ', whatsAppText);
    window.open(whatsAppUrl + whatsAppText, '_blank');
  }

  callCandidates(element) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S3.TITLE'),
      html: this.translate.instant('CANDIDAT_S3.TEXT', {
        candidateName:
          (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) : '') +
          ' ' +
          element.first_name +
          ' ' +
          element.last_name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        const payload = _.cloneDeep(element);
        if (payload && payload.date_of_birth) {
          payload.date_of_birth = moment(payload.date_of_birth).format('DD/MM/YYYY');
        }
        delete payload._id;
        delete payload.student_mentor_id;
        delete payload.admission_member_id;
        delete payload.count_document;
        delete payload.user_id;
        delete payload.date_added;
        delete payload.announcement_call;
        delete payload.candidate_unique_number;
        delete payload.billing_id;
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
        if (payload && payload.type_of_formation_id) {
          payload.type_of_formation_id = payload.type_of_formation_id._id;
        }
        this.subs.sink = this.candidateService.UpdateCandidateCall(element._id, payload).subscribe(
          (resp) => {
            console.log('Candidate Updated!', resp);
            Swal.fire({
              type: 'success',
              title: this.translate.instant('CANDIDAT_S4.MESSAGE'),
              html: this.translate.instant('CANDIDAT_S4.TEXT', {
                candidateName:
                  (element && element.civility && element.civility !== 'neutral' ? this.translate.instant(element.civility) : '') +
                  ' ' +
                  element.first_name +
                  ' ' +
                  element.last_name,
              }),
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
            }).then((resss) => {
              // this.viewCandidateInfo(element._id, 'note-tab');
            });
          },
          (err) => {
            if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
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
            } else if (
              err &&
              err['message'] &&
              (err['message'].includes('jwt expired') ||
                err['message'].includes('str & salt required') ||
                err['message'].includes('Authorization header is missing') ||
                err['message'].includes('salt'))
            ) {
              this.authService.handlerSessionExpired();
              return;
            }
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

  updateStatus(value) {
    if (value === 'report_inscription' || (this.candidate && this.candidate.candidate_admission_status === 'report_inscription')) {
      this.changeStatus(this.candidate);
    } else if (
      value === 'admission_in_progress' &&
      this.candidate &&
      (this.candidate.candidate_admission_status === 'resigned_after_registered' ||
        this.candidate.candidate_admission_status === 'resigned_after_engaged' ||
        this.candidate.candidate_admission_status === 'resignation_missing_prerequisites')
    ) {
      this.readmittedStatus(value);
    } else {
      const payload = {
        candidate_admission_status: value,
      };
      const currentStatus = this.translate.instant(this.candidate.candidate_admission_status);
      const newStatus = this.translate.instant(value);
      const statusValue = this.candidate.candidate_admission_status;
      Swal.fire({
        title: this.translate.instant('CHANGESTATUS_S1.TITLE'),
        html: this.translate.instant('CHANGESTATUS_S1.TEXT', { currentStatus, newStatus }),
        type: 'warning',
        showCancelButton: true,
        cancelButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 2'),
        confirmButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 1'),
      }).then((result) => {
        if (result.value) {
          const dialogRef = this.dialog
            .open(StudentChangeStatusDialogComponent, {
              width: '750px',
              minHeight: '100px',
              disableClose: true,
              data: {
                currentStatus,
                statusValue,
                newStatus: value,
                isEdit: false,
                currentUser: this.currentUser,
                candidateId: this.candidate._id,
                allDataUser: this.userData,
              },
            })
            .afterClosed()
            .subscribe((responDialog) => {
              if (responDialog) {
                this.isLoading = true;
                console.log('responDialog', responDialog);
                if (value === 'resign_after_school_begins') {
                  payload['resign_after_school_begins_at'] = responDialog['resign_after_school_begins_at'];
                  delete responDialog['resign_after_school_begins_at'];
                } else if (value === 'no_show') {
                  payload['no_show_at'] = responDialog['no_show_at'];
                  delete responDialog['no_show_at'];
                }
                payload['status_changed_at'] = responDialog['status_changed_at'];
                delete responDialog['status_changed_at'];
                // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
                const is_save_identity_student = true;
                this.subs.sink = this.admissionService.UpdateCandidate(this.candidateId, payload, is_save_identity_student).subscribe(
                  (resp) => {
                    if (resp) {
                      this.subs.sink = this.candidateService.CreateCandidateComment(responDialog).subscribe(
                        (resp) => {
                          if (resp) {
                            Swal.fire({
                              type: 'success',
                              title: this.translate.instant('Bravo'),
                              confirmButtonText: this.translate.instant('OK'),
                              allowOutsideClick: false,
                              allowEscapeKey: false,
                            }).then((res) => {
                              if (res.value) {
                                this.isLoading = false;
                                // this.matMenuTrigger.closeMenu;
                                this.reloadData(true);
                              }
                            });
                          }
                        },
                        (err) => {
                          this.isLoading = false;
                          if (
                            err &&
                            err['message'] &&
                            (err['message'].includes('jwt expired') ||
                              err['message'].includes('str & salt required') ||
                              err['message'].includes('Authorization header is missing') ||
                              err['message'].includes('salt'))
                          ) {
                            this.authService.handlerSessionExpired();
                            return;
                          }
                          Swal.fire({
                            type: 'info',
                            title: this.translate.instant('SORRY'),
                            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                          });
                        },
                      );
                    }
                  },
                  (err) => {
                    this.isLoading = false;
                    if (
                      err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC'
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
                    } else if (
                      err &&
                      err['message'] &&
                      (err['message'].includes('jwt expired') ||
                        err['message'].includes('str & salt required') ||
                        err['message'].includes('Authorization header is missing') ||
                        err['message'].includes('salt'))
                    ) {
                      this.authService.handlerSessionExpired();
                      return;
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
            });
        }
      });
    }
  }

  readmittedStatus(value) {
    console.log('readmittedStatus', value);
    const currentStatus = this.translate.instant(this.candidate.candidate_admission_status);
    const newStatus = this.translate.instant(value);
    Swal.fire({
      title: this.translate.instant('Are you sure?'),
      html: this.translate.instant('CHANGESTATUS_S1.TEXT', { currentStatus, newStatus }),
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 2'),
      confirmButtonText: this.translate.instant('CHANGESTATUS_S1.BUTTON 1'),
    }).then((result) => {
      if (result.value) {
        const dialogRef = this.dialog
          .open(StudentChangeStatusDialogComponent, {
            width: '750px',
            minHeight: '100px',
            disableClose: true,
            data: {
              currentStatus,
              newStatus: value,
              isEdit: false,
              currentUser: this.currentUser,
              candidateId: this.candidate._id,
            },
          })
          .afterClosed()
          .subscribe((responDialog) => {
            if (responDialog) {
              this.isLoading = true;
              this.subs.sink = this.admissionService.TransferStudentResignedAfterRegisteredToAdmitted(this.candidateId).subscribe(
                (resp) => {
                  if (resp) {
                    delete responDialog['status_changed_at'];
                    this.subs.sink = this.candidateService.CreateCandidateComment(responDialog).subscribe(
                      (ressp) => {
                        if (ressp) {
                          Swal.fire({
                            type: 'success',
                            title: this.translate.instant('Bravo'),
                            confirmButtonText: this.translate.instant('OK'),
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                          }).then((res) => {
                            if (res.value) {
                              this.isLoading = false;
                              // this.matMenuTrigger.closeMenu;
                              this.reloadData(true);
                            }
                          });
                        }
                      },
                      (err) => {
                        this.isLoading = false;
                        if (
                          err &&
                          err['message'] &&
                          (err['message'].includes('jwt expired') ||
                            err['message'].includes('str & salt required') ||
                            err['message'].includes('Authorization header is missing') ||
                            err['message'].includes('salt'))
                        ) {
                          this.authService.handlerSessionExpired();
                          return;
                        }
                        Swal.fire({
                          type: 'info',
                          title: this.translate.instant('SORRY'),
                          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                        });
                      },
                    );
                  }
                },
                (err) => {
                  this.isLoading = false;
                  if (err['message'] === 'GraphQL error: There is term that already paid') {
                    Swal.fire({
                      type: 'info',
                      title: this.translate.instant('TRANSFER_S5.Title'),
                      text: this.translate.instant('TRANSFER_S5.Text'),
                      confirmButtonText: this.translate.instant('TRANSFER_S5.Button 1'),
                      allowEnterKey: false,
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                    });
                  } else if (err['message'] === 'GraphQL error: There is term still pending') {
                    Swal.fire({
                      type: 'info',
                      title: this.translate.instant('PAY_SUM_S3.Title'),
                      text: this.translate.instant('PAY_SUM_S3.Text'),
                      confirmButtonText: this.translate.instant('PAY_SUM_S3.Button'),
                      allowEnterKey: false,
                      allowEscapeKey: false,
                      allowOutsideClick: false,
                    });
                  } else {
                    if (
                      err &&
                      err['message'] &&
                      (err['message'].includes('jwt expired') ||
                        err['message'].includes('str & salt required') ||
                        err['message'].includes('Authorization header is missing') ||
                        err['message'].includes('salt'))
                    ) {
                      this.authService.handlerSessionExpired();
                      return;
                    }
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
          });
      }
    });
  }

  sendUrgentMail(data) {
    this.studentUrgentMailDialog = this.dialog.open(StudentUrgentDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }
  changeStatus(element) {
    const payload = {
      candidate_admission_status: element.candidate_admission_status === 'registered' ? 'report_inscription' : 'registered',
    };
    const civility = element.civility && element.civility === 'neutral' ? '' : this.translate.instant(element.civility);
    const last_name = element.last_name;
    const first_name = element.first_name;
    let timeDisabled = 4;
    if (element.candidate_admission_status === 'registered' || element.candidate_admission_status === 'financement_validated') {
      payload.candidate_admission_status = 'report_inscription';
      Swal.fire({
        title: this.translate.instant('INSCRIPTION_REPORT_S1.TITLE'),
        html: this.translate.instant('INSCRIPTION_REPORT_S1.TEXT', {
          candidateName: civility + ' ' + first_name + ' ' + last_name,
        }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S1.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.updateToPostPone(element, payload);
        }
      });
    } else {
      Swal.fire({
        title: this.translate.instant('INSCRIPTION_REPORT_S2.TITLE'),
        html: this.translate.instant('INSCRIPTION_REPORT_S2.TEXT', {
          candidateName: civility + ' ' + first_name + ' ' + last_name,
        }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('DASHBOARD_DELETE.NO'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('INSCRIPTION_REPORT_S2.BUTTON_1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then((res) => {
        clearTimeout(this.timeOutVal);
        if (res.value) {
          this.updateToPostPone(element, payload);
        }
      });
    }
  }

  updateToPostPone(element, payload) {
    this.isLoading = true;
    this.subs.sink = this.candidateService.UpdateCandidateStatus(element._id, payload).subscribe(
      (resp) => {
        this.isLoading = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
        }).then((resss) => {
          this.reloadData(true);
        });
      },
      (err) => {
        this.isLoading = false;
        if (err['message'] === 'GraphQL error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC' || err['message'] === 'GraphQL error: Error: You type the IBAN or BIC from the legal entity. Please enter your IBAN and BIC') {
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
        } else if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  connectAsStudent(student) {
    this.isLoading = true;
    const currentUser = this.utilService.getCurrentUser();
    const studentUserId = student && student.user_id && student.user_id._id ? student.user_id._id : null;
    if (currentUser && studentUserId && student.candidate_admission_status === 'registered') {
      this.subs.sink = this.authService.loginAsUser(currentUser._id, studentUserId).subscribe(
        (resp) => {
          this.isLoading = false;
          if (resp?.user?.student_id?._id) {
            const tempUser = resp.user;
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: this.translate.instant(student.civility),
                UserFirstName: student.first_name,
                UserLastName: student.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              const studentType = '5a067bba1c0217218c75f8ab';
              if (tempUser.entities[0].type._id === studentType || tempUser.student_id) {
                this.authService.connectAsStudent(resp, 'Student', 'connect');
              }
            });
          } else {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('Student_Not_Registered.TITLE'),
              html: this.translate.instant('Student_Not_Registered.TEXT', {
                civility: student.civility === 'neutral' ? '' : `${this.translate.instant(student.civility)} `,
                firstname: student.first_name,
                lastname: student.last_name,
              }),
              confirmButtonText: this.translate.instant('Student_Not_Registered.BUTTON'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          }
        },
        (err) => {
          this.isLoading = false;
          if (err['message'] === 'GraphQL error: you cannot logged in as this user') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SWAL_CONNECTAS.TITLE'),
              html: this.translate.instant('SWAL_CONNECTAS.TEXT'),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('SWAL_CONNECTAS.BUTTON'),
            });
          }
        },
      );
    } else {
      this.isLoading = false;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Student_Not_Registered.TITLE'),
        html: this.translate.instant('Student_Not_Registered.TEXT', {
          civility: student.civility === 'neutral' ? '' : `${this.translate.instant(student.civility)} `,
          firstname: student.first_name,
          lastname: student.last_name,
        }),
        confirmButtonText: this.translate.instant('Student_Not_Registered.BUTTON'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    }
  }

  statusStudentMinorManagement(candidate){
    if(candidate?.is_adult && candidate?.candidate_admission_status === 'registered'){
      return 'Adult'
    }else if(candidate?.is_emancipated_minor && candidate?.candidate_admission_status === 'registered'){
      return 'Minor emancipated'
    } else if(candidate?.personal_information === 'legal_representative' && candidate?.candidate_admission_status === 'registered'){
      return 'Minor'
    } else {
      return 'None'
    }
  }
}
