import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { QuickSearchListDialogComponent } from '../quick-search-list-dialog/quick-search-list-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CoreService } from 'app/service/core/core.service';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'ms-quick-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './quick-search-bar.component.html',
  styleUrls: ['./quick-search-bar.component.scss'],
})
export class QuickSearchBarComponent implements OnInit, OnDestroy {
  @Input() isSearchContainerOpen: boolean;
  @Output() onSearchContainer: EventEmitter<boolean> = new EventEmitter();

  private subs = new SubSink();
  userSearch = new UntypedFormControl('');
  isEntityOperator = false;
  isAcadDirAdmin = false;
  isWaitingForResponse = false;
  currentUser: any;

  themeClass$ = 
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => url === '/home' ? '' : 'default-app-themed'),
    )

  constructor(
    public utilService: UtilityService,
    private userService: UserService,
    public dialog: MatDialog,
    public translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    public permissionService: PermissionService,
    public coreService: CoreService,
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');
      }
    });
  }

  onOpenSearchContainer() {
    this.userSearch.patchValue('');
    this.onSearchContainer.emit(!this.isSearchContainerOpen);
  }

  onPaste(event) {
    // ************ case email
    const value = event.clipboardData.getData('text/plain').trim();
    const regexMail =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmail = regexMail.test(value);

    // ************ case student number
    const regexStudentNumber = /^[aA]\d{5,}$/;
    const isStudentNumber = regexStudentNumber.test(value);

    // ************ Automatically Search if match condition
    if (isEmail) {
      this.quickSearchEmail('email', value);
    } else if (isStudentNumber) {
      this.quickSearchStudent(value, 'student');
    }
  }

  quickSearch(type: string) {
    this.isEntityOperator = this.utilService.isUserEntityOPERATOR();
    this.isAcadDirAdmin = this.utilService.isUserAcadDirAdmin();
    const lastName = this.userSearch.value;
    if (type && lastName) {
      if (type === 'user') {
        this.quickSearchUser(lastName, type);
      } else if (type === 'student') {
        this.quickSearchStudent(lastName, type);
      } else if (type === 'school') {
        this.quickSearchSchool(lastName, type);
      } else if (type === 'teacher') {
        this.quickSearchTeacher(lastName, type);
      } else if (type === 'mentor') {
        this.quickSearchMentor(lastName, type);
      } else if (type === 'tag') {
        this.quickSearchTag(lastName, type);
      } else if (type === 'email') {
        this.quickSearchEmail(type, lastName);
      }
    }
  }

  quickSearchTag(searchInput, type) {
    const tagFilter = {
      tag: searchInput,
      offset: 480,
      readmission_status: 'all_candidates',
      candidate_admission_statuses: [
        'admitted',
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
      ],
      exclude_crm_student: true,
    };
    const sorting = {
      // Search CandidateSortInput on playground
      candidate: 'asc', // sort candidate with last name
    };

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getTagQuickSearch(tagFilter, userTypesList, sorting).subscribe((resp) => {
      this.isWaitingForResponse = false;

      if (resp && resp.length) {
        // if school found, redirect to table active student with filtered on this school
        if (resp.length === 1) {
          this.goToStudent(resp[0]);
        } else {
          // ************ open pop up
          const temp = _.cloneDeep(resp);
          const dataStudents = temp.map((student) => {
            if (student && student._id) {
              student._id = student._id;
            } else {
              student._id = '';
            }
            return student;
          });
          this.dialog
            .open(QuickSearchListDialogComponent, {
              width: '750px',
              panelClass: 'no-padding-pop-up',
              disableClose: true,
              data: {
                data: dataStudents,
                type: type,
              },
            })
            .afterClosed()
            .subscribe((result) => {
              if (result) {
                console.log('_dialog', result);
              }
            });
        }
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Student not Found'),
        });
      }
    });
  }

  quickSearchEmail(type, email) {
    if (this.isAcadDirAdmin) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.authService.getUserById(this.currentUser?._id).subscribe(
        (resp) => {
          if (resp) {
            const schools = this.utilService.getAcademicAllAssignedSchool(resp?.entities);
            this.quickSearchEmailCallAPI(type, email, schools);
          } else {
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.swalError(err);
        },
      );
    } else {
      this.quickSearchEmailCallAPI(type, email);
    }
  }

  quickSearchEmailCallAPI(type, email, school?) {
    const schools = school ? school : [];
    const user_type = [
      '617f64ec5a48fe2228518812',
      '617f64ec5a48fe2228518813',
      '6299dc63ed8388461031b835',
      '617f64ec5a48fe2228518810',
      '617f64ec5a48fe2228518811',
      '60b4421aa16cc71e0c37132d',
      '617f64ec5a48fe2228518814',
      '617f64ec5a48fe2228518815',
      '61ceb560688f572138e023b2',
      '6209f2dc74890f0ecad16670',
      '617f64ec5a48fe222851880e',
      '617f64ec5a48fe222851880f',
      '61dd3ccff647127fd6bf65d7',
      '6009066808ed8724f5a54836',
      '5fe98eeadb866c403defdc6b',
      '5a067bba1c0217218c75f8ab',
      '5fe98eeadb866c403defdc6c',
      '6278e027b97bfb30674e76af',
      '6278e02eb97bfb30674e76b0',
    ];
    this.isWaitingForResponse = true;
    const pagination = {
      limit: 10,
      page: 0,
    };
    this.subs.sink = this.userService.getQuickSearchEmail(email, schools, user_type, pagination).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');

        if (resp?.length === 1 && resp[0]) {
          if (resp[0]?.candidate_id) {
            this.goToStudent(resp[0]?.candidate_id);
          } else {
            this.goToUser(resp[0]);
          }
        } else if (resp?.length > 1) {
          this.dialog.open(QuickSearchListDialogComponent, {
            width: '900px',
            panelClass: 'no-padding-pop-up',
            disableClose: true,
            data: {
              data: resp,
              type: type,
              filter: {
                email,
                schools,
                user_type,
              },
            },
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('User not Found'),
            allowEscapeKey: false,
            allowOutsideClick: false,
            allowEnterKey: false,
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');
        this.swalError(err);
      },
    );
  }

  quickSearchTeacher(lastName, type) {
    if (lastName) {
      const filter = {
        name: lastName,
      };
      const sorting = {
        // Search TeacherSortingInput on playground
        name: 'asc',
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.userService.quickSearchTeacher(filter, sorting).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp && resp.length === 1) {
            this.goToTeacher(resp[0]);
          } else if (resp && resp.length > 1) {
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: '750px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: 'teacher',
                },
              })
              .afterClosed()
              .subscribe((result) => {
                console.log('dialog teacher', result);
                // if (result) {
                //   this.goToTeacher(result);
                // }
              });
          } else {
            if (type === 'teacher') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Teacher not Found'),
              });
            }
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.swalError(err);
        },
      );
    }
  }

  quickSearchUser(searchInput: string, type: string) {
    const payload = {
      schools: [],
      exclude_company: true,
    };

    this.isWaitingForResponse = true;
    if (this.isAcadDirAdmin) {
      if(this.currentUser?._id){
        this.isWaitingForResponse = true;
        this.subs.sink = this.authService.getUserById(this.currentUser?._id).subscribe((ressp) => {
          this.isWaitingForResponse = false;
          const schools = this.utilService.getUserAllSchoolAcadDirAdmin();
          payload['schools'] = schools;
          payload['schools'] =
            payload['schools'] && payload['schools'].length
              ? payload['schools'].filter((resp) => resp?.school?._id).map((entity) => entity?.school?._id)
              : null;
          this.quickSearchUserCallAPI(searchInput, type, payload);
        });
      } else {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('User not Found'),
        });
      }
    } else {
      this.quickSearchUserCallAPI(searchInput, type, payload);
    }
  }

  quickSearchUserCallAPI(lastName: string, type: string, payload) {
    const sorting = { last_name: 'asc' };
    const user_type = [
      '617f64ec5a48fe2228518812',
      '617f64ec5a48fe2228518813',
      '6299dc63ed8388461031b835',
      '617f64ec5a48fe2228518810',
      '617f64ec5a48fe2228518811',
      '60b4421aa16cc71e0c37132d',
      '617f64ec5a48fe2228518814',
      '617f64ec5a48fe2228518815',
      '61ceb560688f572138e023b2',
      '6209f2dc74890f0ecad16670',
      '617f64ec5a48fe222851880e',
      '617f64ec5a48fe222851880f',
      '61dd3ccff647127fd6bf65d7',
      '6009066808ed8724f5a54836',
      '5fe98eeadb866c403defdc6b',
      '64a245893677852cf45c5763',
    ];
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getUserQuickSearch(lastName, payload.schools, sorting, user_type).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          if (resp.length === 1) {
            // ************ auto redirect
            this.goToUser(resp[0]);
          } else {
            // ************ open pop up
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: type === 'user' ? '900px' : '850px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                console.log(result);
                if (result) {
                  this.goToUser(result);
                }
              });
          }
        } else {
          if (type === 'user') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('User not Found'),
            });
          }
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
          this.authService.handlerSessionExpired();
          return;
        }
        this.swalError(err);
      },
    );
  }

  quickSearchStudent(searchInput: string, type: string) {
    const studentFilter = {
      schools: [],
      candidate: searchInput,
    };
    const lastNameFilter = {
      student_quick_search: searchInput,
      offset: 480,
      readmission_status: 'all_candidates',
      candidate_admission_statuses: [
        'admitted',
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
      ],
      exclude_crm_student: true,
    };
    const sorting = {
      // Search CandidateSortInput on playground
      candidate: 'asc', // sort candidate with last name
    };

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getAllCandidateQuickSearch(lastNameFilter, userTypesList, sorting).subscribe(
      (response) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');

        if (response?.length) {
          let respData = _.cloneDeep(response);
          if (respData?.length > 1) {
            let tempData = Object.values(_.groupBy(_.cloneDeep(respData), 'candidate_unique_number'));
            if (tempData && tempData?.length) {
              tempData = tempData?.map((group: any, index) => {
                if (group && group?.length) {
                  const temp = group?.filter(
                    (data) =>
                      data?.program_status === 'active' ||
                      (data?.program_status === 'not_active' && data?.candidate_admission_status !== 'registered'),
                  );
                  if (temp?.length) {
                    return temp;
                  } else {
                    return group?.[group?.length - 1];
                  }
                }
              });
              
            }
            respData = _.uniqBy(_.flattenDeep(tempData), 'user_id._id');
          }
          // if school found, redirect to table active student with filtered on this school
          if (respData.length === 1) {
            this.goToStudent(respData[0]);
          } else if (respData.length > 1) {
            // ************ open pop up
            const temp = _.cloneDeep(respData);
            const dataStudents = temp.map((student) => {
              if (student && student._id) {
                student._id = student._id;
              } else {
                student._id = '';
              }
              return student;
            });
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: '750px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: dataStudents,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  console.log('_dialog', result);
                }
              });
          }
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Student not Found'),
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');
        this.swalError(err);
      },
    );
  }

  quickSearchMentor(searchInput: string, type: string) {
    // user type for mentor
    const userTypeMentor = ['6278e027b97bfb30674e76af', '6278e02eb97bfb30674e76b0'];
    const sorting = {
      // Search UserSorting on playground
      last_name: 'asc',
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getMentorQuickSearch(searchInput, userTypeMentor, sorting).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          if (resp.length === 1) {
            // ************ auto redirect
            this.goToMentor(resp[0]);
          } else {
            // ************ open pop up
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: type === 'mentor' ? '900px' : '850px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                console.log(result);
                if (result) {
                  this.goToUser(result);
                }
              });
          }
        } else {
          if (type === 'mentor') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Mentor not Found'),
            });
          }
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
          this.authService.handlerSessionExpired();
          return;
        }
        this.swalError(err);
      },
    );
  }

  quickSearchSchool(searchInput: string, type: string) {
    const schoolFilter = {
      short_name: searchInput,
      short_names: null,
    };

    const userTypeId =
      this.currentUser && this.currentUser.entities[0] && this.currentUser.entities[0].type ? this.currentUser.entities[0].type._id : null;

    if (this.isAcadDirAdmin) {
      schoolFilter.short_names =
        this.currentUser && this.currentUser.app_data && this.currentUser.app_data.school
          ? this.currentUser.app_data.school.map((res) => res.short_name)
          : null;
    } else {
      schoolFilter.short_names = null;
    }

    const sorting = {
      // Search CandidateSchoolSortingInput on playground
      short_name: 'asc',
    };

    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getSchoolQuickSearch(schoolFilter, userTypeId, sorting).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          if (resp.length === 1) {
            // ************ auto redirect
            this.goToSchool(resp[0]);
          } else {
            // ************ open pop up
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: '750px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                // if (result) {
                //   this.goToSchool(result);
                // }
              });
          }
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('School not Found'),
          });
        }
      },
      (err) => {
        this.swalError(err);
        this.isWaitingForResponse = false;
      },
    );
  }

  swalError(err) {
    this.isWaitingForResponse = false;
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  goToSchool(school) {
    window.open(`./schools/school-detail/${school._id}`, '_blank');
  }

  goToStudent(student) {
    window.open(`./candidate-file?selectedCandidate=${student._id}`, '_blank');
  }

  goToUser(user) {
    window.open(`./users/user-list?user=${user._id}`, '_blank');
  }

  goToTeacher(teacher) {
    window.open(`./users/teacher-list?teacherId=${teacher._id}`, '_blank');
  }

  goToMentor(mentor) {
    const query = {
      selectedMentor: mentor._id ? mentor._id : null,
      companyId:
        mentor.entities && mentor.entities.length && mentor.entities[0].companies.length ? mentor.entities[0].companies[0]._id : null,
    };
    const url = this.router.createUrlTree(['companies/branches'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
