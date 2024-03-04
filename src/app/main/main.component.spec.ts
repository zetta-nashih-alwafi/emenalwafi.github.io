import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCommonModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatIconModule,
  MatToolbarModule,
  MatMenuModule,
  MatTabsModule,
  MatCardModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDialogModule,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { MenuItems } from 'app/core/menu/menu-items/menu-items';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import { BreadcrumbService } from 'ng5-breadcrumb';
import { NgxPermissionsModule } from 'ngx-permissions';
import { BehaviorSubject, of } from 'rxjs';

import { MainComponent } from './main.component';
import { By } from '@angular/platform-browser';
import { QuickSearchBarComponent } from 'app/shared/components/quick-search-bar/quick-search-bar.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainComponent, MockComponent(QuickSearchBarComponent)],
      imports: [
        CommonModule,
        MatCommonModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatIconModule,
        MatToolbarModule,
        MatMenuModule,
        MatTabsModule,
        MatCardModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        RouterTestingModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [
        { provide: MenuItems, useClass: MenuItemsStub },
        { provide: BreadcrumbService, useClass: BreadcrumbServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: PageTitleService, useClass: PageTitleServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have page title "List of schools" for route /school', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/school');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of schools');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of schools" for route /school-detail', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/school-detail');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of schools');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "Summary" for route /academic-journeys/summary', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/summary');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('Summary');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "My Profile" for route /academic-journeys/my-profile', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/my-profile');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('My Profile');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "My Diploma" for route /academic-journeys/my-diploma', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/my-diploma');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('My Diploma');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "My Experience" for route /academic-journeys/my-experience', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/my-experience');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('My Experience');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "My Skill" for route /academic-journeys/my-skill', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/my-skill');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('My Skill');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "My Language" for route /academic-journeys/my-language', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/my-language');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('My Language');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "My Interest" for route /academic-journeys/my-interest', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/academic-journeys/my-interest');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('My Interest');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of users" for route /users', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/users');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of users');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of tasks" for route /task', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/task');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of tasks');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of notifications" for route /notifications', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/notifications');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of notifications');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of Tests" for route /doctest', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/doctest');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of Tests');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of questionnaire" for route /questionnaireTools', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/questionnaireTools');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of questionnaire');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of 1001 ideas" for route /ideas', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/ideas');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of 1001 ideas');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of tutorials" for route /tutorial', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/tutorial');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of tutorials');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of Students" for route /students-card', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/students-card');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of Students');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of Active Students" for route /students', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/students');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of Active Students');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of Completed Students" for route /completed-students', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/completed-students');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of Completed Students');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of Deactivated Students" for route /deactivated-students', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/deactivated-students');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of Deactivated Students');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of Suspended Students" for route /suspended-students', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/suspended-students');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of Suspended Students');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of platform" for route /platform', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/platform');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of platform');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of alert" for route /alert-functionality', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/alert-functionality');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of alert');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of RNCP Title" for route /rncpTitles', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/rncpTitles');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of RNCP Title');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should have page title "List of pending task and calendar step" for route /rncpTitles/dashboard', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/rncpTitles/dashboard');
    component.setPageTitleTutorial();
    expect(component.pageTitle).toBe('List of pending task and calendar step');
    expect(component.isTutorialAdded).toBe(false);
  });

  it('should Have search button in toolbar', () => {
    const searchButton = fixture.debugElement.query(By.css('.search-toolbar-button'));
    expect(searchButton).toBeTruthy();
    const tooltipContent = searchButton.nativeElement.getAttribute('mattooltip');
    expect(tooltipContent).toEqual('Quick Search');
  })

  it('should have #onSearchContainer to call isSearchContainerOpen and open the QuickSearchBarComponent', () => {
    fixture.detectChanges();

    expect(component.isSearchContainerOpen).toBe(true);

    const searchButton = fixture.debugElement.query(By.css('.search-toolbar-button'));
    searchButton.triggerEventHandler('click', null);
    expect(component.isSearchContainerOpen).toBe(false);

    const quickSearchBarComponent = fixture.debugElement.query(By.directive(QuickSearchBarComponent));
    expect(quickSearchBarComponent).toBeTruthy();
  })

  it('should handle response from GetAllInAppTutorial', () => {
    const service = TestBed.get(TutorialService);
    spyOn(service, 'GetAllInAppTutorialsByModule').and.returnValue(
      of([
        {
          is_published: true,
          module: 'type_id_testing',
        },
      ]),
    );
    component.getInAppTutorial('type_id_testing');
    expect(component.dataTutorial.length).toBeTruthy();
    expect(component.tutorialData).toEqual({
      is_published: true,
      module: 'type_id_testing',
    });
  });
});

const MOCKED_LOCAL_STORAGE_USER = {
  _id: 'user-random-id',
  entities: [
    {
      type: {
        _id: 'type_id_testing',
        name: 'permission_one',
      },
    },
  ],
};

class MenuItemsStub {
  getAll = () => [];
  add = () => {};
}

class BreadcrumbServiceStub {
  addFriendlyNameForRoute = () => {};
}

class PageTitleServiceStub {
  title = of('title');
  icon = of('icon');
  message = of('message');
  messageFinance = of('messageFinance');

  setIcon = () => {};
}

class AuthServiceStub {
  isConnectAsUserSource = new BehaviorSubject<boolean>(false);
  isConnectAsUser$ = this.isConnectAsUserSource.asObservable();

  isLoginAsOther = () => {};
  getPermission = () => ['permission_one', 'permission_two'];
  getLocalStorageUser = () => MOCKED_LOCAL_STORAGE_USER;
  handlerSessionExpired = () => {};
  getUserEntity = () => {};
  getCurrentUser = () => MOCKED_LOCAL_STORAGE_USER;
}
