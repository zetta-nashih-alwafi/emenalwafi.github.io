import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ContractService } from 'app/service/contract/contract.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AcademicKitService } from 'app/service/rncpTitles/academickit.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { catchError, concatMap, debounceTime, distinctUntilChanged, map, startWith, take, tap } from 'rxjs/operators';
import { Subject, concat, of } from 'rxjs';

@Component({
  selector: 'ms-add-contract-follow-up-dialog',
  templateUrl: './add-contract-follow-up-dialog.component.html',
  styleUrls: ['./add-contract-follow-up-dialog.component.scss'],
})
export class AddContractFollowUpDialogComponent implements OnInit {
  typeForm: UntypedFormGroup;
  public inputStudent$ = new Subject<string | null>();
  filteredStudent$: any;
  isLoadingFilter = false;
  private subs = new SubSink();
  templateId;
  alumniOptionPermision;
  signatoryUserList = [];
  displayTextError = false;
  isWaitingForResponse = false;
  isPermission: string[];
  currentUserTypeId: any;
  currentUser: any;
  candidate_admission_statuses = [
    'admission_in_progress',
    'engaged',
    'registered',
    'resigned',
    'resigned_after_engaged',
    'resigned_after_registered',
    'bill_validated',
    'deactivated',
    'report_inscription',
    'financement_validated',
    'mission_card_validated',
    'in_scholarship',
    'resignation_missing_prerequisites',
    'resign_after_school_begins',
    'no_show',
  ];
  candidateData = [];
  managerData = [];
  templateData = [];
  userTypeList = [];
  templateSelected = null;
  mergedSignatories: any[]; // the merged result of signatories per step of the selected template
  listSignatoryAuto = ['5fe98eeadb866c403defdc6c', '5a067bba1c0217218c75f8ab', '61ceb560688f572138e023b2', '617f64ec5a48fe2228518811','64a245893677852cf45c5763'];
  contractCompany = [];
  firstWhoCompleteForm:any;

  constructor(
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddContractFollowUpDialogComponent>,
    private utilService: UtilityService,
    public permission: PermissionService,
    private contractService: ContractService,
    private teacherService: TeacherContractService,
    private authService: AuthService,
    private academicService: AcademicKitService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    if (this.data && !this.data.candidate_id) {
      this.getDataCandidateFC();
    }
    this.getAllUserType();
    this.initFormContract();
    this.getContractManagerDropdown();
    this.getAllFormBuildersContract();
    this.initTypeAhead();
  }

  recheckStudent() {
    this.typeForm.get('contract_validator_signatory_status').value.forEach((val, index) => {
      if (val.user_type_id === '5a067bba1c0217218c75f8ab') {
        // userType is student
        const studentSelected =
          this.candidateData && this.candidateData.length
            ? this.candidateData.find((candidate) => candidate._id === this.typeForm.get('candidate_id').value)
            : null;
        this.signatoryUserList[index] = this.getFilterSignatoryUserIncludeStudent(
          val.user_type_id,
          index,
          studentSelected?.last_name.toLowerCase(),
        );
      } else if (val?.user_type_id === '6278e027b97bfb30674e76af') {
        this.getAllSignatoryUserForContractCompany(index);
      } else {
        this.signatoryUserList[index] = this.getFilterSignatoryUser(val.user_type_id, index);
      }
    });
  }

  recheckFC() {
    const fCContractManger = '64a245893677852cf45c5763';
    this.typeForm.get('contract_validator_signatory_status').value.forEach((val, index) => {
      if (val.user_type_id === fCContractManger) {
        this.signatoryUserList[index] = this.getFilterSignatoryUser(val.user_type_id, index);
      }
    });
  }

  getAllSignatoryUserForContractCompany(listIndex) {
    const id = this.data?.from === 'student_card' && this.data?.candidate_id ? this.data?.candidate_id : this.typeForm.get('candidate_id').value;
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.getAllUsersFinancementOfStudent(id).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.signatoryUserList[listIndex] = resp;
          this.contractCompany = _.cloneDeep(resp)
          this.contractCompany = this.contractCompany.map(list =>{
            const name  = list?.last_name + " " + list?.first_name + (list?.civility && list?.civility!=='neutral'?(" " +this.translate.instant(list.civility)) : '')
            return{
              ...list,
              name
            }
          })
        } else {
          this.contractCompany = [];
          this.signatoryUserList[listIndex] = resp;
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getAllUserType() {
    this.subs.sink = this.academicService.getAllUserTypesIncludeStudent().subscribe(
      (res) => {
        if (res) {
          this.userTypeList = res;
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
  initFormContract() {
    this.typeForm = this.fb.group({
      candidate_id: [this.data.candidate_id, [Validators.required]],
      user_id: [this.data.user_id],
      continuous_formation_manager_id: [this.data.continuous_formation_manager_id],
      admission_member_id: [this.data.admission_member_id],
      form_builder_id: [null, [Validators.required]],
      contract_manager_id: [null, [Validators.required]],
      user_type_id: [this.currentUserTypeId, [Validators.required]],
      contract_validator_signatory_status: this.fb.array([]),
    });
  }

  initSignatoryForm() {
    return this.fb.group({
      user_type_id: [null],
      user:[null],
      user_id: [null, [Validators.required]],
    });
  }

  pushSignatory() {
    this.getSignatoryArray().push(this.initSignatoryForm());
  }

  get signatoryArr() {
    return this.typeForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getSignatoryArray(): UntypedFormArray {
    return this.typeForm.get('contract_validator_signatory_status') as UntypedFormArray;
  }

  getContractManagerDropdown() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllFCContractManagerDropdown().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.managerData = resp;
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

  getAllFormBuildersContract() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.contractService.getAllFormBuildersContract().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.templateData = resp;
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

  getDataCandidateFC() {
    const filter: any = {
      candidate_admission_statuses: this.candidate_admission_statuses,
      type_of_formation_name: 'continuous',
      readmission_status: 'all_candidates',
    };
    // *************** limit display dropdown max 50 student
    const pagination = {
      limit: 50,
      page: 0,
    };
    this.isWaitingForResponse = true;
    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.contractService.getAllCandidates(userTypesList, filter, pagination).subscribe(
      (list) => {
        this.isWaitingForResponse = false;
        if (list) {
          this.candidateData = list;
          this.inputStudent$.next(null);
        }
      },
      (error) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  initTypeAhead() {
    this.filteredStudent$ = concat(
      of(this.candidateData),
      this.inputStudent$.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        concatMap((searchTxt: any) => {
          if (searchTxt && searchTxt.length > 2) {
            this.isLoadingFilter = true;
            const filter = {
              candidate_admission_statuses: this.candidate_admission_statuses,
              type_of_formation_name: 'continuous',
              readmission_status: 'all_candidates',
              candidate: searchTxt,
            };
            const pagination = {
              limit: 50,
              page: 0,
            };
            const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];

            return this.contractService.getAllCandidates(userTypesList, filter, pagination).pipe(
              take(1),
              tap((resp) => {
                this.isLoadingFilter = false;
                this.candidateData = resp;
              }),
              catchError((err) => {
                this.isLoadingFilter = false;
                return of([]);
              }),
            );
          } else {
            return of(this.candidateData);
          }
        }),
      ),
    );
  }

  onValidate() {
    if (this.typeForm.invalid) {
      this.displayTextError = true;
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.typeForm.markAllAsTouched();
      return true;
    } else {
      // loading for waiting mutation subscription
      const payload = this.typeForm.value;
      let signatoryVal = [];
      payload.contract_validator_signatory_status = payload.contract_validator_signatory_status.map((resp) => {
        return {
          user_type_id: resp.user_type_id,
          user_id: resp.user_id._id,
        };
      });
      signatoryVal = payload.contract_validator_signatory_status;
      const payloadFinal = _.cloneDeep(payload);
      this.isWaitingForResponse = true;
      this.subs.sink = this.contractService
        .sendFCContractProcess(
          payloadFinal.contract_manager_id,
          payloadFinal.candidate_id,
          payloadFinal.form_builder_id,
          payloadFinal.user_type_id,
          payloadFinal.contract_validator_signatory_status,
        )
        .subscribe(
          (list) => {
            this.isWaitingForResponse = false;
            if (list) {
              Swal.fire({
                type: 'success',
                title: 'Bravo!',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.dialogRef.close({...list, user_who_complete: this.firstWhoCompleteForm});
              });
            }
          },
          (error) => {
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
    }
  }
  selectedTemplate(data) {
    const signatory = this.typeForm.get('contract_validator_signatory_status').value;
    this.templateSelected = _.cloneDeep(data);
    if (signatory && signatory.length) {
      for (let i = signatory.length - 1; i >= 0; i--) {
        this.signatoryArr.removeAt(i);
      }
    }
    this.firstWhoCompleteForm = this.templateSelected?.steps[0].user_who_complete_step?.name;

    this.mergedSignatories =
      data && data.steps
        ? [].concat.apply(
            [],
            data.steps.map((step) => step.contract_signatory),
          )
        : [];
    if (this.mergedSignatories.length) {
      this.mergedSignatories = this.mergedSignatories.filter((list) => list && list._id);
      this.mergedSignatories = _.uniqBy(this.mergedSignatories, '_id');
      this.mergedSignatories.forEach((element) => {
        this.pushSignatory();
      });
      const contract_validator_signatory_status = this.mergedSignatories.map((resp) => {
        return {
          user_id: null,
          user_type_id: resp._id,
        };
      });
      this.typeForm.get('contract_validator_signatory_status').patchValue(contract_validator_signatory_status);
      this.recheckStudent();
      this.recheckFC();
    }
  }

  getFilterSignatoryUser(userType, listIndex, name?) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.GetAllUsers(userType, name).subscribe(
      (resp) => {

        if (resp && resp.length) {
          this.signatoryUserList[listIndex] = resp;
          const fCContractManagerID = "64a245893677852cf45c5763";
          if(userType === fCContractManagerID) {
            this.populateUserConnected(resp, listIndex, this.typeForm.get('contract_manager_id').value, userType);
          } else {
            this.populateUserConnected(resp, listIndex, this.typeForm.get('candidate_id').value, userType);
          }
        } else {
          this.signatoryUserList[listIndex] = resp;
        }
        this.isWaitingForResponse = false;
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
  getFilterSignatoryUserIncludeStudent(userType, listIndex, name?) {
    const userTypes = ['5a067bba1c0217218c75f8ab', '5fe98eeadb866c403defdc6c'];
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.GetAllUsersIncludeStudent(userTypes, name).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.signatoryUserList[listIndex] = resp;
          this.populateStudent(resp, listIndex, this.typeForm.get('candidate_id').value);
        }
        this.isWaitingForResponse = false;
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
  filterSignatoryUser(value, listIndex, userType) {
    if (value.length > 2 || value.length === 0) {
      const filterUser = this.utilService.simpleDiacriticSensitiveRegex(value.toLowerCase());
      // usertypeId student and candidate
      if (userType === '5a067bba1c0217218c75f8ab' || userType === '5fe98eeadb866c403defdc6c') {
        // userType is student
        this.getFilterSignatoryUserIncludeStudent(userType, listIndex, filterUser);
      } else if(userType !== '6278e027b97bfb30674e76af'){
        this.getFilterSignatoryUser(userType, listIndex, filterUser);
      }
    }

    if(userType === '6278e027b97bfb30674e76af'){
      const search = this.utilService.simpleDiacriticSensitiveRegex(value?.toLowerCase())?.toLowerCase()?.trim();
      if(search){
        this.signatoryUserList[listIndex] = this.contractCompany.filter((list) => list?.name?.toLowerCase().trim().includes(search));
      }else{
        this.signatoryUserList[listIndex] = this.contractCompany
      }
      this.getSignatoryArray().at(listIndex).get('user_id').patchValue(null);
    }
  }

  populateUserConnected(resp, indexStudent, candidateId, userType,from?) {
    if (indexStudent || indexStudent === 0) {
      const fCContractManger = '64a245893677852cf45c5763';
      let userIdSelected = null;
      if(userType === fCContractManger) {
        userIdSelected = this.managerData.find((res) => res?._id === candidateId);
      } else {
        userIdSelected = this.candidateData.find((res) => res._id === candidateId);
      }
      let found = null;
      if (
        userType === '61ceb560688f572138e023b2' &&
        this.data?.from === 'student_card' &&
        this.data?.candidate?.continuous_formation_manager_id?._id &&
        resp?.length
      ) {
        found = resp.find((ele) => ele._id === this.data?.candidate?.continuous_formation_manager_id?._id);
        if (!found) {
          found = this.data?.candidate?.continuous_formation_manager_id;
          this.signatoryUserList[indexStudent].push(found);
        }
      } else if (userIdSelected) {
        if (userType === '61ceb560688f572138e023b2') {
          found = resp.find((ele) => ele._id === userIdSelected?.continuous_formation_manager_id?._id);
        } else if (userType === '617f64ec5a48fe2228518811') {
          found = resp.find((ele) => ele._id === userIdSelected?.admission_member_id?._id);
        } else if(userType === fCContractManger) {
          found = this.managerData.find((ele) => ele?._id === userIdSelected?._id);
        }
      } else {
        found = null;
      }
      if (found) {
        this.getSignatoryArray().at(indexStudent).get('user_id').patchValue(found);
        this.getSignatoryArray().at(indexStudent).get('user').patchValue(found);
      } else {
        this.getSignatoryArray().at(indexStudent).get('user_id').patchValue(null);
      }
    }
  }
  selectedUser(indexStudent,value){
    this.getSignatoryArray().at(indexStudent).get('user_id').patchValue(value);
  }

  populateStudent(resp, indexStudent, candidateId,from?) {
    if (indexStudent || indexStudent === 0) {
      const userIdSelected = this.candidateData.find((res) => res._id === candidateId);
      let found = null;
      if (this.data?.from === 'student_card' && this.data?.candidate?.user_id?._id && resp?.length) {
        found = resp.find((ele) => ele._id === this.data?.candidate?.user_id?._id);
        if (!found) {
          found = this.data?.candidate?.user_id;
          this.signatoryUserList[indexStudent].push(found);
        }
      } else if (userIdSelected) {
        found = resp.find((ele) => ele._id === userIdSelected?.user_id?._id);
      } else {
        found = null;
      }
      if (found) {
        this.getSignatoryArray().at(indexStudent).get('user_id').patchValue(found);
        this.getSignatoryArray().at(indexStudent).get('user').patchValue(found);
      } else {
        this.getSignatoryArray().at(indexStudent).get('user_id').patchValue(null);
      }
    }
  }

  displayFullName(user): string {
    if (user) {
      const civility =
        user.civility && user.civility !== 'neutral'
          ? user.civility
            ? this.translate
              ? this.translate.instant(user.civility)
              : user.civility
            : ''
          : '';
      return user.last_name.toUpperCase() + ' ' + user.first_name + ' ' + civility;
    }
    return null;
  }

  getNameOfUserType(formCtrl, type) {
    let userType;
    const form = formCtrl.value;
    if (this.userTypeList && this.userTypeList.length) {
      if (form && type === 'validator') {
        userType = this.userTypeList.find((resp) => resp._id === form.validator);
      } else if (form && type === 'signatory') {
        userType = this.userTypeList.find((resp) => resp._id === form.user_type_id);
      }
    }
    const userTypeName = userType && userType.name ? this.translate.instant('USER_TYPES.' + userType.name) : '';
    return userTypeName;
  }
}
