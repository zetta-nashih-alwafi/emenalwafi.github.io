import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'ms-add-intervention-dialog',
  templateUrl: './add-intervention-dialog.component.html',
  styleUrls: ['./add-intervention-dialog.component.scss']
})
export class AddInterventionDialogComponent implements OnInit {

  constructor(private router: Router,public dialogRef: MatDialogRef<AddInterventionDialogComponent>,) { }

  ngOnInit(): void {
  }

  gotoAddInterventionForm() {
    const url = this.router.createUrlTree(['teacher-management/intervention-form']);
    window.open(url.toString(), '_blank');
    this.dialogRef.close();
  }

}
