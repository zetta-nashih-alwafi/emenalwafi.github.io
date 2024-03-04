import { Component, OnInit } from '@angular/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-history-parent-tab',
  templateUrl: './history-parent-tab.component.html',
  styleUrls: ['./history-parent-tab.component.scss']
})
export class HistoryParentTabComponent implements OnInit {

  hideArchive = true;

  constructor(
    private pageTitleService: PageTitleService
  ) { }

  ngOnInit() {
    this.pageTitleService.setTitle('List of notifications');
  }

  ngOnDestroy(){
    this.pageTitleService.setTitle(null);
  }
}
