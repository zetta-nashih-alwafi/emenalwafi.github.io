import { CustomValidators } from 'ng2-validation';
import { StudentsService } from './../../../service/students/students.service';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { UntypedFormGroup, Validators, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { AdmissionService } from 'app/service/admission/admission.service';

@Component({
  selector: 'ms-student-new-contact-tab-detail',
  templateUrl: './student-new-contact-tab-detail.component.html',
  styleUrls: ['./student-new-contact-tab-detail.component.scss'],
})
export class StudentNewContactTabDetailComponent implements OnInit {
  private subs = new SubSink();
  @Input() candidate_id: any;
  @Input() showFinacment;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  isWaitingForResponse = false;
  emergencyContact: UntypedFormGroup;
  legalRepresentative: UntypedFormGroup;
  relationList = ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other'];

  // *************** START OF property to store data of country dial code
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  @Input() countryCodeList: any[] = [];
  dialCodeControl = new UntypedFormControl(null, Validators.required);
  // *************** END OF property to store data of country dial code

  candidateData;
  emailSameStudent = false;
  constructor(
    private fb: UntypedFormBuilder,
    private userService: AuthService,
    private candidateService: CandidatesService,
    private translate: TranslateService,
    private studentsService: StudentsService,
    private authService: AuthService,
    private admissionService: AdmissionService,
  ) {}

  ngOnInit(): void {
    this.initEmergencyContact();
    this.getCandidateContact();
  }

  initEmergencyContact() {
    this.emergencyContact = this.fb.group({
      _id: [null],
      relation: [null, [Validators.required]],
      family_name: [null, [Validators.required]],
      name: [null, [Validators.required]],
      tele_phone: [null, [Validators.required, Validators.pattern('[- ()0-9]+')]],
      email: [null, [Validators.required, CustomValidators.email]],
      address: [null],
      city: [null],
      postal_code: [null],
      phone_number_indicative: [null, Validators.required],
    });

    this.legalRepresentative = this.fb.group({
      unique_id: [null],
      first_name: [null, [Validators.required]],
      last_name: [null, [Validators.required]],
      email: [null, [Validators.required, CustomValidators.email]],
      phone_number: [null, [Validators.required, Validators.pattern('[- +()0-9]+')]],
      parental_link: [null, [Validators.required]],
      address: [null],
      city: [null],
      postal_code: [null],
    });
  }

  selectionDialCode(event) {
    this.emergencyContact?.get('phone_number_indicative')?.reset();
    this.emergencyContact?.get('phone_number_indicative')?.patchValue(event?.dialCode);
  }

  getCandidateContact() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.candidateService.getOneCandidate(this.candidate_id).subscribe(
      (response) => {
        this.isWaitingForResponse = false;
        const resp = _.cloneDeep(response);
        this.candidateData = _.cloneDeep(response);

        if (resp?.emergency_contacts?.length && resp?.emergency_contacts[0]) {
          let emergencyData = resp?.emergency_contacts[0];
          if (emergencyData?.parent_address?.length) {
            emergencyData['address'] = emergencyData?.parent_address[0]?.address;
            emergencyData['city'] = emergencyData?.parent_address[0]?.city;
            emergencyData['postal_code'] = emergencyData?.parent_address[0]?.postal_code;
          }
          if (emergencyData) {
            this.emergencyContact.patchValue(emergencyData);
            if (emergencyData?.phone_number_indicative) {
              const findIdx = this.countryCodeList?.findIndex((country) => country?.dialCode === emergencyData?.phone_number_indicative);
              if (findIdx >= 0) this.dialCodeControl?.patchValue(this.countryCodeList[findIdx]);
            }
          }
        }

        //************* it will be used when legalRepresentative
        if (resp?.is_emancipated_minor === false) {
          this.legalRepresentative.patchValue(resp?.legal_representative);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
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

  createPayload() {
    const payload = this.emergencyContact.value;
    const address = {
      address: payload.address,
      city: payload.city,
      postal_code: payload.postal_code,
    };
    delete payload.address;
    delete payload.city;
    delete payload.postal_code;
    delete payload._id;
    payload['parent_address'] = [address];

    return {
      emergency_contacts: [payload],
    };
  }

  createPayloadLegalRepresentative() {
    const payload = this.legalRepresentative.value;
    return {
      legal_representative: payload,
    };
  }
  onSave() {
    this.emailSameStudent = false;

    if (this.candidateData?.personal_information === 'legal_representative' && !this.showFinacment) {
      if (this.emergencyContact.invalid || this.legalRepresentative.invalid) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('FormSave_S1.TITLE'),
          html: this.translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        });
        this.emergencyContact.markAllAsTouched();
        this.legalRepresentative.markAllAsTouched();
        return;
      }
    } else {
      if (this.emergencyContact.invalid) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('FormSave_S1.TITLE'),
          html: this.translate.instant('FormSave_S1.TEXT'),
          confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
        });
        this.emergencyContact.markAllAsTouched();
        return;
      }
    }

    const payloadLegalRepresentative = this.createPayloadLegalRepresentative();
    const payload = this.createPayload();
    const payloadAllLegalRepresentative = {
      ...payloadLegalRepresentative,
      ...payload,
    };

    this.isWaitingForResponse = true;
    // *************** UAT_970 add flag to update status when there is update in student card there is no swal error display even required field is still empty
    const is_save_identity_student = true;

    if (this.candidateData?.personal_information === 'legal_representative' && !this.showFinacment) {
      const validateEmailStudent = this.legalRepresentative?.get('email').value === this.candidateService.candidateOneStduent.value.email;
      if (!validateEmailStudent) {
        this.subs.sink = this.studentsService
          .updateCandidate(this.candidate_id, payloadAllLegalRepresentative, is_save_identity_student)
          .subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.successfullUpdate();
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.authService.postErrorLog(err);
              this.unSuccessfullUpdate(err);
            },
          );
      } else {
        this.emailSameStudent = true;
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('SORRY'),
          text: this.translate.instant('This email has been used by the student'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });
      }
    } else {
      this.subs.sink = this.studentsService.updateCandidate(this.candidate_id, payload, is_save_identity_student).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.successfullUpdate();
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
          this.unSuccessfullUpdate(err);
        },
      );
    }
  }

  successfullUpdate() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo'),
      confirmButtonText: this.translate.instant('OK'),
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      this.getCandidateContact();
    });
  }

  unSuccessfullUpdate(err) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }
}
