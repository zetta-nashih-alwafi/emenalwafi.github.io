import { TestBed } from "@angular/core/testing"
import { MockComponent, MockModule, MockProvider, MockRender, ngMocks } from 'ng-mocks';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of } from 'rxjs';
import { QuickSearchBarComponent } from "./quick-search-bar.component";
import { MatIconModule } from "@angular/material/icon";
import { UtilityService } from "app/service/utility/utility.service";
import { AuthService } from "app/service/auth-service/auth.service";
import { PermissionService } from "app/service/permission/permission.service";
import { UserService } from "app/service/user/user.service";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ReactiveFormsModule } from "@angular/forms";

describe('QuickSearchBarComponent', () => {
  beforeEach(() =>{
    TestBed.configureTestingModule({
      declarations: [QuickSearchBarComponent],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinner,
        ReactiveFormsModule,
        MockModule(MatIconModule),
        MatDialogModule,
        TranslateTestingModule
          .withTranslations('en', require('assets/i18n/en.json'))
          .withTranslations('fr', require('assets/i18n/fr.json')),],
      providers: [
        MockProvider(UtilityService),
        MockProvider(UserService,{
          getTagQuickSearch: jest.fn().mockReturnValue(of([]))
          getQuickSearchEmail: jest.fn().mockReturnValue(of([]))
          quickSearchTeacher: jest.fn().mockReturnValue(of([]))
          getUserQuickSearch: jest.fn().mockReturnValue(of([]))
          getAllCandidateQuickSearch: jest.fn().mockReturnValue(of([]))
          getMentorQuickSearch: jest.fn().mockReturnValue(of([]))
          getSchoolQuickSearch: jest.fn().mockReturnValue(of([]))
        }),
        MockProvider(AuthService,{
          getUserById: jest.fn().mockReturnValue(of([]))
        }),
        MockProvider(PermissionService),
      ]
    })
  })

  it('should create', () => {
    const component = MockRender(QuickSearchBarComponent,{
      isWaitingForResponse: false
    }).point.componentInstance
    expect(component).toBeTruthy();
  });

  it('should Hide quick search bar component when the close icon is clicked', () => {
    const component = MockRender(QuickSearchBarComponent,{
      isWaitingForResponse: false
    }).point.componentInstance

    const closeButton = component.debugElement.nativeElement.querySelector('button');
    closeButton.click();

    // Check if the onOpenSearchContainer method is called and the value is toggled
    spyOn(component, 'onOpenSearchContainer');
    expect(component.onOpenSearchContainer).toHaveBeenCalledWith(true);
  })

  it('should bind the quick search form to the form control', () => {
    const component = MockRender(QuickSearchBarComponent,{
      isWaitingForResponse: false
    }).point.componentInstance

    const userSearchFormControl = component.userSearch;
  const inputElement = component.debugElement.nativeElement.querySelector('input');

  const testInputValue = 'test input value';
  inputElement.value = testInputValue;
  inputElement.dispatchEvent(new Event('input'));

  expect(userSearchFormControl.value).toEqual(testInputValue);
  })
})

