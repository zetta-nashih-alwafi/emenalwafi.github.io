import { TestBed } from '@angular/core/testing';

import { FilterBreadcrumbService } from './filter-breadcrumb.service';

describe('FilterBreadcrumbService', () => {
  let service: FilterBreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterBreadcrumbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
