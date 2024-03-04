import { Component, OnInit, Input, OnDestroy, ViewChild, OnChanges, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CoreService } from '../../service/core/core.service';
import { MenuItems } from '../../core/menu/menu-items/menu-items';
import { UntypedFormControl } from '@angular/forms';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UserProfileData } from 'app/users/user.model';
import { SubSink } from 'subsink';
import { UrgentMessageDialogComponent } from 'app/urgent-message/urgent-message-dialog.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { PermissionService } from 'app/service/permission/permission.service';
import { MailToGroupDialogComponent } from 'app/mailbox/mail-to-group-dialog/mail-to-group-dialog.component';
import { environment } from 'environments/environment';
import { ContactUsDialogComponent } from 'app/need-help/contact-us/contact-us-dialog.component';
import { ApplicationUrls } from '../settings';
import * as _ from 'lodash';
import { ParseStringDatePipe } from '../pipes/parse-string-date.pipe';
import { FinancesService } from 'app/service/finance/finance.service';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { ImagePreviewDialogComponent } from '../components/image-preview-dialog/image-preview-dialog.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'ms-tutorial-bar',
  templateUrl: './tutorial-bar.component.html',
  styleUrls: ['./tutorial-bar.component.scss'],
  providers: [ParseStringDatePipe],
})
export class TutorialBarComponent implements OnInit, OnDestroy, OnChanges {
  private subs = new SubSink();
  @Input() menuList: any;
  @Input() verticalMenuStatus: boolean;
  @ViewChild('fileUpload', { static: false }) uploadInput: any;

  juryOrgId;
  juryName;
  isUserADMTC;
  isLoadingUpload = false;
  isStudent = false;
  isWaitingResponse = false;
  studentId = '';
  acadJourneyId = '';
  studentData: any;
  currentUser: UserProfileData;
  profilePic = new UntypedFormControl('');
  frontendVersion: string;
  backendVersion: string;
  maleUserIcon = '../../../../assets/img/student_icon.png';
  femaleUserIcon = '../../../../assets/img/student_icon_fem.png';
  urgentMessageConfig: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  config: MatDialogConfig = {
    disableClose: true,
    width: '800px',
  };
  configImage: MatDialogConfig = {
    disableClose: true,
    width: '1400px',
  };
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  urgentMessageDialogComponent: MatDialogRef<UrgentMessageDialogComponent>;
  contactUsDialogComponent: MatDialogRef<ContactUsDialogComponent>;
  imagePreviewDialogComponent: MatDialogRef<ImagePreviewDialogComponent>;
  mailToGroupDialogComponent: MatDialogRef<MailToGroupDialogComponent>;

  filteredValues = {
    _id: '',
    module: '',
    sub_module: '',
    is_published: true,
  };
  moduleSelected = '';
  dataTutorial: any;
  newData;
  envLink = environment.apiUrl;
  selected = 0;
  tutorialDisable = {
    is_jury_organization: false,
    is_video_presentation: false,
    is_video_url: false,
    is_scenario_checklist_url: false,
    is_qa_checklist_url: false,
  }

  constructor(
    public translate: TranslateService,
    private router: Router,
    public coreService: CoreService,
    public menuItems: MenuItems,
    private authService: AuthService,
    public dialog: MatDialog,
    public permissionService: PermissionService,
    private tutorialService: TutorialService,
    public utilService: UtilityService,
  ) {}

  ngOnInit() {
    this.isUserADMTC = this.utilService.isUserEntityADMTC();
    this.dataTutorial = null;
    this.currentUser = this.authService.getLocalStorageUser();
    this.subs.sink = this.tutorialService.currentStep.subscribe(
      (val) => {
        this.selected = val;
        this.getOneTutorial();
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
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
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
    this.subs.sink = this.tutorialService.tutorialData.subscribe(
      (val) => {
        if (val) {
          console.log('_tut', val);

          this.dataTutorial = [val];
          const pay = {
            sub_modules: val,
          };
          const valArray = [val];
          this.newData = _.cloneDeep(valArray);
          this.tutorialDisable.is_jury_organization = this.newData.some(tutorialData => tutorialData.module === 'Jury Organization');                    
          this.tutorialDisable.is_video_presentation = this.newData.some(tutorialData => tutorialData.video_presentation);          
          this.tutorialDisable.is_video_url = this.newData.some(tutorialData => tutorialData.video_url);
          this.tutorialDisable.is_scenario_checklist_url = this.newData.some(tutorialData => tutorialData.scenario_checklist_url);
          this.tutorialDisable.is_qa_checklist_url = this.newData.some(tutorialData => tutorialData.qa_checklist_url);
          this.insetOpenImage();
        } else {
          this.getOneTutorial();
        }

        if (this.dataTutorial && this.dataTutorial.module === 'Jury Organization') {
          this.subs.sink = this.tutorialService.juryName.subscribe(
            (vals) => {
              if (vals) {
                this.juryName = vals;
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
              } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
                Swal.fire({
                  type: 'warning',
                  title: this.translate.instant('BAD_CONNECTION.Title'),
                  html: this.translate.instant('BAD_CONNECTION.Text'),
                  confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                  allowOutsideClick: false,
                  allowEnterKey: false,
                  allowEscapeKey: false,
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
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
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

  ngOnChanges() {
    this.dataTutorial = null;
    this.newData = null;
    this.currentUser = this.authService.getLocalStorageUser();
    switch (this.router.url) {
      // Admission Menu
      case '/candidates':
        this.moduleSelected = 'Follow Up FI';
        break;
      case '/oscar-campus':
        this.moduleSelected = 'CRM Oscar Campus';
        break;
      case '/hubspot':
        this.moduleSelected = 'CRM Hubspot';
        break;
      case '/dashboard-register':
        this.moduleSelected = 'General';
        break;

      // Students
      case '/students-table':
        this.moduleSelected = 'Students - Follow up';
        break;
      case '/all-students':
        this.moduleSelected = 'All students';
        break;
      case '/students-trombinoscope':
        this.moduleSelected = 'Trombinoscope';
        break;

      // Finance
      case '/finance-follow-up':
        this.moduleSelected = 'Follow Up Student';
        break;
      case '/finance-history':
        this.moduleSelected = 'History';
        break;
      case '/finance-import':
        this.moduleSelected = 'Reconciliation and Lettrage';
        break;
      case '/cheque-transaction':
        this.moduleSelected = 'Check';
        break;
      case '/transaction-report':
        this.moduleSelected = 'Transaction';
        break;
      case '/balance-report':
        this.moduleSelected = 'Balance Report';
        break;

      // Internship
      case '/internship/follow-up':
        this.moduleSelected = 'Follow Up - Internship';
        break;
      case '/internship/settings':
        this.moduleSelected = 'Internship Settings';
        break;

      // Alumni
      case '/alumni-follow-up':
        this.moduleSelected = 'Follow Up - Alumni';
        break;
      case '/alumni-cards':
        this.moduleSelected = 'Alumni Card';
        break;
      case '/alumni-trombinoscope':
        this.moduleSelected = 'Trombinoscope';
        break;

      // My Task
      case '/task':
        this.moduleSelected = 'My Task';
        break;

      // Mailbox
      case '/mailbox/inbox':
        this.moduleSelected = 'Mailbox';
        break;
      case '/mailbox/cc':
        this.moduleSelected = 'Mailbox';
        break;
      case '/mailbox/sentBox':
        this.moduleSelected = 'Mailbox';
        break;
      case '/mailbox/important':
        this.moduleSelected = 'Mailbox';
        break;
      case '/mailbox/trash':
        this.moduleSelected = 'Mailbox';
        break;
      case '/mailbox/draft':
        this.moduleSelected = 'Mailbox';
        break;

      // Contract
      case '/teacher-contract/contract-management':
        this.moduleSelected = 'Contract Management';
        break;
      case '/teacher-contract/contract-template':
        this.moduleSelected = 'Contract Template';
        break;

      // Course and sequences
      case '/courses-sequences':
        this.moduleSelected = 'Courses & Sequences';
        break;
      case '/template-sequences':
        this.moduleSelected = 'Template';
        break;
      case '/sequences':
        this.moduleSelected = 'Sequences';
        break;
      case '/modules':
        this.moduleSelected = 'Modules';
        break;
      case '/subjects':
        this.moduleSelected = 'Subjects';
        break;

      // Users
      case '/users':
        this.moduleSelected = 'Users';
        break;

      // Intake Channel
      case '/scholar-card':
        this.moduleSelected = 'Intake channel';
        break;

      // Setting
      case '/import-register':
        this.moduleSelected = 'Import of Objectives';
        break;
      case '/import-finance':
        this.moduleSelected = 'Import of Finance Objectives';
        break;
      case '/import-previous-finance':
        this.moduleSelected = 'Import of financial N-1';
        break;
      case '/promo-external':
        this.moduleSelected = 'Diapos External';
        break;
      case '/step-validation-message':
        this.moduleSelected = 'Messages Steps';
        break;
      case '/user-permission':
        this.moduleSelected = 'User Permission';
        break;
      case '/form-builder':
        this.moduleSelected = 'Form Builder';
        break;
      case '/notification-management':
        this.moduleSelected = 'Notification Management';
        break;
      case '/notifications':
        this.moduleSelected = 'Notifications';
        break;
      case '/organization':
        this.moduleSelected = 'Organization';
        break;
      case '/timeline-template':
        this.moduleSelected = 'Timeline template';
        break;
      case '/candidates-fc':
        this.moduleSelected = 'Follow Up FC';
        break;
      case '/contract-follow-up':
        this.moduleSelected = 'Follow up Contract/Convention';
        break;
      case '/finance-follow-up-organization':
        this.moduleSelected = 'Follow Up Organization';
        break;

      // intakeChannel v2
      case '/scholar-season':
        this.moduleSelected = 'Scholar Season';
        break;
      case '/schools':
        this.moduleSelected = 'Schools';
        break;
      case '/campus':
        this.moduleSelected = 'Campus';
        break;
      case '/level':
        this.moduleSelected = 'Level';
        break;
      case '/sector':
        this.moduleSelected = 'Sector';
        break;
      case '/speciality':
        this.moduleSelected = 'Speciality';
        break;
      case '/site':
        this.moduleSelected = 'Sites';
        break;
      case '/settings':
        this.moduleSelected = 'Settings';
        break;

      case '/assignment':
        this.moduleSelected = 'Assignment';
        break;

      case '/follow-up':
        this.moduleSelected = 'Follow Up Admission';
        break;
      
      // Teacher Management
      case '/teacher-management/follow-up':
        this.moduleSelected = 'Follow Up Teacher Management';
        break;
      
      case '/teacher-management/teachers':
        this.moduleSelected = 'Teachers';
        break;

      // Sub Menu Intake v2 Proses - Document Builder
      case '/document-builder':
        this.moduleSelected = 'Document Builder';
        break;

      // Menu Form Follow Up
      case '/form-follow-up/admission-document-follow-up':
        this.moduleSelected = 'Admission Document Follow Up';
        break;
        
      case '/form-follow-up/general-form-follow-up':
        this.moduleSelected = 'General Form Follow Up';
        break;      

      // In app tutorials
      case '/tutorial-app':
        this.moduleSelected = 'InApp Tutorials';
        break;

      default:
        this.moduleSelected = null;
        if (this.router.url.includes('/balance-report/payout-detail')) {
          this.moduleSelected = 'Payout Detail';
        }
        if (this.router.url.includes('/transaction-report/detail')) {
          this.moduleSelected = 'Transaction Detail';
        }
        if (this.router.url.includes('/companies/entities')) {
          this.moduleSelected = 'Companies Entity';
        }
        if (this.router.url.includes('/companies/branches')) {
          this.moduleSelected = 'Companies Branches';
        }
        break;
    }
    this.subs.sink = this.tutorialService.tutorialData.subscribe(
      (val) => {
        if (val) {
          this.dataTutorial = [val];
          const pay = {
            sub_modules: val,
          };
          const valArray = [val];
          this.newData = _.cloneDeep(valArray);
          this.tutorialDisable.is_jury_organization = this.newData.some(tutorialData => tutorialData.module === 'Jury Organization');                    
          this.tutorialDisable.is_video_presentation = this.newData.some(tutorialData => tutorialData.video_presentation);          
          this.tutorialDisable.is_video_url = this.newData.some(tutorialData => tutorialData.video_url);
          this.tutorialDisable.is_scenario_checklist_url = this.newData.some(tutorialData => tutorialData.scenario_checklist_url);
          this.tutorialDisable.is_qa_checklist_url = this.newData.some(tutorialData => tutorialData.qa_checklist_url);
          this.insetOpenImage();
          console.log('tutorial bar', val, this.newData);
        } else {
          this.getOneTutorial();
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
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getOneTutorial() {
    if (this.moduleSelected && this.currentUser?._id) {
      this.isWaitingResponse = true;
      this.filteredValues.module = this.moduleSelected;
      this.subs.sink = this.tutorialService.getOneUser(this.currentUser._id).subscribe(resp => {
        const currentEntity = _.cloneDeep(resp);
        const currentUserEntityId = currentEntity.entities.map((resp) => resp.type._id);   
        const filter = {
          module: this.moduleSelected,
          is_published: true,
          user_types: [...currentUserEntityId]
        };
        this.subs.sink = this.tutorialService.GetAllInAppTutorial(filter, null, null).subscribe(
          (list) => {
            this.isWaitingResponse = false;
            this.dataTutorial = list;
            const pay = {
              sub_modules: list,
            };
            this.newData = _.cloneDeep(list);
            this.tutorialDisable.is_jury_organization = this.newData.some(tutorialData => tutorialData.module === 'Jury Organization');                    
            this.tutorialDisable.is_video_presentation = this.newData.some(tutorialData => tutorialData.video_presentation);          
            this.tutorialDisable.is_video_url = this.newData.some(tutorialData => tutorialData.video_url);
            this.tutorialDisable.is_scenario_checklist_url = this.newData.some(tutorialData => tutorialData.scenario_checklist_url);
            this.tutorialDisable.is_qa_checklist_url = this.newData.some(tutorialData => tutorialData.qa_checklist_url);
            this.insetOpenImage();
          },
          (err) => {
            this.isWaitingResponse = false;
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
            } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('BAD_CONNECTION.Title'),
                html: this.translate.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
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
      })
    }
      // const filter = this.cleanFilterData();
  }

  insetOpenImage() {
    this.newData = _.cloneDeep(this.dataTutorial);
    if (this.newData && this.newData.length && this.newData.sub_modules && this.newData.sub_modules.length) {
      this.newData.forEach(newData => {
        newData.sub_modules.forEach((data) => {
          if (data && data.items.length) {
            data.items.forEach((item) => {
              item.description = item.description.replaceAll('<img', '|<img');
              item.description = item.description.split('|');
            });
          }        
      })
      });
    }
  }

  openNeedHelp() {
    this.contactUsDialogComponent = this.dialog.open(ContactUsDialogComponent, this.config);
  }

  openImage(data) {
    this.subs.sink = this.dialog
      .open(ImagePreviewDialogComponent, {
        disableClose: true,
        width: '98%',
        height: '98%',
        panelClass: 'image-preview-pop-up',
        data: data,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === '_id' || key === 'module' || key === 'sub_module') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  dataModuleNoEmpty(dataTutorial) {
    let isNotEmpty = false;
    const subModule =
      dataTutorial && dataTutorial.sub_modules && dataTutorial.sub_modules.length ? dataTutorial.sub_modules : [];
    if (subModule && subModule.length) {
      if (subModule[0].sub_module) {
        isNotEmpty = true;
      }
    }
    return isNotEmpty;
  }
  dataItemNoEmpty(dataTutorial, index) {
    let isNotEmpty = false;
    const items =
      dataTutorial &&
      dataTutorial.sub_modules &&
      dataTutorial.sub_modules[index] &&
      dataTutorial.sub_modules[index].items &&
      dataTutorial.sub_modules[index].items.length
        ? dataTutorial.sub_modules[index].items
        : [];
    if (items && items.length) {
      if (items[0].title) {
        isNotEmpty = true;
      }
    }
    return isNotEmpty;
  }

  toggleSidebar() {
    this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }

  viewTutorial(data, typeData) {    
    this.openTutorial(data, typeData);    
  }

  openTutorial(tutorials: any, type: string) {
    tutorials.forEach(dataTutorial => {
      if( type === 'video_presentation') {        
        if (dataTutorial?.video_presentation &&!dataTutorial?.video_presentation.includes('http')) {
          dataTutorial.video_presentation = 'http://' + dataTutorial?.video_presentation;
          window.open(dataTutorial.video_presentation, '_blank');
        } else if(dataTutorial?.video_presentation) {
          window.open(dataTutorial.video_presentation, '_blank');
        }
      } else if(type === 'video_url') {        
        if (dataTutorial?.video_url && !dataTutorial?.video_url.includes('http')) {
          dataTutorial.video_url = 'http://' + dataTutorial?.video_url;
          window.open(dataTutorial.video_url, '_blank');
        }else if(dataTutorial.video_url) {
          window.open(dataTutorial.video_url, '_blank');
        }
      } else if(type === 'scenario_checklist_url') {        
        if (dataTutorial?.scenario_checklist_url && !dataTutorial?.scenario_checklist_url.includes('http')) {
          dataTutorial.scenario_checklist_url = 'http://' + dataTutorial?.scenario_checklist_url;
          window.open(dataTutorial.scenario_checklist_url, '_blank');
        } else if(dataTutorial.scenario_checklist_url) {
          window.open(dataTutorial.scenario_checklist_url, '_blank');
        }
      } else if(type === 'qa_checklist_url') {        
        if (dataTutorial?.qa_checklist_url && !dataTutorial?.qa_checklist_url.includes('http')) {
          dataTutorial.qa_checklist_url = 'http://' + dataTutorial?.qa_checklist_url;
          window.open(dataTutorial.qa_checklist_url, '_blank');
        } else if(dataTutorial?.qa_checklist_url) {
          window.open(dataTutorial.qa_checklist_url, '_blank');
        }
      }
    })
  }

  getMessage(data) {
    console.log('_TUTORIAL', data);

    if (data && data.includes('<img')) {
      const imgs = _.cloneDeep(data);
      let img = imgs.split('src="');
      if (data && data.includes('<figcaption>')) {
        img = img[1].split('"><figcaption>');
        img = img[0];
      } else {
        img = img[1].split('"></figure>');
        img = img[0];
      }
      if (img) {
        this.openImage(img.toString());
      }
    }
    return '';
  }

  panic() {
    const currentUser = this.utilService.getCurrentUser();
    const civility = currentUser.civility !== 'neutral' ? currentUser.civility : '';
    const whatsAppUrl = 'https://api.whatsapp.com/send?phone=6593722206&text=';
    let whatsAppText = '';
    if (this.isUserADMTC) {
      whatsAppText = this.translate.instant('PANIC.MESSAGE_ADMTC', {
        userName: `${this.translate.instant(civility)} ${currentUser.first_name} ${currentUser.last_name}`,
        userType:
          currentUser.entities && currentUser.entities[0] && currentUser.entities[0].type && currentUser.entities[0].type.name
            ? this.translate.instant(currentUser.entities[0].type.name)
            : '',
        juryName: this.juryName ? this.juryName : '',
      });
    } else {
      whatsAppText = this.translate.instant('PANIC.MESSAGE', {
        userName: `${this.translate.instant(civility)} ${currentUser.first_name} ${currentUser.last_name}`,
        userType:
          currentUser.entities && currentUser.entities[0] && currentUser.entities[0].type && currentUser.entities[0].type.name
            ? this.translate.instant(currentUser.entities[0].type.name)
            : '',
        school:
          currentUser.entities && currentUser.entities[0] && currentUser.entities[0].school && currentUser.entities[0].school.short_name
            ? currentUser.entities[0].school.short_name
            : '',
        juryName: this.juryName ? this.juryName : '',
      });
    }
    console.log('curernt ', currentUser);
    console.log('whatsAppText ', whatsAppText);
    window.open(whatsAppUrl + whatsAppText, '_blank');
  }
}
