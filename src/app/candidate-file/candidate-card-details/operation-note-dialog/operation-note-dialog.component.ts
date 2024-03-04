import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'ms-operation-note-dialog',
  templateUrl: './operation-note-dialog.component.html',
  styleUrls: ['./operation-note-dialog.component.scss'],
})
export class OperationNoteDialogComponent implements OnInit {
  private sub = new SubSink();
  isWaitingForResponse = false;

  legalEntityName;
  reference;
  note;

  constructor(
    public dialogRef: MatDialogRef<OperationNoteDialogComponent>,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    console.log('Operation', this.data);

    // legal entity name
    if (this.data?.transaction_id?.legal_entity?.legal_entity_name) {
      this.legalEntityName = this.data.transaction_id.legal_entity.legal_entity_name;
    } else {
      this.legalEntityName = this.data?.legal_entity_id?.legal_entity_name;
    }

    // reference
    if (this.data?.transaction_id?.psp_reference) {
      this.reference = this.data.transaction_id.psp_reference;
    } else {
      this.reference = this.data?.reference;
    }

    // note
    if (this.data?.note) {
      this.note = this.data.note;
    }
  }
}
