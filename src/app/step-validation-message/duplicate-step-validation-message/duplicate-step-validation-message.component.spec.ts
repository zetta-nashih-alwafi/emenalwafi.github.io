import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { StepValidationMessageService } from 'app/service/step-validation-message/step-validation-message.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSelectModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DuplicateStepValidationMessageDialogComponent } from './duplicate-step-validation-message.component';

describe('DuplicateStepValidationMessageDialogComponent', () => {
  let component: DuplicateStepValidationMessageDialogComponent;
  let fixture: ComponentFixture<DuplicateStepValidationMessageDialogComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DuplicateStepValidationMessageDialogComponent],
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        CKEditorModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: StepValidationMessageService, useClass: StepValidationMessageServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateStepValidationMessageDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.get(StepValidationMessageService)
    component.data = {
      action: "duplicate",
      campus: "EFAP",
      count_document: 35,
      first_button: "Retour",
      first_title: "<p>Étape complétée avec succès !</p>",
      gender: "F",
      generic: false,
      image_upload: "Logo_EFAP_cartouche-32493eb0-c6cd-4d4d-9a05-102382710474.png",
      is_published: true,
      region: "Europe",
      school: "EFAP",
      second_button: "Compléter mes informations",
      second_title: "<p>Dans la prochaine étape, vous compléterez vos informations personnelles.</p>",
      validation_step: 1,
      video_link: "",
      _id: "6001748b76aba9678cdb4114"
    }
    fixture.detectChanges();
  });
  afterEach(() => {
    fixture = null,
    component = null
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form invalid', () => {
    component.initStepValidationDialogForm()
    expect(component.form.invalid).toBeTruthy()
  })
  it('should populate form when data dialog is not empty', () => {
    expect(component.action).toBe('duplicate')
    expect(component.defaultSchool).toBe('EFAP')
    expect(component.disableImage).toBeFalsy()
    expect(component.modifyAdmissionDialog).toBeTruthy()
    expect(component.form.get('validation_step').value).toBe(2)
    expect(component.form.get('school').value).toBe('EFAP')
  })
  it('form change: validation step', () => {
    expect(component.form.get('validation_step').value).toBe(2)
    // open options dialog
    const matSelect = fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement
    matSelect.click();
    fixture.detectChanges();
    // select the first option (use queryAll if you want to chose an option)
    const matOption = fixture.debugElement.query(By.css('.mat-option')).nativeElement;
    matOption.click();
    fixture.detectChanges();
    expect(component.form.get('validation_step').value).toBe(1)
  })
  it('form change: first_title', () => {
    component.form.get('first_title').patchValue('test')
    expect(component.form.get('first_title').value).toBe('test')
  })
  it('form change: second_title', () => {
    component.form.get('second_title').patchValue('test')
    expect(component.form.get('second_title').value).toBe('test')
  })
  it('form change: school', () => {
    expect(component.form.get('school').value).toBe('EFAP')
    component.schoolList = [{
      short_name:'EFAP'
    },{
      short_name:'TEST'
    }]
    const matSelect = fixture.debugElement.queryAll(By.css('.mat-select-trigger'))[1]
    matSelect.nativeElement.click()
    fixture.detectChanges();
    const matOption = fixture.debugElement.queryAll(By.css('.mat-option'))[1].nativeElement;
    matOption.click();
    fixture.detectChanges();
    expect(component.form.get('school').value).toBe('TEST')
  })
  it('form change: campus', () => {
    component.campusList = [{
      name:'TEST'
    }]
    const matSelect = fixture.debugElement.queryAll(By.css('.mat-select-trigger'))[2]
    matSelect.nativeElement.click()
    fixture.detectChanges();
    const matOption = fixture.debugElement.queryAll(By.css('.mat-option'))[1].nativeElement;
    matOption.click();
    fixture.detectChanges();
    expect(component.form.get('campus').value).toBe('TEST')
  })
  it('form change: button1', () => {
    expect(component.form.get('first_button').value).toBe('Retour')
    const matInput = fixture.debugElement.query(By.css('input[formControlName="first_button"]'))
    const inputEl = matInput.nativeElement
    inputEl.value = 'test'
    inputEl.dispatchEvent(new Event('input'));
    expect(component.form.get('first_button').value).toBe('test')
  })
  it('form change: button2', () => {
    expect(component.form.get('second_button').value).toBe('Compléter mes informations')
    const matInput = fixture.debugElement.query(By.css('input[formControlName="second_button"]'))
    const inputEl = matInput.nativeElement
    inputEl.value = 'test'
    inputEl.dispatchEvent(new Event('input'));
    expect(component.form.get('second_button').value).toBe('test')
  })
  it('form change: radio button with value video', () => {
    expect(component.disableVideo).toBeTruthy()
    expect(component.form.get('video_link').value).toBe('')
    const matRadio = fixture.debugElement.queryAll(By.css('mat-radio-button'))[0]
    matRadio.triggerEventHandler('change', { target: matRadio.nativeElement });
    expect(component.disableVideo).toBeFalsy()
    expect(component.disableImage).toBeTruthy()

    const matInput = fixture.debugElement.query(By.css('input[name="video_link"]'))
    const inputEl = matInput.nativeElement
    inputEl.value = 'test'
    inputEl.dispatchEvent(new Event('input'));
    expect(component.form.get('video_link').value).toBe('test')
  })
  it('save validation step', (done) => {
    spyOn(service,'createStepValidationMessage').and.callThrough()
    component.saveValidationStep()
    expect(Swal.isVisible()).toBeTruthy()
    expect(Swal.getTitle().textContent).toEqual('REG_STEP_VAL.You are about to save only')
    Swal.clickConfirm()
    setTimeout(()=>{
      expect(Swal.getTitle().textContent).toEqual('Bravo!')
      Swal.clickConfirm()
      done()
    })
  })
  it('save and publish', (done) => {
    spyOn(service,'createStepValidationMessage').and.callThrough()
    component.saveAndPublishValidationStep()
    expect(Swal.isVisible()).toBeTruthy()
    expect(Swal.getTitle().textContent).toEqual('REG_STEP_VAL.You are about to save and publish')
    Swal.clickConfirm()
    setTimeout(()=>{
      expect(Swal.getTitle().textContent).toEqual('Bravo!')
      Swal.clickConfirm()
      done()
    })
  })
});
class StepValidationMessageServiceStub extends StepValidationMessageService {
  getAllCandidateSchool(pagination, filter?, user_type_id?) {
    return of([{
      short_name: 'TEST',
      _id: 1,
      campuses: [{
        name: 'Lyon'
      }]
    },
    {
      short_name: 'EFAP',
      _id: 2,
      campuses: [{
        name: 'Lyon2'
      }]
    }])
  }
  createStepValidationMessage(data) {
    return of({})
  }
}
