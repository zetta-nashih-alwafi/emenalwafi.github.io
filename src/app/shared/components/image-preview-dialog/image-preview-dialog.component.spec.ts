import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCommonModule, MatDialogModule, MatDialogRef, MatIconModule, MAT_DIALOG_DATA } from '@angular/material';

import { ImagePreviewDialogComponent } from './image-preview-dialog.component';

describe('ImagePreviewDialogComponent', () => {
  let component: ImagePreviewDialogComponent;
  let fixture: ComponentFixture<ImagePreviewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImagePreviewDialogComponent],
      imports: [CommonModule, MatCommonModule, MatDialogModule, MatIconModule],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: 'sample-data' },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagePreviewDialogComponent);
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

  it('should have correct data passed', () => {
    expect(component.data).toBe('sample-data');
  });

  it('should close the dialog', () => {
    const dialogRef = TestBed.get(MatDialogRef);
    spyOn(dialogRef, 'close');
    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith('sample-data');
  });
});

class MatDialogRefStub {
  close = () => {};
}
