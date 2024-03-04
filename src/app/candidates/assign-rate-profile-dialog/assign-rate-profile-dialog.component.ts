import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ms-assign-rate-profile-dialog',
  templateUrl: './assign-rate-profile-dialog.component.html',
  styleUrls: ['./assign-rate-profile-dialog.component.scss']
})
export class AssignRateProfileDialogComponent implements OnInit {

  selectedCandidates = ["Something", "Freddy Assoba"]
  constructor() { }

  ngOnInit() {
  }

}
