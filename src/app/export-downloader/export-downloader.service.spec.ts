import { TestBed } from '@angular/core/testing';

import { ExportDownloaderService } from './export-downloader.service';

describe('ExportDownloaderService', () => {
  let service: ExportDownloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportDownloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
