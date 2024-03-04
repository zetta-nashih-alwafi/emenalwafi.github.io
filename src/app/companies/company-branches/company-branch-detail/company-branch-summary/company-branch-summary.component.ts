import { CompanyService } from 'app/service/company/company.service';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'ms-company-branch-summary',
  templateUrl: './company-branch-summary.component.html',
  styleUrls: ['./company-branch-summary.component.scss']
})
export class CompanyBranchSummaryComponent implements OnInit {
  @Input() companyId
  @Output() isRefresh = new EventEmitter<boolean>();
  company
  isWaitingForResponse = false

  constructor(private companyService: CompanyService) { }

  ngOnInit() {
    this.getOneCompany()
  }
  ngOnChanges() {
    if (this.companyId) {
      this.getOneCompany()
    }
  }
  getOneCompany() {
    this.isWaitingForResponse = true
    this.companyService.getOneCompany(this.companyId).subscribe(resp => {
      if (resp) {
        this.company = resp
      }
      this.isWaitingForResponse = false
    }, err => {
      this.company = null
      console.log(err)
      this.isWaitingForResponse = false
    })
  }
  refresh() {
    this.isWaitingForResponse = true
    this.companyService.RefreshCompany(this.companyId).subscribe(resp => {
      if(resp){
        this.isRefresh.emit(true)
      }
      this.isWaitingForResponse = false
    },
      err => {
        console.log(err)
        this.isWaitingForResponse = false
      })
  }

}
