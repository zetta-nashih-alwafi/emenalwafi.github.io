import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCommonModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MAT_DIALOG_DATA,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AddSpecialityDialogComponent } from './add-speciality-dialog.component';

describe('AddSpecialityDialogComponent', () => {
  let component: AddSpecialityDialogComponent;
  let fixture: ComponentFixture<AddSpecialityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddSpecialityDialogComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: MOCKED_DIALOG_DATA },
        { provide: MatDialogRef, useClass: MatDialogRefStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSpecialityDialogComponent);
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

  it('should create date instance for today property', () => {
    expect(component.today instanceof Date).toBe(true);
  });

  it('should have #iniVerificationForm to initialize the form group', () => {
    component.iniVerificationForm();
    expect(component.identityForm instanceof FormGroup).toBe(true);
  });

  it('should have #patchDataScholar to patch the initialized form using the passed data', () => {
    const { _id, ...expected } = MOCKED_DIALOG_DATA;
    component.patchDataScholar();
    expect(component.identityForm.value).toEqual(expected);
  });

  it('should have #patchDataScholar to set firstForm using the patched form value', () => {
    const { _id, ...expected } = MOCKED_DIALOG_DATA;
    component.patchDataScholar();
    expect(component.firstForm).toEqual(expected);
  });

  it('should have #checkFormValidity to return `true` when the form is invalid', () => {
    spyOn(Swal, 'fire'); // just to prevent swal from firing when testing
    spyOnProperty(component.identityForm, 'invalid', 'get').and.returnValue(true);
    const result = component.checkFormValidity();
    expect(result).toBe(true);
  });

  it('should have #checkFormValidity to mark all of the form fields to be touched when the form is invalid', () => {
    spyOn(Swal, 'fire'); // just to prevent swal from firing when testing
    spyOn(component.identityForm, 'markAllAsTouched');
    spyOnProperty(component.identityForm, 'invalid', 'get').and.returnValue(true);
    component.checkFormValidity();
    expect(component.identityForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should have #checkFormValidity to fire swal when the form is invalid', () => {
    spyOn(Swal, 'fire');
    spyOnProperty(component.identityForm, 'invalid', 'get').and.returnValue(true);
    component.checkFormValidity();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'warning',
      }),
    );
  });

  it('should have #checkFormValidity to return `false` when the form is valid', () => {
    spyOnProperty(component.identityForm, 'invalid', 'get').and.returnValue(false);
    const result = component.checkFormValidity();
    expect(result).toBe(false);
  });

  it('should have #submitVerification to return nothing when the form is invalid', () => {
    spyOn(component, 'checkFormValidity').and.returnValue(true);
    component.submitVerification();
    expect(component.isWaitingForResponse).toBe(false);
  });

  it('should have #submitVerification to call UpdateSpecialization and fire a success swal if the form is valid', () => {
    const service = TestBed.get(IntakeChannelService);
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'UpdateSpecialization').and.returnValue(of({}));
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'success',
      }),
    );
  });

  it('should have #submitVerification to handle UpdateSpecialization `existing name` error and inform the user', () => {
    const service = TestBed.get(IntakeChannelService);
    const error = { message: 'GraphQL error: Name already exists!' };
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'UpdateSpecialization').and.returnValue(throwError(error));
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'info',
      }),
    );
  });

  it('should have #submitVerification to handle UpdateSpecialization `program already connected to candidate` error and inform the user', () => {
    const service = TestBed.get(IntakeChannelService);
    const error = { message: 'GraphQL error: Program already connected to candidate' };
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'UpdateSpecialization').and.returnValue(throwError(error));
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'info',
      }),
    );
  });

  it('should have #submitVerification to handle UpdateSpecialization unknown error and inform the user', () => {
    const service = TestBed.get(IntakeChannelService);
    const error = { message: 'GraphQL error: i-am-an-unknown-error' };
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'UpdateSpecialization').and.returnValue(throwError(error));
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'info',
        text: 'i-am-an-unknown-error',
      }),
    );
  });

  it('should have #submitVerification to call CreateSpecialization and fire a success swal if the form is valid', () => {
    const service = TestBed.get(IntakeChannelService);
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'CreateSpecialization').and.returnValue(of({}));
    delete component.data._id;
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'success',
      }),
    );
  });

  it('should have #submitVerification to handle CreateSpecialization `existing name` error and inform the user', () => {
    const service = TestBed.get(IntakeChannelService);
    const error = { message: 'GraphQL error: Name already exists!' };
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'CreateSpecialization').and.returnValue(throwError(error));
    delete component.data._id;
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'info',
      }),
    );
  });

  it('should have #submitVerification to handle CreateSpecialization `program already connected to candidate` error and inform the user', () => {
    const service = TestBed.get(IntakeChannelService);
    const error = { message: 'GraphQL error: Program already connected to candidate' };
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'CreateSpecialization').and.returnValue(throwError(error));
    delete component.data._id;
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'info',
      }),
    );
  });

  it('should have #submitVerification to handle CreateSpecialization unknown error and inform the user', () => {
    const service = TestBed.get(IntakeChannelService);
    const error = { message: 'GraphQL error: i-am-an-unknown-error' };
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve('ok' as unknown as SweetAlertResult));
    spyOn(component, 'checkFormValidity').and.returnValue(false);
    spyOn(service, 'CreateSpecialization').and.returnValue(throwError(error));
    delete component.data._id;
    component.submitVerification();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'info',
        text: 'i-am-an-unknown-error',
      }),
    );
  });

  it('should have #closeDialog to close the dialog', () => {
    const ref = TestBed.get(MatDialogRef);
    spyOn(ref, 'close');
    component.closeDialog();
    expect(ref.close).toHaveBeenCalled();
  });

  it('should have #translateDate to return nothing when passed falsy value to the datee parameter', () => {
    const result = component.translateDate(null, null);
    expect(result).toBe('');
  });

  it('should have #patchDataScholarFromExisting to patch the form with passed value', () => {
    const { _id, ...data } = MOCKED_DIALOG_DATA;
    component.patchDataScholarFromExisting(MOCKED_DIALOG_DATA);
    expect(component.identityForm.value).toEqual(data);
  });

  it('should have #comparison to return `true` if the first and second form data have the same value', () => {
    const data = { name: 'testing-name', description: 'testing-description', sigli: 'testing-sigli' };
    component.firstForm = data;
    component.identityForm.patchValue(data);
    const result = component.comparison();
    expect(result).toBe(true);
  });

  it('should have #comparison to return `false` if the first and second form data have the same value', () => {
    const data = { name: 'testing-name', description: 'testing-description', sigli: 'testing-sigli' };
    component.firstForm = { name: 'name-testing', description: 'testing-description', sigli: 'testing-sigli' };
    component.identityForm.patchValue(data);
    const result = component.comparison();
    expect(result).toBe(false);
  });

  it('should clear timeout when the component is destroyed', () => {
    spyOn(global, 'clearTimeout');
    component.ngOnDestroy();
    expect(clearTimeout).toHaveBeenCalled();
  });

  it('should clear interval when the component is destroyed', () => {
    spyOn(global, 'clearInterval');
    component.ngOnDestroy();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('should unsubscribe when the component is destroyed', () => {
    // @ts-ignore private subs error for testing purpose
    spyOn(component.subs, 'unsubscribe');
    component.ngOnDestroy();
    // @ts-ignore private subs error for testing purpose
    expect(component.subs.unsubscribe).toHaveBeenCalled();
  });
});

const MOCKED_DIALOG_DATA = {
  _id: 'testing-id',
  name: 'testing-name',
  description: 'testing-description',
  sigli: 'testing-sigli',
};

class MatDialogRefStub {
  close = () => {};
}
