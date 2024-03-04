import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-export-payout-dialog-component',
  templateUrl: './export-payout-dialog.component.html',
  styleUrls: ['./export-payout-dialog.component.scss'],
})
export class ExportPayoutDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  exportPayoutForm: UntypedFormGroup;
  filteredValues;
  currentUserTypeId;
  isWaitingForResponse: boolean = false;

  private subs = new SubSink();

  legalEntityList;
  filteredLegalEntityList;
  selectedLegalEntityId;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private httpClient: HttpClient,
    public dialogRef: MatDialogRef<ExportPayoutDialogComponent>,
    private utilService: UtilityService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.initPayoutForm();
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getLegalEntityDropdown();
  }

  ngAfterViewInit() {}

  initPayoutForm() {
    this.exportPayoutForm = this.fb.group({
      legal_entity: [null, Validators.required],
      from_date: [null, Validators.required],
      to_date: [null, Validators.required],
    });
  }

  getLegalEntityDropdown() {
    this.subs.sink = this.financeService.getAllLegalEntities().subscribe((resp) => {
      this.legalEntityList = resp;
      this.filteredLegalEntityList = this.exportPayoutForm?.get('legal_entity')?.valueChanges?.pipe(
        startWith(''),
        map((searchText) =>
          this.legalEntityList.filter((legal) =>
            this.utilService
              .simpleDiacriticSensitiveRegex(legal?.legal_entity_name)
              ?.toLowerCase()
              ?.trim()
              ?.includes(this.utilService.simpleDiacriticSensitiveRegex(searchText)?.toString()?.toLowerCase()?.trim()),
          ),
        ),
      );
    });
  }

  selectLegalEntity(id) {
    if (id) {
      this.selectedLegalEntityId = id;
    }
  }

  downloadCSV() {
    if (this.exportPayoutForm.invalid || !this.selectedLegalEntityId) {
      this.exportPayoutForm.markAllAsTouched();
      Swal.fire({
        type: 'info',
        title: this.translate.instant('FormSave_S1s.TITLE'),
        html: this.translate.instant('FormSave_S1s.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1s.BUTTON 1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return;
    }
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };
    // const currentLang = this.translate.currentLang;
    Swal.fire({
      type: 'question',
      title: this.translate.instant('EXPORT_DECISION.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            resolve('');
            Swal.enableConfirmButton();
          } else {
            Swal.disableConfirmButton();
            reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
          }
        });
      },
      onOpen: function () {
        Swal.disableConfirmButton();
        Swal.getContent().addEventListener('click', function (e) {
          Swal.enableConfirmButton();
        });
        const input = Swal.getInput();
        const inputValue = input.getAttribute('value');
        if (inputValue === ';') {
          Swal.enableConfirmButton();
        }
      },
    }).then((separator) => {
      if (separator.value) {
        const fileType = separator.value;
        this.openDownloadCsv(fileType);
      }
    });
  }

  openDownloadCsv(fileType) {
    const payout_from = moment(this.exportPayoutForm.get('from_date')?.value).format('DD/MM/YYYY');
    const payout_to = moment(this.exportPayoutForm.get('to_date')?.value).format('DD/MM/YYYY');
    let transaction_statuses = ['Credited', 'Debited', 'Payout', 'Chargeback', 'ChargebackReceived'];
    transaction_statuses = transaction_statuses?.map((res) => `"` + res + `"`);
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const lang = this.translate.currentLang.toLowerCase();
    const importStudentTemlate = `downloadBalanceReportCSV/`;
    let filter;
    filter = `"filter":{"payout_legal_entity": "${
      this.selectedLegalEntityId
    }", "payout_from":"${payout_from}", "payout_to":"${payout_to}", "is_payload_detail": true, "transaction_status": [${transaction_statuses}], "offset":${moment().utcOffset()}}`;
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
        'Content-Type': 'application/json',
      }),
    };
    const payload = '{' + filter + '}';
    this.isWaitingForResponse = true;
    const fullURL = url + importStudentTemlate + fileType + '/' + lang;
    this.httpClient.post(`${encodeURI(fullURL)}`, payload, httpOptions).subscribe(
      (res) => {
        this.isWaitingForResponse = false;
        if (res) {
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.dialogRef.close();
          });
        }
      },
      (err) => {
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

  ngOnDestroy() {}
}
