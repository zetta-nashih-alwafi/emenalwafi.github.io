import { TestBed } from '@angular/core/testing';

import { ReadmissionService } from './readmission.service';

describe('ReadmissionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReadmissionService = TestBed.get(ReadmissionService);
    expect(service).toBeTruthy();
  });
});
