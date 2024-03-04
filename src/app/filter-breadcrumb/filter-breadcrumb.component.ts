import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-filter-breadcrumb',
  templateUrl: './filter-breadcrumb.component.html',
  styleUrls: ['./filter-breadcrumb.component.scss']
})
export class FilterBreadcrumbComponent implements OnInit {

  @Input() filterBreadcrumbData;
  @Input() isReadmission;
  @Output() removeFilterTrigger = new EventEmitter<any>();

  constructor( public translate: TranslateService) { }

  ngOnInit(): void {
  }

  filterDataExist(type) {
    let filterDataExist = this.filterBreadcrumbData.find(data => data?.type === type);
    if(filterDataExist) {
      return true;
    } else {
      return false;
    }
  }

  removeFilter(filterBreadcrumb, crumbIndex?: number) {
    this.filterBreadcrumbData.splice(crumbIndex, 1);
    this.removeFilterTrigger.emit(filterBreadcrumb);
  }


}
