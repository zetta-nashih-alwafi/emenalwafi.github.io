import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
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
import { InternshipService } from 'app/service/internship/internship.service';
import { AskRevisionDialogComponent } from '../ask-revision-dialog/ask-revision-dialog.component';
import * as moment from 'moment';

@Component({
  selector: 'ms-pdf-aggrement',
  templateUrl: './pdf-aggrement.component.html',
  styleUrls: ['./pdf-aggrement.component.scss'],
})
export class PdfAggrementComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() candidateId = '';
  @Input() dataModify: any;
  @Input() internshipId = '';
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() isUserMember: any;
  private subs = new SubSink();
  detailForm: UntypedFormGroup;
  today = new Date();
  isLoadingUpload = false;
  isWaitingForResponse = false;
  pdfIsLoading = false;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  photo: string;
  parcheminUrl: any;
  photo_s3_path: string;
  is_photo_in_s3: boolean;
  paymentForm: UntypedFormGroup;
  creditForm: UntypedFormGroup;
  pdfIcon = '../../../assets/img/pdf.png';
  questionList = [
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  ];
  titleList = ['Title 1', 'Title 2', 'Title 3'];
  uploadCV = [{ name: 'capture', s3_file_name: '1' }];
  imageLetter = [{ name: 'capture', s3_file_name: '1' }];
  companyImage = 'https://i.imgur.com/uCLo8Ek.jpg';
  maleStudentIcon = '../../../../../assets/img/student_icon.png';
  femaleStudentIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  schoolImage = 'https://api.poc-edh.zetta-demo.space/fileuploads/EFAP.jpg';
  photos = '';
  question = [];
  specialization_input = new UntypedFormControl('');
  conditionAgrement =
    '<p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>';

  @Output() currentIndex = new EventEmitter<any>();
  internshipData: any;
  pdfUrl = '';

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
    private transcriptBuilderService: TranscriptBuilderService,
    private internshipService: InternshipService,
  ) {}
  ngOnInit() {
    this.iniForm();
    this.photos = this.serverimgPath + 'Josefina.jpg';
    this.getDataInternship(false);
    this.generatePDF();
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });
  }

  submitAgreement() {
    Swal.fire({
      type: 'question',
      text: this.translate.instant('INTERNSHIP_S6.TEXT'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('INTERNSHIP_S6.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_S6.BUTTON_2'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((resp) => {
      if (resp.value) {
        this.subs.sink = this.candidateService.triggerNotificationINTERNSHIP_N6(this.internshipData._id).subscribe(
          (resps) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getDataInternship(true);
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
    });
  }

  iniForm() {
    this.detailForm = this.fb.group({
      is_student_already_sign: [null, Validators.required],
      is_mentor_already_sign: [null, Validators.required],
      is_company_manager_already_sign: [null, Validators.required],
      is_company_relation_member_already_sign: [null, Validators.required],
    });
  }
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getDataInternship(last) {
    // console.log('Internship Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            this.detailForm.patchValue(resp);
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

  generatePDF() {
    // console.log('Internship Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.pdfIsLoading = true;
      let is_CRM = false;
      if (this.isUserCRM) {
        is_CRM = true;
      } else {
        is_CRM = false;
      }
      this.subs.sink = this.internshipService.generateAgreementPDF(this.internshipId, is_CRM).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.pdfUrl = resp;
            if (this.internshipData && this.internshipData.pdf_file_name) {
              const url = this.serverimgPath + this.internshipData.pdf_file_name;
              this.parcheminUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              // console.log(this.parcheminUrl);
              if (this.parcheminUrl) {
                this.pdfIsLoading = false;
              }
              this.savePDF();
            }
          }
        },
        (err) => {
          this.parcheminUrl = '';
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

  savePDF() {
    const payload = {
      pdf_file_name: this.pdfUrl,
    };
    this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payload).subscribe(
      (resps) => {
        if (resps) {
          this.getDataInternship(false);
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

  viewPDF() {
    // console.log('Internship Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.pdfIsLoading = true;
      let is_CRM = false;
      if (this.isUserCRM) {
        is_CRM = true;
      } else {
        is_CRM = false;
      }
      this.subs.sink = this.internshipService.generateAgreementPDF(this.internshipId, is_CRM).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.pdfUrl = resp;
            if (this.internshipData && this.internshipData.pdf_file_name) {
              const url = this.serverimgPath + this.internshipData.pdf_file_name;
              this.parcheminUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              console.log(this.parcheminUrl);
              if (this.parcheminUrl) {
                this.pdfIsLoading = false;
              }
              this.savePDF();
            }
            console.log(resp);
            const a = document.createElement('a');
            a.target = '_blank';
            a.href = `${this.serverimgPath + resp}`.replace('/graphql', '');
            a.click();
            a.remove();
          }
        },
        (err) => {
          this.parcheminUrl = '';
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

  downloadPDF() {
    // console.log('Internship Tab', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.pdfIsLoading = true;
      let is_CRM = false;
      if (this.isUserCRM) {
        is_CRM = true;
      } else {
        is_CRM = false;
      }
      this.subs.sink = this.internshipService.generateAgreementPDF(this.internshipId, is_CRM).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            this.pdfUrl = resp;
            if (this.internshipData && this.internshipData.pdf_file_name) {
              const url = this.serverimgPath + this.internshipData.pdf_file_name;
              this.parcheminUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              console.log(this.parcheminUrl);
              if (this.parcheminUrl) {
                this.pdfIsLoading = false;
              }
              this.savePDF();
            }
            // console.log(resp);
            const a = document.createElement('a');
            a.target = '_blank';
            a.href = `${this.serverimgPath + resp}?download=true`.replace('/graphql', '');
            a.click();
            a.remove();
          }
        },
        (err) => {
          this.parcheminUrl = '';
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

  publishAgreement() {
    const payload = {
      is_published: true,
      agreement_status: 'agreement_signed',
      student_sign_status: 'signed',
      mentor_sign_status: 'signed',
      company_manager_sign_status: 'signed',
      company_relation_member_sign_status: 'signed',
      is_student_already_sign: this.detailForm.get('is_student_already_sign').value,
      is_mentor_already_sign: this.detailForm.get('is_mentor_already_sign').value,
      is_company_manager_already_sign: this.detailForm.get('is_company_manager_already_sign').value,
      is_company_relation_member_already_sign: this.detailForm.get('is_company_relation_member_already_sign').value,
      date_company_relation_manager_submit_signature: {
        date: moment().format('DD/MM/YYYY'),
        time: '15:59',
      },
    };
    Swal.fire({
      type: 'question',
      text: this.translate.instant('INTERNSHIP_S9.TEXT'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('INTERNSHIP_S9.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_S9.BUTTON_2'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((resp) => {
      if (resp.value) {
        this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payload).subscribe(
          (resps) => {
            this.subs.sink = this.candidateService.triggerNotificationINTERNSHIP_N4(this.internshipData._id).subscribe(
              (respss) => {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getDataInternship(true);
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
    });
  }

  submitSign(who) {
    const payload = {
      is_student_already_sign: this.detailForm.get('is_student_already_sign').value,
      is_mentor_already_sign: this.detailForm.get('is_mentor_already_sign').value,
      is_company_manager_already_sign: this.detailForm.get('is_company_manager_already_sign').value,
      is_company_relation_member_already_sign: this.detailForm.get('is_company_relation_member_already_sign').value,
      student_sign_status:
        this.internshipData && this.internshipData.student_sign_status ? this.internshipData.student_sign_status : 'validate_information',
      mentor_sign_status:
        this.internshipData && this.internshipData.mentor_sign_status ? this.internshipData.mentor_sign_status : 'validate_information',
      company_manager_sign_status:
        this.internshipData && this.internshipData.company_manager_sign_status
          ? this.internshipData.company_manager_sign_status
          : 'validate_information',
      date_student_submit_signature: {
        date: moment().format('DD/MM/YYYY'),
        time: '15:59',
      },
      date_mentor_submit_signature: {
        date: moment().format('DD/MM/YYYY'),
        time: '15:59',
      },
      date_company_manager_submit_signature: {
        date: moment().format('DD/MM/YYYY'),
        time: '15:59',
      },
    };
    if (who === 'student') {
      payload.student_sign_status = 'signed';
      delete payload.mentor_sign_status;
      delete payload.company_manager_sign_status;
      delete payload.is_mentor_already_sign;
      delete payload.is_company_manager_already_sign;
      delete payload.date_mentor_submit_signature;
      delete payload.date_company_manager_submit_signature;
    } else if (who === 'mentor') {
      payload.mentor_sign_status = 'signed';
      delete payload.student_sign_status;
      delete payload.company_manager_sign_status;
      delete payload.is_student_already_sign;
      delete payload.is_company_manager_already_sign;
      delete payload.date_student_submit_signature;
      delete payload.date_company_manager_submit_signature;
    } else if (who === 'manager') {
      payload.company_manager_sign_status = 'signed';
      delete payload.student_sign_status;
      delete payload.mentor_sign_status;
      delete payload.is_student_already_sign;
      delete payload.is_mentor_already_sign;
      delete payload.date_mentor_submit_signature;
      delete payload.date_student_submit_signature;
    }
    Swal.fire({
      type: 'question',
      text: this.translate.instant('INTERNSHIP_S8.TEXT'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('INTERNSHIP_S8.BUTTON_1'),
      cancelButtonText: this.translate.instant('INTERNSHIP_S8.BUTTON_2'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((resp) => {
      if (resp.value) {
        this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payload).subscribe(
          (resps) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.generatePDF();
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
    });
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

  modifyStep() {
    this.candidateService.setIndexStep(0);
    // this.candidateService.setStatusStepThree(true);
  }
  saveStep() {
    // this.candidateService.setIndexStep(8);
    this.candidateService.setStatusStepEight(true);
  }

  saveOnlyStep() {
    Swal.fire({
      type: 'question',
      title: this.translate.instant('JOB_OFFER_S1.TITLE'),
      html: this.translate.instant('JOB_OFFER_S1.TEXT', {
        user: name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('JOB_OFFER_S1.BUTTON_2'),
      cancelButtonText: this.translate.instant('JOB_OFFER_S1.BUTTON_1'),
    }).then((resss) => {
      if (resss.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('JOB_OFFER_S2.TITLE'),
          html: this.translate.instant('JOB_OFFER_S2.TEXT', {
            user: name,
          }),
          showCancelButton: true,
          allowEscapeKey: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('JOB_OFFER_S2.BUTTON_1'),
        }).then((ressss) => {
          window.open(`./rncpTitles`, '_self');
        });
      }
    });
  }
  openImage(img) {
    if (img === '1') {
      const url = 'https://api.admission.zetta-demo.space/fileuploads/dummy.pdf';
      window.open(url, '_blank');
    } else {
      const url = `${environment.apiUrl}/fileuploads/${img}`.replace('/graphql', '');
      window.open(url, '_blank');
    }
  }

  getPdfHtml() {
    const fileDoc = document.getElementById('pdf-condition').innerHTML;
    const html = fileDoc;
    return html;
  }

  onOpenRevisionDialog() {
    const dialgref = this.dialog.open(AskRevisionDialogComponent, {
      width: '750px',
      disableClose: true,
      data: this.internshipId,
    });
  }
}
