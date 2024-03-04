import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, debounceTime, map, startWith, take, tap } from 'rxjs/operators';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-add-assign-teacher-dialog',
  templateUrl: './add-assign-teacher-dialog.component.html',
  styleUrls: ['./add-assign-teacher-dialog.component.scss'],
})
export class AddAssignTeacherDialogComponent implements OnInit, OnDestroy {
  isWaitingForResponse = false;
  assignTeacher: UntypedFormGroup;
  private subs = new SubSink();
  isPermission: any;
  currentUser: any;
  currentUserTypeId: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public parentData: any,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddAssignTeacherDialogComponent>,
    private teacherManagementService: TeacherManagementService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private router: Router,
    private userService: AuthService,
  ) {}

  max_group = this.parentData.data.number_of_group;
  type_of_intervention_list = [];
  teacherList = [];
  filteredTeacher: Observable<any[]>;
  teacherFilter = new UntypedFormControl('');
  isLoading: boolean = false;

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    console.log(this.parentData);
    this.initForm();
    this.getTeacherDropDown();
    this.initFilter();
  }

  getTeacherDropDown() {
    this.isLoading = true;
    const filter = null;
    const pagination = {
      limit: 10,
      page: 0
    }
    this.subs.sink = this.teacherManagementService.getTeacherDropdown(this.currentUserTypeId, filter, pagination).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.teacherList = _.cloneDeep(resp);
          this.filteredTeacher = _.cloneDeep(resp);
          this.isLoading = false;
        }
      },
      (error) => {
        console.error(error);
        this.isLoading = false
        this.userService.postErrorLog(error)
      },
    );
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  setTeacher(teacherId) {
    this.isWaitingForResponse = true;
    let legalEntitiesId = [];
    console.log("PARENTDATA", this.parentData.legalEntities);
    this.parentData.legalEntities.forEach(element => {
      element.legal_entities_id.forEach(legal => {
        console.log(legal)
        legalEntitiesId.push(legal._id);
      });
    });
    if (teacherId) {
      this.assignTeacher.get('teacher').setValue(teacherId);
      this.type_of_intervention_list = [];
      this.isWaitingForResponse = false;
    }
    const filter = {
      teacher_id: teacherId,
      legal_entity_id: [...legalEntitiesId]
    }
    this.subs.sink = this.teacherManagementService.getTypeOfInterventionAssignTeacher(filter).subscribe({
      next: (resp) => {
        this.type_of_intervention_list = _.cloneDeep(resp);
        console.log(this.type_of_intervention_list);
        this.isWaitingForResponse = false;
      },
      error: (error) => {
        console.log(error);
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(error)
      },
    });
  }

  initFilter() {
    this.subs.sink = this.teacherFilter.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      tap(() => this.isWaitingForResponse = true),
      concatMap((searchTxt) => {
        if (searchTxt) {
          const filter = {
            name: searchTxt,
          };
          const pagination = {
            limit: 10,
            page: 0
          }
          return this.teacherManagementService.getTeacherDropdown(this.currentUserTypeId, filter, pagination).pipe(take(1));
        } else {
          return of(this.teacherList);
        }
      }),
      catchError((err) => {
        this.isWaitingForResponse = false;
        return of([]);
      }),
      // map((searchTxt) =>
      //   this.teacherList.filter((teacher) => {
      //     const fullName = `${teacher.last_name} ${teacher.first_name}`
      //     return teacher && fullName.toLowerCase().includes(searchTxt ? searchTxt.toLowerCase() : '')
      //   }),
      // ),
    ).subscribe((resp) => {
      this.isWaitingForResponse = false;
      this.filteredTeacher = resp;
    });

    this.subs.sink = this.teacherFilter.valueChanges.subscribe((teacher) => {
      if(!teacher) {
        this.type_of_intervention_list = [];
        this.assignTeacher.get('teacher').setValue('');
        this.assignTeacher.get('type_of_intervention').setValue('');
        this.assignTeacher.get('type_of_intervention').markAsUntouched();
      }
    })
  }

  initForm() {
    this.assignTeacher = this.fb.group({
      teacher: ['', [Validators.required]],
      nb_of_group: [null, [Validators.required, Validators.max(this.max_group), this.cantBeZero()]],
      type_of_intervention: ['', [Validators.required]],
    });
  }

  cantBeZero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control.value;
      let isValid = true;
      if(group === 0){  
        isValid = false;
      }
      return isValid ? null : { zeroValue: true };
    };
  }

  addTeacher() {
    this.subs.sink = this.dialog
    .open(AddUserDialogComponent, {
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      width: '660px',
      data: { type: 'create-teacher' },
    })
    .afterClosed()
    .subscribe((resp) => {
      if (resp) {
        this.closeDialog();
        this.goToTeacherCardDetail(resp._id);
      }
    });
  }

  goToTeacherCardDetail(userId: string) {
    const params = { teacherId: userId, tab: 'details' };
    const url = this.router.createUrlTree(['users/teacher-list'], { queryParams: params });
    window.open(url.toString(), '_blank');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.checkFormValidity()) {
      return;
    }
    this.isWaitingForResponse = true;
    const payload = {
      teacher_subject_id: this.parentData.data ? this.parentData.data._id : '',
      teacher_id: this.assignTeacher.get('teacher').value,
      number_of_group: this.assignTeacher.get('nb_of_group').value,
      type_of_intervention_id: this.assignTeacher.get('type_of_intervention').value,
    };


    this.subs.sink = this.teacherManagementService.assignTeacherToSubject(payload).subscribe({
      next: (resp) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: 'Bravo!',
          confirmButtonText: 'OK',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        });

        this.dialogRef.close(true)
      },
      error: (error) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(error)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    });
  }

  checkFormValidity(): boolean {
    if (this.assignTeacher.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.assignTeacher.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
