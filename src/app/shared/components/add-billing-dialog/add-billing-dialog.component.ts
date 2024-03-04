import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import Swal from 'sweetalert2';
import { FormBuilder, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import * as moment from 'moment';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ms-add-billing-dialog',
  templateUrl: './add-billing-dialog.component.html',
  styleUrls: ['./add-billing-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddBillingDialogComponent implements OnInit, OnDestroy {
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

  constructor(
    public dialogRef: MatDialogRef<AddBillingDialogComponent>,
    public translate: TranslateService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parseToUTC: ParseLocalToUtcPipe,
    private parseToLocal: ParseUtcToLocalPipe,
    private financeService: FinancesService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.payerList();

    this.checkingAmount();
  }

  checkingAmount() {
    this.sub.sink = this.formAddManualBilling.get('amount').valueChanges.subscribe((resp) => {
      if (resp && resp > 0) {
        this.disablePayer(false);
      } else {
        this.disablePayer(true);
      }
    });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  disablePayer(isDisable) {
    const payers = this.payerAmountArray.value;
    if (payers?.length) {
      payers.forEach((payer, index) => {
        if (isDisable) {
          this.payerAmountArray.at(index).get('amount_seperate').disable();
        } else {
          this.payerAmountArray.at(index).get('amount_seperate').enable();
        }
      });
    }
  }

  initForm() {
    this.formAddManualBilling = this.fb.group({
      payeur_amount: this.fb.array([]),
      amount: [null, Validators.required],
      operation_name: [null, Validators.required],
      date: [null, Validators.required],
      note: [null],
      reference: [null],
    });
  }

  get payerAmountArray() {
    return this.formAddManualBilling.get('payeur_amount') as UntypedFormArray;
  }

  initPayerAmountArray(item) {
    return this.fb.group({
      name_payer: [this.payer.payer_name, Validators.required],
      payer: [item?._id, Validators.required],
      amount_seperate: [null, Validators.required],
      isStudent: [item?.isStudent],
      isFinancement: [item?.isFinancement],
    });
  }

  payerList() {
    if (this.data?.dropdown?.length) {
      this.data?.dropdown.forEach((item) => {
        if (item) {
          this.payer = {
            billing_id: item._id,
            payer_name: '',
          };
          if (!item?.is_financial_support && !item?.company_branch_id && !item?.organization_id) {
            this.payer.payer_name =
              item?.candidate_id?.civility === 'neutral'
                ? `${item?.candidate_id?.first_name} ${item?.candidate_id?.last_name}`
                : `${item?.candidate_id?.civility} ${item?.candidate_id?.first_name} ${item?.candidate_id?.last_name}`;
            item['isStudent'] = true;
          } else if (item?.is_financial_support && !item?.company_branch_id && !item?.organization_id) {
            this.payer.payer_name =
              item?.financial_support_info?.civility === 'neutral'
                ? `${item?.financial_support_info?.name} ${item?.financial_support_info?.family_name}`
                : `${item?.financial_support_info?.civility} ${item?.financial_support_info?.name} ${item?.financial_support_info?.family_name}`;
            item['isStudent'] = true;
          } else if ((item?.is_financial_support || !item?.is_financial_support) && item?.company_branch_id) {
            this.payer.payer_name = item?.company_branch_id?.company_name;
            item['isFinancement'] = true;
          } else if (item?.organization_id) {
            this.payer.payer_name = item?.organization_id?.name;
            item['isFinancement'] = true;
          }

          this.payerAmountArray.push(this.initPayerAmountArray(item));
        }
      });

      if (this.data?.isUpdate) {
        this.isUpdate = true;
        const tempForm = {
          payeur: this.data.billing_id,
          amount: this.data.debit ? this.data.debit : 0,
          operation_name: this.data?.operation_name?.includes('scholarship_fees')
            ? 'scholarship_fees <student program>'
            : this.data?.operation_name,
          date: this.data?.date_action ? moment(this.data?.date_action?.date, 'DD/MM/YYYY').format('YYYY-MM-DD') : null,
          note: this.data?.note,
          reference: this.data?.reference,
        };

        let payers = [];
        if (this.data?.manual_billings?.length) {
          payers = this.mappingPayers(this.data?.manual_billings);
          this.formAddManualBilling.patchValue(tempForm);
          this.payerAmountArray.patchValue(payers);
        } else {
          this.formAddManualBilling.patchValue(tempForm);
        }

        this.formAddManualBilling.get('note').disable();
        this.formAddManualBilling.get('reference').disable();
      } else {
        this.disablePayer(true);
        this.recalculateAmountForPayerEqual();
      }
    }
  }

  mappingPayers(dataPayers) {
    let result = [];
    result = dataPayers.map((item) => {
      let namePayer;
      let isBilling = false;

      if (item?.billing_id) {
        if (!item?.billing_id?.is_financial_support) {
          namePayer =
            item?.billing_id?.candidate_id?.civility === 'neutral'
              ? `${item?.billing_id?.candidate_id?.first_name} ${item?.billing_id?.candidate_id?.last_name}`
              : `${item?.billing_id?.candidate_id?.civility} ${item?.billing_id?.candidate_id?.first_name} ${item?.billing_id?.candidate_id?.last_name}`;

          isBilling = true;
        } else {
          namePayer =
            item?.billing_id?.financial_support_info?.civility === 'neutral'
              ? `${item?.billing_id?.financial_support_info?.name} ${item?.billing_id?.financial_support_info?.family_name}`
              : `${item?.billing_id?.financial_support_info?.civility} ${item?.billing_id?.financial_support_info?.name} ${item?.billing_id?.financial_support_info?.family_name}`;

          isBilling = true;
        }
      } else if (item?.finance_organization_id) {
        if (item?.finance_organization_id?.company_branch_id) {
          namePayer = item?.finance_organization_id?.company_branch_id?.company_name;
          isBilling = false;
        } else if (item?.finance_organization_id?.organization_id) {
          namePayer = item?.finance_organization_id?.organization_id?.name;
          isBilling = false;
        }
      }

      return {
        name_payer: namePayer,
        payer: isBilling ? item?.billing_id?._id : item?.finance_organization_id?._id,
        amount_seperate: item?.amount,
        isStudent: isBilling ? true : false,
        isFinancement: !isBilling ? true : false,
      };
    });

    return result;
  }

  payerSelect(data) {
    if (data) {
      this.payer = {
        billing_id: data._id,
        payer_name: '',
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
      } else if (data?.organization_id) {
        this.payer.payer_name = data?.organization_id?.name;
      }
    }
  }

  submitVerification() {
    if (this.formAddManualBilling.invalid) {
      this.formAddManualBilling.markAllAsTouched();
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('Invalid_Form_Warning.TITLE'),
        html: this.translate.instant('Invalid_Form_Warning.TEXT'),
        confirmButtonText: this.translate.instant('Invalid_Form_Warning.BUTTON'),
      });
    } else {
      if (!this.isUpdate) {
        let operation_name = '';
        if (this.formAddManualBilling.get('operation_name').value === 'scholarship_fees <student program>') {
          operation_name = this.formAddManualBilling
            .get('operation_name')
            .value?.replace('<student program>', this.displayProgram(this.data?.dropdown[0]?.candidate_id));
        } else {
          operation_name = this.formAddManualBilling.value.operation_name;
        }

        let payers = this.payerAmountArray.value ? this.payerAmountArray.value : [];

        if (payers?.length) {
          payers = payers.map((resp) => {
            return {
              billing_id: resp?.isStudent ? resp?.payer : null,
              finance_organization_id: resp?.isFinancement ? resp?.payer : null,
              amount: resp?.amount_seperate,
            };
          });

          payers.forEach((resp) => {
            if (!resp?.billing_id) {
              delete resp?.billing_id;
            }

            if (!resp?.finance_organization_id) {
              delete resp?.finance_organization_id;
            }
          });
        }

        const payload = {
          billing_id: payers?.length ? payers[0].billing_id : '',
          amount: this.formAddManualBilling.get('amount').value,
          operation_name,
          date: this.formAddManualBilling.get('date').value
            ? this.parseToUTC.transformDate(this.formAddManualBilling.get('date').value.toLocaleDateString('en-GB'), '15:59')
            : '',
          reference: this.formAddManualBilling.get('reference').value,
          note: this.formAddManualBilling.get('note').value,
          payers,
        };

        this.isWaitingForResponse = true;
        this.sub.sink = this.financeService.createManualBillingImprovement(payload).subscribe(
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
        let operation_name = '';
        if (this.formAddManualBilling.get('operation_name').value === 'scholarship_fees <student program>') {
          operation_name = this.formAddManualBilling
            .get('operation_name')
            .value?.replace('<student program>', this.displayProgram(this.data?.dropdown[0]?.candidate_id));
        } else {
          operation_name = this.formAddManualBilling.value.operation_name;
        }

        let payers = this.payerAmountArray.value ? this.payerAmountArray.value : [];

        if (payers?.length) {
          payers = payers.map((resp) => {
            return {
              billing_id: resp?.isStudent ? resp?.payer : null,
              finance_organization_id: resp?.isFinancement ? resp?.payer : null,
              amount: resp?.amount_seperate,
            };
          });

          payers.forEach((resp) => {
            if (!resp?.billing_id) {
              delete resp?.billing_id;
            }

            if (!resp?.finance_organization_id) {
              delete resp?.finance_organization_id;
            }
          });
        }

        const date = moment(this.formAddManualBilling.get('date').value, 'YYYY-MM-DD').format('DD/MM/YYYY');

        const payload = {
          billing_id: this.data?._id,
          amount: this.formAddManualBilling.get('amount').value,
          operation_name,
          date: this.formAddManualBilling.get('date').value ? date : '',
          payers,
        };

        this.isWaitingForResponse = true;

        this.sub.sink = this.financeService.updateManualBilling(payload).subscribe(
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

  recalculateAmountForPayerEqual() {
    let totalAmountChecked = 0;
    let endAddedTotalAmount = 0;
    const payerForm = this.formAddManualBilling.get('payeur_amount').value;
    const controlDateArray = _.cloneDeep(payerForm);
    const controlDateArrayLength = controlDateArray.length - 1;
    const totalAmountPayer = this.formAddManualBilling.get('amount').value;
    const lengthDateArray = controlDateArray && controlDateArray.length ? controlDateArray.length : 0;
    const percentage = lengthDateArray > 1 ? 100 / lengthDateArray : 100;
    const totalAmount = parseFloat(((percentage / 100) * totalAmountPayer).toFixed(2));

    if (payerForm && payerForm?.length) {
      controlDateArray.forEach((item, index) => {
        if (payerForm && payerForm?.length) {
          totalAmountChecked = totalAmountChecked + totalAmount;
          this.payerAmountArray?.at(index).get('amount_seperate')?.patchValue(totalAmount);
          if (totalAmountChecked !== totalAmountPayer) {
            const addedTotalAmount = Number((totalAmountChecked - totalAmountPayer).toFixed(2));
            endAddedTotalAmount = Number((totalAmount - addedTotalAmount).toFixed(2));
            this.payerAmountArray?.at(controlDateArrayLength).get('amount_seperate')?.patchValue(endAddedTotalAmount);
            this.payerAmountArray?.at(controlDateArrayLength).get('amount_seperate')?.patchValue(endAddedTotalAmount);
          }
        } else {
          this.payerAmountArray?.at(controlDateArrayLength).get('amount_seperate')?.patchValue(null);
        }
      });
    }
  }

  recaculateAmountPayer(currentIndex) {
    const totalPayer = this.data?.dropdown?.length;
    const totalAmount = this.formAddManualBilling.get('amount').value;

    //*************** Case if total payer only 2
    if (totalPayer === 2) {
      const amountChanges = this.payerAmountArray?.at(currentIndex).get('amount_seperate').value;
      //*************** since only 2 payer we can get other index with this for patch value
      const updatedIndex = currentIndex === 0 ? 1 : 0;
      //*************** calculation inputted amount - total amount for value patch to other index
      const updatedAmount = Number((totalAmount - amountChanges).toFixed(2));
      //*************** If user put amount less than or equal totalamount will go in here
      if (amountChanges <= totalAmount) {
        this.payerAmountArray.at(updatedIndex).get('amount_seperate').patchValue(updatedAmount);
        //*************** Need to call this one since in else we add manual error
        this.payerAmountArray.at(currentIndex).get('amount_seperate').updateValueAndValidity();
      } else {
        //*************** Add error if user put amount greater than total amount
        this.payerAmountArray.at(currentIndex).get('amount_seperate').setErrors({
          over: true,
        });
        //*************** Need to patch other payer to be 0 so it will not effected
        this.payerAmountArray.at(updatedIndex).get('amount_seperate').patchValue(0);
      }
    } else if (totalPayer > 2) {
      //*************** case if total payer have more than 2
      //*************** variable for store other amount of payer
      let amountUsed = 0;
      const payers = this.formAddManualBilling.get('payeur_amount').value;
      payers.forEach((resp, index) => {
        //*************** since the update only greater than index selected need add validation in here
        if (index < currentIndex && currentIndex !== payers.length - 1) {
          amountUsed = amountUsed + resp?.amount_seperate;
        } else if (currentIndex === payers.length - 1) {
          if (index !== 0 && index !== currentIndex) {
            amountUsed += resp?.amount_seperate;
          }
        }
      });
      const amountChanges = this.payerAmountArray?.at(currentIndex).get('amount_seperate').value;
      //*************** need multiply amountused and amountchanges for conditional when check later on
      amountUsed = amountUsed + amountChanges;
      //*************** calculate remaining amount by divided total amount with amountused
      const remainingAmount = Number((totalAmount - amountUsed).toFixed(2));
      //*************** variable for storing index that affected when amount got changes
      let indexEffected = [];
      //*************** looping payers to check which index greater than selected index, and it will store to indexEffected variable
      payers.forEach((resp, index) => {
        if (index > currentIndex && currentIndex !== payers.length - 1) {
          indexEffected.push(index);
        } else if (currentIndex === payers.length - 1) {
          indexEffected.push(0);
        }
      });

      if (amountUsed <= totalAmount) {
        //*************** condition if amountused less than or same with totalAmount
        if (currentIndex === totalPayer - 1) {
          //*************** condition if currentindex is lastindex
          this.payerAmountArray?.at(0).get('amount_seperate').patchValue(remainingAmount);
          this.payerAmountArray?.at(0).get('amount_seperate').updateValueAndValidity();
        } else {
          //*************** condition if currentindex isnt coming from lastindex
          if (indexEffected.length) {
            const equalAmounts = Number((remainingAmount / indexEffected.length).toFixed(2));
            //*************** to check if there is dividen and it will give to last index
            const dividen: any =
              equalAmounts * indexEffected.length + amountUsed === totalAmount
                ? 0
                : Number(totalAmount - (equalAmounts * indexEffected.length + amountUsed)).toFixed(2);
            const lastIndexAmount = Number(equalAmounts) + Number(dividen);
            indexEffected.forEach((indexEff) => {
              if (indexEff === payers.length - 1) {
                this.payerAmountArray?.at(indexEff).get('amount_seperate').patchValue(lastIndexAmount);
              } else {
                this.payerAmountArray?.at(indexEff).get('amount_seperate').patchValue(equalAmounts);
              }
            });
          }
        }
      } else {
        //*************** condition if amountused greater than with totalAmount and set error if total amount exceed
        this.payerAmountArray.at(currentIndex).get('amount_seperate').setErrors({
          over: true,
        });
        //*************** replace all indexEffected with zero value to prevent any error
        if (indexEffected.length) {
          indexEffected.forEach((indexEff) => {
            this.payerAmountArray?.at(indexEff).get('amount_seperate').patchValue(0);
          });
        }
      }
    } else {
      //*************** condition where if only have 1 payer
      const payers = this.formAddManualBilling.get('payeur_amount').value;
      let amounSeperated = 0;
      payers.forEach((resp, index) => {
        amounSeperated += resp?.amount_seperate;
      });
      if (amounSeperated < totalAmount) {
        this.payerAmountArray?.at(0).get('amount_seperate').setErrors({
          below: true,
        });
      } else {
        if (amounSeperated > totalAmount) {
          this.payerAmountArray?.at(0).get('amount_seperate').setErrors({
            over: true,
          });
        } else {
          this.payerAmountArray?.at(0).get('amount_seperate').updateValueAndValidity();
        }
      }
      return;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
