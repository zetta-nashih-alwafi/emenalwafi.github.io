import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy, OnChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
import { CompanyService } from 'app/service/company/company.service';
import { InternshipService } from 'app/service/internship/internship.service';
import { concatMap } from 'rxjs/operators';
import { NgxPermissionsService } from 'ngx-permissions';
import { AddCompanyInternshipFrDialogComponent } from '../add-company-internship-fr-dialog/add-company-internship-fr-dialog.component';

@Component({
  selector: 'ms-fourth-step-aggrement',
  templateUrl: './fourth-step-aggrement.component.html',
  styleUrls: ['./fourth-step-aggrement.component.scss'],
})
export class FourthStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() dataModify: any;
  @Input() internshipId = '';
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() isUserMember: any;
  private subs = new SubSink();
  today = new Date();
  isLoadingUpload = false;
  photo: string;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  companyImage = 'https://i.imgur.com/uCLo8Ek.jpg';
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  companyBannerDefault =
    'https://cdn.editage.com/insights/editagecom/production/6%20Differences%20between%20a%20study%20background%20and%20a%20literature%20review.jpg';
  question = [];
  specialization_input = new UntypedFormControl('');
  isModifyCompanyMode = false;

  @Output() currentIndex = new EventEmitter<any>();
  companyData: any[];
  isWaitingForResponse = false;
  isCreateNew = false;
  internshipData: any;
  isHaveCompany = false;
  currSelectedCompanyId = '';
  currSelectedCompanyData: any;
  isImageUploading: boolean;
  countries = [];
  franceCountry = {
    code: 'FR',
    name: 'France',
  };
  isUserCandidate = false;
  isUserAlumni = false;
  isUserAlumniMember = false;
  selectedCountry: any;

  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private companyService: CompanyService,
    private internshipService: InternshipService,
    private parseStringDatePipe: ParseStringDatePipe,
    private dateAdapter: DateAdapter<Date>,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utilService: UtilityService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private transcriptBuilderService: TranscriptBuilderService,
    private ngxPermissionService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    // this.fetchCompanyData();
    this.isUserAlumni = !!this.ngxPermissionService.getPermission('Alumni');
    this.isUserAlumniMember = !!this.ngxPermissionService.getPermission('Alumni Member');
    this.isUserCandidate = !!this.ngxPermissionService.getPermission('Candidate');
    if (!this.isUserStudent) {
      this.isUserStudent = !!this.ngxPermissionService.getPermission('Student Mentor');
    }
    this.getDataInternship();
    this.subs.sink = this.schoolService.getCountry().subscribe((list: any[]) => {
      const dataCountry = _.cloneDeep(list);
      const indexFr = list.findIndex((lists) => lists.name === 'France');
      dataCountry.splice(indexFr, 1);
      dataCountry.unshift(this.franceCountry);
      this.countries = dataCountry;
    });
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });

    this.subs.sink = this.candidateService.statusEditModeFour.subscribe((val) => {
      this.isModifyCompanyMode = val;
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  fetchCompanyData() {
    this.route.queryParams.pipe(concatMap((params) => this.companyService.getOneCompany(params['companyId']))).subscribe((companyData) => {
      // console.log('company data is:', companyData);
      if (companyData) {
        this.companyData = companyData;
      }
    });
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

  // showForm
  toggleEditMode() {
    this.isModifyCompanyMode = !this.isModifyCompanyMode;
    this.isCreateNew = false;
  }

  reloadPage() {
    this.isModifyCompanyMode = !this.isModifyCompanyMode;
    this.getDataInternship();
  }

  identityUpdated() {
    const payloadIntern = {
      internship_creation_step: 'mentor',
    };
    if (
      (this.internshipData.internship_creation_step !== 'pdf' &&
        this.internshipData.internship_creation_step !== 'conditions' &&
        this.internshipData.internship_creation_step !== 'internship' &&
        this.internshipData.internship_creation_step !== 'mentor') ||
      !this.internshipData.internship_creation_step
    ) {
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
            this.candidateService.setStatusStepFour(true);
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
    } else {
      Swal.fire({
        type: 'success',
        title: 'Bravo!',
        confirmButtonText: 'OK',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.candidateService.setStatusStepFour(true);
      });
    }
  }

  continueButton() {
    this.candidateService.setStatusStepFour(true);
  }
  openDialogAddCompanyCountry() {
    const dialogRef = this.dialog.open(AddCompanyInternshipFrDialogComponent, {
      width: '600px',
      minHeight: '100px',
      data: {
        country: this.countries,
        isInternship: true,
        internshipData: this.internshipData,
      },
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: { country: string; case?: string; company_data?: any }) => {
      console.log(res);
      if (res) {
        this.selectedCountry = res;
        if (res.country !== 'France') {
          this.isModifyCompanyMode = true;
          this.isCreateNew = true;
        } else {
          this.getDataInternship();
          switch (res.case) {
            case 'case 1':
              break;
            case 'case 2':
              break;
            // continue adding case here if there is an action to do after swal closed...
            // ...
            case 'no_case':
              break;
            case 'case_6':
              break;
            default:
              break;
          }
        }
      }
    });
  }
  // addSpecialization() {
  //   if (this.question.length <= 4) {
  //     if (this.specialization_input.value && this.specialization_input.value !== '') {
  //       this.question.push(this.specialization_input.value);
  //       this.specialization_input.setValue('');
  //     }
  //   }
  // }

  getDataInternship() {
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            if (resp.company_branch_id && resp.company_branch_id._id) {
              this.internshipData = _.cloneDeep(resp);
              const activeCompany = this.internshipData.company_branch_id;
              this.currSelectedCompanyId = activeCompany ? activeCompany._id : null;
              this.currSelectedCompanyData = activeCompany ? activeCompany : null;
              this.isHaveCompany = true;
            } else {
              this.internshipData = _.cloneDeep(resp);
              this.currSelectedCompanyId = null;
              this.currSelectedCompanyData = null;
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
  onFileSelected(fileInput: Event, type: string) {
    this.isImageUploading = true;
    const imageInput = (<HTMLInputElement>fileInput.target).files[0];
    if ((imageInput && imageInput.type === 'image/png') || (imageInput && imageInput.type === 'image/jpeg')) {
      this.subs.sink = this.fileUploadService
        .singleUpload(imageInput)
        .pipe(concatMap((imageResp) => this.updateCompanyImage(imageResp, type)))
        .subscribe(
          (resp) => {
            this.isImageUploading = false;
            this.getDataInternship(); // reset everything so user can get the latest display
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
            }
          },
          (err) => {
            this.isImageUploading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    } else {
      this.isImageUploading = false;
    }
  }

  updateCompanyImage(imageResp: any, type: string) {
    // console.log('Image response is:', imageResp.s3_file_name);
    const payload = _.cloneDeep(this.currSelectedCompanyData);
    const imageVariable = type === 'logo' ? 'company_logo' : 'banner';
    payload[imageVariable] = imageResp.s3_file_name;
    delete payload['_id'];
    delete payload['count_document'];
    delete payload['mentor_ids'];
    delete payload['school_ids'];
    delete payload['company_entity_id'];
    if (!payload.images) {
      payload.images = [];
    }
    return this.companyService.updateCompany(this.currSelectedCompanyId, payload);
  }
  imgURL(url: string): string {
    return `${this.serverimgPath}${url}`;
  }
  goToSocialMedia(url, typeUrl) {
    console.log('clicked');
    if (url) {
      switch (typeUrl) {
        case 'Website': {
          let link = '';
          if (!/^http[s]?:\/\//.test(url)) {
            link += 'http://';
          }

          link += url;
          window.open(link, '_blank');
          break;
        }
        case 'Twitter': {
          let link = '';
          if (!/^http[s]?:\/\//.test(url)) {
            link += 'http://';
          }

          link += url;
          window.open(link, '_blank');
          break;
        }
        case 'Youtube': {
          let link = '';
          if (!/^http[s]?:\/\//.test(url)) {
            link += 'http://';
          }

          link += url;
          window.open(link, '_blank');
          break;
        }
        case 'Facebook': {
          let link = '';
          if (!/^http[s]?:\/\//.test(url)) {
            link += 'http://';
          }

          link += url;
          window.open(link, '_blank');
          break;
        }
        case 'Instagram': {
          let link = '';
          if (!/^http[s]?:\/\//.test(url)) {
            link += 'http://';
          }

          link += url;
          window.open(link, '_blank');
          break;
        }

        default:
          break;
      }
    } else {
      return;
    }
  }
  checkIfUserStudent() {
    if (this.isUserStudent || this.isUserAlumni || this.isUserCandidate || this.isUserAlumniMember) {
      return true;
    } else {
      return false;
    }
  }
  continueStep() {
    this.candidateService.setStatusStepOne(true);
  }
}
