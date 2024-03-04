import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit, OnChanges {
  @Input() userList;
  @Input() tab;
  @Input() selectedUserId;
  @Input() isWaitingForResponse;
  @ViewChild('userDetailTabGroup', { static: false }) userDetailTabGroup: MatTabGroup;
  private subs = new SubSink();
  selectedIndex = 0;
  selectedUserData: any;
  selectedUserTypeData: any;

  constructor(private candidatesService: CandidatesService, private translate: TranslateService) {}

  ngOnInit() {}

  ngOnChanges() {
    if (this.selectedUserId) {
      this.getOneUser(this.selectedUserId);
    }
  }

  getOneUser(id) {
    this.subs.sink = this.candidatesService.GetOneUserCRM(id).subscribe(
      (res) => {
        // console.log(res);
        if (res) {
          this.selectedUserData = res;
          this.selectedUserTypeData = res && res.entities.length > 0 ? res.entities : null;
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  goToTab(value) {
    if (value) {
      this.selectedIndex = 1;
    }
  }

  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'Identity':
          this.selectedIndex = 0;
          break;
        case 'Usertype':
          this.selectedIndex = 1;
          break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  reloadTable(value) {
    if (value) {
      this.getOneUser(this.selectedUserId);
    }
  }
}
