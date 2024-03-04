import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  HostListener,
  ViewEncapsulation,
  OnChanges,
  AfterViewChecked,
  ChangeDetectorRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { MenuItems } from '../core/menu/menu-items/menu-items';
import { BreadcrumbService } from 'ng5-breadcrumb';
import { PageTitleService } from '../core/page-title/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';
import { Subscription, combineLatest, of } from 'rxjs';
import { AuthService } from '../service/auth-service/auth.service';
import { CoreService } from '../service/core/core.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService } from 'app/service/user/user.service';
import { SubSink } from 'subsink';
import { NgxPermissionsService } from 'ngx-permissions';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BannerConnectAsSnackbarComponent } from 'app/shared/components/banner-connect-as-snackbar/banner-connect-as-snackbar.component';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { environment } from 'environments/environment';
import { ContactUsDialogComponent } from 'app/need-help/contact-us/contact-us-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { UtilityService } from 'app/service/utility/utility.service';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { NotificationBarService } from 'app/service/notification-bar/notification-bar.service';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalConstants } from 'app/shared/settings';
import { HomepageService } from 'app/homepage/homepage.service';
declare var require: any;

const screenfull = require('screenfull');

@Component({
  selector: 'ms-gene-layout',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  private subs = new SubSink();
  currentUrl: any;
  dataTutorial: any;
  tutorialData: any;
  root: any = 'ltr';
  layout: any = 'ltr';
  currentLang: any = 'fr';
  customizerIn = false;
  showSettings = false;
  chatpanelOpen = false;
  sidenavOpen = true;
  isMobile = false;
  isFullscreen = false;
  isTutorialAdded = false;
  collapseSidebarStatus: boolean;
  header: string;
  dark: boolean;
  compactSidebar: boolean;
  isMobileStatus: boolean;
  sidenavMode = 'side';
  popupDeleteResponse: any;
  sidebarColor: any;
  url: string;
  pageTitle = '';
  pageMessage = '';
  pageMessageFinance = '';
  pageIcon = '';
  currentUser: any;
  currentEntity: any;
  windowSize: number;
  chatList;
  isLoginAsOther = false;
  isSnackbarOpen = false;
  isCompanyUser = false;
  badgeOn = false;

  // ***************  Property for ERP_064 Live Notifications
  unReadToggle = new UntypedFormControl(true);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  totalNotifications: any;
  listNotifications = [];
  totalNotificationsForPaginator;

  isPermission: any;
  config: MatDialogConfig = {
    disableClose: true,
    width: '800px',
  };
  helpOption = [
    {
      name: 'Contact Us',
      value: 'contact_us',
    },
    {
      name: 'Tutorial',
      value: 'tutorial',
    },
  ];
  selectedBar = '';
  // @HostListener('window:scroll', ['$event']) // for window scroll events
  private _routerEventsSubscription: Subscription;
  contactUsDialogComponent: MatDialogRef<ContactUsDialogComponent>;
  private _router: Subscription;
  @ViewChild('sidenav', { static: true }) sidenav;
  @ViewChild('sidenavTutorial', { static: true }) sidenavTutorial;

  sideBarFilterClass: any = [
    {
      sideBarSelect: 'sidebar-color-1',
      colorSelect: 'sidebar-color-dark',
    },
    {
      sideBarSelect: 'sidebar-color-2',
      colorSelect: 'sidebar-color-primary',
    },
    {
      sideBarSelect: 'sidebar-color-3',
      colorSelect: 'sidebar-color-accent',
    },
    {
      sideBarSelect: 'sidebar-color-4',
      colorSelect: 'sidebar-color-warn',
    },
    {
      sideBarSelect: 'sidebar-color-5',
      colorSelect: 'sidebar-color-green',
    },
  ];

  headerFilterClass: any = [
    {
      headerSelect: 'header-color-1',
      colorSelect: 'header-color-dark',
    },
    {
      headerSelect: 'header-color-2',
      colorSelect: 'header-color-primary',
    },
    {
      headerSelect: 'header-color-3',
      colorSelect: 'header-color-accent',
    },
    {
      headerSelect: 'header-color-4',
      colorSelect: 'header-color-warning',
    },
    {
      headerSelect: 'header-color-5',
      colorSelect: 'header-color-green',
    },
  ];

  /*   chatList: any[] = [
    {
      image: 'assets/img/user-1.jpg',
      name: 'John Smith',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
    {
      image: 'assets/img/user-2.jpg',
      name: 'Amanda Brown',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
    {
      image: 'assets/img/user-3.jpg',
      name: 'Justin Randolf',
      chat: 'Lorem ipsum simply dummy',
      mode: 'offline',
    },
    {
      image: 'assets/img/user-4.jpg',
      name: 'Randy SunSung',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
    {
      image: 'assets/img/user-5.jpg',
      name: 'Lisa Myth',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
  ]; */
  tutorialIcon = '../../assets/img/tutorial.png';
  listMail;
  currentURL: any;
  isShow: boolean;
  visited: Boolean;
  showSidebar = true;
  selected = 0;
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  noData: boolean;
  isWaitingForResponse: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;

  // ERP_072 Homepage
  isSearchContainerOpen: boolean = false;
  themeClass$ = 
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => url === '/home' ? 'app-themed' : ''),
    )

  constructor(
    public menuItems: MenuItems,
    private breadcrumbService: BreadcrumbService,
    private pageTitleService: PageTitleService,
    public translate: TranslateService,
    public router: Router,
    public authService: AuthService,
    public coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private ngxPermissionService: NgxPermissionsService,
    private _snackBar: MatSnackBar,
    private rncpTitleService: RNCPTitlesService,
    public dialog: MatDialog,
    public permissionService: PermissionService,
    public utilService: UtilityService,
    private cdr: ChangeDetectorRef,
    public tutorialService: TutorialService,
    private mailboxService: MailboxService,
    private financeService: FinancesService,
    private notificationBarService: NotificationBarService,
  ) {
    // const browserLang: string = translate.getBrowserLang();
    // translate.use(browserLang.match(/en|fr/) ? browserLang : 'fr');

    breadcrumbService.addFriendlyNameForRoute('/dashboard', 'Dashboard');
    breadcrumbService.addFriendlyNameForRoute('/dashboard/saas', 'SAAS');
    breadcrumbService.addFriendlyNameForRoute('/dashboard/web-analytics', 'Web Analytics');
    breadcrumbService.addFriendlyNameForRoute('/inbox', '');
    breadcrumbService.addFriendlyNameForRoute('/chat', '');
    breadcrumbService.addFriendlyNameForRoute('/calendar', '');
    breadcrumbService.addFriendlyNameForRoute('/taskboard', '');
    breadcrumbService.addFriendlyNameForRoute('/editor', 'Editor');
    breadcrumbService.addFriendlyNameForRoute('/video-player', 'Editor');
    breadcrumbService.addFriendlyNameForRoute('/editor/wysiwyg', 'Wysiwyg');
    breadcrumbService.addFriendlyNameForRoute('/editor/ckeditor', 'Ckeditor');
    breadcrumbService.addFriendlyNameForRoute('/icons', '');
    breadcrumbService.addFriendlyNameForRoute('/admission-entrypoint', 'Admission Entry Point');
    breadcrumbService.addFriendlyNameForRoute('/candidate-file?', 'Candidates Files');
    breadcrumbService.addFriendlyNameForRoute('/alumni-cards?', 'Cards');
    breadcrumbService.addFriendlyNameForRoute('/alumni-cards', 'Cards');
    breadcrumbService.addFriendlyNameForRoute('/components', 'Components');
    breadcrumbService.addFriendlyNameForRoute('/components/buttons', 'Buttons');
    breadcrumbService.addFriendlyNameForRoute('/components/cards', 'Cards');
    breadcrumbService.addFriendlyNameForRoute('/components/grid', 'Grid');
    breadcrumbService.addFriendlyNameForRoute('/components/list', 'List');
    breadcrumbService.addFriendlyNameForRoute('/components/menu', 'Menu');
    breadcrumbService.addFriendlyNameForRoute('/components/slider', 'Slider');
    breadcrumbService.addFriendlyNameForRoute('/components/snackbar', 'Snackbar');
    breadcrumbService.addFriendlyNameForRoute('/components/dialog', 'Dialog');
    breadcrumbService.addFriendlyNameForRoute('/components/select', 'Select');
    breadcrumbService.addFriendlyNameForRoute('/components/input', 'Input');
    breadcrumbService.addFriendlyNameForRoute('/components/colorpicker', 'Colorpicker');
    breadcrumbService.addFriendlyNameForRoute('/checkbox', 'Checkbox');
    breadcrumbService.addFriendlyNameForRoute('/components/radio', 'Radio');
    breadcrumbService.addFriendlyNameForRoute('/components/toolbar', 'Toolbar');
    breadcrumbService.addFriendlyNameForRoute('/components/progress', 'Progress');
    breadcrumbService.addFriendlyNameForRoute('/components/tabs', 'Tabs');
    breadcrumbService.addFriendlyNameForRoute('/dragndrop', 'Drag and Drop');
    breadcrumbService.addFriendlyNameForRoute('/dragndrop/dragula', 'Dragula');
    breadcrumbService.addFriendlyNameForRoute('/dragndrop/sortable', 'SortableJS');
    breadcrumbService.addFriendlyNameForRoute('/chart', 'Charts');
    breadcrumbService.addFriendlyNameForRoute('/chart/ng2-charts', 'NG2 Charts');
    breadcrumbService.addFriendlyNameForRoute('/chart/easy-pie-chart', 'Easy Pie');
    breadcrumbService.addFriendlyNameForRoute('/tables', 'Table');
    breadcrumbService.addFriendlyNameForRoute('/tables/fullscreen', 'Full Screen');
    breadcrumbService.addFriendlyNameForRoute('/tables/selection', 'Selection');
    breadcrumbService.addFriendlyNameForRoute('/tables/pinning', 'Pinning');
    breadcrumbService.addFriendlyNameForRoute('/tables/sorting', 'Sorting');
    breadcrumbService.addFriendlyNameForRoute('/tables/Paging', 'Paging');
    breadcrumbService.addFriendlyNameForRoute('/tables/editing', 'Editing');
    breadcrumbService.addFriendlyNameForRoute('/tables/filter', 'Filter');
    breadcrumbService.addFriendlyNameForRoute('/tables/responsive', 'Responsive');
    breadcrumbService.addFriendlyNameForRoute('/forms', 'Forms');
    breadcrumbService.addFriendlyNameForRoute('/forms/form-wizard', 'Form Wizard');
    breadcrumbService.addFriendlyNameForRoute('/forms/form-validation', 'Form Validation');
    breadcrumbService.addFriendlyNameForRoute('/forms/form-upload', 'Form Upload');
    breadcrumbService.addFriendlyNameForRoute('/forms/form-tree', 'Tree');
    breadcrumbService.addFriendlyNameForRoute('/maps', 'Maps');
    breadcrumbService.addFriendlyNameForRoute('/maps/googlemap', 'Google Map');
    breadcrumbService.addFriendlyNameForRoute('/maps/leafletmap', 'Leaflet Map');
    breadcrumbService.addFriendlyNameForRoute('/pages', 'Pages');
    breadcrumbService.addFriendlyNameForRoute('/pages/media', 'Gallery');
    breadcrumbService.addFriendlyNameForRoute('/pages/pricing', 'Pricing');
    breadcrumbService.addFriendlyNameForRoute('/pages/blank', 'Blank');
    breadcrumbService.addFriendlyNameForRoute('/pages/mediaV2', 'Gallery V2');
    breadcrumbService.addFriendlyNameForRoute('/pages/pricing-1', 'Pricing-1');
    breadcrumbService.addFriendlyNameForRoute('/pages/timeline', 'Timeline');
    breadcrumbService.addFriendlyNameForRoute('/pages/faq', 'FAQ');
    breadcrumbService.addFriendlyNameForRoute('/pages/feedback', 'Feedback');
    breadcrumbService.addFriendlyNameForRoute('/pages/about', 'About');
    breadcrumbService.addFriendlyNameForRoute('/pages/contact', 'Contact');
    breadcrumbService.addFriendlyNameForRoute('/pages/search', 'Search');
    breadcrumbService.addFriendlyNameForRoute('/pages/comingsoon', 'Coming Soon');
    breadcrumbService.addFriendlyNameForRoute('/pages/maintenance', 'Maintenance');
    breadcrumbService.addFriendlyNameForRoute('/users', 'Users');
    breadcrumbService.addFriendlyNameForRoute('/users/userprofile', 'User Profile');
    breadcrumbService.addFriendlyNameForRoute('/users/userlist', 'User List');
    breadcrumbService.addFriendlyNameForRoute('/session', 'Session');
    breadcrumbService.addFriendlyNameForRoute('/session/login', 'Login');
    breadcrumbService.addFriendlyNameForRoute('/session/register', 'Register');
    breadcrumbService.addFriendlyNameForRoute('/session/forgot-password', 'Forgot');
    breadcrumbService.addFriendlyNameForRoute('/session/lockscreen', 'Lock Screen');
    breadcrumbService.addFriendlyNameForRoute('/session/setPassword', 'Set Password');
    breadcrumbService.addFriendlyNameForRoute('/mailbox', 'Mailbox');
    breadcrumbService.addFriendlyNameForRoute('/mailbox/inbox', 'Inbox');
    breadcrumbService.addFriendlyNameForRoute('/mailbox/sentBox', 'Sent Box');
    breadcrumbService.addFriendlyNameForRoute('/mailbox/important', 'Important');
    breadcrumbService.addFriendlyNameForRoute('/mailbox/draft', 'Draft');
    breadcrumbService.addFriendlyNameForRoute('/mailbox/trash', 'Trash');
    breadcrumbService.addFriendlyNameForRoute('/courses', 'Courses');
    breadcrumbService.addFriendlyNameForRoute('/dashboard/courses', 'Courses');
    breadcrumbService.addFriendlyNameForRoute('/courses/courses-list', 'Courses List');
    breadcrumbService.addFriendlyNameForRoute('/courses/course-detail', 'Course Detail');
    breadcrumbService.addFriendlyNameForRoute('/courses/signin', 'Sign In');
    breadcrumbService.addFriendlyNameForRoute('/courses/payment', 'Payment');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce', 'Ecommerce');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/shop', 'Shop');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/cart', 'Cart');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/checkout', 'Checkout');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/cards', 'Cards');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/invoice', 'Invoice');
    breadcrumbService.addFriendlyNameForRoute('/users/userprofilev2', 'User Profile V2');
    breadcrumbService.addFriendlyNameForRoute('/user-management', 'Management');
    breadcrumbService.addFriendlyNameForRoute('/user-management/usermanagelist', 'User List');
    breadcrumbService.addFriendlyNameForRoute('/user-management/usergridlist', 'User Grid');
    breadcrumbService.addFriendlyNameForRoute('/video-player', '');

    breadcrumbService.addFriendlyNameForRoute('/crypto', 'Crypto');
    breadcrumbService.addFriendlyNameForRoute('/dashboard/crypto', 'Crypto');
    breadcrumbService.addFriendlyNameForRoute('/crypto/marketcap', 'Market Cap');
    breadcrumbService.addFriendlyNameForRoute('/crypto/wallet', 'Wallet');
    breadcrumbService.addFriendlyNameForRoute('/crypto/trade', 'Trade');
    breadcrumbService.addFriendlyNameForRoute('/crm', 'CRM');
    breadcrumbService.addFriendlyNameForRoute('/crm/dasboard', 'Dasboard');
    breadcrumbService.addFriendlyNameForRoute('/crm/projects', 'Projects');
    breadcrumbService.addFriendlyNameForRoute('/crm/project-detail', 'Project Details');
    breadcrumbService.addFriendlyNameForRoute('/crm/clients', 'Clients');
    breadcrumbService.addFriendlyNameForRoute('/crm/reports', 'Reports');
    breadcrumbService.addFriendlyNameForRoute('/dashboard/crm', 'CRM');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/products', 'Products');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/edit-products', 'Edit Products');
    breadcrumbService.addFriendlyNameForRoute('/ecommerce/product-add', 'Product Add');
    breadcrumbService.addFriendlyNameForRoute('/crm/reports', 'Reports');
    breadcrumbService.addFriendlyNameForRoute('/crm/reports', 'Reports');
  }
  ngOnInit() {
    this.getMailbox('');
    this.isPermission = this.authService.getPermission();
    this.getCurrentUser();
    if (
      (this.router.url === '/dashboard/courses' ||
        this.router.url === '/courses/courses-list' ||
        this.router.url === '/courses/course-detail' ||
        this.router.url === '/ecommerce/shop' ||
        this.router.url === '/ecommerce/checkout' ||
        this.router.url === '/ecommerce/invoice') &&
      window.innerWidth < 1920
    ) {
      this.coreService.sidenavOpen = false;
    }
    if (this.router.url !== this.currentURL) {
      this.currentURL = this.router.url;
      this.pageTitleService.setIcon(null);
      this.subs.unsubscribe();
      this.getMailbox('');
      if (this.currentURL && this.currentURL.includes('/form-builder/key-table')) {
        this.showSidebar = false;
      } else {
        this.showSidebar = true;
      }
    }
    this.currentUser = this.authService.getLocalStorageUser();
    this.currentEntity = this.authService.getUserEntity();
    this.coreService.collapseSidebarStatus = this.coreService.collapseSidebar;
    this.subs.sink = this.pageTitleService.title.subscribe((val: string) => {
      this.header = val;
      this.pageTitle = val;
    });

    this.subs.sink = this.pageTitleService.icon.subscribe((val: string) => {
      this.pageIcon = val;
    });

    this.subs.sink = this.pageTitleService.message.subscribe((val: string) => {
      this.pageMessage = val;
    });

    this.subs.sink = this.pageTitleService.messageFinance.subscribe((val: string) => {
      this.pageMessageFinance = val;
    });

    this._router = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.coreService.collapseSidebarStatus = this.coreService.collapseSidebar;
      // this.coreService.sidenavTutorialMode = 'side';
      this.url = event.url;
      this.customizeSidebar();
    });
    // this.coreService.sidenavTutorialMode = 'side';
    this.url = this.router.url;
    this.customizeSidebar();

    // ********** Check if user is using connect as, then show snackbar
    this.subs.sink = this.authService.isConnectAsUser$.pipe(debounceTime(100)).subscribe((resp) => {
      //  console.log(resp);
      if (resp) {
        if (!this.isSnackbarOpen) {
          this._snackBar.openFromComponent(BannerConnectAsSnackbarComponent, {
            data: {
              currentUser: JSON.parse(localStorage.getItem('userProfile')),
            },
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: 'banner-connect-snackbar',
          });
          this.isSnackbarOpen = true;
        }
      } else {
        this._snackBar.dismiss();
        this.isSnackbarOpen = false;
      }
    });

    setTimeout(() => {
      this.windowSize = window.innerWidth;
      this.resizeSideBar();
    }, 0);

    this._routerEventsSubscription = this.router.events.pipe(debounceTime(200)).subscribe((event) => {
      if (event instanceof NavigationEnd && this.isMobile) {
        this.sidenav.close();
      }
      if (this.location.path() !== '') {
        // Close sidebar if change route
        // this.coreService.sidenavOpen = false;
        this.coreService.sidenavTutorialOpen = false;

        // this page title will be displayed in main.component.html
        this.setPageTitleTutorial();
      }
    });

    this.isVisited();

    // Close the QuickSearchBar when change route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isSearchContainerOpen = false;
      }
    });
  }

  getNotificationCount() {
    this.subs.sink = this.notificationBarService.notificationCount$.subscribe((resp) => {
      this.totalNotifications = resp;
    });
  }

  setPageTitleTutorial() {
    switch (this.router.url) {
      case '/news/manage-news':
        this.pageTitle = 'Manage News';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Manage News');
        break;
      case '/news/all-news':
        this.pageTitle = 'All News';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('All News');
        break;
      case '/school':
        this.pageTitle = 'List of schools';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of schools');
        break;
      case '/school-detail':
        this.pageTitle = 'List of schools';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of schools');
        break;
      case '/academic-journeys/summary':
        this.pageTitle = 'Summary';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Summary');
        break;
      case '/academic-journeys/my-profile':
        this.pageTitle = 'My Profile';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Profile');
        break;
      case '/academic-journeys/my-diploma':
        this.pageTitle = 'My Diploma';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Diploma');
        break;
      case '/academic-journeys/my-experience':
        this.pageTitle = 'My Experience';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Experience');
        break;
      case '/academic-journeys/my-skill':
        this.pageTitle = 'My Skill';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Skill');
        break;
      case '/academic-journeys/my-language':
        this.pageTitle = 'My Language';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Language');
        break;
      case '/academic-journeys/my-interest':
        this.pageTitle = 'My Interest';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Interest');
        break;
      case '/users':
        this.pageTitle = 'List of users';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Users');
        break;
      case '/task':
        this.pageTitle = 'List of tasks';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Task');
        break;
      case '/notifications':
        this.pageTitle = 'List of notifications';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Notifications');
        break;
      case '/doctest':
        this.pageTitle = 'List of Tests';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of Tests');
        break;
      case '/questionnaireTools':
        this.pageTitle = 'List of questionnaire';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Questionnary tools');
        break;
      // case '/jury-organization':
      //   this.pageTitle = 'List of jury organizations';
      //   this.isTutorialAdded = false;
      //   this.getUrgentMail();this.getInAppTutorial('Jury Organization');
      //   break;
      case '/transcript-process':
        // this.pageTitle = 'List of jury organizations';
        // this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Transcript');
        break;
      case '/ideas':
        this.pageTitle = 'List of 1001 ideas';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of 1001 ideas');
        break;
      case '/tutorial':
        this.pageTitle = 'List of tutorials';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Tutorial');
        break;
      case '/students-card':
        this.pageTitle = 'List of Students';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of Students');
        break;
      case '/students':
        this.pageTitle = 'List of Active Students';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Active students');
        break;
      case '/completed-students':
        this.pageTitle = 'List of Completed Students';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Completed students');
        break;
      case '/deactivated-students':
        this.pageTitle = 'List of Deactivated Students';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Deactivated students');
        break;
      case '/suspended-students':
        this.pageTitle = 'List of Suspended Students';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Suspended students');
        break;
      case '/platform':
        this.pageTitle = 'List of platform';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of platform');
        break;
      case '/alert-functionality':
        this.pageTitle = 'List of alert';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Message - List of Alerts');
        break;
      case '/rncpTitles':
        this.pageTitle = 'List of RNCP Title';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('RNCP Title');
        break;
      case '/rncpTitles/dashboard':
        this.pageTitle = 'List of pending task and calendar step';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of pending task and calendar step');
        break;
      case '/companies':
        this.pageTitle = 'List of companies';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Companies');
        break;
      case '/quality-control':
        this.pageTitle = 'List of quality control';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of quality control');
        break;
      case '/certidegree':
        this.pageTitle = 'List of CertiDegree';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of CertiDegree');
        break;
      case '/crossCorrection':
        this.pageTitle = 'List of Cross Correction';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Cross correction');
        break;
      case '/mailbox/inbox':
        this.pageTitle = 'Inbox';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Mailbox');
        break;
      case '/mailbox/cc':
        this.pageTitle = 'CC';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Mailbox');
        break;
      case '/mailbox/sentBox':
        this.pageTitle = 'Sent';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Mailbox');
        break;
      case '/mailbox/important':
        this.pageTitle = 'Important';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Mailbox');
        break;
      case '/mailbox/trash':
        this.pageTitle = 'Trash';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Mailbox');
        break;
      case '/mailbox/draft':
        this.pageTitle = 'Draft';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Mailbox');
        break;
      case '/title-rncp':
        this.pageTitle = 'RNCP Title Management';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('RNCP Title Management');
        break;
      case '/my-file':
        this.pageTitle = 'My File';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My File');
        break;
      case '/group-of-schools':
        this.pageTitle = 'List of Group of School';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Group of schools');
        break;
      case '/questionnaire-tools':
        this.pageTitle = 'Questionnaire Tools';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Questionnary tools');
        break;
      case '/process-management':
        this.pageTitle = 'Process Management';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Process Management');
        break;
      case '/promo/auto-promo':
        this.pageTitle = 'Promo';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Promo');
        break;
      case '/grand-oral':
        this.pageTitle = 'Saise de notes pour grand oral';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Saise de notes pour grand oral');
        break;
      case '/jury-organization/all-jury-schedule':
        this.pageTitle = 'Schedule of Jury';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Schedule of Jury');
        break;
      case '/title-rncp/details':
        break;
      case '/tutorial-app':
        this.pageTitle = 'InApp Tutorials';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('InApp Tutorials');
        break;
      case '/employability-survey':
        this.pageTitle = 'List of Employability Survey';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('List of Employability Survey');
        break;
      case '/candidate-file':
        this.pageTitle = 'Candidates Files';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Candidates Files');
        break;
      case '/companies-internship/entities':
        this.pageTitle = 'Companies Entities';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Companies');
        break;
      case '/companies-internship/branches':
        this.pageTitle = 'Companies Branches';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Companies');
        break;
      case '/candidates':
        this.pageTitle = 'List of Candidates';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow Up FI');
        break;
      case '/promo-external':
        this.pageTitle = 'NAV.Promo External';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Diapos External');
        break;
      case '/step-validation-message':
        this.pageTitle = 'Registration Steps Messages';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Messages Steps');
        break;
      case '/admission-member':
        this.pageTitle = 'Admission members';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Admission members');
        break;
      case '/workProgress':
        this.pageTitle = 'Work on progress';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Work on progress');
        break;
      case '/dashboard':
        this.pageTitle = 'Dashboard Cash In';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Dashboard Cash In');
        break;
      case '/dashboard-register':
        this.pageTitle = 'Dashboard Admission';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('General');
        break;
      case '/dashboard-finance':
        this.pageTitle = 'Dashboard Finance';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Dashboard Finance');
        break;
      case '/dashboard-payment':
        this.pageTitle = 'Dashboard Comparative';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Dashboard Comparative');
        break;
      case '/dashboard-cash-flow':
        this.pageTitle = 'Dashboard Cash In Finance';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Dashboard Cash In Finance');
        break;
      case '/scholar-card':
        this.pageTitle = 'List of scholar season';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Intake channel');
        break;
      case '/internship-file':
        this.pageTitle = 'Student profil card';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Student profil card');
        break;
      case '/finance-follow-up':
        this.pageTitle = 'Follow Up Student';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow Up Student');
        break;
      case '/finance-follow-up-organization':
        this.pageTitle = 'Follow Up Organization';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow Up Organization');
        break;
      case '/unbalanced-balance':
        this.pageTitle = 'Unbalanced Balance';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Unbalanced Balance');
        break;
      case '/operation-lines':
        this.pageTitle = 'Operation Lines';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Operation Lines');
        break;
      case '/finance-member':
        this.pageTitle = 'Financial members';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Financial members');
        break;
      case '/finance-history':
        this.pageTitle = 'History of Transaction';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('History');
        break;
      case '/import-previous-finance':
        this.pageTitle = 'Platform >> Import of financial N - 1';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Import of financial N-1');
        break;
      case '/cheque-transaction':
        this.pageTitle = 'Check';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Check');
        break;
      case '/transaction-report':
        this.pageTitle = 'Online Payment Transaction Report';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Transaction');
        break;
      case '/master-transaction':
        this.pageTitle = 'Master Transaction';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Master Transaction');
        break;
      case '/balance-report':
        this.pageTitle = 'Online Payment Balance Report';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Balance Report');
        break;
      case '/finance-import':
        this.pageTitle = 'Import Finance';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Reconciliation and Lettrage');
        break;
      case '/courses-sequences':
        this.pageTitle = 'Courses & Sequences';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Courses & Sequences');
        break;
      case '/alumni-follow-up':
        this.pageTitle = 'NAV.alumni-follow-up';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow Up - Alumni');
        break;
      case '/alumni-cards':
        this.pageTitle = 'NAV.alumni-cards';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Alumni Card');
        break;
      case '/alumni-trombinoscope':
        this.pageTitle = 'Trombinoscope';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Trombinoscope');
        break;
      case '/alumni-members':
        this.pageTitle = 'Members';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Members');
        break;
      case '/internship/follow-up':
        this.pageTitle = 'Follow Up';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow Up - Internship');
        break;
      case '/my-internships':
        this.pageTitle = 'My Internships';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('My Internships');
        break;
      case '/internship/settings':
        this.pageTitle = 'Internship Settings';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Internship Settings');
        break;
      case '/internship/users':
        this.pageTitle = 'Users';
        this.isTutorialAdded = false;
        // this.getUrgentMail();this.getInAppTutorial('Internship Settings');
        break;
      // case '/teacher-contract/contract-management':
      //   this.pageTitle = 'NAV.TEACHER_CONTRACT.CONTRACT_MANAGEMENT';
      //   this.isTutorialAdded = false;
      //   this.getUrgentMail();
      //   this.getInAppTutorial('Contract Management');
      //   break;
      case '/teacher-contract/contract-template':
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Contract Template');
        break;
      case '/oscar-campus':
        this.pageTitle = 'CRM';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('CRM Oscar Campus');
        break;
      case '/organization':
        this.pageTitle = 'List of Organization';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Organization');
        break;
      case '/organization-detail':
        this.pageTitle = 'Organization Detail';
        this.isTutorialAdded = false;
        break;
      case '/form-builder':
        this.pageTitle = 'List of Form Template';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Form Builder');
        break;
      case '/candidates-fc':
        this.pageTitle = 'Candidates Follow up FC';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow Up FC');
        break;
      case '/contract-follow-up':
        this.pageTitle = 'Follow up Contract/Convention';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Follow up Contract/Convention');
        break;
      case '/notification-management':
        // this.pageTitle = 'List of All Notifications in the Platform';
        // this.pageTitleService.setTitle(this.translate.instant('List of All Notification In the Platform'));
        // this.pageTitleService.setIcon('clipboard-flow');
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Notification Management');
        break;
      case '/organization':
        this.pageTitle = 'List of Organization';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Organization');
        break;
      case '/organization-detail':
        this.pageTitle = 'Organization Detail';
        this.isTutorialAdded = false;
        break;
      case '/timeline-template':
        this.pageTitle = 'NAV.FINANCE.Timeline template';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Timeline template');
        break;
      case '/hubspot':
        this.pageTitle = 'CRM';
        this.isTutorialAdded = false;
        this.getInAppTutorial('CRM Hubspot');
        break;
      case '/import-register':
        this.pageTitle = 'Platform >> Import of Registration Objectives';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Import of Objectives');
        break;
      case '/balance-report/payout-detail':
        this.pageTitle = 'NAV.Payout Detail';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Payout Detail');
        break;
      case '/user-permission':
        this.pageTitle = 'NAV.SETTINGS.USER_PERMISSION';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('User Permission');
        break;
      case '/transaction-report/detail':
        this.pageTitle = 'NAV.Transaction Detail';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Transaction Detail');
        break;
      case '/import-finance':
        this.pageTitle = 'Platform >> Import of Finance Objectives';
        this.isTutorialAdded = false;
        this.getUrgentMail();
        this.getInAppTutorial('Import of Finance Objectives');
        break;

      // intakeChannel v2
      case '/scholar-season':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Scholar season';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Scholar Season');
        break;
      case '/schools':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Schools';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Schools');
        break;
      case '/campus':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Campus';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Campus');
        break;
      case '/level':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Level';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Level');
        break;
      case '/sector':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Sector';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Sector');
        break;
      case '/speciality':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Speciality';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Speciality');
        break;
      case '/site':
        this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Sites';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Sites');
        break;
      case '/settings':
        // this.pageTitle = 'INTAKE_CHANNEL.PAGE_TITLE.Settings';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Settings');
        break;

      // Sub Menu Intake v2 Proses - Document Builder
      case '/document-builder':
        this.pageTitle = 'List of Document Template';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Document Builder');
        break;
      case '/teacher-management/follow-up':
        this.pageTitle = 'NAV.Follow up Teacher Management';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Follow Up Teacher Management');
        break;
      case '/teacher-management/teachers':
        this.pageTitle = 'NAV.Teachers';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Teachers');
        break;
      // Sub Menu Course Sequence - Template
      case '/template-sequences':
        this.pageTitle = 'course_sequence.Template';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Template');
        break;
      // Sub Menu Course Sequence - Sequences
      case '/sequences':
        this.pageTitle = 'course_sequence.Sequences';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Sequences');
        break;
      case '/modules':
        this.pageTitle = 'course_sequence.Modules';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Modules');
        break;
      case '/subjects':
        this.pageTitle = 'course_sequence.Subjects';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Subjects');
        break;
      case '/assignment':
        this.pageTitle = 'NAV.Assignment';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Assignment');
        break;

      case '/follow-up':
        this.pageTitle = 'NAV.Follow up';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Follow Up Admission');
        break;

      case '/students-table':
        this.pageTitle = 'NAV.STUDENT.Registered';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Students - Follow up');
        break;
      case '/all-students':
        this.pageTitle = 'NAV.STUDENT.All students';
        this.isTutorialAdded = false;
        this.getInAppTutorial('All students');
        break;
      case '/students-trombinoscope':
        this.pageTitle = 'NAV.STUDENT.Trombinoscope';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Trombinoscope');
        break;

      case '/form-follow-up/general-form-follow-up':
        this.pageTitle = 'General';
        this.isTutorialAdded = false;
        this.getInAppTutorial('General Form Follow Up');
        break;

      case '/form-follow-up/admission-document-follow-up':
        this.pageTitle = 'Admission Document Follow Up';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Admission Document Follow Up');
        break;

      case '/teacher-management/intervention-form':
        this.pageTitle = 'Intervention';
        this.isTutorialAdded = false;
        this.getInAppTutorial('Intervention');
        break;

      default:
        // this.pageTitle = '';
        this.isTutorialAdded = false;

        // For jury organization, need to check using include. so cannot use in switchase because it has juryorgid
        if (this.router.url.includes('/jury-organization')) {
          this.pageTitle = 'List of jury organizations';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Jury Organization');
        }

        if (this.router.url.includes('/companies-internship/branches')) {
          this.pageTitle = 'Companies Branches';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Companies Branches');
        }

        if (this.router.url.includes('/companies-internship/entities')) {
          this.pageTitle = 'Companies Entity';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Companies Entity');
        }

        if (this.router.url.includes('/companies/branches')) {
          this.pageTitle = 'Companies Branches';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Companies Branches');
        }

        if (this.router.url.includes('/companies/entities')) {
          this.pageTitle = 'Companies Entity';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Companies Entity');
        }

        if (this.router.url.includes('/balance-report/payout-detail')) {
          this.pageTitle = 'NAV.Payout Detail';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Payout Detail');
        }

        if (this.router.url.includes('/transaction-report?candidate')) {
          this.pageTitle = 'Online Payment Transaction Report';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Transaction');
        }

        if (this.router.url.includes('/transaction-report/detail')) {
          this.pageTitle = 'NAV.Transaction Detail';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Transaction Detail');
        }

        if (this.router.url.includes('/teacher-contract/contract-management')) {
          this.pageTitle = 'NAV.TEACHER_CONTRACT.CONTRACT_MANAGEMENT';
          this.isTutorialAdded = false;
          this.getUrgentMail();
          this.getInAppTutorial('Contract Management');
        }
        break;
    }
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.getNotificationCount();
  }

  getCurrentUser() {
    this.userService.reloadCurrentUser$.subscribe((isReload) => {
      if (isReload) {
        this.currentUser = this.authService.getLocalStorageUser();
        this.userService.reloadCurrentUser(false);
      }
    });
  }

  ngOnDestroy() {
    this._router.unsubscribe();
    this.subs.unsubscribe();
  }

  /**
   *As router outlet will emit an activate event any time a new component is being instantiated.
   */
  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
  }

  /**
   * toggleFullscreen method is used to show a template in fullscreen.
   */
  toggleFullscreen() {
    if (screenfull.enabled) {
      screenfull.toggle();
      this.isFullscreen = !this.isFullscreen;
    }
  }

  /**
   * customizerFunction is used to open and close the customizer.
   */
  customizerFunction() {
    this.customizerIn = !this.customizerIn;
  }

  /**
   * addClassOnBody method is used to add a add or remove class on body.
   */
  addClassOnBody(event) {
    const body = document.body;
    if (event.checked) {
      body.classList.add('dark-theme-active');
    } else {
      body.classList.remove('dark-theme-active');
    }
  }

  /**
   * changeRTL method is used to change the layout of template.
   */
  changeRTL(isChecked) {
    if (isChecked) {
      this.layout = 'rtl';
    } else {
      this.layout = 'ltr';
    }
  }

  /**
   * toggleSidebar method is used a toggle a side nav bar.
   */
  toggleSidebar() {
    this.selectedBar = '';
    this.coreService.sidenavMode = 'side';
    this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    if (this.coreService.sidenavTutorialOpen) {
      this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
    }
  }
  /**
   * sidebarFilter function filter the color for sidebar section.
   */
  sidebarFilter(selectedFilter) {
    for (let i = 0; i < this.sideBarFilterClass.length; i++) {
      document.getElementById('main-app').classList.remove(this.sideBarFilterClass[i].colorSelect);
      if (this.sideBarFilterClass[i].colorSelect === selectedFilter.colorSelect) {
        document.getElementById('main-app').classList.add(this.sideBarFilterClass[i].colorSelect);
      }
    }
    document.querySelector('.radius-circle').classList.remove('radius-circle');
    document.getElementById(selectedFilter.sideBarSelect).classList.add('radius-circle');
  }

  /**
   * headerFilter function filter the color for header section.
   */
  headerFilter(selectedFilter) {
    for (let i = 0; i < this.headerFilterClass.length; i++) {
      document.getElementById('main-app').classList.remove(this.headerFilterClass[i].colorSelect);
      if (this.headerFilterClass[i].colorSelect === selectedFilter.colorSelect) {
        document.getElementById('main-app').classList.add(this.headerFilterClass[i].colorSelect);
      }
    }
    document.querySelector('.radius-active').classList.remove('radius-active');
    document.getElementById(selectedFilter.headerSelect).classList.add('radius-active');
  }

  /**
   *chatMenu method is used to toggle a chat menu list.
   */
  /* chatMenu() {
    document.getElementById('gene-chat').classList.toggle('show-chat-list');
  } */

  /**
   * onChatOpen method is used to open a chat window.
   */
  /*   onChatOpen() {
    document.getElementById('chat-open').classList.toggle('show-chat-window');
  } */

  /**
   * onChatWindowClose method is used to close the chat window.
   */
  /*  chatWindowClose() {
    document.getElementById('chat-open').classList.remove('show-chat-window');
  } */

  collapseSidebar(event) {
    document.getElementById('main-app').classList.toggle('collapsed-sidebar');
  }

  // onResize method is used to set the side bar according to window width.
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowSize = event.target.innerWidth;
    this.resizeSideBar();
  }

  // customizeSidebar method is used to change the side bar behaviour.
  customizeSidebar() {
    if (
      (this.url === '/dashboard/courses' ||
        this.url === '/courses/courses-list' ||
        this.url === '/courses/course-detail' ||
        this.url === '/ecommerce/shop' ||
        this.url === '/ecommerce/checkout' ||
        this.url === '/ecommerce/invoice') &&
      this.windowSize < 1920
    ) {
      this.coreService.sidenavMode = 'over';
      this.coreService.sidenavOpen = false;
      if (!document.getElementById('main-app').classList.contains('sidebar-overlay')) {
        document.getElementById('main-app').className += ' sidebar-overlay';
      }
    } else if (
      window.innerWidth > 1200 &&
      (this.url === '/dashboard/crypto' ||
        this.url === '/crypto/marketcap' ||
        this.url === '/crypto/wallet' ||
        this.url === '/crypto/trade')
    ) {
      this.collapseSidebarStatus = this.coreService.collapseSidebar;
      if (this.collapseSidebarStatus === false && window.innerWidth > 1200) {
        document.getElementById('main-app').className += ' collapsed-sidebar';
        this.coreService.collapseSidebar = true;
        if (this.showSidebar) {
          this.coreService.sidenavOpen = true;
        } else {
          this.coreService.sidenavOpen = false;
        }
        this.coreService.sidenavMode = 'side';
        document.getElementById('main-app').classList.remove('sidebar-overlay');
      }
    } else if (
      window.innerWidth > 1200 &&
      !(
        this.url === '/dashboard/courses' ||
        this.url === '/courses/courses-list' ||
        this.url === '/courses/course-detail' ||
        this.url === '/ecommerce/shop' ||
        this.url === '/ecommerce/checkout' ||
        this.url === '/ecommerce/invoice'
      )
    ) {
      this.coreService.sidenavMode = 'side';
      if (this.showSidebar) {
        this.coreService.sidenavOpen = true;
      } else {
        this.coreService.sidenavOpen = false;
      }
      // for responsive
      const main_div = document.getElementsByClassName('app');
      for (let i = 0; i < main_div.length; i++) {
        if (main_div[i].classList.contains('sidebar-overlay')) {
          document.getElementById('main-app').classList.remove('sidebar-overlay');
        }
      }
    } else if (window.innerWidth < 1200) {
      // for responsive
      this.coreService.sidenavMode = 'over';
      this.coreService.sidenavOpen = false;
      const main_div = document.getElementsByClassName('app');
      for (let i = 0; i < main_div.length; i++) {
        if (!main_div[i].classList.contains('sidebar-overlay')) {
          document.getElementById('main-app').className += ' sidebar-overlay';
        }
      }
    }
  }

  getInAppTutorial(type) {
    this.currentUser = this.authService.getCurrentUser();
    this.isPermission = this.authService.getPermission();
    if (this.currentUser?._id && this.isPermission?.length > 0) {
      this.subs.sink = this.tutorialService.getOneUser(this.currentUser._id).subscribe((resp) => {
        const currentEntity = _.cloneDeep(resp);
        const currentUserEntity = currentEntity.entities.find((resps) => resps.type.name === this.isPermission[0]);
        const currentUserEntityId = currentEntity.entities.map((resps) => resps.type._id);
        const id = [];
        if (currentUserEntity) {
          id.push(...currentUserEntityId);
          this.subs.sink = this.tutorialService.GetAllInAppTutorialsByModule(type, id).subscribe(
            (list) => {
              if (list && list.length) {
                this.dataTutorial = list;
                const tutorialData = this.dataTutorial.filter((tutorial) => {
                  return tutorial.is_published === true && tutorial.module === type;
                });
                this.tutorialData = tutorialData[0];
                if (this.tutorialData) {
                  this.isTutorialAdded = true;
                } else {
                  this.isTutorialAdded = false;
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
      });
    }
  }

  toggleTutorial(data) {
    this.tutorialService.setTutorialView(data);
    if (this.coreService.sidenavOpen) {
      this.coreService.sidenavOpen = !this.coreService.sidenavOpen;
    }
    this.coreService.sidenavTutorialOpen = !this.coreService.sidenavTutorialOpen;
  }

  navTutorialClosed() {
    this.selectedBar = '';
    this.unReadToggle.patchValue(true);
    this.pageIndex = 0;
    this.pageSize = 10;
    this.coreService.setTutorialView(null);
  }

  // To resize the side bar according to window width.
  resizeSideBar() {
    if (this.windowSize < 1200) {
      this.isMobileStatus = true;
      this.isMobile = this.isMobileStatus;
      this.coreService.sidenavMode = 'over';
      this.coreService.sidenavOpen = false;
      // for responsive
      const main_div = document.getElementsByClassName('app');
      for (let i = 0; i < main_div.length; i++) {
        if (!main_div[i].classList.contains('sidebar-overlay')) {
          if (document.getElementById('main-app')) {
            document.getElementById('main-app').className += ' sidebar-overlay';
          }
        }
      }
    } else if (
      (this.url === '/dashboard/courses' ||
        this.url === '/courses/courses-list' ||
        this.url === '/courses/course-detail' ||
        this.url === '/ecommerce/shop' ||
        this.url === '/ecommerce/checkout' ||
        this.url === '/ecommerce/invoice') &&
      this.windowSize < 1920
    ) {
      this.customizeSidebar();
    } else {
      this.isMobileStatus = false;
      this.isMobile = this.isMobileStatus;
      this.coreService.sidenavMode = 'side';
      if (this.showSidebar) {
        this.coreService.sidenavOpen = true;
      } else {
        this.coreService.sidenavOpen = false;
      }
      // for responsive
      const main_div = document.getElementsByClassName('app');
      for (let i = 0; i < main_div.length; i++) {
        if (main_div[i].classList.contains('sidebar-overlay')) {
          document.getElementById('main-app').classList.remove('sidebar-overlay');
        }
      }
    }
  }
  onScrollContainer(event) {
    if (this.router.url === '/dashboard-register') {
      this.rncpTitleService.setEventScroll(event);
    }
    if (event && event.path && event.path[8].URL.search('/title-rncp/details/') !== -1) {
      this.rncpTitleService.setEventScroll(event);
    }
  }

  openNeedHelp() {
    this.contactUsDialogComponent = this.dialog.open(ContactUsDialogComponent, this.config);
  }

  openTutorial() {
    this.router.navigate(['tutorial']);
  }

  onFilterNotification(event) {
    if (event?.checked) {
      this.getLiveNotifications(!event?.checked);
    } else {
      this.getLiveNotifications();
    }
  }

  pageChange(event) {
    this.pageIndex = event?.pageIndex;
    this.pageSize = event?.pageSize;
    this.getLiveNotifications(!this.unReadToggle.value);
  }

  getLiveNotifications(is_read?) {
    this.isWaitingForResponse = true;
    this.selectedBar = 'notif';

    const payload = {
      is_read,
    };
    if (is_read === false) {
      payload.is_read = false;
    } else {
      payload.is_read = true;
    }

    const pagination = {
      limit: this.pageSize ? this.pageSize : 10,
      page: this.pageIndex ? this.pageIndex : 0,
    };

    this.subs.sink = this.notificationBarService.getAllNotificationRelatedToUser(pagination, payload).subscribe((resp) => {
      if (resp.length) {
        this.noData = false;
        const tempNotifications = _.cloneDeep(resp);
        tempNotifications.map((notif) => {
          if (notif?.date_created) {
            const dateTimeInLocal = moment(notif?.date_created).format('DD/MM/YYYY - HH:mm');
            notif.date_created = dateTimeInLocal;
          }
        });
        this.listNotifications = tempNotifications;
        this.notificationBarService.setNotificationCount(this.listNotifications);
        if (is_read === false) {
          this.totalNotificationsForPaginator = this.listNotifications[0]?.unread_notification;
        } else {
          this.totalNotificationsForPaginator = this.listNotifications[0]?.count_document;
        }
        this.isWaitingForResponse = false;
      } else {
        this.noData = true;
        this.listNotifications = [];
        if (is_read === false) {
          this.notificationBarService.setNotificationCount(this.listNotifications);
        }
        this.totalNotificationsForPaginator = 0;
        this.isWaitingForResponse = false;
      }
    });
  }

  getMailbox(notif) {
    this.selectedBar = notif;
    const type = 'inbox';
    const new_mail = true;
    const pagination = {
      limit: 10,
      page: 0,
    };
    this.subs.sink = this.mailboxService.getMailNotif(pagination, type, new_mail).subscribe(
      (mailList: any[]) => {
        if (mailList && mailList.length) {
          this.listMail = mailList;
          const read = this.listMail.filter((temp) => {
            return temp.recipient_properties[0].is_read === false;
          });
          //  console.log('Is New', read);
        }
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('UnAuthenticated') ||
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

  selectNotif(data, index) {
    //  console.log('Notif Selected', data);
    this.router.navigate(['/mailbox/inbox'], {
      queryParams: { mail: data._id, index: index },
    });
  }

  selectNotification(data, index) {
    if (data?._id) {
      const filter = {
        is_read: true,
      };
      this.subs.sink = this.notificationBarService.updateLiveNofication(data._id, filter).subscribe(() => {
        if (!data?.is_removed) {
          const query = {
            selectedCandidate: data?.comment_id?.candidate_id?._id,
            selectedComment: data?.comment_id?.reply_for_comment_id?._id
              ? data?.comment_id?.reply_for_comment_id?._id
              : data?.comment_id?._id,
            tab: 'Commentaries',
            paginator: JSON.stringify({
              pageIndex: 0,
              pageSize: 10,
            }),
          };
          const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
          window.open(url.toString(), '_');
        } else if (data?.is_removed) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('LIVENOTIF.TITLESWAL'),
            html: this.translate.instant('LIVENOTIF.BODYSWAL'),
            confirmButtonText: this.translate.instant('LIVENOTIF.BTNSWAL'),
          }).then(() => {
            return;
          });
        }
        this.getLiveNotifications(!this.unReadToggle.value);
      });
    }
  }

  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
      (mailList: any[]) => {
        if (mailList && mailList.length) {
          this.subs.sink = this.dialog
            .open(ReplyUrgentMessageDialogComponent, {
              disableClose: true,
              width: '825px',
              panelClass: 'certification-rule-pop-up',
              data: mailList,
            })
            .afterClosed()
            .subscribe((resp) => {
              this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
                (mailUrgent: any[]) => {
                  if (mailUrgent && mailUrgent.length) {
                    this.replyUrgentMessageDialogComponent = this.dialog.open(ReplyUrgentMessageDialogComponent, {
                      disableClose: true,
                      width: '825px',
                      panelClass: 'certification-rule-pop-up',
                      data: mailUrgent,
                    });
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
            });
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

  isVisited() {
    const dataFromLocalStorage = JSON.parse(localStorage.getItem('cookieVisited'));
    if (dataFromLocalStorage?.visited == true) {
      this.visited = true;
    } else {
      this.visited = false;
    }
  }

  setVisited() {
    const dataVisited = {
      visited: true,
    };
    localStorage.setItem('cookieVisited', JSON.stringify(dataVisited));
    this.visited = true;
  }

  gotoPrivacyPolicy() {
    const privacyPolicylink = document.createElement('a');
    privacyPolicylink.target = '_blank';

    if (this.translate.currentLang.toLowerCase() === 'en') {
      privacyPolicylink.href = GlobalConstants.privacyPolicy.ENLink;
    } else {
      privacyPolicylink.href = GlobalConstants.privacyPolicy.FRLink;
    }

    privacyPolicylink.setAttribute('visibility', 'hidden');
    document.body.appendChild(privacyPolicylink);
    privacyPolicylink.click();
    document.body.removeChild(privacyPolicylink);
  }

  // ERP_0072 Homepage
  onSearchContainer() {
    this.isSearchContainerOpen = !this.isSearchContainerOpen;
  }
}
