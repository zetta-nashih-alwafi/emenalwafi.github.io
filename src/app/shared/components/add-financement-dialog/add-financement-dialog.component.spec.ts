import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCommonModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSelectModule,
  MatSliderModule,
  MAT_DIALOG_DATA,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AddFinancementDialogComponent } from './add-financement-dialog.component';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { of, throwError } from 'rxjs';

describe('AddFinancementDialogComponent', () => {
  let component: AddFinancementDialogComponent;
  let fixture: ComponentFixture<AddFinancementDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddFinancementDialogComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatSliderModule,
        MatIconModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        NoopAnimationsModule,
        RouterTestingModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA_MOCK },
        { provide: MatDialogRef, useClass: MatDialogRefStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFinancementDialogComponent);
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

  it('should init the form', () => {
    expect(component.addFinancementForm).toBeTruthy();
  });

  it('should display swal if user select file other than pdf', () => {
    const fileInput = {
      target: {
        files: (() => {
          // prettier-ignore
          const parts = [
            new Blob(['blob part for dummy txt file'], { type: 'text/plain'})
          ]
          const file = new File(parts, 'sample.txt', { type: 'text/plain' });
          return [file];
        })(),
      },
    };

    spyOn(Swal, 'fire');
    component.chooseFile(fileInput);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should display swal if there is an error from the backend', () => {
    const fileUploaderServ = TestBed.get(FileUploadService);
    const fileInput = {
      target: {
        files: (() => {
          // prettier-ignore
          const parts = [
            new Blob(['blob part for dummy txt file'], { type: 'text/plain'})
          ]
          const file = new File(parts, 'sample.pdf', { type: 'text/pdf' });
          return [file];
        })(),
      },
    };

    spyOn(Swal, 'fire');
    spyOn(fileUploaderServ, 'singleUpload').and.returnValue(throwError('sample error from testing'));
    component.chooseFile(fileInput);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should successfully set document_pdf value inside the form', () => {
    const fileUploaderServ = TestBed.get(FileUploadService);
    const fileInput = {
      target: {
        files: (() => {
          // prettier-ignore
          const parts = [
            new Blob(['blob part for dummy txt file'], { type: 'text/plain'})
          ]
          const file = new File(parts, 'sample.pdf', { type: 'text/pdf' });
          return [file];
        })(),
      },
    };

    spyOn(Swal, 'fire');
    spyOn(fileUploaderServ, 'singleUpload').and.returnValue(of({ s3_file_name: 'sample_file_name.pdf' }));
    component.chooseFile(fileInput);
    expect(component.addFinancementForm.get('document_pdf').value).toBe('sample_file_name.pdf');
  });

  it('should correctly remove the document', () => {
    component.removeFile();
    expect(component.addFinancementForm.get('document_pdf').value).toBeFalsy();
  });

  it('should display swal when user try to submit invalid form', () => {
    spyOn(Swal, 'fire');
    component.addFinancementForm.patchValue({ organization_name: '' });
    component.handleSubmit();
    expect(Swal.fire).toHaveBeenCalled();
  });
});

const DIALOG_DATA_MOCK = {
  comps: {
    title: 'Add timeline template',
    icon: null,
    isEdit: false,
    callFrom: 'timeline_template',
  },
  source: null,
};

class MatDialogRefStub {
  close = () => {};
}
