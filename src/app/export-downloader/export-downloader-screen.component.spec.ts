import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDownloaderScreenComponent } from './export-downloader-screen.component';

describe('ExportDownloaderScreenComponent', () => {
  let component: ExportDownloaderScreenComponent;
  let fixture: ComponentFixture<ExportDownloaderScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportDownloaderScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportDownloaderScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
