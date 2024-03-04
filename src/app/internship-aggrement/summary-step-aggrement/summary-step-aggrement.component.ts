import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, AfterViewChecked, OnDestroy, OnChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import * as moment from 'moment';

@Component({
  selector: 'ms-summary-step-aggrement',
  templateUrl: './summary-step-aggrement.component.html',
  styleUrls: ['./summary-step-aggrement.component.scss'],
})
export class SummaryStepAggrementComponent implements OnInit, AfterViewChecked, OnDestroy, OnChanges {
  @Input() candidateId = '';
  @Input() dataModify: any;
  @Input() internshipId = '';
  @Input() isUserCRM: any;
  @Input() isUserMentor: any;
  @Input() isUserStudent: any;
  @Input() selectedIndex: any;
  @Input() isUserMember: any;
  private subs = new SubSink();
  detailForm: UntypedFormGroup;
  today = new Date();
  isLoadingUpload = false;
  photo: string;
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
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  photos = '';
  question = [];
  specialization_input = new UntypedFormControl('');
  conditionAgrement =
    '<p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p style="text-align:justify;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>';

  @Output() currentIndex = new EventEmitter<any>();
  isWaitingForResponse = false;
  internshipData: any;

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
    this.photos = this.serverimgPath + 'Josefina.jpg';
    this.iniForm();
    this.getDataInternship(false);
    this.subs.sink = this.candidateService.dataJobOfferThree.subscribe((val) => {
      if (val) {
        if (val.question && val.question.length) {
          this.question = val.question;
        }
      }
    });
  }

  ngOnChanges() {
    if (this.selectedIndex && this.selectedIndex === 6) {
      this.getDataInternship(false);
    }
  }

  iniForm() {
    this.detailForm = this.fb.group({
      student_sign_status: [null],
      mentor_sign_status: [null],
      company_manager_sign_status: [null],
    });
  }

  initCRM() {
    return this.fb.group({
      is_already_sign: [false],
      company_member_id: this.fb.group({
        _id: [null],
      }),
    });
  }

  get entities(): UntypedFormArray {
    return this.detailForm.get('company_member_signs') as UntypedFormArray;
  }

  // *************** Function to add new CRM
  addEntities() {
    this.entities.push(this.initCRM());
  }

  deleteEntity(addressIndex: number) {
    this.entities.removeAt(addressIndex);
  }

  resetCRM() {
    const control = this.entities;
    for (let i = control.length - 1; i >= 0; i--) {
      this.deleteEntity(i);
    }
    for (let i = 0; i < this.internshipData.company_member_signs.length; i++) {
      this.addEntities();
    }
  }
  continueButton() {
    this.candidateService.setStatusEditModeEight(false);
    this.candidateService.setStatusStepEight(true);
  }

  getDataInternship(last) {
    // console.log('Internship Tab Summary', this.internshipId);
    if (this.internshipId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.internshipService.getOneInternship(this.internshipId).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            // console.log(resp);
            this.internshipData = _.cloneDeep(resp);
            // console.log('_data sum', this.internshipData);

            if (
              this.internshipData.student_sign_status === 'validate_information' ||
              this.internshipData.student_sign_status === 'signed'
            ) {
              this.internshipData.student_sign_status = true;
            } else {
              this.internshipData.student_sign_status = false;
            }
            if (this.internshipData.mentor_sign_status === 'validate_information' || this.internshipData.mentor_sign_status === 'signed') {
              this.internshipData.mentor_sign_status = true;
            } else {
              this.internshipData.mentor_sign_status = false;
            }
            if (
              this.internshipData.company_manager_sign_status === 'validate_information' ||
              this.internshipData.company_manager_sign_status === 'signed'
            ) {
              this.internshipData.company_manager_sign_status = true;
            } else {
              this.internshipData.company_manager_sign_status = false;
            }
            this.detailForm.patchValue(this.internshipData);
            if (last && !this.isUserStudent && !this.isUserMentor && !this.isUserMember) {
              this.candidateService.setStatusStepEight(true);
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

  identityUpdated(who) {
    const payloadIntern = _.cloneDeep(this.detailForm.value);
    payloadIntern.internship_creation_step = 'pdf';
    if (who === 'student') {
      payloadIntern.student_sign_status = 'validate_information';
      delete payloadIntern.mentor_sign_status;
      delete payloadIntern.company_manager_sign_status;
    } else if (who === 'mentor') {
      payloadIntern.mentor_sign_status = 'validate_information';
      delete payloadIntern.student_sign_status;
      delete payloadIntern.company_manager_sign_status;
    } else if (who === 'manager') {
      payloadIntern.company_manager_sign_status = 'validate_information';
      delete payloadIntern.student_sign_status;
      delete payloadIntern.mentor_sign_status;
    }
    payloadIntern.company_relation_member_sign_status = 'not_validate_information';
    if (this.isUserStudent || this.isUserMember || this.isUserMentor) {
      Swal.fire({
        type: 'question',
        text: this.translate.instant('INTERNSHIP_S2.TEXT'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('INTERNSHIP_S2.BUTTON_1'),
        cancelButtonText: this.translate.instant('INTERNSHIP_S2.BUTTON_2'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((resp) => {
        this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
          (resps) => {
            if (this.isUserStudent) {
              if (resp.value) {
                if (this.internshipId && this.internshipId.length) {
                  this.subs.sink = this.candidateService.triggerNotificationINTERNSHIP_N2(this.internshipId).subscribe(
                    (response) => {
                      if (response) {
                        // console.log('response trigger', response);
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
            } else {
              if (resp.value) {
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
      });
    } else {
      this.subs.sink = this.internshipService.updateInternship(this.internshipData._id, payloadIntern).subscribe(
        (resps) => {
          if (resps) {
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

  translateDate(date) {
    const birthDate = this.parseStringDatePipe.transform(date);
    return moment(birthDate, 'YYYYMMDD').format('DD/MM/YYYY');
  }
}
