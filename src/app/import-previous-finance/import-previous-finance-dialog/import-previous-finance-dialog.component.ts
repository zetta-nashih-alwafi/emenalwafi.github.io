import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TaskService } from 'app/service/task/task.service';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as moment from 'moment';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-import-previous-finance',
  templateUrl: './import-previous-finance-dialog.component.html',
  styleUrls: ['./import-previous-finance-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class ImportPreviousFinanceDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  importForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<ImportPreviousFinanceDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    private parseStringDatePipe: ParseStringDatePipe,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    console.log('Import Selected is => ', this.data);
    this.initForm();
    // if (this.data.action === 'second') {
    const payload = {
      opening: this.parseStringDatePipe.transform('09/01/2020'),
      closing: this.parseStringDatePipe.transform('08/31/2021'),
    };
    this.importForm.patchValue(payload);
    // }
  }

  initForm() {
    this.importForm = this.fb.group({
      opening: ['', Validators.required],
      closing: ['', Validators.required],
    });
  }

  downloadFile() {
    let campus = '';
    let levels = '';
    let scholarSeasons = '';
    let schools = '';
    const opening = moment(this.importForm.get('opening').value, 'DD-MM-YYYY').format('DD-MM-YYYY');
    const closing = moment(this.importForm.get('closing').value, 'DD-MM-YYYY').format('DD-MM-YYYY');
    for (const entity of this.data.campuses) {
      campus += entity + ',';
    }
    campus = campus.substring(0, campus.length - 1);

    for (const entity of this.data.levels) {
      levels += entity + ',';
    }
    levels = levels.substring(0, levels.length - 1);

    for (const entity of this.data.scholarSeasons) {
      scholarSeasons += entity + ',';
    }
    scholarSeasons = scholarSeasons.substring(0, scholarSeasons.length - 1);

    for (const entity of this.data.schools) {
      schools += entity + ',';
    }
    schools = schools.substring(0, schools.length - 1);
    this.financeService.downloadGeneralFinanceN1TemplateCSV(opening, closing, this.data.delimiter, scholarSeasons, schools, campus, levels);
    this.dialogRef.close('downloaded');
  }

  downLoadFile(data: any, type: string) {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const pwa = window.open(url);
    if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
      alert('Please disable your Pop-up blocker and try again.');
    }
  }

  filterMonday() {
    const myFilter = (d: Date | null): boolean => {
      const day = (d || new Date()).getDay();
      // Prevent Saturday and Sunday from being selected.
      return day !== 0 && day !== 2 && day !== 3 && day !== 4 && day !== 5 && day !== 6;
    };
    return myFilter;
  }

  filterSunday() {
    const myFilter = (d: Date | null): boolean => {
      const day = (d || new Date()).getDay();
      // Prevent Saturday and Sunday from being selected.
      return day !== 1 && day !== 2 && day !== 3 && day !== 4 && day !== 5 && day !== 6;
    };
    return myFilter;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
