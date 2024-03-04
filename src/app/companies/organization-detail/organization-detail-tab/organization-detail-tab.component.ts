import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ms-organization-detail-tab',
  templateUrl: './organization-detail-tab.component.html',
  styleUrls: ['./organization-detail-tab.component.scss'],
})
export class OrganizationDetailTabComponent implements OnInit {
  selectedIndex = 0;
  @Input() orgId: string;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  passData(item: boolean) {
    this.reloadData.emit(item);
  }
}
