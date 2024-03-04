import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import * as moment from 'moment';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-import-objective-dialog',
  templateUrl: './import-objective-dialog.component.html',
  styleUrls: ['./import-objective-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class ImportObjectiveDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  importForm: UntypedFormGroup;
  maxDate: any;
  minDate: any;
  isWaitingForResponse: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImportObjectiveDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private candidateService: CandidatesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.data.action === 'second') {
      const payload = {
        opening: this.data.first_dates ? moment(this.data.first_dates, 'DD-MM-YYYY').format('YYYY-MM-DD') : '',
        closing: this.data.last_dates ? moment(this.data.last_dates, 'DD-MM-YYYY').format('YYYY-MM-DD') : '',
      };
      this.importForm.patchValue(payload);
      this.importForm.setErrors(null);
      this.importForm.updateValueAndValidity();
    }

    // for get max and min date
    this.getMaxAndMinDate();
  }

  getMaxAndMinDate() {
    this.subs.sink = this.importForm.get('opening').valueChanges.subscribe((res) => {
      if (res) {
        this.minDate = moment(res).add(1, 'd').format('YYYY-MM-DD');
      }
    });

    this.subs.sink = this.importForm.get('closing').valueChanges.subscribe((res) => {
      if (res) {
        this.maxDate = moment(res).subtract(1, 'd').format('YYYY-MM-DD');
      }
    });
  }

  initForm() {
    this.importForm = this.fb.group({
      opening: ['', Validators.required],
      closing: ['', Validators.required],
    });
  }

  downloadFile() {
    if (this.importForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
      this.importForm.markAllAsTouched();
    } else {
      let campus = '';
      let levels = '';
      let scholarSeasons = this.data.scholarSeasons;
      let schools = '';
      let specialities = '';
      let sectors = '';
      const opening = moment(this.importForm.get('opening').value).format('DD-MM-YYYY');
      const closing = moment(this.importForm.get('closing').value).format('DD-MM-YYYY');
      for (const entity of this.data.campuses) {
        campus += entity + ',';
      }
      campus = campus.substring(0, campus.length - 1);

      for (const entity of this.data.levels) {
        levels += entity + ',';
      }
      levels = levels.substring(0, levels.length - 1);

      for (const entity of this.data.schools) {
        schools += entity + ',';
      }
      schools = schools.substring(0, schools.length - 1);

      if (this.data && this.data.specialities) {
        for (const entity of this.data.specialities) {
          specialities += entity + ',';
        }
        specialities = specialities.substring(0, specialities.length - 1);
      } else {
        specialities = null;
      }

      for (const entity of this.data.sectors) {
        sectors += entity + ',';
      }
      sectors = sectors.substring(0, sectors.length - 1);

      this.isWaitingForResponse = true;
      const startDate = moment(this.importForm.get('opening').value).format('DD/MM/YYYY');
      // call api to check has start and end date
      this.subs.sink = this.candidateService
        .GetFirstDateOfRegisteredCandidate(
          this.data.scholarSeasons,
          this.data.schools,
          this.data.campuses,
          this.data.levels,
          this.data.sectors,
          this.data.specialities,
          startDate,
        )
        .subscribe(
          (res) => {
            if (res) {
              // call "swall" for make user notice about action they choose
              Swal.fire({
                type: 'warning',
                title: this.translate.instant('IMPORT_OBJ_S4.Title'),
                html: this.translate.instant('IMPORT_OBJ_S4.Text', { start_date_input: startDate, start_date_response: res.date }),
                confirmButtonText: this.translate.instant('IMPORT_OBJ_S4.Button1'),
                showCancelButton: true,
                cancelButtonText: this.translate.instant('IMPORT_OBJ_S4.Button2'),
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then((result) => {
                if (result.value) {
                  this.candidateService.downloadTemplateCSV(
                    opening,
                    closing,
                    this.data.delimiter,
                    scholarSeasons,
                    schools,
                    campus,
                    levels,
                    sectors,
                    specialities,
                  );
                  this.isWaitingForResponse = false;
                  this.dialogRef.close('downloaded');
                }
                if (result.dismiss) {
                  this.isWaitingForResponse = false;
                }
              });
            } else {
              this.candidateService.downloadTemplateCSV(
                opening,
                closing,
                this.data.delimiter,
                scholarSeasons,
                schools,
                campus,
                levels,
                sectors,
                specialities,
              );
              this.isWaitingForResponse = false;
              this.dialogRef.close('downloaded');
            }
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
            this.isWaitingForResponse = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    }
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
