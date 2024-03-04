import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudentsService } from 'app/service/students/students.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { UserService } from 'app/service/user/user.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-trombinoscope-pdf-dialog',
  templateUrl: './trombinoscope-pdf-dialog.component.html',
  styleUrls: ['./trombinoscope-pdf-dialog.component.scss'],
})
export class TrombinoscopePdfDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  isWaitingForResponse;
  isLoading = false;
  pdfForm: FormGroup;
  groupFilter: FormGroup;
  isSortedByGroup = false;
  programDataDropdown = [];
  currentProgram;
  sequences = [];
  listSequence = [];
  typeOfGroups = [];
  groups = [];
  preFilter = false;
  isPermission: any;
  currentUser: any;
  currentUserTypeId: any;

  constructor(
    private translate: TranslateService,
    private userService: AuthService,
    private fb: FormBuilder,
    private studentService: StudentsService,
    public dialogref: MatDialogRef<TrombinoscopePdfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public pdfData,
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser.entities.find((resp) => resp.type.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity.type._id;
    this.initForm();
    this.getProgramData();
  }

  getProgramData() {
    console.log('this.pdfData', this.pdfData);
    this.isWaitingForResponse = true;
    const filterValues = {
      scholar_season_id: this.pdfData.scholar_season_id,
      school_id: this.pdfData.school_id ? this.pdfData.school_id : null,
      campus: this.pdfData.campus ? this.pdfData.campus : null,
      level: this.pdfData.level ? this.pdfData.level : null,
      sector: this.pdfData.sector ? this.pdfData.sector : null,
      specialities: this.pdfData.speciality ? this.pdfData.speciality : null,
    };
    const userTypesLogins = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.subs.sink = this.studentService.getProgramDataTrombinoscope(filterValues, userTypesLogins).subscribe(
      (resp) => {
        this.programDataDropdown = _.cloneDeep(resp);

        // If there is only one Program, automatically choosing that program in the dropdown
        if (this.programDataDropdown.length === 1) {
          this.preFilter = true;
          if (this.pdfData.sequence) {
            this.pdfForm.get('sortings').setValue('groups');
            this.initFormGroupFilter();
          }
          this.setCurrentValue(this.programDataDropdown[0]);
        }
        this.isWaitingForResponse = false;
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

  initForm() {
    this.pdfForm = this.fb.group({
      program: [null, [Validators.required]],
      sortings: ['alpha_order'],
    });
  }

  initFormGroupFilter() {
    this.groupFilter = this.fb.group({
      sequence: [null, [Validators.required]],
      type_of_group: [null, [Validators.required]],
      group: [null, [Validators.required]],
      type_of_group_name: [null],
    });
    this.isSortedByGroup = true;
    this.groupFilter.markAsUntouched();
  }

  closeDialog() {
    this.dialogref.close();
  }

  selectSortedBy() {
    this.isSortedByGroup = false;
    this.groupFilter.reset();
    this.groupFilter.get('sequence').clearValidators();
    this.groupFilter.get('type_of_group').clearValidators();
    this.groupFilter.get('group').clearValidators();
    this.groupFilter.get('sequence').updateValueAndValidity();
    this.groupFilter.get('type_of_group').updateValueAndValidity();
    this.groupFilter.get('group').updateValueAndValidity();
  }

  setCurrentValue(program) {
    if (this.preFilter) {
      this.pdfForm.get('program').setValue(program._id);
    }
    if (program === 'All') {
      this.pdfForm.get('sortings').setValue('alpha_order');
      this.isSortedByGroup = false;
      this.groupFilter?.get('sequence')?.setValue(null);
      this.groupFilter?.get('type_of_group')?.setValue(null);
      this.groupFilter?.get('type_of_group_name')?.setValue(null);
      this.groupFilter?.get('group')?.setValue(null);
    }
    this.currentProgram = program;
    console.log('currentProgram', this.currentProgram);
    this.sequences = [];
    this.typeOfGroups = [];
    this.groups = [];
    let programData;
    if (this.preFilter) {
      programData = program;
    } else {
      programData = this.programDataDropdown.find((el) => el._id === program);
    }
    this.getSequenceDropdown(programData);
  }

  getSequenceDropdown(programData) {
    this.isLoading = true;
    const filter = {
      scholar_season_id: programData?.scholar_season_id ? programData.scholar_season_id._id : null,
      school_id: programData?.school_id ? programData.school_id._id : null,
      campus_id: programData?.campus ? programData.campus._id : null,
      level_id: programData?.level ? programData.level._id : null,
      speciality_id: programData?.speciality_id ? programData.speciality_id._id : null,
    };
    this.subs.sink = this.studentService.getAllProgramSequence(filter).subscribe((resp) => {
      if (resp && resp.length) {
        this.isLoading = false;
        this.sequences = _.cloneDeep(resp);
        this.sequences = _.sortBy(this.sequences, ['name']);
        this.listSequence = _.cloneDeep(resp);

        if (this.preFilter) {
          const sequence = this.pdfData.sequence ? this.pdfData.sequence : null;
          const typeOfGroup = this.pdfData.typeOfGroup ? this.pdfData.typeOfGroup : null;
          const group = this.pdfData.group ? this.pdfData.group : null;
          const typeOfGroupName = this.pdfData.typeOfGroup === 'class' ? 'class' : 'group';

          if (this.pdfForm.get('sortings').value === 'groups') {
            this.groupFilter.get('sequence').setValue(sequence);
            this.selectSequence();
            this.groupFilter.get('type_of_group').setValue(typeOfGroup);
            this.groupFilter.get('type_of_group_name').setValue(typeOfGroupName);
            this.selectTypeOfGroup();
            this.groupFilter.get('group').setValue(group);
          }

          this.preFilter = false;
        }
      } else {
        this.isLoading = false;
        this.sequences = [];
      }
    });
  }

  selectSequence() {
    const sequenceIdValue = this.groupFilter.get('sequence').value;
    this.typeOfGroups = [];
    this.groups = [];
    this.groupFilter.get('type_of_group').setValue(null);
    this.groupFilter.get('group').setValue(null);
    this.groupFilter.get('type_of_group_name').setValue(null);
    if (sequenceIdValue) {
      const selectedSequence = this.listSequence.find((seq) => seq._id === sequenceIdValue);
      if (selectedSequence && selectedSequence.program_sequence_groups && selectedSequence.program_sequence_groups.length) {
        selectedSequence.program_sequence_groups.forEach((element) => {
          this.typeOfGroups.push(...element.group_class_types);
        });
        this.typeOfGroups = _.sortBy(this.typeOfGroups, ['name']);
      }
    }
  }

  selectTypeOfGroup() {
    const typeOfGroupIdValue = this.groupFilter.get('type_of_group').value;
    this.groups = [];
    this.groupFilter.get('group').setValue(null);
    if (typeOfGroupIdValue === 'class') {
      this.groupFilter.get('type_of_group_name').setValue('class');
    } else {
      this.groupFilter.get('type_of_group_name').setValue('group');
    }

    if (typeOfGroupIdValue) {
      const sequenceIdValue = this.groupFilter.get('sequence').value;
      const selectedSequence = this.listSequence.find((seq) => seq._id === sequenceIdValue);

      if (typeOfGroupIdValue === 'class') {
        if (selectedSequence && selectedSequence.program_sequence_groups && selectedSequence.program_sequence_groups.length) {
          selectedSequence.program_sequence_groups.forEach((element) => {
            this.groups.push(...element.student_classes);
          });
        } else {
          this.groups = [];
        }
      } else {
        if (selectedSequence && selectedSequence.program_sequence_groups && selectedSequence.program_sequence_groups.length) {
          const groupClassTypes = [];
          selectedSequence.program_sequence_groups.forEach((element) => {
            groupClassTypes.push(...element.group_class_types);
          });

          if (groupClassTypes && groupClassTypes.length) {
            const selectedTypeOfGroup = this.typeOfGroups.find((type) => type._id === typeOfGroupIdValue);
            if (selectedTypeOfGroup && selectedTypeOfGroup.group_classes_id && selectedTypeOfGroup.group_classes_id.length) {
              this.groups.push(...selectedTypeOfGroup.group_classes_id);
            } else {
              this.groups = [];
            }
          }
        } else {
          this.groups = [];
        }
      }

      this.groups = _.sortBy(this.groups, ['name']);
      console.log('GROUPS', this.groups);
    }
  }

  createPayload() {
    const payload = this.groupFilter.value;
    if (payload && payload.type_of_group_name === 'class') {
      payload.type_of_group = null;
    }

    if (payload && payload.group === 'allClasses') {
      payload.group = null;
    }

    return payload;
  }

  validate() {
    if (this.pdfForm.invalid || (this.groupFilter && this.groupFilter.invalid)) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.pdfForm.markAllAsTouched();
      if (this.groupFilter && this.groupFilter.invalid) {
        this.groupFilter.markAllAsTouched();
      }
      return true;
    }

    const sortingMode = this.translate.instant('Sorting_by.' + this.pdfForm.get('sortings').value);
    const programId = this.pdfForm.get('program').value === 'All' ? null : this.pdfForm.get('program').value;
    const programData = this.programDataDropdown.find((el) => el._id === programId);
    let programName = '';
    if (programData && programData.program) {
      programName = programData.program;
    } else {
      programName = this.translate.instant('All');
    }
    Swal.fire({
      type: 'info',
      title: this.translate.instant('TrombinoscopePDF_S1.TITLE'),
      html: this.translate.instant('TrombinoscopePDF_S1.TEXT', { program_name: programName, user_sorting_selection: sortingMode }),
      confirmButtonText: this.translate.instant('TrombinoscopePDF_S1.BUTTON 1'),
      cancelButtonText: this.translate.instant('TrombinoscopePDF_S1.BUTTON 2'),
      showCancelButton: true,
    }).then((resp) => {
      if (resp.value) {
        const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];        
        this.isWaitingForResponse = true;
        const scholarSeasonId = this.pdfData?.scholar_season_id ? this.pdfData?.scholar_season_id : null;
        if (this.pdfForm.get('sortings').value === 'alpha_order') {
          if (!programId) {
            this.exportAllTrombinoscope(programId, userTypesList);
          } else {
            this.subs.sink = this.studentService.createPDFTrombinoscope(scholarSeasonId, programId, userTypesList).subscribe(
              (ressp) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogref.close('success');
                });
              },
              (error) => {
                this.isWaitingForResponse = false;
                this.handleCreatePDFTrombinoscopeError(error);
              },
            );
          }
        } else {
          const payload = this.createPayload();
          const sequence_id = payload.sequence ? payload.sequence : null;
          const type_of_group_name = payload.type_of_group_name ? payload.type_of_group_name : null;
          const type_of_group_id = payload.type_of_group ? payload.type_of_group : null;
          const group_or_class_id = payload.group ? payload.group : null;
          this.subs.sink = this.studentService
            .createPDFTrombinoscope(scholarSeasonId, programId, userTypesList, sequence_id, type_of_group_name, type_of_group_id, group_or_class_id)
            .subscribe(
              (ressp) => {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.dialogref.close('success');
                });
              },
              (error) => {
                this.isWaitingForResponse = false;
                this.handleCreatePDFTrombinoscopeError(error);
              },
            );
        }
      }
    });
  }

  handleCreatePDFTrombinoscopeError(error: any) {
    if (error?.message.toLowerCase().includes('student is not exist')) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TrombinoscopePDF_S2.TITLE'),
        text: this.translate.instant('TrombinoscopePDF_S2.TEXT'),
        confirmButtonText: this.translate.instant('TrombinoscopePDF_S2.BUTTON_1'),
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        this.dialogref.close();
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
        confirmButtonText: this.translate.instant('OK'),
      });
    }
  }
  exportAllTrombinoscope(programId, userTypesList) {
    const school_ids = this.pdfData?.school_id && this.pdfData?.school_id.length ? this.pdfData?.school_id : null;
    const campus_ids = this.pdfData?.campus && this.pdfData?.campus.length ? this.pdfData?.campus : null;
    const level_ids = this.pdfData?.level && this.pdfData?.level.length ? this.pdfData?.level : null;
    const sector_ids = this.pdfData?.sector && this.pdfData?.sector.length ? this.pdfData?.sector : null;
    const specialities = this.pdfData?.speciality && this.pdfData?.speciality.length ? this.pdfData?.speciality : null;
    const scholarSeasonId = this.pdfData?.scholar_season_id ? this.pdfData?.scholar_season_id : null;
    this.subs.sink = this.studentService
      .createPDFTrombinoscopeAll(scholarSeasonId, programId, userTypesList, school_ids, campus_ids, level_ids, sector_ids, specialities)
      .subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogref.close('success');
          });
        },
        (error) => {
          this.isWaitingForResponse = false;
          this.handleCreatePDFTrombinoscopeError(error);
        },
      );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
