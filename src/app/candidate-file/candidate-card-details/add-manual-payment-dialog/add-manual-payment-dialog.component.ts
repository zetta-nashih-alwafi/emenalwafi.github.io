import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { FinancesService } from 'app/service/finance/finance.service';
import Swal from 'sweetalert2';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-add-manual-payment-dialog',
  templateUrl: './add-manual-payment-dialog.component.html',
  styleUrls: ['./add-manual-payment-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddManualPaymentDialogComponent implements OnInit {
  private subs = new SubSink();
  formAddManualPaymentLine: UntypedFormGroup;
  amountDateIncrement = 0;
  dataLegalEntity: any;
  isLegalEntity = false;
  amountTotalValue;
  dataDateCollectArray;

  avoirOrg: boolean;
  avoirStu: boolean;
  operationNameList = [
    {
      key: 'Payment of the term',
      value: 'payment_of_term',
    },
    {
      key: 'Regulation Payment',
      value: 'regulation_payment',
    },
  ];
  methodOfPaymentList = [
    {
      key: 'Sepa',
      value: 'sepa',
    },
    {
      key: 'Check',
      value: 'check',
    },
    {
      key: 'transfer',
      value: 'transfer',
    },
    {
      key: 'Credit card',
      value: 'credit_card',
    },
    {
      key: 'Cash',
      value: 'cash',
    },
  ];
  comingFromFC = false;
  candidateList = [];
  dataFinanceList = [];
  minDeduction = true;
  maxDeduction = false;
  isTotalCost = false;
  totalCostAmount = false;
  payer;

  isWaitingForResponse = false;
  isUpdate = false;

  constructor(
    public dialogRef: MatDialogRef<AddManualPaymentDialogComponent>,
    public translate: TranslateService,
    private fb: FormBuilder,
    private financeService: FinancesService,
    private parseToUTC: ParseLocalToUtcPipe,
    private parseToLocal: ParseUtcToLocalPipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setPayerData();
    this.sortingAllListSelect();
    this.sortingAllListSelectTranslate();
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
          this.formAddManualPaymentLine.get('payeur').setValue(isStudent[0]?._id);
        }
      }
    }
    if (this.data?.isUpdate) {
      console.log('DATA: ', this.data)
      this.isUpdate = true;
      this.payer = { orgId: this.data?.isFinancement ? this.data?.isFinancement : null };
      const date = [
        {
          date: this.data?.date_action?.date
            ? this.parseToLocal.transformDateToJavascriptDate(this.data?.date_action?.date, this.data?.date_action?.time)
            : null,
          date_amount: this.data.credit ? this.data.credit : 0,
        },
      ];
      const tempForm = {
        payeur: this.data.billing_id,
        amount: this.data.credit ? this.data.credit : 0,
        operation_name: this.data.operation_name,
        method_of_payment: this.data.nature,
        reference: this.data.reference,
        note: this.data.note,
        dateCollectArray: date,        
      };
      this.formAddManualPaymentLine.patchValue(tempForm);
      // Disable form for note and refrence field
      this.formAddManualPaymentLine.get('reference').disable();
      this.formAddManualPaymentLine.get('note').disable();
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
          // this.formAddManualPaymentLine.get('payeur').setValue(isStudent[0]?._id);
        }
      }
    }
  }

  sortingAllListSelect() {
    this.operationNameList = this.operationNameList.sort((a, b) => {
      return this.translate.instant(a.key).localeCompare(this.translate.instant(b.key));
    });

    this.methodOfPaymentList = this.methodOfPaymentList.sort((a, b) => {
      return this.translate.instant('method_of_payment.' + a.key).localeCompare(this.translate.instant('method_of_payment.' + b.key));
    });
  }

  sortingAllListSelectTranslate() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingAllListSelect();
    });
  }

  initForm() {
    this.formAddManualPaymentLine = this.fb.group({
      amount: [null, [Validators.required, Validators.min(2)]],
      operation_name: [null, Validators.required],
      payeur: [null, Validators.required],
      method_of_payment: [null, Validators.required],
      reference: [null],
      note: [null],
      dateCollectArray: this.fb.array([this.initDateFromArray()]),      
    });
  }

  get dateArray() {
    return this.formAddManualPaymentLine.get('dateCollectArray') as UntypedFormArray;
  }

  initDateFromArray() {
    return this.fb.group({
      date: [null, Validators.required],
      amount_date: [null, Validators.min(2)],
    });
  }

  addDateDynamic() {
    this.initDateFromArray().controls.date.setValidators(Validators.required);
    this.initDateFromArray().controls.date.updateValueAndValidity();
    this.dateArray.push(this.initDateFromArray());
    this.recalculateAmountByDate();
  }

  listenAmount() {
    this.recalculateAmountByDate();
  }

  recalculateAmountByDate() {
    let totalAmountChecked = 0;
    let endAddedTotalAmount = 0;
    this.dataDateCollectArray = this.formAddManualPaymentLine.get('dateCollectArray').value;
    const controlDateArray = _.cloneDeep(this.dataDateCollectArray);
    const controlDateArrayLength = controlDateArray.length - 1;
    this.amountTotalValue = this.formAddManualPaymentLine.get('amount').value;
    const lengthDateArray = controlDateArray && controlDateArray.length ? controlDateArray.length : 0;
    const percentage = lengthDateArray > 1 ? 100 / lengthDateArray : 100;
    const totalAmount = parseFloat(((percentage / 100) * this.amountTotalValue).toFixed(2));

    if (this.dataDateCollectArray && this.dataDateCollectArray?.length) {
      controlDateArray.forEach((item, index) => {
        if (this.dataDateCollectArray && this.dataDateCollectArray.length) {
          totalAmountChecked = totalAmountChecked + totalAmount;
          this.dateArray?.at(index).get('amount_date')?.patchValue(totalAmount);
          if (totalAmountChecked !== this.amountTotalValue) {
            const addedTotalAmount = Number((totalAmountChecked - this.amountTotalValue).toFixed(2));
            endAddedTotalAmount = Number((totalAmount - addedTotalAmount).toFixed(2));
            this.dateArray?.at(controlDateArrayLength).get('amount_date')?.patchValue(endAddedTotalAmount);
            this.dateArray?.at(controlDateArrayLength).get('amount_date')?.patchValue(endAddedTotalAmount);
          }
        } else {
          this.dateArray?.at(controlDateArrayLength).get('amount_date')?.patchValue(null);
        }
      });
    }

    this.checkValidation(controlDateArrayLength);
  }

  checkValidation(item) {
    if (this.checkMinDeduction(item)) {
      this.minDeduction = true;
      this.maxDeduction = false;
      this.isTotalCost = false;
      this.totalCostAmount = false;
    } else if (this.checkMaxDeduction(item)) {
      this.minDeduction = false;
      this.maxDeduction = true;
      this.isTotalCost = false;
      this.totalCostAmount = false;
    } else if (this.checkTotalCost()) {
      this.minDeduction = false;
      this.maxDeduction = false;
      this.isTotalCost = true;
      this.totalCostAmount = false;
    } else if (this.checkTotalCostAmount()) {
      this.minDeduction = false;
      this.maxDeduction = false;
      this.isTotalCost = false;
      this.totalCostAmount = true;
    } else {
      this.minDeduction = false;
      this.maxDeduction = false;
      this.isTotalCost = false;
      this.totalCostAmount = false;
    }
  }

  checkMinDeduction(item) {
    const form = this.dateArray?.at(item).get('amount_date')?.value;
    this.minDeduction = form < 2;
    return this.minDeduction;
  }

  checkMaxDeduction(item) {
    const form = this.dateArray?.at(item).get('amount_date')?.value;
    const amountTotalValue = this.formAddManualPaymentLine.get('amount').value;
    return (this.maxDeduction = form > amountTotalValue);
  }

  checkTotalCost() {
    let totalCost = 0;
    const formArrayDate = this.formAddManualPaymentLine.get('dateCollectArray').value;
    const amountValue = this.formAddManualPaymentLine.get('amount').value;
    if (formArrayDate && formArrayDate.length) {
      formArrayDate.forEach((item) => {
        totalCost = totalCost + item.amount_date;
      });
    }

    return (this.isTotalCost = totalCost > amountValue);
  }

  checkTotalCostAmount() {
    let totalCost = 0;
    const form = this.dateArray.value;
    const amountValue = this.formAddManualPaymentLine.get('amount').value;
    if (form && form.length) {
      form.forEach((item) => {
        item.amount_date = item.amount_date ? item.amount_date : 0;
        totalCost = totalCost + item.amount_date;
      });
    }

    return (this.totalCostAmount = totalCost < amountValue && totalCost > 1);
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

  removeAmountDate(item) {
    this.dateArray.removeAt(item);
    this.recalculateAmountByDate();
  }

  submitVerification() {
    if (this.formAddManualPaymentLine.invalid) {
      this.formAddManualPaymentLine.markAllAsTouched();
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      this.isWaitingForResponse = true;
      const form = _.cloneDeep(this.formAddManualPaymentLine.value);
      if (!this.isUpdate) {
        let payment_line_inputs = [{
          reference: this.formAddManualPaymentLine.value.reference,
          note: this.formAddManualPaymentLine.value.note
        }];
        if (form?.dateCollectArray?.length) {
          payment_line_inputs = form.dateCollectArray.map((data) => {
            return {
              amount: data?.amount_date,
              date: data?.date ? this.parseToUTC.transformDate(data?.date.toLocaleDateString('en-GB'), '15:59') : '',
            };
          });
        }
        const payload = {
          billing_id: this.payer.billing_id ? this.payer.billing_id : null,
          payer: this.payer.payer_name ? this.payer.payer_name : '',
          operation_name: form?.operation_name ? form?.operation_name : '',
          amount: form?.amount ? form?.amount : 0,
          method_of_payment: form?.method_of_payment ? form?.method_of_payment : '',
          payment_line_inputs: payment_line_inputs?.length ? payment_line_inputs : [],
          reference: form?.reference,
          note: form?.note,
        };
        if (payload) {
          if (this.payer?.orgId) {
            this.subs.sink = this.financeService.createManualPaymentLineFinanceOrganization(payload).subscribe(
              (resp) => {
                this.isWaitingForResponse = false;
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
              },
              (err) => {
                this.isWaitingForResponse = false;
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
              },
            );
          } else {
            this.subs.sink = this.financeService.createManualPaymentLine(payload).subscribe(
              (resp) => {
                this.isWaitingForResponse = false;
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
              },
              (err) => {
                this.isWaitingForResponse = false;
                const msg = String(err?.message)
                if (msg.includes('Network error: Http failure response for')) {
                  Swal.fire({
                    type: 'warning',
                    title: this.translate.instant('BAD_CONNECTION.Title'),
                    html: this.translate.instant('BAD_CONNECTION.Text'),
                    confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
                    allowOutsideClick: false,
                    allowEnterKey: false,
                    allowEscapeKey: false,
                  });
                } else if (msg.includes('Missing IBAN/BIC/Account Holder Name')) {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('Add_Payment_Line_S1.TITLE'),
                    html: this.translate.instant('Add_Payment_Line_S1.TEXT'),
                    confirmButtonText: this.translate.instant('Add_Payment_Line_S1.BUTTON'),
                    allowOutsideClick: false,
                    allowEnterKey: false,
                    allowEscapeKey: false,
                  })
                } else {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  });
                }
              },
            );
          }
        }
      } else {
        if (this.payer?.orgId) {
          const payload = {
            master_transaction_id: this.data?._id ? this.data?._id : null,
            new_amount: form?.amount ? form?.amount : 0,
          };
          this.financeService.updateManualPaymentFinanceOrganization(payload).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
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
            },
            (err) => {
              this.isWaitingForResponse = false;
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
            },
          );
        } else {
          const payload = {
            master_transaction_id: this.data?._id ? this.data?._id : null,
            new_amount: form?.amount ? form?.amount : 0,
          };
          this.financeService.updateManualPaymentLine(payload).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
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
            },
            (err) => {
              this.isWaitingForResponse = false;
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
            },
          );
        }
      }
    }
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*[.,]?\d{0,2}$/;
    const input = event.target.value + String.fromCharCode(event.charCode);
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }
}
