import Swal from 'sweetalert2';
import { UtilityService } from './../../service/utility/utility.service';
import { Observable, of } from 'rxjs';
import { FinancesService } from './../../service/finance/finance.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { NgxPermissionsService, NgxPermissionsModule } from 'ngx-permissions';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportOscarDialogComponent } from './import-oscar-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ImportOscarDialogComponent', () => {
  let component: ImportOscarDialogComponent;
  let fixture: ComponentFixture<ImportOscarDialogComponent>;
  let service

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportOscarDialogComponent],
      imports: [
        TranslateModule.forRoot(),
        NgxPermissionsModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        MatSelectModule,
        NgSelectModule,
        MatDialogModule,
        RouterTestingModule,
        MatFormFieldModule,

      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: FinancesService, useClass: FinanceServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportOscarDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.get(FinancesService)

    fixture.detectChanges();
  });
  afterEach(() => {
    fixture = null
    component = null
    service = null
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form change', () => {
    expect(component.importForm.get('file_delimeter').value).toEqual(';')
    component.importForm.get('file_delimeter').setValue(',')
    fixture.detectChanges()
    expect(component.importForm.get('file_delimeter').value).toEqual(',')
  });
  it('download template', () => {
    spyOn(service, 'downloadTemplateOscarCSV').and.callThrough()
    expect(component.templateDownloaded).toBeFalsy()
    const button = fixture.debugElement.query(By.css('.oscar-import-download'))
    button.triggerEventHandler('click', null)
    expect(component.templateDownloaded).toBeTruthy()
  });
  it('reset form', () => {
    component.templateDownloaded = true
    const button = fixture.debugElement.query(By.css('.oscar-import-reset'))
    button.triggerEventHandler('click', null)
    expect(component.templateDownloaded).toBeFalsy()
    expect(component.importForm.get('file_delimeter').value).toBeNull()
  });
  xit('should close dialog', () => {
    spyOn(component.dialogRef, 'close');
    component.closeDialog();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
  it('import', () => {
    spyOn(service, 'ImportCandidateData').and.callThrough()
    spyOn(Swal, 'fire')
    const b = new Blob();
    component.file = new File([b], "name");
    fixture.detectChanges()
    const button = fixture.debugElement.query(By.css('.oscar-import-submit'))
    button.triggerEventHandler('click', null)
    console.log('swal', Swal.fire.arguments)
    expect(Swal.fire).toHaveBeenCalledWith({ type: 'success', title: 'Oscar_S7_Import.TITLE', html: 'Oscar_S7_Import.TEXT', confirmButtonText: 'Oscar_S7_Import.BUTTON', allowEnterKey: false, allowEscapeKey: false, allowOutsideClick: false })
  });
});
class FinanceServiceStub extends FinancesService {
  ImportCandidateData(file_delimiter, file): Observable<any> {
    return of({
      name: 'test'
    })
  }
  downloadTemplateOscarCSV(delimiter) { }
}
class UtilityServiceStub extends UtilityService {
  getFileExtension(fileName: string) {
    return ''
  }
}