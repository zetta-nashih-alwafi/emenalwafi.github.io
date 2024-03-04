import { FinancesService } from 'app/service/finance/finance.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import Swal from 'sweetalert2';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';

@Component({
  selector: 'ms-add-manual-billing-dialog',
  templateUrl: './add-manual-billing-dialog.component.html',
  styleUrls: ['./add-manual-billing-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddManualBillingDialogComponent implements OnInit, OnDestroy {
  private sub = new SubSink();
  formAddManualBilling: UntypedFormGroup;
  operationNameList = [
    {
      key: 'Scholarship fees <Student program>',
      value: 'scholarship_fees <student program>',
    },
    {
      key: 'Social Security',
      value: 'social_security',
    },
    {
      key: 'Schedule fees',
      value: 'schedule_fees',
    },
    {
      key: 'Administrative charges',
      value: 'administrative_charges',
    },
    {
      key: 'Additional costs - Rejection',
      value: 'additional_costs_rejection',
    },
    {
      key: 'Additional costs - Formal notice',
      value: 'additional_costs_formal_notice',
    },
    {
      key: 'Additional costs - Litigation',
      value: 'additional_costs_litigation',
    },
    {
      key: 'Additional costs - International transfer',
      value: 'additional_costs_international_transfer',
    },
  ];
  isWaitingForResponse = false;
  payer;
  isUpdate = false;
  comingFromFC = false;
  payerSelectedEdit;

  constructor(
    public dialogRef: MatDialogRef<AddManualBillingDialogComponent>,
    public translate: TranslateService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parseToUTC: ParseLocalToUtcPipe,
    private parseToLocal: ParseUtcToLocalPipe,
    private financeService: FinancesService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setPayerData();

    if (this.data?.isFC) {
      this.comingFromFC = true;
    }
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  setPayerData() {
    if (this.data?.dropdown?.length && this.data?.isUpdate) {
      if (this.data?.finance_organization_id?.company_branch_id?.company_name) {
        this.payer = {
          billing_id: this.data?.billing_id,
          payer_name: this.data?.finance_organization_id?.company_branch_id?.company_name,
        };
      } else if (this.data?.finance_organization_id?.organization_id?.name) {
        this.payer = {
          billing_id: this.data?.billing_id,
          payer_name: this.data?.finance_organization_id?.organization_id?.name,
        };
      } else {
        const isStudent = this.data?.dropdown?.filter(
          (data) => !data?.is_financial_support && !data?.company_branch_id && !data?.organization_id,
        );
        if (isStudent?.length) {
          this.payer = {
            billing_id: isStudent[0]?._id,
            payer_name:
              isStudent[0]?.candidate_id?.civility === 'neutral'
                ? `${isStudent[0]?.candidate_id?.first_name} ${isStudent[0]?.candidate_id?.last_name}`
                : `${isStudent[0]?.candidate_id?.civility} ${isStudent[0]?.candidate_id?.first_name} ${isStudent[0]?.candidate_id?.last_name}`,
          };
          this.formAddManualBilling.get('payeur').setValue(isStudent[0]?._id);
        }
      }
    }
    if (this.data?.isUpdate) {
      this.isUpdate = true;
      this.payerSelectedEdit = this.data?.finance_organization_id?._id ? this.data?.finance_organization_id?._id : this.data?.billing_id;

      const tempForm = {
        payeur: this.payerSelectedEdit,
        amount: this.data.debit ? this.data.debit : 0,
        operation_name: this.data?.operation_name?.includes('scholarship_fees')
          ? 'scholarship_fees <student program>'
          : this.data?.operation_name,
        date: this.data?.date_action?.date
          ? this.parseToLocal.transformDateToJavascriptDate(this.data?.date_action?.date, this.data?.date_action?.time)
          : null,
        note: this.data?.note,
        reference: this.data?.reference,
      };
      this.formAddManualBilling.patchValue(tempForm);
      // Disable form for note and refrence field
      this.formAddManualBilling.get('reference').disable();
      this.formAddManualBilling.get('note').disable();
    } else {
      this.isUpdate = false;
      if (this.data?.dropdown?.length) {
        const isStudent = this.data?.dropdown?.filter(
          (data) => !data?.is_financial_support && !data?.company_branch_id && !data?.organization_id,
        );
        if (isStudent?.length) {
          this.payer = {
            billing_id: isStudent[0]?._id,
            payer_name:
              isStudent[0]?.candidate_id?.civility === 'neutral'
                ? `${isStudent[0]?.candidate_id?.first_name} ${isStudent[0]?.candidate_id?.last_name}`
                : `${isStudent[0]?.candidate_id?.civility} ${isStudent[0]?.candidate_id?.first_name} ${isStudent[0]?.candidate_id?.last_name}`,
          };
          // Need to comment this one, for Expected Case 23 Finance v2 - 21/02/2023
          // this.formAddManualBilling.get('payeur').setValue(isStudent[0]?._id);
        }
      }
    }
  }

  initForm() {
    this.formAddManualBilling = this.fb.group({
      payeur: [null, Validators.required],
      amount: [null, Validators.required],
      operation_name: [null, Validators.required],
      date: [null, Validators.required],
      note: [null],
      reference: [null],
    });
  }

  payerSelect(data) {
    if (data) {
      this.payer = {
        billing_id: data._id,
        payer_name: '',
        orgId: null,
      };
      if (!data?.is_financial_support && !data?.company_branch_id && !data?.organization_id) {
        this.payer.payer_name =
          data?.candidate_id?.civility === 'neutral'
            ? `${data?.candidate_id?.first_name} ${data?.candidate_id?.last_name}`
            : `${data?.candidate_id?.civility} ${data?.candidate_id?.first_name} ${data?.candidate_id?.last_name}`;
      } else if (data?.is_financial_support && !data?.company_branch_id && !data?.organization_id) {
        this.payer.payer_name =
          data?.financial_support_info?.civility === 'neutral'
            ? `${data?.financial_support_info?.name} ${data?.financial_support_info?.family_name}`
            : `${data?.financial_support_info?.civility} ${data?.financial_support_info?.name} ${data?.financial_support_info?.family_name}`;
      } else if ((data?.is_financial_support || !data?.is_financial_support) && data?.company_branch_id) {
        this.payer.payer_name = data?.company_branch_id?.company_name;
        this.payer.orgId = data?.company_branch_id?._id;
      } else if (data?.organization_id) {
        this.payer.payer_name = data?.organization_id?.name;
        this.payer.orgId = data?.organization_id?._id;
      }
    }
  }

  submitVerification() {
    let typeBillingOrganization = false;
    if (this.formAddManualBilling.invalid) {
      this.formAddManualBilling.markAllAsTouched();
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      this.isWaitingForResponse = true;
      let operation = '';
      if (this.formAddManualBilling.value.operation_name === 'scholarship_fees <student program>') {
        operation = this.formAddManualBilling.value.operation_name.replace(
          '<student program>',
          this.displayProgram(this.data?.dropdown[0]?.candidate_id),
        );
      } else {
        operation = this.formAddManualBilling.value.operation_name;
      }

      if (!this.isUpdate) {
        const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
        const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
        typeBillingOrganization = isOrganization || isCompany;

        let payload = {
          billing_id: this.payer.billing_id ? this.payer.billing_id : null,
          payer: this.payer.payer_name ? this.payer.payer_name : '',
          operation_name: operation ? operation : '',
          amount: this.formAddManualBilling.value.amount ? parseFloat(this.formAddManualBilling.value.amount.toFixed(2)) : 0,
          date: this.formAddManualBilling.value.date
            ? this.parseToUTC.transformDate(this.formAddManualBilling.value.date.toLocaleDateString('en-GB'), '15:59')
            : '',
          reference: this.formAddManualBilling.get('reference').value,
          note: this.formAddManualBilling.get('note').value,
        };

        if (typeBillingOrganization) {
          const organizationId = {
            finance_organization_id: this.payer?.billing_id ? this.payer?.billing_id : null,
          };
          payload = {
            ...payload,
            ...organizationId,
          };
          this.financeService.createManualBillingFinanceOrganization(payload).subscribe(
            (resp) => {
              if (resp) {
                this.isWaitingForResponse = false;
                this.swalSuccessSubmit();
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorSubmit(err);
            },
          );
        } else {
          const billing_id = {
            billing_id: this.payer.billing_id ? this.payer.billing_id : null,
          };
          payload = {
            ...payload,
            ...billing_id,
          };
          this.sub.sink = this.financeService.createManualBilling(payload).subscribe(
            (resp) => {
              if (resp) {
                this.isWaitingForResponse = false;
                this.swalSuccessSubmit();
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorSubmit(err);
            },
          );
        }
      } else {
        const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
        const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
        typeBillingOrganization = isOrganization || isCompany;
        const payload = {
          _id: this.data._id ? this.data._id : null,
          operation_name: operation ? operation : '',
          amount: this.formAddManualBilling.value.amount ? parseFloat(this.formAddManualBilling.value.amount.toFixed(2)) : 0,
          date: this.formAddManualBilling.value.date
            ? this.parseToUTC.transformDate(this.formAddManualBilling.value.date.toLocaleDateString('en-GB'), '15:59')
            : '',
          reference: this.formAddManualBilling.get('reference').value,
          note: this.formAddManualBilling.get('note').value,
        };

        if (typeBillingOrganization) {
          this.sub.sink = this.financeService.updateManualBillingFinanceOrganization(payload).subscribe(
            (resp) => {
              if (resp) {
                this.isWaitingForResponse = false;
                this.swalSuccessSubmit();
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorSubmit(err);
            },
          );
        } else {
          this.sub.sink = this.financeService.updateManualBilling(payload).subscribe(
            (resp) => {
              if (resp) {
                this.isWaitingForResponse = false;
                this.swalSuccessSubmit();
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorSubmit(err);
            },
          );
        }
      }
    }
  }

  swalSuccessSubmit() {
    Swal.fire({
      type: 'success',
      title: this.translate.instant('Bravo!'),
      confirmButtonText: this.translate.instant('OK'),
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then(() => {
      this.dialogRef.close(true);
    });
  }

  swalErrorSubmit(err) {
    if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('BAD_CONNECTION.Title'),
        html: this.translate.instant('BAD_CONNECTION.Text'),
        confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    }
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  displayProgram(data) {
    let program = '';
    if (data?.intake_channel?.scholar_season_id?.scholar_season && data?.intake_channel?.program) {
      program = data?.intake_channel?.scholar_season_id?.scholar_season.concat(' ', data?.intake_channel?.program);
      return program;
    } else {
      return '';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
