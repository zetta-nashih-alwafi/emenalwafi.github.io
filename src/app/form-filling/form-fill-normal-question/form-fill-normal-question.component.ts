import { NgxImageCompressService } from 'ngx-image-compress';
import { Component, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { FormFillingRevisionDialogComponent } from '../form-filling-revision-dialog/form-filling-revision-dialog.component';
import { FormFillingService } from '../form-filling.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { debounceTime, switchMap, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { FormBuilderService } from 'app/service/form-builder/form-builder.service';
import { StepDynamicMessageDialogComponent } from 'app/shared/components/step-dynamic-message-dialog/step-dynamic-message-dialog.component';
import * as moment from 'moment';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { ApplicationUrls } from 'app/shared/settings';
import { SchoolService } from 'app/service/schools/school.service';
import { StudentsService } from 'app/service/students/students.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { ContractService } from 'app/service/contract/contract.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { isArray } from '@amcharts/amcharts4/core';
import { AdmissionService } from 'app/service/admission/admission.service';

@Component({
  selector: 'ms-form-fill-normal-question',
  templateUrl: './form-fill-normal-question.component.html',
  styleUrls: ['./form-fill-normal-question.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe],
})
export class FormFillNormalQuestionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentStepIndex;
  @Input() stepData: any;
  @Input() formDetail: any;
  @Input() userData: any;
  @Input() fromModalityPayment: any;
  @Input() formData: any;
  @Input() paymentForm: any;
  @Input() candidates: any;
  @Input() initialCostCoverage: any;
  @Input() modalityData;
  @Output() triggerRefresh: EventEmitter<any> = new EventEmitter();
  @ViewChild('userphoto', { static: false }) uploadInput: any;
  private subs = new SubSink();
  templateStepForm: UntypedFormGroup;
  intVal: any;
  timeOutVal: any;
  disable = false;
  isValidator = false;
  formId: any;
  isRevisionUser: any = false;
  isWaitingForResponse = false;
  isWaitingForMessageResponse = false;
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  cities: any;
  departments: any;
  regions: any;
  regionsParents: any;
  departmentsParent: any;
  citiesParent: any;
  isUsingStepMessage: boolean = false;
  isAccepted = false;
  isValidatePayment = true;
  isPhotoUploading: boolean;
  is_photo_in_s3: boolean;
  photo: string;
  is_photo_uploaded: boolean;
  nationalList = [];
  countryList;
  countries = [];
  photoIsField: string;
  photo_s3_path: string;
  photoIsField_s3_path: string;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  sectorList: any;
  specialityList: any[];
  campusList: any;
  schoolList: any;
  promotionList: any;
  filteredCurrentProgram: any;
  proffesionalList = ['unemployed', 'employed'];
  financialSsupportLinkList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];
  interventions = [
    { value: 'face_to_face', name: 'Face to Face' },
    { value: 'face_to_face_2', name: 'Face to Face 2' },
    { value: 'face_to_face_3', name: 'Face to Face 3' },
    { value: 'face_to_face_4', name: 'Face to Face 4' },
    { value: 'jury', name: 'Jury' },
    { value: 'coaching', name: 'Coaching' },
    { value: 'conference', name: 'Conference' },
    { value: 'correction_of_files', name: 'Correction of Files' },
    { value: 'correction_of_copies', name: 'Correction of Copies' },
    { value: 'making_subjects', name: 'Making Subjects' },
  ];
  legalStatusList: any[] = [];
  contract_type = ['cddu', 'convention'];
  grayBackground = '../../../../../assets/img/gray-background.jpg';
  teacherContractFieldTypeNumber = [
    'TEACHER_TOTAL_PERIOD_1',
    'TEACHER_TOTAL_PERIOD_2',
    'TEACHER_TOTAL_PERIOD_3',
    'TEACHER_TOTAL_PERIOD_4',
    'TEACHER_TOTAL_PERIOD_5',
    'TEACHER_TOTAL_PERIOD_6',
    'TEACHER_HOURLY_RATE_1',
    'TEACHER_HOURLY_RATE_2',
    'TEACHER_HOURLY_RATE_3',
    'TEACHER_HOURLY_RATE_4',
    'TEACHER_HOURLY_RATE_5',
    'TEACHER_HOURLY_RATE_6',
    'TEACHER_TOTAL_HOURS_1',
    'TEACHER_TOTAL_HOURS_2',
    'TEACHER_TOTAL_HOURS_3',
    'TEACHER_TOTAL_HOURS_4',
    'TEACHER_TOTAL_HOURS_5',
    'TEACHER_TOTAL_HOURS_6',
    'TEACHER_TRIAL_PERIOD_1',
    'TEACHER_TRIAL_PERIOD_2',
    'TEACHER_TRIAL_PERIOD_3',
    'TEACHER_TRIAL_PERIOD_4',
    'TEACHER_TRIAL_PERIOD_5',
    'TEACHER_TRIAL_PERIOD_6',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_1',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_2',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_3',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_4',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_5',
    'TEACHER_INDUCED_HOUR_COEFFICIENT_6',
    'PAID_LEAVE_ALLOWANCE_RATE_1',
    'PAID_LEAVE_ALLOWANCE_RATE_2',
    'PAID_LEAVE_ALLOWANCE_RATE_3',
    'PAID_LEAVE_ALLOWANCE_RATE_4',
    'PAID_LEAVE_ALLOWANCE_RATE_5',
    'PAID_LEAVE_ALLOWANCE_RATE_6',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_1',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_2',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_3',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_4',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_5',
    'RATE_EXCLUDING_PAID_LEAVE_ALLOWANCE_6',
    'TEACHER_COMPENSATION_PAID_VACATION_1',
    'TEACHER_COMPENSATION_PAID_VACATION_2',
    'TEACHER_COMPENSATION_PAID_VACATION_3',
    'TEACHER_COMPENSATION_PAID_VACATION_4',
    'TEACHER_COMPENSATION_PAID_VACATION_5',
    'TEACHER_COMPENSATION_PAID_VACATION_6',
    'TEACHER_VOLUME_HOURS_INDUCED_1',
    'TEACHER_VOLUME_HOURS_INDUCED_2',
    'TEACHER_VOLUME_HOURS_INDUCED_3',
    'TEACHER_VOLUME_HOURS_INDUCED_4',
    'TEACHER_VOLUME_HOURS_INDUCED_5',
    'TEACHER_VOLUME_HOURS_INDUCED_6',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_1',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_2',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_3',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_4',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_5',
    'TEACHER_TOTAL_HOURS_AND_VOLUME_HOURS_INDUCED_6',
  ];

  processFinish = false;
  lastStep = false;
  isPhotoMandatory = false;
  questionIndex: number;
  originQuestion = [];
  ceoList: any[];
  mentorList: any[];
  levelList: any;
  selectedLevelId: any;
  selectedSchoolId: any;
  selectedFinancer: any;
  listFinance: any;
  scholars: any;
  subjectsList: any;
  listTypeOfFinancement: any[];
  programs: any[];
  email_sign: any;
  selectedCampusId: any;
  checkUploadImage: boolean;
  candidateData: any;
  minimumDateOfBirth: Date;

  paymentType;
  invalidCost = false;
  studentAsFinancialSupport: boolean = false;
  minCostCoverage = false;
  maxCostCoverage = false;

  payloadForStudentQuestion = [];

  imageBeforeCompressed;
  imageAfterCompressed;
  listCountryField = ['parent_country', 'student_country', 'country_of_birth', 'alumni_country', 'financial_support_country'];
  disableButtonSave = [];
  disableButtonEmail = [];
  userId: string;
  isValidCostCoverageAfterRecalculate: boolean = true;

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[] = [];
  dialCodeSegmentArray = new UntypedFormArray([]);
  // *************** END OF property to store data of country dial code

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private formFillingService: FormFillingService,
    private formBuilderService: FormBuilderService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUtc: ParseLocalToUtcPipe,
    private rncpTitleService: RNCPTitlesService,
    private utilityService: UtilityService,
    private alumniService: AlumniService,
    private schoolService: SchoolService,
    private studentService: StudentsService,
    private fileUploadService: FileUploadService,
    private contractService: TeacherContractService,
    private router: Router,
    public sanitizer: DomSanitizer,
    private fcContractService: ContractService,
    private financeService: FinancesService,
    private authService: AuthService,
    private imageCompress: NgxImageCompressService,
    private admissionService: AdmissionService,
  ) {}

  ngOnInit() {
    this.formId = this.route.snapshot.queryParamMap.get('formId');
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    this.initTemplateStepForm();
    this.fetchCountryList();
    this.fetchNationalityList();
    this.populateStepData(_.cloneDeep(this.stepData));
    this.minimumDateOfBirth = this.getMinimumDateOfBirth();
    this.checkStepNotificationOrMessage();
    if (!this.formDetail.isPreview) {
      this.checkDisableForm();
    }
    if (this.formDetail.formType === 'alumni') {
      this.getDataPromoYear();
      this.getDataSchoolCampus();
      this.getDataSector();
      this.getDataSpeciality();
    } else if (this.formDetail.formType === 'fc_contract' || this.formDetail.formType === 'teacher_contract') {
      this.getDataScholarSeasons();
      this.getSignalementEmailDropdown();
      this.getSubjectDropdown();
      this.getProgramDropdown();

      if (this.formDetail.formType === 'fc_contract' && !this.formDetail.isPreview) {
        this.getOneCandidate();
        this.getSchoolDropdown();
        this.getSectorDefaultDropdown();
        this.getSpecialityDefaultDropdown();
        this.legalStatusList = this.formBuilderService.getListOfLegalStatus();
      }
    }
    console.log('formDetail', this.formDetail);
    console.log('stepData', this.stepData);
    console.log('cek isFromSepa', this.fromModalityPayment, this.modalityData);
    console.log(this.userData);
    this.initFormFillChangeEventListener();
    this.checkModalityStatus();
  }

  initFormFillChangeEventListener() {
    this.formFillingService.formFillChangeEvent$.subscribe((resp) => {
      this.studentAsFinancialSupport = resp;
      if (!this.studentAsFinancialSupport) {
        this.templateStepForm.markAsPristine();
        this.templateStepForm.markAsUntouched();
        this.dialCodeSegmentArray.markAllAsTouched();
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  checkStepNotificationOrMessage() {
    if (
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const formBuilderID = this.formDetail.templateId;
      const formBuilderStepID = this.stepData.form_builder_step._id;
      const pagination = { limit: 20, page: 0 };

      this.isWaitingForResponse = true;
      this.subs.sink = this.formBuilderService.getAllStepNotificationsAndMessages(formBuilderID, formBuilderStepID, pagination).subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response && response.length) {
            this.isUsingStepMessage = !!response.find((item) => item && item.type && item.type === 'message');
          } // default value of isUsingStepMessage is false so no need an else block
        },
        (error) => {
          this.isWaitingForResponse = false;
          console.error(error);
        },
      );
    }
  }

  // this function will check the step status, if status accept, will auto open disabled question
  checkModalityStatus() {
    if (this.fromModalityPayment) {
      if (this.stepData?.step_status === 'accept' && this.stepData?.segments?.length) {
        // this will check the question if has question, studentAsFinancialSupport will be true
        if (this.stepData?.segments[0]?.questions?.length) {
          this.studentAsFinancialSupport = true;
        } else {
          this.studentAsFinancialSupport = false;
        }

        // this will check the additional_financial_supports for financial_support question
        if (this.stepData?.segments[0]?.additional_financial_supports?.length) {
          const financialSupport = this.stepData?.segments[0]?.additional_financial_supports;
          if (financialSupport?.length) {
            for (let i = 0; i < financialSupport?.length; i++) {
              this.getAddtionalQuestionFieldFormArray(0).push(this.initQuestionAddtional());
              this.getAddtionalQuestionFieldFormArrayForDialCode(0).push(this.initQuestionAddtional());
              if (financialSupport[i]?.questions?.length) {
                for (let j = 0; j < financialSupport[i]?.questions?.length; j++) {
                  this.getAddtionalQuestionField(0, i).push(this.initQuestionFieldForm());
                  this.getAddtionalQuestionFieldForDialCode(0, i).push(this.initQuestionDialCodeForm());
                  if (financialSupport[i]?.questions[j]?.options.length > 0) {
                    financialSupport[i]?.questions[j]?.options.forEach((option, optionIdx) => {
                      const options = this.getAddtionalQuestionField(0, i).at(j).get('options') as UntypedFormArray;
                      const group = this.initOptionFieldForm();
                      options.push(group);
                    });
                  }
                  // Parent child options
                  if (financialSupport[i]?.questions[j]?.parent_child_options?.length) {
                    financialSupport[i]?.questions[j]?.parent_child_options.forEach((parentChildOption1, pcIndex1) => {
                      const parentChildArray1 = this.getAddtionalQuestionField(0, i).at(j).get('parent_child_options') as UntypedFormArray;
                      if (!parentChildArray1) {
                        return;
                      }
                      parentChildArray1.push(this.initParentChildOptionForm());
                      if (parentChildOption1?.questions?.length) {
                        parentChildOption1.questions.forEach((pc1Question, pc1QuestionIndex) => {
                          const pcQuestionArray1 = parentChildArray1.at(pcIndex1).get('questions') as UntypedFormArray;
                          pcQuestionArray1.push(this.initParentChildOptionQuestionForm());

                          if (pc1Question?.parent_child_options?.length) {
                            this.recursiveParentChild(pcQuestionArray1, pc1Question, pc1QuestionIndex);
                          }
                        });
                      }
                    });
                  }
                }
              }
            }
            const tempDataFinancialSupportForDialCode = financialSupport?.map((additionalFS) => {
              const tempData = additionalFS?.questions?.map((question) => {
                if(question?.phone_number_indicative) {
                  const findIndex = this.countryCodeList?.findIndex((country) => country?.dialCode === question?.phone_number_indicative);
                  return {
                    selected_dial_code: question?.phone_number_indicative ? question?.phone_number_indicative : null,
                    answer: this.countryCodeList[findIndex] ? this.countryCodeList[findIndex] : null,
                  }
                } else {
                  return {
                    selected_dial_code: null,
                    answer: null,
                  }
                }
              })
              
              return { questions: tempData };
            })
            this.getAddtionalQuestionFieldFormArrayForDialCode(0).patchValue(tempDataFinancialSupportForDialCode);
            this.getAddtionalQuestionFieldFormArray(0).patchValue(financialSupport);
          }
        }
      }
    }
  }

  ngOnChanges() {
    this.questionIndex = 0;
    this.originQuestion = [];
    this.isWaitingForResponse = true;
    this.initTemplateStepForm();
    setTimeout(() => {
      this.initTemplateStepForm();
      this.populateStepData(_.cloneDeep(this.stepData));
      this.checkModalityStatus();
      this.isWaitingForResponse = false;
    }, 50);
    if (!this.formDetail.isPreview && this.userData) {
      if (this.formDetail.formType !== 'alumni') {
        this.getSchoolLogo();
      }
      this.checkDisableForm();
    }
  }

  checkDisableForm() {
    if (this.stepData.isCompletingUser) {
      if (
        this.stepData.step_status === 'not_started' ||
        this.stepData.step_status === 'ask_for_revision' ||
        (this.formDetail &&
          (this.formDetail.formType === 'student_admission' || this.formDetail.formType === 'teacher_contract') &&
          this.formDetail.admission_status &&
          this.formDetail.admission_status === 'ask_for_revision') ||
        (this.formDetail &&
          this.formDetail.formType === 'fc_contract' &&
          this.formDetail.contract_status &&
          this.formDetail.contract_status === 'ask_for_revision') ||
        (this.stepData.step_status === 'accept' && this.formDetail.is_final_validator_active && !this.formDetail.admission_status)
      ) {
        if(this.formDetail?.is_form_closed) {
          this.disable = true;
        } else {
          this.disable = false;
        }
      } else {
        this.disable = true;
      }
    } else {
      this.disable = true;
    }

    if(this.disable) {
      this.dialCodeSegmentArray?.disable();
    }

    if (this.formDetail.formType === 'teacher_contract' && this.formDetail.isFinalRevisionUser) {
      this.isRevisionUser = this.formDetail.isFinalRevisionUser;
    } else {
      if (this.userData && this.userData.entities) {
        this.isRevisionUser = this.userData.entities.find((ent) => {
          if (ent && ent.type && this.stepData.revision_user_type && ent.type._id === this.stepData.revision_user_type) {
            return true;
          } else {
            return false;
          }
        });
      }
    }
    console.log('isRevisionUser', this.isRevisionUser);
    if (!this.userData) return;
    if (this.userData && this.userData.entities) {
      this.isValidator = !!this.userData.entities.find((ent) => {
        if (
          ent &&
          ent.type &&
          this.stepData.is_validation_required &&
          this.stepData.validator &&
          ent.type._id === this.stepData.validator._id
        ) {
          return true;
        } else {
          return false;
        }
      });
    }
  }

  selectionDialCode(event, segmentIdx, questionIdx, from?, additionalIndex?) {
    if(from === 'financial_support_phone_number') {
      this.getAddtionalQuestionFieldForDialCode(segmentIdx, additionalIndex)?.at(questionIdx)?.reset();
      this.getAddtionalQuestionField(segmentIdx, additionalIndex)?.at(questionIdx)?.get('phone_number_indicative')?.reset();
      this.getAddtionalQuestionFieldForDialCode(segmentIdx, additionalIndex)?.at(questionIdx)?.get('selected_dial_code')?.patchValue(event?.dialCode);
      this.getAddtionalQuestionFieldForDialCode(segmentIdx, additionalIndex)?.at(questionIdx)?.get('answer')?.patchValue(event);
      this.getAddtionalQuestionField(segmentIdx, additionalIndex)?.at(questionIdx)?.get('phone_number_indicative')?.patchValue(event?.dialCode);
    } else {
      this.getQuestionDialCodeField(segmentIdx, questionIdx)?.reset();
      this.getQuestionFieldFormArray(segmentIdx)?.at(questionIdx)?.get('phone_number_indicative')?.reset();
      this.getQuestionDialCodeField(segmentIdx, questionIdx)?.get('selected_dial_code')?.patchValue(event?.dialCode);
      this.getQuestionDialCodeField(segmentIdx, questionIdx)?.get('answer')?.patchValue(event);
      this.getQuestionFieldFormArray(segmentIdx)?.at(questionIdx)?.get('phone_number_indicative')?.patchValue(event?.dialCode);
    }
  }

  populateStepData(tempStep: any, from?) {
    console.log('tempStep', this.stepData);
    if (tempStep) {
      if (tempStep.segments && tempStep.segments.length) {
        tempStep.segments.forEach((segment, segmentIndex) => {
          segment = this.changeModalityForm(segment, from);
          if (!this.getSegmentFormarray() || (this.getSegmentFormarray() && this.getSegmentFormarray().length < tempStep.segments.length)) {
            this.addSegmentForm(); // only add if length of segment does not match what has been initialized
          }
          if(!this.dialCodeSegmentArray || (this.dialCodeSegmentArray && this.dialCodeSegmentArray?.length < tempStep?.segments?.length)) {
            this.addSegmentForDialCodeForm(); // *************** adds a segment for the dial code to be the same as the segment in the step 
          }
          if (segment.questions && segment.questions.length) {
            segment.questions.forEach((question, questionIndex) => {
              this.originQuestion.push(question);
              if (!this.getQuestionFieldFormArray(segmentIndex)) {
                this.addQuestionFieldForm(segmentIndex);
                this.addQuestionDialCodeForm(segmentIndex);
              } else if (
                this.getQuestionFieldFormArray(segmentIndex) &&
                this.getQuestionFieldFormArray(segmentIndex).length < segment.questions.length
              ) {
                this.addQuestionFieldForm(segmentIndex);
                this.addQuestionDialCodeForm(segmentIndex);
              } else {
                return;
              }

              if (!question.multiple_option_validation) {
                question.multiple_option_validation = {};
              }

              if (question.options && question.options.length) {
                question.options.forEach((option, optionIdx) => {
                  const options = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('options') as UntypedFormArray;
                  const group = this.initOptionFieldForm();
                  options.push(group);
                });
              }
              if (question.field_type && question.field_type === 'date_of_birth' && question.answer) {
                if (question.answer !== 'Invalid date') {
                  question.answer = this.formatDateOfBirth(question?.answer_date?.date);
                  question.answer_date = this.formatStringAnswerToDate(question.answer_date);
                  // question.answer = moment(question.answer,'DD/MM/YYYY').format('YYYY-MM-DD');
                  if (question.answer === 'Invalid date') {
                    question.answer = null;
                    question.answer_date = null;
                  }
                } else {
                  question.answer = null;
                  question.answer_date = null;
                }
              }

              if(question?.phone_number_indicative && ['parent_phone', 'alumni_telephone', 'phone_number', 'financial_support_phone_number', 'emergency_contact_telephone'].includes(question?.field_type)) {
                const foundIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === question?.phone_number_indicative)
                this.getQuestionDialCodeField(segmentIndex, questionIndex)?.get('answer')?.patchValue(this.countryCodeList[foundIdx]);
                this.getQuestionDialCodeField(segmentIndex, questionIndex)?.get('selected_dial_code')?.patchValue(question?.phone_number_indicative);
              }

              if (
                ((question.answer_type && question.answer_type === 'date') || question.is_field) &&
                question.answer_date &&
                question.answer_date.date &&
                question.answer_date.time
              ) {
                question.answer_date = this.formatStringAnswerToDate(question.answer_date);
              } else if (
                ((question.answer_type && question.answer_type === 'date') || question.is_field) &&
                question.answer_date &&
                question.answer_date.hasOwnProperty('date') &&
                question.answer_date.date === null
              ) {
                question.answer_date = ''; // doing this to prevent passing object to form which will cause it to be eternally invalid
              }

              if (question.answer_type && question.answer_type === 'single_option' && question.is_required) {
                this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer').setValidators([Validators.required]);
                this.templateStepForm.updateValueAndValidity();
              }

              if (question.answer_type && question.answer_type === 'email' && !question.is_field) {
                const validators = [Validators.email];
                if (question.is_required) validators.push(Validators.required);
                this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer').setValidators(validators);
                this.templateStepForm.updateValueAndValidity();
              }

              // set checkbox answer type to required as it cannot be set with [required] from the template
              if (
                ((question.answer_type && question.answer_type === 'multiple_option') ||
                  question.answer_type === 'dropdown_multiple_option') &&
                !question.is_field
              ) {
                const validators = [];
                if (question.is_required) validators.push(Validators.required);

                if (
                  ((question.answer_multiple && question.answer_multiple.length && !question.is_required) || question.is_required) &&
                  question.multiple_option_validation &&
                  question.multiple_option_validation.condition &&
                  question.multiple_option_validation.number
                ) {
                  const conditions = {
                    'Select at least': (c: UntypedFormControl) => {
                      const condition = c.value && c.value.length && c.value.length >= question.multiple_option_validation.number;
                      return condition ? null : { minSelection: true };
                    },
                    'Select at most': (c: UntypedFormControl) => {
                      const condition = c.value && c.value.length && c.value.length <= question.multiple_option_validation.number;
                      return condition ? null : { maxSelection: true };
                    },
                    'Select exactly': (c: UntypedFormControl) => {
                      const condition = c.value && c.value.length && c.value.length === question.multiple_option_validation.number;
                      return condition ? null : { exactSelection: true };
                    },
                  };
                  validators.push(conditions[question.multiple_option_validation.condition]);
                }
                this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').setValidators(validators);
                this.templateStepForm.updateValueAndValidity();
              }

              if (question && question.parent_child_options && question.parent_child_options.length) {
                question.parent_child_options.forEach((parentChildOption1, pcIndex1) => {
                  const parentChildArray1 = this.getQuestionFieldFormArray(segmentIndex)
                    .at(questionIndex)
                    .get('parent_child_options') as UntypedFormArray;
                  if (!parentChildArray1) return;
                  parentChildArray1.push(this.initParentChildOptionForm());
                  if (parentChildOption1.questions && parentChildOption1.questions.length) {
                    parentChildOption1.questions.forEach((pc1Question, pc1QuestionIndex) => {
                      const pcQuestionArray1 = parentChildArray1.at(pcIndex1).get('questions') as UntypedFormArray;
                      pcQuestionArray1.push(this.initParentChildOptionQuestionForm());

                      if (pc1Question && pc1Question.parent_child_options && pc1Question.parent_child_options.length) {
                        this.recursiveParentChild(pcQuestionArray1, pc1Question, pc1QuestionIndex);
                      }
                    });
                  }
                });
              }

              if (question.is_field && question.field_type === 'student_date_of_birth' && question.answer) {
                question.answer = this.formatDateOfBirth(question.answer);
              }

              if (
                question?.is_field &&
                this.listCountryField.includes(question?.field_type) &&
                question?.answer &&
                this?.countryList?.length
              ) {
                const dataCountry = this?.countryList?.find((list) => list?.original?.toLowerCase() === question?.answer.toLowerCase());
                question.answer = dataCountry ? dataCountry?.original : null;
              }
              if (question.is_field && question.field_type === 'student_cost' && (!question.answer || Number(question.answer) <= 0)) {
                question.answer = this.initialCostCoverage ? this.initialCostCoverage.toFixed(2) : '0';
              }
            });
          }
          if (!segment.additional_financial_supports) {
            segment.additional_financial_supports = [];
          }
        });
      }
      this.cleanNullValues(tempStep);
      this.templateStepForm.patchValue(tempStep);
      console.log('171 form', this.templateStepForm.value);
      this.addArrayButtonEmailandSave(this.templateStepForm.value);
    }
  }

  populateFieldStudent(question, data) {
    if (question.field_type === 'student_civility') {
      return data.civility;
    } else if (question.field_type === 'student_first_name') {
      return data.first_name;
    } else if (question.field_type === 'student_last_name') {
      return data.last_name;
    } else if (question.field_type === 'student_phone') {
      return data.tele_phone;
    } else if (question.field_type === 'student_email') {
      return data.email;
    } else if (question.field_type === 'student_date_of_birth' || question.field_type === 'date_of_birth') {
      const date = moment(data.date_of_birth).format('DD/MM/YYYY');
      return date;
    } else if (question.field_type === 'student_place_of_birth') {
      return data.place_of_birth;
    } else if (question.field_type === 'student_nationality') {
      return data.nationality;
    } else if (question.field_type === 'student_address' && data.student_address && data.student_address.length) {
      return data.student_address[0].address;
    } else if (question.field_type === 'student_zipcode' && data.student_address && data.student_address.length) {
      return data.student_address[0].postal_code;
    } else if (question.field_type === 'student_country' && data.student_address && data.student_address.length) {
      return data.student_address[0].country;
    } else if (question.field_type === 'student_city' && data.student_address && data.student_address.length) {
      return data.student_address[0].city;
    } else if (question.field_type === 'student_department' && data.student_address && data.student_address.length) {
      return data.student_address[0].department;
    } else if (question.field_type === 'student_region' && data.student_address && data.student_address.length) {
      return data.student_address[0].region;
    } else if (question.field_type === 'student_title' && data.rncp_title) {
      return data.rncp_title.short_name;
    } else if (question.field_type === 'student_class' && data.current_class) {
      return data.current_class.name;
    } else if (question.field_type === 'student_specialization' && data.specialization) {
      return data.specialization.name;
    } else if (data.parents && data.parents.length) {
      if (question.field_type === 'parent_relation') {
        return data.parents[0].relation;
      } else if (question.field_type === 'parent_civility') {
        return data.parents[0].civility;
      } else if (question.field_type === 'parent_first_name') {
        return data.parents[0].name;
      } else if (question.field_type === 'parent_last_name') {
        return data.parents[0].family_name;
      } else if (question.field_type === 'parent_phone') {
        return data.parents[0].tele_phone;
      } else if (question.field_type === 'parent_email') {
        return data.parents[0].email;
      } else if (data.parents[0] && data.parents[0].parent_address && data.parents[0].parent_address.length) {
        if (question.field_type === 'parent_address') {
          return data.parents[0].parent_address[0].address;
        } else if (question.field_type === 'parent_zipcode') {
          return data.parents[0].parent_address[0].postal_code;
        } else if (question.field_type === 'parent_country') {
          return data.parents[0].parent_address[0].country;
        } else if (question.field_type === 'parent_city') {
          return data.parents[0].parent_address[0].city;
        } else if (question.field_type === 'parent_department') {
          return data.parents[0].parent_address[0].department;
        } else if (question.field_type === 'parent_region') {
          return data.parents[0].parent_address[0].region;
        }
      }
    }
  }

  populateFieldUser(question, data) {
    if (question.field_type === 'student_civility') {
      return data.civility;
    } else if (question.field_type === 'student_first_name') {
      return data.first_name;
    } else if (question.field_type === 'student_last_name') {
      return data.last_name;
    } else if (question.field_type === 'student_phone') {
      return data.portable_phone ? data.portable_phone : data.office_phone;
    } else if (question.field_type === 'student_email') {
      return data.email;
    } else if (question.field_type === 'student_address' && data.address && data.address.length) {
      return data.address[0].address;
    } else if (question.field_type === 'student_zipcode' && data.address && data.address.length) {
      return data.address[0].postal_code;
    } else if (question.field_type === 'student_country' && data.address && data.address.length) {
      return data.address[0].country;
    } else if (question.field_type === 'student_city' && data.address && data.address.length) {
      return data.address[0].city;
    } else if (question.field_type === 'student_department' && data.address && data.address.length) {
      return data.student_address[0].department;
    } else if (question.field_type === 'student_region' && data.address && data.address.length) {
      return data.address[0].region;
    } else if (question.field_type === 'student_title' && this.formData.rncp_title_id) {
      return this.formData.rncp_title_id.short_name;
    } else if (question.field_type === 'student_class' && this.formData.class_id) {
      return this.formData.class_id.name;
    }
  }

  cleanNullValues(obj) {
    return Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object') {
        this.cleanNullValues(obj[key]);
      } else if (obj[key] === null) {
        delete obj[key];
      }
    });
  }

  formatStringAnswerToDate(date_answer: { date: string; time: string }) {
    return this.parseStringDatePipe.transformStringToDate(date_answer.date);
  }

  formatDateOfBirth(answer: string) {
    return this.parseStringDatePipe.transformStringToDate(answer);
  }

  // to set options when user tick multiple options
  setOptions(segmentIndex: number, questionIndex: number, value: any, isRequired) {
    const answers = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple');
    const answersValue = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').value;
    const multipleOption = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('multiple_option_validation').value;

    if (!answers.touched) answers.markAsTouched();
    if (answers.pristine) answers.markAsDirty();
    let currentAnswers = this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).value.answer_multiple;
    currentAnswers = currentAnswers ? currentAnswers : []; // if the currentAnswers are null by default, make it into an empty array
    if (isArray(value)) {
      const currentAnswers = [];
      currentAnswers.push(...value);
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer_multiple: currentAnswers });
    } else {
      let indexOfExistingValue = currentAnswers.indexOf(value);
      if (indexOfExistingValue >= 0) {
        // if exist remove
        currentAnswers.splice(indexOfExistingValue, 1);
      } else {
        // if not we add
        currentAnswers.push(value);
      }
      this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer_multiple: currentAnswers });
    }

    this.getQuestionFieldFormArray(segmentIndex).updateValueAndValidity();
    if (answers.touched && answers.dirty && isRequired === false) {
      if (answersValue && answersValue.length && multipleOption && multipleOption.condition && multipleOption.number) {
        const validators = [];
        const conditions = {
          'Select at least': (c: UntypedFormControl) => {
            const condition = c.value && c.value.length && c.value.length >= multipleOption.number;
            return condition ? null : { minSelection: true };
          },
          'Select at most': (c: UntypedFormControl) => {
            const condition = c.value && c.value.length && c.value.length <= multipleOption.number;
            return condition ? null : { maxSelection: true };
          },
          'Select exactly': (c: UntypedFormControl) => {
            const condition = c.value && c.value.length && c.value.length === multipleOption.number;
            return condition ? null : { exactSelection: true };
          },
        };
        validators.push(conditions[multipleOption.condition]);
        this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').setValidators(validators);
        this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').updateValueAndValidity();
      } else {
        this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').clearValidators();
        this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).get('answer_multiple').updateValueAndValidity();
      }
    }
  }

  handleRadioOption(segmentIndex, questionIndex, optionName, optionIndex) {
    this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer: optionName });
    this.getQuestionFieldFormArray(segmentIndex)
      .at(questionIndex)
      .patchValue({ is_answer_yes: optionIndex === 0 ? true : false });
  }

  initTemplateStepForm() {
    this.templateStepForm = this.fb.group({
      _id: [null],
      step_title: [''],
      is_validation_required: [false],
      step_type: [null],
      validator: [null],
      direction: [''],
      segments: this.fb.array([]),
    });
  }

  initSegmentForm() {
    return this.fb.group({
      segment_title: [''],
      is_selected_modality: [false],
      is_multiple_financial_support: [false],
      is_student_included: [false],
      questions: this.fb.array([]),
      additional_financial_supports: this.fb.array([]),
    });
  }

  initSegmentDialCodeForm() {
    return this.fb.group({
      questions: this.fb.array([]),
      additional_financial_supports: this.fb.array([]),
    });
  }

  initQuestionAddtional() {
    return this.fb.group({
      questions: this.fb.array([]),
    });
  }

  initQuestionFieldForm() {
    return this.fb.group({
      _id: [null],
      ref_id: [{ value: null, disabled: true }],
      field_type: [null],
      is_field: [false],
      is_editable: [false],
      is_required: [false],
      field_position: [null],
      options: this.fb.array([]),
      question_label: [''],
      answer_type: [],
      answer: [null],
      answer_number: [null, [Validators.max(2147483647)]], // max value for int32
      answer_date: [null],
      answer_multiple: [null],
      answer_time: ['00:00'],
      answer_duration: ['00:00:00'],
      phone_number_indicative: [null],
      text_validation: this.fb.group({
        condition: [''],
        custom_error_text: [''],
        number: [null],
      }),
      numeric_validation: this.fb.group({
        condition: [''],
        custom_error_text: [''],
        number: [null],
        min_number: [null],
        max_number: [null],
      }),
      multiple_option_validation: this.fb.group({
        condition: [null],
        number: [null],
        custom_error_text: [null],
      }),
      parent_child_options: this.fb.array([]),
      modality_question_type: [null],
      compressed_photo: [null],
      is_answer_yes: [null],
    });
  }
  
  initQuestionDialCodeForm() {
    return this.fb.group({
      answer: [null],
      selected_dial_code: [null],
    });
  }

  initParentChildOptionForm() {
    return this.fb.group({
      option_text: [''],
      position: [''],
      questions: this.fb.array([]),
    });
  }

  initParentChildOptionQuestionForm() {
    return this.fb.group({
      question_name: [''],
      answer: [null],
      answer_type: [null],
      answer_number: [null],
      answer_date: this.fb.group({
        date: [null],
        time: [null],
      }),
      is_answer_required: [null],
      parent_child_options: this.fb.array([]),
    });
  }

  recursiveParentChild(pcQuestionArray: UntypedFormArray, pcQuestionData, pcQuestionIndex) {
    pcQuestionData.parent_child_options.forEach((parentChildOption2, pcIndex2) => {
      const parentChildArray = pcQuestionArray.at(pcQuestionIndex).get('parent_child_options') as UntypedFormArray;
      parentChildArray.push(this.initParentChildOptionForm());
      if (parentChildOption2.questions && parentChildOption2.questions.length) {
        parentChildOption2.questions.forEach((pc2Question, pc2QuestionIndex) => {
          const pcQuestionArray2 = parentChildArray.at(pcIndex2).get('questions') as UntypedFormArray;
          pcQuestionArray2.push(this.initParentChildOptionQuestionForm());
          if (pc2Question && pc2Question.parent_child_options && pc2Question.parent_child_options.length) {
            this.recursiveParentChild(pcQuestionArray2, pc2Question, pc2QuestionIndex);
          }
        });
      }
    });
  }

  initAddtionalQuestionFieldForm() {
    return this.fb.group({
      ref_id: [{ value: null, disabled: true }],
      field_type: [null],
      is_field: [false],
      is_editable: [false],
      is_required: [false],
      field_position: [null],
      options: this.fb.array([]),
      question_label: [''],
      answer_type: [],
      answer: [null],
      answer_number: [null, [Validators.max(2147483647)]], // max value for int32
      answer_date: [null],
      answer_multiple: [null],
      is_answer_yes: [null],
    });
  }

  initOptionFieldForm(): UntypedFormGroup {
    return this.fb.group({
      option_name: [null],
      is_continue_next_step: [false],
      is_go_to_final_step: [false],
      additional_step_id: [null],
      is_go_to_final_message: [false],
      additional_contract_step_id: [null]
    });
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  getSegmentFormarray(): UntypedFormArray {
    return this.templateStepForm.get('segments') as UntypedFormArray;
  }

  addSegmentForm() {
    this.getSegmentFormarray().push(this.initSegmentForm());
    if (this.getSegmentFormarray() && this.getSegmentFormarray().length) {
      this.templateStepForm.get('step_type').disable();
    }
  }

  getQuestionFieldFormArray(segmentIndex): UntypedFormArray {
    return this.getSegmentFormarray().at(segmentIndex).get('questions') as UntypedFormArray;
  }

  getNextQuestionField(segmentIndex, questionIndex) {
    return this.getQuestionFieldFormArray(segmentIndex).at(questionIndex + 1);
  }

  getPreviousQuestionField(segmentIndex, questionIndex) {
    const idx = questionIndex === 0 ? 0 : questionIndex - 1;
    return this.getQuestionFieldFormArray(segmentIndex).at(idx);
  }

  addQuestionFieldForm(segmentIndex) {
    this.getQuestionFieldFormArray(segmentIndex).push(this.initQuestionFieldForm());
  }

  getOptionsFormArrayFrom(questionField: UntypedFormGroup) {
    return questionField.get('options') as UntypedFormArray;
  }

  addSegmentForDialCodeForm() {
    this.dialCodeSegmentArray.push(this.initSegmentDialCodeForm());
  }

  getQuestionArrayForDialCode(segmentIndex) {
    return this.dialCodeSegmentArray?.at(segmentIndex).get('questions') as UntypedFormArray;
  }

  addQuestionDialCodeForm(segmentIndex) {
    this.getQuestionArrayForDialCode(segmentIndex).push(this.initQuestionDialCodeForm());
  }

  getQuestionDialCodeField(segmentIdx, questionIdx) {
    return this.getQuestionArrayForDialCode(segmentIdx).at(questionIdx);
  }

  checkTypeForValidation(segmentIndex, index) {
    const answerType = this.getQuestionFieldFormArray(segmentIndex).at(index).get('answer_type').value;
    const lengthInput = this.getQuestionFieldFormArray(segmentIndex).at(index).get('text_validation').get('number').value;
    const conditionInput = this.getQuestionFieldFormArray(segmentIndex).at(index).get('text_validation').get('condition').value;
    // const errorTextInput = this.getQuestionFieldFormArray(segmentIndex).at(index).get('text_validation').get('custom_error_text').value;
    if (answerType === 'short_text' || answerType === 'long_text') {
      if (conditionInput === 'Min Character') {
        this.getQuestionFieldFormArray(segmentIndex)
          .at(index)
          .get('answer')
          .setValidators([Validators.minLength(lengthInput)]);
      } else if (conditionInput === 'Max Character') {
        this.getQuestionFieldFormArray(segmentIndex)
          .at(index)
          .get('answer')
          .setValidators([Validators.maxLength(lengthInput)]);
      }
    }
  }

  checkValidationNumeric(segmentIndex, index, isRequired) {
    const inputControl = this.getQuestionFieldFormArray(segmentIndex).at(index).get('answer_number');
    const formValue = this.getQuestionFieldFormArray(segmentIndex).at(index).get('answer_number').value
      ? this.getQuestionFieldFormArray(segmentIndex).at(index).get('answer_number').value
      : 0;
    const min = Number(this.getQuestionFieldFormArray(segmentIndex).at(index).get('numeric_validation').get('min_number').value);
    const max = Number(this.getQuestionFieldFormArray(segmentIndex).at(index).get('numeric_validation').get('max_number').value);
    const number = Number(this.getQuestionFieldFormArray(segmentIndex).at(index).get('numeric_validation').get('number').value);
    const numberNull = inputControl.value === null;
    const conditionInput = this.getQuestionFieldFormArray(segmentIndex).at(index).get('numeric_validation').get('condition').value;

    if (conditionInput === 'Greater than') {
      if (formValue > number || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Greater than or equal to') {
      if (formValue >= number || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Less than') {
      if (formValue < number || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Less than or equal to') {
      if (formValue <= number || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Equal to') {
      if (formValue === number || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Not equal to') {
      if (formValue !== number || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Between') {
      const value = Number(inputControl.value);
      if ((min < value && value < max) || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else if (conditionInput === 'Not between') {
      const value = Number(inputControl.value);
      if (min >= value || value >= max || numberNull) {
        inputControl.setErrors(null);
      } else if ((inputControl.value && isRequired) || !isRequired) {
        inputControl.setErrors({ errors: true });
      }
    } else {
      return;
    }
    if (!inputControl.value && isRequired) {
      inputControl.setErrors({ required: true });
    }
  }

  onAskForRevision() {
    this.subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          stepId: this.stepData.is_final_step && this.formData.is_final_validator_active ? null : this.stepData._id,
          existingMessages: this.stepData.revise_request_messages ? this.stepData.revise_request_messages : null,
          formBuilderStepId: this.stepData.form_builder_step._id,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formId);
        }
      });
  }

  onCompleteRevision() {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S5.TITLE'),
      text: this.translate.instant('UserForm_S5.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S5.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S5.CANCEL'),
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((resp) => {
      if (resp.value) {
        this.isWaitingForResponse = true;
        this.saveStep().subscribe(
          (resps) => {
            if (resps) {
              this.acceptStep().subscribe(
                (resp) => {
                  if (resp) {
                    const stepID = this.stepData.form_builder_step._id;
                    const formProcessID = this.formDetail.formId;
                    const isPreview = typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false;
                    const triggerCondition = 'waiting_for_validation';
                    this.subs.sink = this.formBuilderService
                      .generateFormBuilderStepMessage(stepID, formProcessID, isPreview, triggerCondition)
                      .subscribe((resp) => {
                        this.isWaitingForResponse = false;
                        if (resp) {
                          this.subs.sink = this.dialog
                            .open(StepDynamicMessageDialogComponent, {
                              width: '600px',
                              minHeight: '100px',
                              panelClass: 'certification-rule-pop-up',
                              disableClose: true,
                              data: {
                                step_id: this.stepData.form_builder_step._id,
                                form_process_id: this.formDetail.formId,
                                is_preview: typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false,
                                dataPreview: null,
                                triggerCondition: triggerCondition,
                              },
                            })
                            .afterClosed()
                            .subscribe((result) => {
                              this.isWaitingForResponse = true;
                              this.triggerRefresh.emit(this.formId);
                            });
                        } else {
                          Swal.fire({
                            type: 'success',
                            title: this.translate.instant('Bravo!'),
                            confirmButtonText: this.translate.instant('OK'),
                            allowEnterKey: false,
                            allowEscapeKey: false,
                            allowOutsideClick: false,
                          });
                          this.triggerRefresh.emit(this.formId);
                        }
                      });
                  }
                },
                (err) => {
                  this.isWaitingForResponse = false;
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
          },
          (err) => {
            this.isWaitingForResponse = false;
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
      } else {
        return;
      }
    });
  }

  removeValidators(form: UntypedFormGroup) {
    for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
    }
  }
  checkFSCostCoverage() {
    const form = this.templateStepForm.value;
    let invalidCostCoverage = false;
    if (form.segments?.length) {
      form.segments.forEach((segment, segIndex) => {
        if (segment?.additional_financial_supports?.length) {
          segment.additional_financial_supports.forEach((fs) => {
            if (fs?.questions?.length) {
              fs.questions.forEach((question, questionIndex) => {
                if (question?.field_type === 'financial_support_cost') {
                  const value = question.answer ? Number(question.answer) : 0;
                  if (value < 20) {
                    invalidCostCoverage = true;
                  }
                }
              });
            }
          });
        }
      });
    }
    return invalidCostCoverage;
  }

  nextStepMessage(type) {
    this.checkUploadImage = true;
    if (this.fromModalityPayment) {
      if (
        (!this.invalidCost && !this.minCostCoverage && this.maxCostCoverage) ||
        (!this.invalidCost && this.minCostCoverage && !this.maxCostCoverage) ||
        (this.invalidCost && !this.minCostCoverage && !this.maxCostCoverage) ||
        (this.invalidCost && this.minCostCoverage && !this.maxCostCoverage) ||
        (this.invalidCost && !this.minCostCoverage && this.maxCostCoverage) ||
        this.checkFSCostCoverage() || 
        !this.isValidCostCoverageAfterRecalculate || 
        this.dialCodeSegmentArray?.invalid
      ) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('FormSave_S1.TITLE'),
          html: this.translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
        this.templateStepForm.markAllAsTouched();
        this.dialCodeSegmentArray.markAllAsTouched();
        return;
      }
    }
    // Clear Validator on field
    if (this.fromModalityPayment) {
      const form = this.templateStepForm.value;
      if (this.studentAsFinancialSupport) {
        form.segments.forEach((segment, segIndex) => {
          this.getQuestionFieldFormArray(segIndex).setErrors(null);
          this.getQuestionFieldFormArray(segIndex).updateValueAndValidity();
          segment.questions.forEach((question, questionIndex) => {
            if (question && question.modality_question_type === 'financial_support') {
              this.removeValidators(this.getQuestionFieldFormArray(segIndex).at(questionIndex) as UntypedFormGroup);
            }
          });
        });
      }
      this.isValidatePayment = this.checkInvalidPaymentForm();
    }
    if (!this.isValidatePayment) {
      this.templateStepForm.markAllAsTouched();
      this.dialCodeSegmentArray.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }

    if (this.templateStepForm.invalid || this.isPhotoMandatory || this.dialCodeSegmentArray?.invalid) {
      console.log('this.isPhotoMandatory', this.isPhotoMandatory);
      this.templateStepForm.markAllAsTouched();
      this.dialCodeSegmentArray.markAllAsTouched();

      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    let stepId = null;
    if (this.stepData && this.stepData._id) {
      stepId = this.stepData._id;
    }
    console.log('CONTROL =>', this.templateStepForm.controls);
    if (
      this.isUsingStepMessage &&
      this.formDetail &&
      this.formDetail.templateId &&
      this.stepData &&
      this.stepData.form_builder_step &&
      typeof this.stepData._id === 'string' &&
      typeof this.formDetail.formId === 'string' &&
      typeof this.formDetail.templateId === 'string' &&
      typeof this.stepData.form_builder_step._id === 'string'
    ) {
      const stepID = this.stepData.form_builder_step._id;
      const formProcessID = this.formDetail.formId;
      const isPreview = typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false;
      const triggerCondition = type === 'waiting_for_validation' ? (this.stepData.is_validation_required ? type : 'validated') : type;

      this.subs.sink = this.formBuilderService.generateFormBuilderStepMessage(stepID, formProcessID, isPreview, triggerCondition).subscribe(
        (resp) => {
          if (resp) {
            this.subs.sink = this.saveStep()
              .pipe(
                take(1),
                switchMap((resp) => {
                  if (resp) {
                    return this.acceptStep();
                  } else {
                    this.isWaitingForResponse = false;
                    return EMPTY;
                  }
                }),
              )
              .subscribe(
                (resp) => {
                  this.isWaitingForResponse = false;
                  this.subs.sink = this.dialog
                    .open(StepDynamicMessageDialogComponent, {
                      width: '600px',
                      minHeight: '100px',
                      panelClass: 'certification-rule-pop-up',
                      disableClose: true,
                      data: {
                        step_id: this.stepData.form_builder_step._id,
                        form_process_id: this.formDetail.formId,
                        is_preview: typeof this.formDetail.isPreview === 'boolean' ? this.formDetail.isPreview : false,
                        dataPreview: null,
                        triggerCondition: triggerCondition,
                      },
                    })
                    .afterClosed()
                    .subscribe((result) => {
                      if (result.type === 'cancel') {
                        return;
                      }
                      this.isWaitingForResponse = true;
                      this.triggerRefresh.emit(this.formId);
                    });
                },
                (err) => {
                  this.isWaitingForResponse = false;
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
          } else {
            this.isWaitingForResponse = false;
            this.acceptContinueNextStep();
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          this.acceptContinueNextStep();
          console.error(error);
        },
      );
    } else {
      this.acceptContinueNextStep();
    }
  }

  checkInvalidPaymentForm() {
    const form = this.templateStepForm.value;
    let isValidatePayment = true;
    if (this.candidates?.method_of_payment !== 'transfer' && form?.segments?.length) {
      const segment = form?.segments[0];
      if (!segment?.is_student_included && !segment?.is_multiple_financial_support) {
        if (segment?.questions?.length) {
          segment?.questions.forEach((quest) => {
            if (quest?.field_type === 'student_iban' && !quest?.answer && quest?.is_required) {
              isValidatePayment = false;
            }
            if (quest?.field_type === 'student_bic' && !quest?.answer && quest?.is_required) {
              isValidatePayment = false;
            }
            if (quest?.field_type === 'student_acccount_holder_name' && !quest?.answer && quest?.is_required) {
              isValidatePayment = false;
            }
            if (quest?.field_type === 'student_cost' && !quest?.answer && quest?.is_required) {
              isValidatePayment = false;
            }
          });
        } else {
          isValidatePayment = false;
        }
      } else {
        if (segment?.is_student_included) {
          if (segment?.questions?.length) {
            segment?.questions.forEach((quest) => {
              if (quest?.field_type === 'student_iban' && !quest?.answer && quest?.is_required) {
                isValidatePayment = false;
              }
              if (quest?.field_type === 'student_bic' && !quest?.answer && quest?.is_required) {
                isValidatePayment = false;
              }
              if (quest?.field_type === 'student_acccount_holder_name' && !quest?.answer && quest?.is_required) {
                isValidatePayment = false;
              }
              if (quest?.field_type === 'student_cost' && !quest?.answer && quest?.is_required) {
                isValidatePayment = false;
              }
            });
          } else if (!segment?.additional_financial_supports?.length) {
            isValidatePayment = false;
          }
        }
        if (segment?.is_multiple_financial_support) {
          if (segment?.additional_financial_supports?.length) {
            segment?.additional_financial_supports.forEach((additional) => {
              if (additional?.questions?.length) {
                additional?.questions.forEach((quest) => {
                  if (quest?.field_type === 'financial_support_civility' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_first_name' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_last_name' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_email' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_phone_number' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_address' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_postcode' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_city' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_country' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_iban' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_bic' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_account_holder_name' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                  if (quest?.field_type === 'financial_support_cost' && !quest?.answer && quest?.is_required) {
                    isValidatePayment = false;
                  }
                });
              }
            });
          } else if (!this.studentAsFinancialSupport) {
            isValidatePayment = false;
          }
        }
      }
    }
    return isValidatePayment;
  }

  acceptContinueNextStep() {
    if (this.templateStepForm.invalid || this.dialCodeSegmentArray?.invalid) {
      this.templateStepForm.markAllAsTouched();
      this.dialCodeSegmentArray.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }

    let swalTitle: string;
    let swalText: string;
    let swalConfirm: string;
    if (
      this.stepData.isCompletingUser &&
      !this.isValidator &&
      this.stepData.is_validation_required &&
      this.stepData.step_status !== 'accept'
    ) {
      swalTitle = this.translate.instant('UserForm_S6.TITLE');
      swalText = this.translate.instant('UserForm_S6.TEXT');
      swalConfirm = this.translate.instant('UserForm_S6.CONFIRM');
    } else {
      swalTitle = 'Bravo !';
      swalText = null;
      swalConfirm = 'OK';
    }
    this.isWaitingForResponse = true;
    if (!this.formDetail.isPreview) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.saveStep()
        .pipe(
          take(1),
          switchMap((resp) => {
            if (resp) {
              return this.acceptStep();
            } else {
              this.isWaitingForResponse = false;
              return EMPTY;
            }
          }),
        )
        .subscribe(
          (resp) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'success',
              title: swalTitle,
              text: swalText ? swalText : '',
              confirmButtonText: swalConfirm,
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((response) => {
              this.triggerRefresh.emit(this.formId);
            });
          },
          (err) => {
            this.isWaitingForResponse = false;
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
    } else {
      this.triggerRefresh.emit(this.formId);
    }
  }

  saveStep() {
    const payload = this.templateStepForm.value;
    this.formatPayload(payload);
    console.log('payload', payload);
    if (this.isValidator) {
      payload.validator = payload.validator._id;
      return this.formFillingService.createUpdateFormProcessStepAndQuestion(payload);
    } else {
      return this.formFillingService.createUpdateFormProcessStepAndQuestion(payload);
    }
  }

  onAskForRevisionFinalValidator() {
    this.subs.sink = this.dialog
      .open(FormFillingRevisionDialogComponent, {
        minWidth: '800px',
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          formData: this.formDetail,
          existingMessages: this.formDetail.revise_request_messages ? this.formDetail.revise_request_messages : null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
      });
  }

  onCompleteRevisionFinalValidator() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.triggerRefresh.emit(this.formDetail.formId);
        }
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
        }
      },
    );
  }

  onValidateFormFinalValidator() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S10.TITLE'),
      html: this.translate.instant('UserForm_S10.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S10.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S10.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S10.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        this.subs.sink = this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe((res) => {
          if (res) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((res) => {
              this.triggerRefresh.emit(this.formDetail.formId);
            });
          }
        });
      } else {
        return;
      }
    });
  }

  onSubmitFormFinalVlidator() {
    this.isWaitingForResponse = true;
    this.formFillingService.acceptFormProcessStep(this.formDetail.formId, this.stepData._id).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          if (
            this.formData &&
            this.formData.final_validators &&
            this.formData.final_validators.length &&
            this.formData.is_final_validator_active
          ) {
            // with validator
            Swal.fire({
              type: 'success',
              title: this.translate.instant('UserForm_S7.TITLE'),
              text: this.translate.instant('UserForm_S7.TEXT'),
              confirmButtonText: this.translate.instant('UserForm_S7.CONFIRM'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.router.navigate(['/']);
            });
          } else {
            // without validator
            Swal.fire({
              type: 'success',
              title: this.translate.instant('UserForm_S8.TITLE'),
              text: this.translate.instant('UserForm_S8.TEXT'),
              confirmButtonText: this.translate.instant('UserForm_S8.CONFIRM'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.router.navigate(['/']);
            });
          }
        }
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
        }
      },
    );
  }

  formatPayload(payload) {
    // format the dates
    for (const segment of payload.segments) {
      if (this.fromModalityPayment) {
        // segment.is_selected_modality = true;
        let questionForStudent = segment.questions.filter((res) => res.modality_question_type === 'student');
        this.payloadForStudentQuestion = questionForStudent;
        if (segment.additional_financial_supports && segment.additional_financial_supports.length) {
          segment.additional_financial_supports.forEach((additional) => {
            if (additional && additional.questions && additional.questions.length) {
              additional.questions.forEach((quest) => {
                delete quest._id;
              });
            }
          });
          console.log('segment', _.cloneDeep(segment));
        }
      }

      for (const question of segment.questions) {
        if (question && question.is_field && question.answer instanceof Date) {
          // for parsing back to string format for fields like date of birth
          question.answer = this.parseLocalToUtc.transformDate(question.answer.toLocaleDateString('en-GB'), '15:59');
        }
        if (question && question.answer_date && question.answer_date instanceof Date) {
          question.answer_date = {
            date: this.parseLocalToUtc.transformDate(question.answer_date.toLocaleDateString('en-GB'), '15:59'),
            time: '15:59',
          };
          if (question.field_type === 'date_of_birth' && !question.answer && question.answer_date && question.answer_date.date) {
            question.answer = question.answer_date.date;
          }
        } else if (question && question.answer_date === '') {
          // doing this to convert the modification above from "" to date object again if user did not fill the date
          question.answer_date = {
            date: null,
            time: null,
          };
        }
        if (question && question.field_type === 'date_of_birth' && question.answer) {
          const answerDate = moment(question.answer, 'DD/MM/YYYY').format('DD/MM/YYYY');
          console.log('date', question.answer, answerDate);
          if (answerDate !== 'Invalid date') {
            question.answer = answerDate;
          }
        }
      }
    }
    // format the validator from object to string of IDs
    if (payload && payload.validator && typeof payload.validator === 'object' && payload.validator._id) {
      payload.validator = payload.validator._id;
    }
    // format to remove the revise_request_messages
    if (payload && payload.revise_request_messages) {
      delete payload.revise_request_messages;
    }

    if (this.fromModalityPayment) {
      if (this.studentAsFinancialSupport) {
        if (payload && payload.segments && payload.segments.length) {
          payload.segments = payload.segments.map((list) => {
            return {
              ...list,
              questions: this.payloadForStudentQuestion,
            };
          });
        }
      }
    }
  }

  acceptStep() {
    return this.formFillingService.acceptFormProcessStep(this.formId, this.templateStepForm.value._id);
  }

  saveOnFinalValidationRevision() {
    // Check if form is invalid
    if (this.templateStepForm.invalid || this.dialCodeSegmentArray?.invalid) {
      this.templateStepForm.markAllAsTouched();
      this.dialCodeSegmentArray.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }

    this.isWaitingForResponse = true;
    this.subs.sink = this.saveStep().subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((resp) => {
          this.triggerRefresh.emit(this.formId);
        });
      }
    });
  }

  swalValidate() {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('UserForm_S9.TITLE'),
      html: this.translate.instant('UserForm_S9.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S9.CONFIRM'),
      cancelButtonText: this.translate.instant('UserForm_S9.CANCEL'),
      showCancelButton: true,
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: true,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('UserForm_S9.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('UserForm_S9.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((res) => {
          return;
        });
      } else {
        return;
      }
    });
  }

  // Swal for completing the from
  swalCompleteForm() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('UserForm_S8.TITLE'),
      text: this.translate.instant('UserForm_S8.TEXT'),
      confirmButtonText: this.translate.instant('UserForm_S8.CONFIRM'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      return;
    });
  }

  getPostcodeData(data, segmentIndex, index, from, addtionalIndex?) {
    // console.log('_zip', data.value, index);
    // console.log(this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value);

    let typeField = '';
    if (from && from === 'additional_financial_supports') {
      typeField = this.getAddtionalQuestionField(segmentIndex, addtionalIndex).at(index).get('field_type').value;
    } else if (from && from === 'questions') {
      typeField = this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value;
    }

    console.log(typeField);
    if (
      typeField === 'student_zipcode' ||
      typeField === 'postcode' ||
      typeField === 'student_country' ||
      typeField === 'alumni_country' ||
      typeField === 'alumni_zip_code'
    ) {
      const zipcode = this.getZipcodeForm(this.getQuestionFieldFormArray(segmentIndex));
      const isFormCountryFrance = this.checkHasCountry(this.getQuestionFieldFormArray(segmentIndex));
      if (zipcode && zipcode.length > 3) {
        this.subs.sink = this.rncpTitleService.getFilteredZipCode(zipcode, 'France').subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.setAddressDropdownStudent(resp);
              if (isFormCountryFrance) {
                const isFormHasCity = this.checkHasCity(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasCity) {
                  this.patchFormCity(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormHasRegion = this.checkHasRegion(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasRegion) {
                  this.patchFormRegion(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormDepartment = this.checkHasDepartment(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormDepartment) {
                  this.patchFormDepartment(this.getQuestionFieldFormArray(segmentIndex));
                }
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
      }
    }

    // parent
    if (typeField === 'parent_zipcode' || typeField === 'parent_country' || typeField === 'parent_postcode') {
      const zipcode = this.getZipcodeFormParent(this.getQuestionFieldFormArray(segmentIndex));
      const isFormCountryFrance = this.checkHasCountryParent(this.getQuestionFieldFormArray(segmentIndex));
      if (zipcode && zipcode.length > 3) {
        this.subs.sink = this.rncpTitleService.getFilteredZipCode(zipcode, 'France').subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.setAddressDropdownParent(resp);
              if (isFormCountryFrance) {
                const isFormHasCity = this.checkHasCityParent(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasCity) {
                  this.patchFormCityParent(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormHasRegion = this.checkHasRegionParent(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasRegion) {
                  this.patchFormRegionParent(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormDepartment = this.checkHasDepartmentParent(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormDepartment) {
                  this.patchFormDepartmentParent(this.getQuestionFieldFormArray(segmentIndex));
                }
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
      }
    }

    // financial support modality
    if (typeField === 'financial_support_postcode' || typeField === 'financial_support_country') {
      const zipcode = this.getZipcodeFormModality(this.getQuestionFieldFormArray(segmentIndex));
      const isFormCountryFrance = this.checkHasCountryModality(this.getQuestionFieldFormArray(segmentIndex));

      if (zipcode && zipcode.length > 3) {
        this.subs.sink = this.rncpTitleService.getFilteredZipCode(zipcode, 'France').subscribe(
          (resp) => {
            if (resp && resp.length) {
              this.setAddressDropdownModality(resp);
              if (isFormCountryFrance) {
                const isFormHasCity = this.checkHasCityModality(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasCity) {
                  this.patchFormCityModality(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormHasRegion = this.checkHasRegionModality(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormHasRegion) {
                  this.patchFormRegionModality(this.getQuestionFieldFormArray(segmentIndex));
                }
                const isFormDepartment = this.checkHasDepartmentModality(this.getQuestionFieldFormArray(segmentIndex));
                if (isFormDepartment) {
                  this.patchFormDepartmentModality(this.getQuestionFieldFormArray(segmentIndex));
                }
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
      }
    }
  }

  // modality
  getZipcodeFormModality(form) {
    let zipcode;
    for (const element of form.value) {
      if (element.field_type === 'financial_support_postcode' || element.field_type === 'alumni_zip_code') {
        zipcode = element.answer;
        break;
      }
    }
    return zipcode;
  }

  // student
  getZipcodeFormParent(form) {
    let zipcode;
    for (const element of form.value) {
      if (element.field_type === 'parent_zipcode') {
        zipcode = element.answer;
        break;
      }
    }
    return zipcode;
  }

  getZipcodeForm(form) {
    let zipcode;
    for (const element of form.value) {
      if (element.field_type === 'student_zipcode') {
        zipcode = element.answer;
        break;
      }
    }
    return zipcode;
  }

  patchFormCity(form) {
    let cityData;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'student_city') {
        cityData = element;
        cityData.answer = this.cities[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(cityData);
    form.updateValueAndValidity();
  }

  patchFormRegion(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'student_region') {
        data = element;
        data.answer = this.regions[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  patchFormDepartment(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'student_department') {
        data = element;
        data.answer = this.departments[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  setAddressDropdownStudent(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.cities = _.uniq(tempCities);
      this.departments = _.uniq(tempDepartments);
      this.regions = _.uniq(tempRegions);
    }
  }

  checkHasCountry(form) {
    let hasCountry = false;
    let hasZipcode = false;
    for (const element of form.value) {
      if (
        element.field_type === 'student_country' &&
        (this.utilityService.simplifyRegex(element.answer) === 'france' ||
          this.utilityService.simplifyRegex(element.answer) === 'francais' ||
          this.utilityService.simplifyRegex(element.answer) === 'francaise')
      ) {
        hasCountry = true;
      }
      if (element.field_type === 'student_zipcode') {
        hasZipcode = true;
      }
      if (hasCountry && hasZipcode) {
        break;
      }
    }
    return hasCountry && hasZipcode;
  }

  checkHasCity(form) {
    let hasCity = false;
    for (const element of form.value) {
      if (element.field_type === 'student_city') {
        hasCity = true;
        break;
      }
    }
    return hasCity;
  }

  checkHasRegion(form) {
    let hasRegion = false;
    for (const element of form.value) {
      if (element.field_type === 'student_region') {
        hasRegion = true;
        break;
      }
    }
    return hasRegion;
  }

  checkHasDepartment(form) {
    let hasDepartment = false;
    for (const element of form.value) {
      if (element.field_type === 'student_department') {
        hasDepartment = true;
        break;
      }
    }
    return hasDepartment;
  }

  checkHasCountryModality(form) {
    let hasCountry = false;
    let hasZipcode = false;
    for (const element of form.value) {
      if (
        element.field_type === 'financial_support_country' &&
        (this.utilityService.simplifyRegex(element.answer) === 'france' ||
          this.utilityService.simplifyRegex(element.answer) === 'francais' ||
          this.utilityService.simplifyRegex(element.answer) === '1' ||
          this.utilityService.simplifyRegex(element.answer) === 'francaise')
      ) {
        hasCountry = true;
      }
      if (
        element.field_type === 'alumni_country' &&
        (this.utilityService.simplifyRegex(element.answer) === 'france' ||
          this.utilityService.simplifyRegex(element.answer) === 'francais' ||
          this.utilityService.simplifyRegex(element.answer) === '1' ||
          this.utilityService.simplifyRegex(element.answer) === 'francaise')
      ) {
        hasCountry = true;
      }
      if (element.field_type === 'financial_support_postcode') {
        hasZipcode = true;
      }
      if (element.field_type === 'alumni_zip_code') {
        hasZipcode = true;
      }
      if (hasCountry && hasZipcode) {
        break;
      }
    }
    return hasCountry && hasZipcode;
  }

  setAddressDropdownModality(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.citiesParent = _.uniq(tempCities);
      this.departmentsParent = _.uniq(tempDepartments);
      this.regionsParents = _.uniq(tempRegions);
    }
  }

  patchFormCityModality(form) {
    let cityData;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'financial_support_city' || element.field_type === 'alumni_city') {
        cityData = element;
        cityData.answer = this.citiesParent[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(cityData);
    form.updateValueAndValidity();
  }

  patchFormRegionModality(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'financial_support_region' || element.field_type === 'alumni_region') {
        data = element;
        data.answer = this.regionsParents[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  patchFormDepartmentModality(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'financial_support_departement' || element.field_type === 'alumni_department') {
        data = element;
        data.answer = this.departmentsParent[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  checkHasCityModality(form) {
    let hasCity = false;
    for (const element of form.value) {
      if (element.field_type === 'financial_support_city') {
        hasCity = true;
        break;
      }
    }
    return hasCity;
  }

  checkHasRegionModality(form) {
    let hasRegion = false;
    for (const element of form.value) {
      if (element.field_type === 'financial_support_region') {
        hasRegion = true;
        break;
      }
    }
    return hasRegion;
  }

  checkHasDepartmentModality(form) {
    let hasDepartment = false;
    for (const element of form.value) {
      if (element.field_type === 'financial_support_departement') {
        hasDepartment = true;
        break;
      }
    }
    return hasDepartment;
  }

  // Parent
  setAddressDropdownParent(resp: any) {
    const tempCities = [];
    const tempDepartments = [];
    const tempRegions = [];

    if (resp && resp.length) {
      resp.forEach((address) => {
        tempCities.push(address.city);
        tempDepartments.push(address.department);
        tempRegions.push(address.province);
      });

      this.citiesParent = _.uniq(tempCities);
      this.departmentsParent = _.uniq(tempDepartments);
      this.regionsParents = _.uniq(tempRegions);
    }
  }

  patchFormCityParent(form) {
    let cityData;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'parent_city') {
        cityData = element;
        cityData.answer = this.citiesParent[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(cityData);
    form.updateValueAndValidity();
  }

  patchFormRegionParent(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'parent_region') {
        data = element;
        data.answer = this.regionsParents[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  patchFormDepartmentParent(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'parent_department') {
        data = element;
        data.answer = this.departmentsParent[0];
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  checkHasCountryParent(form) {
    let hasCountry = false;
    let hasZipcode = false;
    for (const element of form.value) {
      if (
        element.field_type === 'parent_country' &&
        (this.utilityService.simplifyRegex(element.answer) === 'france' ||
          this.utilityService.simplifyRegex(element.answer) === 'francais' ||
          this.utilityService.simplifyRegex(element.answer) === 'francaise')
      ) {
        hasCountry = true;
      }
      if (element.field_type === 'parent_zipcode') {
        hasZipcode = true;
      }
      if (hasCountry && hasZipcode) {
        break;
      }
    }
    return hasCountry && hasZipcode;
  }

  checkHasCityParent(form) {
    let hasCity = false;
    for (const element of form.value) {
      if (element.field_type === 'parent_city') {
        hasCity = true;
        break;
      }
    }
    return hasCity;
  }

  checkHasRegionParent(form) {
    let hasRegion = false;
    for (const element of form.value) {
      if (element.field_type === 'parent_region') {
        hasRegion = true;
        break;
      }
    }
    return hasRegion;
  }

  checkHasDepartmentParent(form) {
    let hasDepartment = false;
    for (const element of form.value) {
      if (element.field_type === 'parent_department') {
        hasDepartment = true;
        break;
      }
    }
    return hasDepartment;
  }

  preventNonNumericalInput(event) {
    if (event && event.key) {
      if (!event.key.match(/^[0-9]+$/)) {
        event.preventDefault();
      }
    }
  }

  validateDurationInput(event) {
    const sectioned = event.target.value.split(':');
    if (sectioned.length !== 3) {
      event.target.value = '00:00:00'; // fallback to default
      return;
    }
    if (sectioned.length === 3 && sectioned[1].length === 0) {
      event.target.value = '00:00:00'; // fallback to default
      return;
    }
    if (sectioned.length === 3 && sectioned[0].length === 0) {
      event.target.value = '00:00:00'; // fallback to default
      return;
    }
    if (isNaN(sectioned[0])) {
      sectioned[0] = '00';
    }
    for (let i = 1; i < sectioned.length; i++) {
      if (isNaN(sectioned[i]) || sectioned[i] < 0) {
        sectioned[i] = '00';
      }
      if (sectioned[i] > 59 || sectioned[i].length > 2) {
        sectioned[i] = '59';
      }
    }

    event.target.value = sectioned.join(':');
  }

  requairedValidation(quest?, segmentIndex?, quesIndex?) {
    if (quest && quest.controls && quest.controls.answer && quest.controls.answer.errors && quest.controls.answer.errors.required) {
      return true;
    } else {
      return false;
    }
  }

  alphaNumberOnly(e, type) {
    let regex;
    return true;
    if (type === 'financial_support_first_name' || type === 'financial_support_last_name') {
      regex = new RegExp(`^[a-zA-Z0-9 '-]+$`);
    } else {
      regex = new RegExp('^[a-zA-Z0-9 ]+$');
      // regex = new RegExp('/[|{}\[\]:;<>?,\/]/');
    }
    const str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }
    e.preventDefault();
    return false;
  }

  alphaNumericValidation(quest?, segmentIndex?, quesIndex?) {
    if (quest && quest.controls && quest.controls.answer && quest.controls.answer.errors && quest.controls.answer.errors.pattern) {
      return true;
    } else {
      return false;
    }
  }

  emailValidation(quest?, segmentIndex?, quesIndex?) {
    if (quest && quest.controls && quest.controls.answer && quest.controls.answer.errors && quest.controls.answer.errors.pattern) {
      return true;
    } else {
      return false;
    }
  }

  paternNumberValidate(quest?, segmentIndex?, quesIndex?) {
    if (quest && quest.controls && quest.controls.answer && quest.controls.answer.errors && quest.controls.answer.errors.pattern) {
      return true;
    } else {
      return false;
    }
  }

  selectFile(fileInput: Event, from, segmentIndex, questionIndex) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    this.imageBeforeCompressed = (<HTMLInputElement>fileInput.target).files[0];
    if (this.imageBeforeCompressed) {
      const fileType = this.utilityService.getFileExtension(this.imageBeforeCompressed.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        if (this.imageBeforeCompressed.size > 5000000) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('UPLOAD_IMAGE.TITLE'),
            text: this.translate.instant('UPLOAD_IMAGE.TEXT'),
            confirmButtonText: this.translate.instant('UPLOAD_IMAGE.BUTTON'),
          });
        } else {
          this.isPhotoUploading = true;
          const fileName = this.imageBeforeCompressed?.name;
          const size = this.imageBeforeCompressed?.size;
          const reader = new FileReader();
          reader.onload = (read: any) => {
            const localUrl = read.target.result;
            this.compressFile(localUrl, fileName, size, from, segmentIndex, questionIndex);
          };
          reader.readAsDataURL(this.imageBeforeCompressed);
        }
      } else {
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
  }

  compressFile(image, fileName, size, from, segmentIndex, questionIndex) {
    const orientation = -1;
    let ratio: number;
    const compressedName = fileName.substring(0, fileName.lastIndexOf('.')) + '-Compressed' + fileName.substring(fileName.lastIndexOf('.'));
    // console.log('image size', size);

    // set ratio based on image size
    if (size > 3000000 && size <= 5000000) {
      ratio = 20;
    } else if (size >= 1000000 && size <= 3000000) {
      ratio = 30;
    } else if (size < 1000000) {
      ratio = 40;
    }
    // console.log('ratio:',ratio+'%');

    //compress image
    if (ratio) {
      this.imageCompress.compressFile(image, orientation, ratio, 50).then((result) => {
        fetch(result)
          .then((res) => res.blob())
          .then((blob) => {
            this.imageAfterCompressed = new File([blob], compressedName, { type: 'image/png' });
            // console.log('Before:', this.imageBeforeCompressed);
            // console.log('After:', this.imageAfterCompressed);
            this.uploadFile(this.imageAfterCompressed, this.imageBeforeCompressed, from, segmentIndex, questionIndex);
          });
      });
    }
  }

  uploadFile(imageAfter: File, imageBefore: File, from, segmentIndex, questionIndex) {
    this.photo = '';
    this.photo_s3_path = '';
    this.is_photo_in_s3 = false;
    // upload image after compressed
    if (imageAfter) {
      this.subs.sink = this.fileUploadService.singleUpload(imageAfter).subscribe(
        (resp) => {
          if (resp) {
            console.log('Image compressed upload success');
            this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ compressed_photo: resp.s3_file_name });
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            console.log('[BE Message] Error is : ', err);
          });
        },
      );
    }
    // upload image before compressed
    if (imageBefore) {
      this.subs.sink = this.fileUploadService.singleUpload(imageBefore).subscribe(
        (resp) => {
          this.isPhotoUploading = false;
          if (resp) {
            if (from === 'answerType') {
              this.photo = resp.file_name;
              this.photo_s3_path = resp.s3_file_name;
            }
            if (from === 'isField') {
              this.photoIsField = resp.file_name;
              this.photoIsField_s3_path = resp.s3_file_name;
            }
            this.is_photo_in_s3 = true;
            this.is_photo_uploaded = true;
            this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer: resp.s3_file_name });
          }
        },
        (err) => {
          this.isPhotoUploading = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {
            console.log('[BE Message] Error is : ', err);
          });
        },
      );
    }
    this.resetFileState();
  }

  handleInputChange(fileInput: Event, from, segmentIndex, questionIndex) {
    this.isPhotoUploading = true;
    const file = (<HTMLInputElement>fileInput.target).files[0];
    this.photo = '';
    this.photoIsField = '';
    this.photo_s3_path = '';
    this.photoIsField_s3_path = '';
    this.is_photo_in_s3 = false;

    if (file) {
      this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
        (resp) => {
          this.isPhotoUploading = false;
          if (resp) {
            if (from === 'answerType') {
              this.photo = resp.file_name;
              this.photo_s3_path = resp.s3_file_name;
            }
            if (from === 'isField') {
              this.photoIsField = resp.file_name;
              this.photoIsField_s3_path = resp.s3_file_name;
            }
            this.is_photo_in_s3 = true;
            this.is_photo_uploaded = true;
            this.getQuestionFieldFormArray(segmentIndex).at(questionIndex).patchValue({ answer: resp.s3_file_name });
          }
        },
        (err) => {
          this.isPhotoUploading = false;
          Swal.fire({
            type: 'info',
            title: 'Error !',
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          }).then((res) => {});
        },
      );
    }
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  onKeyDownDuration(e: KeyboardEvent) {
    const navigationKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', ':'];
    if (navigationKeys.indexOf(e.key) > -1) {
      return;
    }
    if (e.key === ' ' || isNaN(Number(e.key))) {
      e.preventDefault();
    }
  }

  getDataPromoYear() {
    this.subs.sink = this.alumniService.GetAllAlumniPromoYear().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.promotionList = resp.filter((program) => program !== '');
          this.filteredCurrentProgram = of(this.promotionList);
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

  getDataScholarSeasons() {
    this.subs.sink = this.financeService.GetAllScholarSeasonsPublished().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholars = resp;
          this.scholars = this.scholars.sort((a, b) =>
            a.scholar_season > b.scholar_season ? 1 : b.scholar_season > a.scholar_season ? -1 : 0,
          );
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

  getDataSchoolCampus() {
    this.campusList = [];
    this.subs.sink = this.alumniService.getAllCandidateSchool().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.schoolList = resp.filter((school) => school.short_name !== '');
          this.schoolList.filter((campus, n) => {
            if (campus.campuses && campus.campuses.length) {
              campus.campuses.filter((campuses, nex) => {
                this.campusList.push(campuses);
              });
            }
          });
          this.campusList = _.uniqBy(this.campusList, 'name');
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

  getDataCampus(schoolName, segmentIndex) {
    let data;
    let indexFound;
    this.campusList = [];
    const form = this.getQuestionFieldFormArray(segmentIndex);
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'alumni_campus') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();

    const school = schoolName;
    const scampusList = [];
    const found = this.schoolList.find((element) => element && element.short_name === school);
    if (found) {
      scampusList.push(found);
    }
    if (scampusList) {
      scampusList.forEach((campus) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
    }
    this.campusList = _.uniqBy(this.campusList, 'name');
    if (!schoolName) {
      this.schoolList.filter((campus, n) => {
        if (campus.campuses && campus.campuses.length) {
          campus.campuses.filter((campuses, nex) => {
            this.campusList.push(campuses);
          });
        }
      });
      this.campusList = _.uniqBy(this.campusList, 'name');
    }
  }

  getDataSector() {
    this.subs.sink = this.alumniService.getAllSectors().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.sectorList = resp.filter((sector) => sector.name !== '');
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

  getDataSpeciality() {
    this.subs.sink = this.alumniService.getAllSpecializations('').subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.specialityList = resp.filter((speciality) => speciality.name !== '');
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

  getDataSpecialityBasedSector(sector, segmentIndex) {
    const sectorFound = this.sectorList.filter((list) => list.name === sector);
    const sectorId = sectorFound && sectorFound.length ? sectorFound[0]._id : '';
    this.specialityList = [];
    const form = this.getQuestionFieldFormArray(segmentIndex);
    let data;
    let indexFound;
    this.subs.sink = this.alumniService.getAllSpecializations(sectorId).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.specialityList = resp.filter((speciality) => speciality.name !== '');
          for (const [index, element] of form.value.entries()) {
            if (element.field_type === 'alumni_speciality') {
              data = element;
              data.answer = null;
              indexFound = index;
              break;
            }
          }
          form.at(indexFound).patchValue(data);
          form.updateValueAndValidity();
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

  fetchCountryList() {
    this.subs.sink = this.schoolService.getCountry().subscribe(
      (list: any[]) => {
        console.log('COUTNRY LIST', list);
        // this.countryList = _.cloneDeep(list);
        this.countries = _.cloneDeep(list);
        if (this.countries && this.countries.length) {
          this.countryList = [];
          this.countries.forEach((item) => {
            const country = this.getTranslateCountry(item.name);
            this.countryList.push({ code: item.code, name: country, original: item.name });
          });
          this.countryList.sort((current, next) => current?.name?.localeCompare(next?.name));
          this.localizeCountryListener();
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

  fetchNationalityList() {
    this.subs.sink = this.studentService
      .getAllNationalities()
      .pipe(take(1))
      .subscribe((response) => {
        this.nationalList = response;
      });
  }

  phoneValidaton(e) {
    if (e && e.key) {
      if (!e.key.match(/[- ()0-9]+/)) {
        e.preventDefault();
      }
    }
  }

  getSchoolLogo() {
    this.isWaitingForResponse = true;
    if (!this.formDetail.candidateId) return;
    this.subs.sink = this.formFillingService.GetOneCandidate(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
          this.candidateData = res;
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

  openUploadWindow(quest) {
    if (this.disable || !quest.get('is_editable').value) {
      return;
    }
    quest.controls['answer'].markAsTouched();
    const file = this.uploadInput.nativeElement.click();
  }

  isMandatory(quest) {
    let display = false;

    if (quest.get('is_required').value && !quest.get('answer').value) {
      if (this.checkUploadImage) {
        display = true;
      }
      if (quest.get('is_required').value && !quest.get('answer').value) {
        this.isPhotoMandatory = true;
      } else {
        this.isPhotoMandatory = false;
      }
    } else if (quest.get('answer').value) {
      this.checkUploadImage = false;
      this.isPhotoMandatory = false;
    }
    return display;
  }
  
  getAddtionalQuestionFieldFormArray(segmentIndex): UntypedFormArray {
    return this.getSegmentFormarray().at(segmentIndex).get('additional_financial_supports') as UntypedFormArray;
  }

  getAddtionalQuestionFieldFormArrayForDialCode(segmentIndex): UntypedFormArray {
    return this.dialCodeSegmentArray?.at(segmentIndex)?.get('additional_financial_supports') as UntypedFormArray;
  }

  getAddtionalQuestionField(segmentIndex, questionIndex): UntypedFormArray {
    return this.getAddtionalQuestionFieldFormArray(segmentIndex).at(questionIndex).get('questions') as UntypedFormArray;
  }

  
  getAddtionalQuestionFieldForDialCode(segmentIndex, questionIndex): UntypedFormArray {
    return this.getAddtionalQuestionFieldFormArrayForDialCode(segmentIndex).at(questionIndex).get('questions') as UntypedFormArray;
  }

  changeModalityForm(segment, from?) {
    if (
      segment?.questions?.length &&
      this.modalityData?.method_of_payment !== 'sepa' &&
      this.fromModalityPayment &&
      this.formDetail?.formType === 'student_admission'
    ) {
      segment.questions = segment.questions.filter(
        (question) =>
          question.field_type !== 'student_iban' &&
          question.field_type !== 'student_bic' &&
          question.field_type !== 'student_acccount_holder_name' &&
          question.field_type !== 'financial_support_iban' &&
          question.field_type !== 'financial_support_bic' &&
          question.field_type !== 'financial_support_account_holder_name',
      );
      if ((!segment?.is_student_included && !segment.is_multiple_financial_support) || from === 'addStudent') {
        segment.questions = this.changePositionFS(segment.questions);
      }
    }
    return segment;
  }
  changePositionFS(questions) {
    let questionsFS;
    if (
      questions?.length &&
      this.modalityData?.method_of_payment !== 'sepa' &&
      this.fromModalityPayment &&
      this.formDetail?.formType === 'student_admission'
    ) {
      questionsFS = questions.map((question, index) => {
        if (index === 0 && question.field_position === 'right') {
          question.field_position = 'left';
        } else if (index % 2 === 0) {
          question.field_position = 'left';
        } else {
          question.field_position = 'right';
        }
        return question;
      });
    } else {
      questionsFS = questions;
    }
    return questionsFS;
  }

  addMultipleFinancialSupport(segmentIndex, questionIndex) {
    if (!this.studentAsFinancialSupport) {
      this.getQuestionFieldFormArray(segmentIndex).clear();
    }
    const questionArray = _.cloneDeep(this.getQuestionFieldFormArray(segmentIndex));
    this.getAddtionalQuestionFieldFormArray(segmentIndex).push(this.initQuestionAddtional());
    this.getAddtionalQuestionFieldFormArrayForDialCode(segmentIndex).push(this.initQuestionAddtional());

    // Check length questionIndex if length from addtional > 0 it will - 1
    if (this.getAddtionalQuestionFieldFormArray(segmentIndex).length === 0) {
      this.questionIndex = 0;
    } else {
      this.questionIndex = this.getAddtionalQuestionFieldFormArray(segmentIndex).length - 1;
    }
    console.log('cek question', this.questionIndex);

    // get from step data to get both of modality_question_type financial support and student
    let formData = _.cloneDeep(this.stepData);
    let questionFinancial = formData.segments.map((seg) => {
      if (seg) {
        seg = this.changeModalityForm(seg);
      }
      return seg.questions;
    });

    // flatting array and filtering only get modality_question_type equal financial support
    let questionsValueForm: any[] = _.cloneDeep(questionFinancial.flat());
    const questionFs = questionsValueForm.filter((question) => question.modality_question_type === 'financial_support');
    questionsValueForm = this.changePositionFS(questionFs);

    // Add control based on how many question length
    questionsValueForm.forEach((element, index) => {
      this.getAddtionalQuestionField(segmentIndex, this.questionIndex).push(this.initQuestionFieldForm());
      this.getAddtionalQuestionFieldForDialCode(segmentIndex, this.questionIndex).push(this.initQuestionDialCodeForm());
      // Add control for options if question has options
      if (element && element.options && element.options.length > 0) {
        element.options.forEach((option, optionIdx) => {
          const options = this.getAddtionalQuestionField(segmentIndex, this.questionIndex).at(index).get('options') as UntypedFormArray;
          const group = this.initOptionFieldForm();
          options.push(group);
        });
      }
      // Parent child options
      if (element?.parent_child_options?.length) {
        element.parent_child_options.forEach((parentChildOption1, pcIndex1) => {
          const parentChildArray1 = this.getAddtionalQuestionField(segmentIndex, this.questionIndex)
            .at(index)
            .get('parent_child_options') as UntypedFormArray;
          if (!parentChildArray1) {
            return;
          }
          parentChildArray1.push(this.initParentChildOptionForm());
          if (parentChildOption1?.questions?.length) {
            parentChildOption1.questions.forEach((pc1Question, pc1QuestionIndex) => {
              const pcQuestionArray1 = parentChildArray1.at(pcIndex1).get('questions') as UntypedFormArray;
              pcQuestionArray1.push(this.initParentChildOptionQuestionForm());

              if (pc1Question?.parent_child_options?.length) {
                this.recursiveParentChild(pcQuestionArray1, pc1Question, pc1QuestionIndex);
              }
            });
          }
        });
      }
    });

    // Reset value
    let data;
    for (const [index, element] of questionsValueForm.entries()) {
      data = element;
      data.answer = '';
      data.answer_date = {
        date: null,
        time: null,
      };
      data.answer_number = null;
      data.answer_multiple = [];
      data.answer_duration = '00:00:00';
      data.answer_time = '00:00';
      data.multiple_option_validation = {
        condition: null,
        custom_error_text: null,
        number: null,
      };
      data.numeric_validation = {
        condition: '',
        custom_error_text: '',
        max_number: null,
        min_number: null,
        number: null,
      };

      data.text_validation = {
        condition: null,
        custom_error_text: null,
        number: null,
      };

      // remove some field because we get from step data that are not in form control
      if (data.final_message_question) delete data.final_message_question;
      if (data.document_validation_status) delete data.document_validation_status;
      if (data.is_document_validated) delete data.is_document_validated;
      if (data.is_router_on) delete data.is_router_on;
      if (data.ref_id) delete data.ref_id;
      if (data.special_question) delete data.special_question;
    }

    this.getAddtionalQuestionField(segmentIndex, this.questionIndex).patchValue(questionsValueForm);
    this.questionIndex++;
    console.log('_test', this.getAddtionalQuestionFieldFormArray(segmentIndex).controls);
    console.log('cek form', this.templateStepForm.value);
    this.addArrayButtonEmailandSave(this.templateStepForm.value);
  }

  removeMultipleFinancialSupport(segmentIndex, questionIndex) {
    this.getAddtionalQuestionFieldFormArray(segmentIndex).removeAt(questionIndex);
    this.getAddtionalQuestionFieldFormArrayForDialCode(segmentIndex)?.removeAt(questionIndex);
    this.questionIndex--;
    this.getCostCoverage(segmentIndex);
    this.addArrayButtonEmailandSave(this.templateStepForm.value);
  }

  getNextAddtionalQuestionField(segmentIndex, addtionalIndex, questionIndex) {
    return this.getAddtionalQuestionField(segmentIndex, addtionalIndex).at(questionIndex + 1);
  }

  getPreviousAddtionalQuestionField(segmentIndex, addtionalIndex, questionIndex) {
    const idx = questionIndex === 0 ? 0 : questionIndex - 1;
    return this.getAddtionalQuestionField(segmentIndex, addtionalIndex).at(idx);
  }

  getTranslateCountry(name) {
    if (name) {
      const value = this.translate.instant('COUNTRY.' + name);
      return value;
    }
  }

  localizeCountryListener() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.countries && this.countries.length) {
        this.countryList = [];
        this.countries.forEach((item) => {
          const country = this.getTranslateCountry(item.name);
          this.countryList.push({ code: item.code, name: country, original: item.name });
        });
      }
    });
  }

  checkFinancer(selectedFinancer, segmentIndex, quesIndex) {
    const found = this.listFinance.find((res) => res.name === selectedFinancer);
    if (found && found.type === 'company') {
      this.isWaitingForResponse = true;
      this.selectedFinancer = found._id;
      this.getOneCompany(this.selectedFinancer, segmentIndex, quesIndex);
      this.getAllMentor(this.selectedFinancer, segmentIndex, quesIndex);
      this.getAllUserCEO(this.selectedFinancer, segmentIndex, quesIndex);
    } else {
      if (this.getAllQuestionFieldFormArray('company_siret')) {
        this.patchCompanyData(this.getAllQuestionFieldFormArray('company_siret'), null, true);
      }
      if (this.getAllQuestionFieldFormArray('company_address')) {
        this.patchCompanyDataAddress(this.getAllQuestionFieldFormArray('company_address'), null, true);
      }
      if (this.getAllQuestionFieldFormArray('mentor_function')) {
        this.patchCompanyMentor(this.getAllQuestionFieldFormArray('mentor_function'), null, true);
      }
      if (this.getAllQuestionFieldFormArray('legal_status')) {
        this.patchCompanyDataLegalStatus(this.getAllQuestionFieldFormArray('legal_status'), null, true);
      }

      this.resetCEO(this.getQuestionFieldFormArray(segmentIndex), null, true);
      this.resetMentor(this.getQuestionFieldFormArray(segmentIndex), null, true);

      this.ceoList = [];
      this.mentorList = [];
    }
  }

  resetCEO(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'ceo' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  resetMentor(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'mentor' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  getOneCompany(_id, segmentIndex, index) {
    this.subs.sink = this.contractService.GetOneCompany(_id).subscribe((res) => {
      this.isWaitingForResponse = false;
      if (res) {
        const typeField = this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value;

        if (typeField === 'financer') {
          if (this.getAllQuestionFieldFormArray('company_siret')) {
            this.patchCompanyData(this.getAllQuestionFieldFormArray('company_siret'), res);
          }
          if (this.getAllQuestionFieldFormArray('company_address')) {
            this.patchCompanyDataAddress(this.getAllQuestionFieldFormArray('company_address'), res);
          }
          if (this.getAllQuestionFieldFormArray('legal_status')) {
            this.patchCompanyDataLegalStatus(this.getAllQuestionFieldFormArray('legal_status'), res);
          }
        }
      }
    });
  }

  getAllQuestionFieldFormArray(field_type?) {
    const formList = this.getSegmentFormarray();
    let segmentIndex;
    formList.value.forEach((value, segIndex) => {
      value.questions.forEach((question) => {
        if (question.field_type === field_type) {
          segmentIndex = segIndex;
        }
      });
    });
    if (segmentIndex) {
      return this.getQuestionFieldFormArray(segmentIndex);
    }
  }

  getAllMentor(_id, segmentIndex, index, selectedMentor?) {
    this.subs.sink = this.contractService.GetAllUsersMentorCompany(_id, true, ['6278e027b97bfb30674e76af']).subscribe((res) => {
      if (res) {
        this.mentorList = res;
        this.mentorList = this.mentorList.sort((a, b) => a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase()));

        let found;
        if (selectedMentor) {
          found = res.find((response) => selectedMentor.includes(response.last_name) && selectedMentor.includes(response.first_name));
        }
        const typeField = this.getQuestionFieldFormArray(segmentIndex).at(index).get('field_type').value;
        if (found) {
          if (typeField === 'mentor') {
            this.patchCompanyMentor(this.getQuestionFieldFormArray(segmentIndex), found);
          }
        }
      }
    });
  }

  getSectorDropdown(candidate_school_ids, campuses, levels, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      // Reset data
      this.specialityList = [];

      this.resetSector(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredLevel = this.levelList.find((res) => res.name === levels);
    this.selectedLevelId = filteredLevel._id;

    const filter = {
      candidate_school_ids: [candidate_school_ids],
      campuses: [campuses],
      levels: [this.selectedLevelId],
    };

    this.subs.sink = this.fcContractService.getAllSectorFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.sectorList = res;
      }
    });
  }

  getCampusDropdown(school_id, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      // Reset data
      this.campusList = [];
      this.levelList = [];
      this.sectorList = [];
      this.specialityList = [];

      this.resetCampus(this.getQuestionFieldFormArray(segmentIndex));
      this.resetLevel(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSector(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredSchool: any = this.schoolList.find((res) => res.short_name === school_id);
    this.selectedSchoolId = filteredSchool._id;

    if (filteredSchool) {
      this.campusList = filteredSchool.campuses;
      this.campusList = this.campusList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    } else {
      this.campusList = [];
    }
  }

  resetCampus(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'campus') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  resetLevel(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'level') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  resetSector(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'sector') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  resetSpeciality(form) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'speciality') {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    form.at(indexFound).patchValue(data);
    form.updateValueAndValidity();
  }

  patchCompanyMentor(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'mentor_function' && !reset) {
        data = element;
        data.answer = dataForm && dataForm.position ? dataForm.position : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'mentor_function' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyData(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'company_siret' && !reset) {
        data = element;
        data.answer = dataForm && dataForm.no_RC ? dataForm.no_RC : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'company_siret' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyDataLegalStatus(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'legal_status' && !reset) {
        data = element;
        data.answer = dataForm && dataForm.legal_status ? dataForm.legal_status : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'legal_status' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  patchCompanyDataAddress(form, dataForm, reset?) {
    let data;
    let indexFound;
    for (const [index, element] of form.value.entries()) {
      if (element.field_type === 'company_address' && !reset) {
        data = element;
        data.answer =
          dataForm && dataForm.company_addresses && dataForm.company_addresses.length > 0 ? dataForm.company_addresses[0].address : null;
        indexFound = index;
        break;
      } else if (element.field_type === 'company_address' && reset) {
        data = element;
        data.answer = null;
        indexFound = index;
        break;
      }
    }
    if (data) {
      form.at(indexFound).patchValue(data);
      form.updateValueAndValidity();
    }
  }

  getAllUserCEO(_id, segmentIndex, quesIndex) {
    this.subs.sink = this.contractService.GetAllUsersCEOCompany(['6278e02eb97bfb30674e76b0'], _id).subscribe((res) => {
      if (res) {
        this.ceoList = res;
        this.ceoList = this.ceoList.sort((a, b) => a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase()));
      }
    });
  }

  getSubjectDropdown() {
    this.subs.sink = this.contractService.getAllSubjectsDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.subjectsList = resp;
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

  getAllFinancement() {
    if (!this.formDetail.candidateId || !this.candidateData) return;
    const filter = {
      candidate_id: this.formDetail.candidateId,
      admission_process_id:
        this.candidateData && this.candidateData.admission_process_id ? this.candidateData.admission_process_id._id : '',
    };

    this.subs.sink = this.contractService.getAllAdmissionFinancements(filter).subscribe((res) => {
      if (res) {
        const result = [];
        if (res && res.length > 0) {
          res.forEach((element, index) => {
            if (element && element.candidate_id && index === 0) {
              result.push(element.candidate_id);
            }
            if (element && element.organization_id) {
              result.push(element.organization_id);
            }
            if (element && element.company_branch_id) {
              result.push(element.company_branch_id);
            }
          });
          const mappedFinancer = result.map((map) => {
            let name;
            let type;
            if (map && map.last_name) {
              name = map.last_name;
              name = `${map.last_name} ${map.first_name}${
                map.civility && map.civility !== 'neutral' ? ' ' + this.translate.instant(map.civility) : ''
              }`;
              type = 'student';
            } else if (map && map.name) {
              name = map.name;
              type = 'organization';
            } else if (map && map.company_name) {
              name = map.company_name;
              type = 'company';
            }
            return {
              _id: map._id,
              name,
              type,
            };
          });

          const mappedTypeFinancement = result.map((map) => {
            if ((map && map.organization_type) || (map && map.company_name)) {
              let name;
              if (map && map.name) {
                name = map.organization_type;
              } else if (map && map.company_name) {
                name = 'Company';
              }
              if (name) {
                return name;
              }
            }
          });

          this.listFinance = mappedFinancer;
          this.listFinance = this.listFinance.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

          this.listTypeOfFinancement = mappedTypeFinancement.filter((fil) => fil);
          this.listTypeOfFinancement = _.uniqBy(this.listTypeOfFinancement);
          this.listTypeOfFinancement = this.listTypeOfFinancement.sort((a, b) => a.localeCompare(b));
        }
      }
    });
  }

  getProgramDropdown() {
    this.subs.sink = this.contractService.GetAllProgramsDropdown().subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.programs = resp;
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

  getSignalementEmailDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllSignalementEmail().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.email_sign = resp.filter((list) => list.signalement_email);
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

  getLevelDropdown(campus_id, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      // Reset data
      this.levelList = [];
      this.sectorList = [];
      this.specialityList = [];

      this.resetLevel(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSector(this.getQuestionFieldFormArray(segmentIndex));
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredCampus: any = this.campusList.find((res) => res.name === campus_id);
    this.selectedCampusId = filteredCampus._id;

    if (filteredCampus) {
      this.levelList = filteredCampus.levels;
      this.levelList = this.levelList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    } else {
      this.levelList = [];
    }
  }

  getSpecialityDropdown(candidate_school_ids, campuses, levels, sectors, segmentIndex, fromPopulate?) {
    if (!fromPopulate) {
      this.resetSpeciality(this.getQuestionFieldFormArray(segmentIndex));
    }

    const filteredSector = this.sectorList.find((res) => res.name === sectors);

    const filter = {
      candidate_school_ids: [candidate_school_ids],
      campuses: [campuses],
      levels: [levels],
      sectors: [filteredSector._id],
    };

    this.subs.sink = this.fcContractService.getAllSpecialityFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.specialityList = res;
      }
    });
  }

  getSchoolDropdown() {
    // Reset data
    this.campusList = [];
    this.levelList = [];
    this.sectorList = [];
    this.specialityList = [];

    this.subs.sink = this.fcContractService.getAllSchoolFormFCContract().subscribe((res) => {
      if (res) {
        this.schoolList = res.sort((a, b) => a.short_name.toLowerCase().localeCompare(b.short_name.toLowerCase()));
      }
    });
  }

  getSectorDefaultDropdown() {
    const filter = null;
    this.subs.sink = this.fcContractService.getAllSectorFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.sectorList = res;
      }
    });
  }

  getSpecialityDefaultDropdown() {
    const filter = null;
    this.subs.sink = this.fcContractService.getAllSpecialityFormFCContract(filter).subscribe((res) => {
      if (res) {
        this.specialityList = res;
      }
    });
  }

  getOneCandidate() {
    this.subs.sink = this.formBuilderService.getOneCandidateAdmission(this.formDetail.candidateId).subscribe(
      (res) => {
        if (res) {
          this.candidateData = res;
          if (this.candidateData) {
            this.getAllFinancement();
          }
        }
      },
      (err) => {
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
      },
    );
  }

  getCostCoverage(segmentIndex) {
    const studentCostQuestionGroup = this.getQuestionFieldFormArray(segmentIndex).controls.find(
      (control) => control.get('field_type').value === 'student_cost',
    );
    const additionalFinancialSupportsFormArray = this.getAddtionalQuestionFieldFormArray(segmentIndex);
    const costs = additionalFinancialSupportsFormArray.controls.map((control) => {
      const question = control.get('questions') as UntypedFormArray;
      const costControl = question.controls.find((controls) => controls.get('field_type').value === 'financial_support_cost');
      if (costControl) {
        return Number(costControl.get('answer').value);
      } else {
        return 0;
      }
    });
    let costCoverage = this.initialCostCoverage;
    let max = 0;
    this.maxCostCoverage = false;
    this.minCostCoverage = false;
    const studentPayByThemself =
      !this.studentAsFinancialSupport &&
      !this.stepData?.segments[0]?.is_multiple_financial_support &&
      this.stepData?.segments?.length === 1;
    if (this.fromModalityPayment && studentPayByThemself) {
      const studentCost = studentCostQuestionGroup.get('answer').getRawValue();
      this.invalidCost = false;
      this.minCostCoverage = false;
      this.maxCostCoverage = false;
      costCoverage = costCoverage - studentCost;
      if (costCoverage < 0) {
        this.invalidCost = true;
        this.maxCostCoverage = true;
      } else if (costCoverage > 0) {
        this.invalidCost = true;
        this.minCostCoverage = true;
      }
    } else if (this.studentAsFinancialSupport) {
      if (costs && costs.length) {
        costs.forEach((cost) => {
          if (cost) {
            costCoverage = costCoverage - cost;
            if (costCoverage < 0) {
              this.invalidCost = true;
            } else {
              this.invalidCost = false;
            }
          } else {
            this.invalidCost = false;
          }
        });
      }
      if (studentCostQuestionGroup && costCoverage >= 0) {
        studentCostQuestionGroup.get('answer').setValue(costCoverage.toFixed(2));
        if(costCoverage < 20) {
          this.isValidCostCoverageAfterRecalculate = false;
        } else {
          this.isValidCostCoverageAfterRecalculate = true;
        }
      } else if(studentCostQuestionGroup && costCoverage < 0) {
        studentCostQuestionGroup.get('answer').setValue(0);
        this.isValidCostCoverageAfterRecalculate = false;
      }
      this.checkInvalidValue();
    } else {
      if (costs && costs.length) {
        costs.forEach((cost) => {
          if (cost) {
            max = max + cost;
            if (max < costCoverage) {
              this.minCostCoverage = true;
              this.maxCostCoverage = false;
            } else if (max > costCoverage) {
              this.minCostCoverage = false;
              this.maxCostCoverage = true;
            } else {
              this.minCostCoverage = false;
              this.maxCostCoverage = false;
            }
          } else {
            this.minCostCoverage = true;
            this.maxCostCoverage = false;
          }
        });
      }
      this.checkInvalidValue();
    }
  }

  checkInvalidValue() {
    if (this.minCostCoverage) {
      this.minCostCoverage = true;
      this.maxCostCoverage = false;
      this.invalidCost = false;
    } else if (this.maxCostCoverage) {
      this.minCostCoverage = false;
      this.maxCostCoverage = true;
      this.invalidCost = false;
    } else if (this.invalidCost) {
      this.minCostCoverage = false;
      this.maxCostCoverage = false;
      this.invalidCost = true;
    } else {
      this.minCostCoverage = false;
      this.maxCostCoverage = false;
      this.invalidCost = false;
    }
  }

  addStudent(segmentIndex) {
    // Reset questionindex
    this.questionIndex = 0;

    this.studentAsFinancialSupport = true;
    this.templateStepForm.markAsPristine();
    this.templateStepForm.markAsUntouched();

    // Filter question only get modality_question_type
    let formData = _.cloneDeep(this.stepData);
    formData.segments = formData.segments.map((seg) => {
      return {
        segment_title: seg.segment_title,
        additional_financial_supports: seg.additional_financial_supports,
        is_multiple_financial_support: seg.is_multiple_financial_support,
        is_selected_modality: seg.is_selected_modality,
        is_student_included: seg.is_student_included,
        questions: seg.questions.filter((question) => question.modality_question_type === 'student'),
      };
    });

    // re initialize template form for only get question with modality_question_type
    this.getQuestionFieldFormArray(segmentIndex).clear();
    this.initQuestionFieldForm();
    this.populateStepData(formData, 'addStudent');

    // this.setStudentValidator();
    // this.populateStudentInformation();
    this.getCostCoverage(segmentIndex);
  }

  removeStudent(segmentIndex) {
    this.studentAsFinancialSupport = false;
    this.isValidCostCoverageAfterRecalculate = true;
    this.templateStepForm.markAsPristine();
    this.templateStepForm.markAsUntouched();

    this.initQuestionFieldForm();
    this.populateStepData(this.stepData);
    this.getQuestionFieldFormArray(segmentIndex).clear();
    // this.removeStudentValidator();
    // this.unpopulateStudentInformation();
    this.getCostCoverage(segmentIndex);
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  validateDateKeyInput(e: KeyboardEvent) {
    return e.key === 'Tab';
  }

  dateBirthValueChange(segmentIndex, quesIndex) {
    const data = this.getQuestionFieldFormArray(segmentIndex).at(quesIndex).get('answer_date').value;
    this.getQuestionFieldFormArray(segmentIndex).at(quesIndex).get('answer_date').clearValidators();
    this.getQuestionFieldFormArray(segmentIndex).at(quesIndex).get('answer_date').updateValueAndValidity();
    this.getQuestionFieldFormArray(segmentIndex).at(quesIndex).get('answer').setValue(data);

    console.log(this.getQuestionFieldFormArray(segmentIndex).at(quesIndex));
    console.log(data);
    console.log(this.getQuestionFieldFormArray(segmentIndex).at(quesIndex)['controls']);
  }
  checkValidation(segmentIndex, quesIndex) {
    if (
      (this.getQuestionFieldFormArray(segmentIndex)?.at(quesIndex)?.get('modality_question_type')?.value === 'student' &&
        this.getSegmentFormarray()?.at(segmentIndex)?.get('is_student_included')?.value) ||
      (!this.getSegmentFormarray()?.at(segmentIndex)?.get('is_multiple_financial_support')?.value &&
        !this.getSegmentFormarray()?.at(segmentIndex)?.get('is_student_included')?.value)
    ) {
      return true;
    } else {
      return false;
    }
  }

  getMinimumDateOfBirth() {
    const now = new Date();
    return new Date(now.setFullYear(now.getFullYear() - 14));
  }

  addArrayButtonEmailandSave(formValue) {
    this.disableButtonEmail = [];
    this.disableButtonSave = [];
    formValue?.segments.forEach((data, segIndex) => {
      if (data?.questions?.length) {
        data?.questions?.forEach((quest, qindex) => {
          if (
            (quest?.field_type?.includes('email') || quest?.field_type?.includes('school_mail')) &&
            quest?.field_type !== 'emergency_contact_email'
          ) {
            const form = {
              indexSegment: segIndex,
              index: qindex,
              type: quest?.field_type,
              answerType: quest?.answer_type,
              value: true,
            };

            const btnSave = {
              indexSegment: segIndex,
              index: qindex,
              type: quest?.field_type,
              answerType: quest?.answer_type,
              value: false,
            };

            this.disableButtonEmail.push(form);
            this.disableButtonSave.push(btnSave);
          }
        });
      }

      if (data?.additional_financial_supports?.length) {
        data?.additional_financial_supports?.forEach((addtionalData, addIndex) => {
          addtionalData?.questions.forEach((addQuest, addQuestIndex) => {
            if (
              (addQuest?.field_type?.includes('email') ||
                addQuest?.field_type?.includes('school_mail')) &&
              addQuest?.field_type !== 'emergency_contact_email'
            ) {
              const form = {
                indexSegment: segIndex,
                index: addQuestIndex,
                addIndex,
                type: addQuest?.field_type,
                answerType: addQuest?.answer_type,
                value: true,
              };

              const btnSave = {
                indexSegment: segIndex,
                index: addQuestIndex,
                addIndex,
                type: addQuest?.field_type,
                answerType: addQuest?.answer_type,
                value: false,
              };

              this.disableButtonEmail.push(form);
              this.disableButtonSave.push(btnSave);
            }
          });
        });
      }
    });
  }

  checkEmailUnique(segmentIndex, quesIndex, formSelected, type, addtionalIndex) {
    if (type === 'financialSupport') {
      this.subs.sink = formSelected
        .get('answer')
        .valueChanges.pipe(debounceTime(400))
        .subscribe((resp) => {
          if (resp) {
            this.disableButtonSave = this.disableButtonSave.map((ele) => {
              if (
                ele?.indexSegment === segmentIndex &&
                ele?.index === quesIndex &&
                ele?.addIndex === addtionalIndex &&
                (ele?.type === formSelected?.get('field_type').value || ele?.answerType === formSelected?.get('answer_type').value)
              ) {
                ele.value = true;
              }
              return ele;
            });

            this.disableButtonEmail = this.disableButtonEmail.map((ele) => {
              if (
                ele?.indexSegment === segmentIndex &&
                ele?.index === quesIndex &&
                ele?.addIndex === addtionalIndex &&
                (ele?.type === formSelected?.get('field_type').value || ele?.answerType === formSelected?.get('answer_type').value)
              ) {
                ele.value = false;
              }
              return ele;
            });
          }
        });
    } else {
      this.subs.sink = formSelected
        .get('answer')
        .valueChanges.pipe(debounceTime(400))
        .subscribe((resp) => {
          if (resp) {
            this.disableButtonSave = this.disableButtonSave.map((ele) => {
              if (
                ele?.indexSegment === segmentIndex &&
                ele?.index === quesIndex &&
                (ele?.type === formSelected?.get('field_type').value || ele?.answerType === formSelected?.get('answer_type').value)
              ) {
                ele.value = true;
              }
              return ele;
            });

            this.disableButtonEmail = this.disableButtonEmail.map((ele) => {
              if (
                ele?.indexSegment === segmentIndex &&
                ele?.index === quesIndex &&
                (ele?.type === formSelected?.get('field_type').value || ele?.answerType === formSelected?.get('answer_type').value)
              ) {
                ele.value = false;
              }
              return ele;
            });
          }
        });
    }
  }

  disableButtonEmailNotValidated(segmentIndex, quesIndex, formSelected, type, addtionalIndex) {
    if (type === 'financialSupport') {
      const found = this.disableButtonEmail.find((resp) => {
        if (
          resp?.indexSegment === segmentIndex &&
          resp?.index === quesIndex &&
          resp?.addIndex === addtionalIndex &&
          (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
        ) {
          return resp;
        }
      });
      if (found) {
        return found?.value;
      } else {
        return true;
      }
    } else {
      const found = this.disableButtonEmail.find((resp) => {
        if (
          resp?.indexSegment === segmentIndex &&
          resp?.index === quesIndex &&
          (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
        ) {
          return resp;
        }
      });
      if (found) {
        return found?.value;
      } else {
        return true;
      }
    }
  }

  checkEmailNotValidated() {
    const found = this.disableButtonSave.find((resp) => resp.value);
    if (found) {
      return found.value;
    } else {
      return false;
    }
  }

  verifyEmail(segmentIndex, quesIndex, formSelected, type, addtionalIndex) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.admissionService.verifyEmailUnique(formSelected?.get('answer').value, this.userId).subscribe(
      () => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo'),
          confirmButtonText: this.translate.instant('OK'),
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          this.isWaitingForResponse = false;
          if (type === 'financialSupport') {
            this.disableButtonSave = this.disableButtonSave.map((resp) => {
              if (
                resp?.indexSegment === segmentIndex &&
                resp?.index === quesIndex &&
                resp?.addIndex === addtionalIndex &&
                (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
              ) {
                resp.value = false;
              }
              return resp;
            });

            this.disableButtonEmail = this.disableButtonEmail.map((resp) => {
              if (
                resp?.indexSegment === segmentIndex &&
                resp?.index === quesIndex &&
                resp?.addIndex === addtionalIndex &&
                (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
              ) {
                resp.value = true;
              }
              return resp;
            });
          } else {
            this.disableButtonSave = this.disableButtonSave.map((resp) => {
              if (
                resp?.indexSegment === segmentIndex &&
                resp?.index === quesIndex &&
                (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
              ) {
                resp.value = false;
              }
              return resp;
            });

            this.disableButtonEmail = this.disableButtonEmail.map((resp) => {
              if (
                resp?.indexSegment === segmentIndex &&
                resp?.index === quesIndex &&
                (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
              ) {
                resp.value = true;
              }
              return resp;
            });
          }
        });
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (err['message'] === 'GraphQL error: Email already exists') {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('SWAL_USER_EXIST_DUMMY.TITLE'),
            text: this.translate.instant('SWAL_USER_EXIST_DUMMY.TEXT'),
            confirmButtonText: this.translate.instant('SWAL_USER_EXIST_DUMMY.BUTTON'),
          }).then(() => {
            if (type === 'financialSupport') {
              this.disableButtonSave = this.disableButtonSave.map((resp) => {
                if (
                  resp?.indexSegment === segmentIndex &&
                  resp?.index === quesIndex &&
                  (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
                ) {
                  resp.value = true;
                }
                return resp;
              });

              this.disableButtonEmail = this.disableButtonEmail.map((resp) => {
                if (
                  resp?.indexSegment === segmentIndex &&
                  resp?.index === quesIndex &&
                  (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
                ) {
                  resp.value = false;
                }
                return resp;
              });
            } else {
              this.disableButtonSave = this.disableButtonSave.map((resp) => {
                if (
                  resp?.indexSegment === segmentIndex &&
                  resp?.index === quesIndex &&
                  (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
                ) {
                  resp.value = true;
                }
                return resp;
              });

              this.disableButtonEmail = this.disableButtonEmail.map((resp) => {
                if (
                  resp?.indexSegment === segmentIndex &&
                  resp?.index === quesIndex &&
                  (resp?.type === formSelected?.get('field_type').value || resp?.answerType === formSelected?.get('answer_type').value)
                ) {
                  resp.value = false;
                }
                return resp;
              });
            }
          });
        }
      },
    );
  }
}
