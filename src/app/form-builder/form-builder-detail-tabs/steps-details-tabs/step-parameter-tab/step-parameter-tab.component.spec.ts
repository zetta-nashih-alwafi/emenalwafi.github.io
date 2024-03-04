import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { StepParameterTabComponent } from './step-parameter-tab.component';

describe('StepParameterTabComponent', () => {
  let component: StepParameterTabComponent;
  let fixture: ComponentFixture<StepParameterTabComponent>;
  let service: FormBuilderService = null;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StepParameterTabComponent],
      imports: [
        CommonModule,
        SharedModule,
        CKEditorModule,
        NgSelectModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        RouterTestingModule,
        NgxPermissionsModule.forRoot(),
        SweetAlert2Module.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [FormBuilderService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepParameterTabComponent);
    component = fixture.componentInstance;
    component.stepId = '62947cad1c9a64306dfcb1f7';
    fixture.detectChanges();
    service = TestBed.get(FormBuilderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('in ngOnInit, this four function will be called initStepParamatersForm, populateStepData, getUserTypeList, getStatusStepList', () => {
    const initStepParamatersFormFunc = spyOn(component, 'initStepParamatersForm');
    const populateStepDataFunc = spyOn(component, 'populateStepData');
    const getUserTypeListFunc = spyOn(component, 'getUserTypeList');
    const getStatusStepListFunc = spyOn(component, 'getStatusStepList');

    component.ngOnInit();

    expect(initStepParamatersFormFunc).toHaveBeenCalled();
    expect(populateStepDataFunc).toHaveBeenCalled();
    expect(getUserTypeListFunc).toHaveBeenCalled();
    expect(getStatusStepListFunc).toHaveBeenCalled();
  });

  it('when call populateStepData if templateType equal alumni it will call populateStepDataForAlumni', () => {
    component.templateType = 'alumni';
    const result = spyOn(component, 'populateStepDataForAlumni');
    component.populateStepData();
    expect(result).toHaveBeenCalled();
  });

  it('when form was invalid then user saveStepData, checkFormValidity will return true', () => {
    component.stepParamatersForm.setErrors({ incorrect: true });
    expect(component.checkFormValidity()).toBe(true);
  });

  it('when user click leave button, but still have data not saved yet the swall will appear', () => {
    service.childrenFormValidationStatus = false;
    const result = spyOn(component, 'fireUnsavedDataWarningSwal');
    component.leave();
    expect(result).toHaveBeenCalled();
  });
});
