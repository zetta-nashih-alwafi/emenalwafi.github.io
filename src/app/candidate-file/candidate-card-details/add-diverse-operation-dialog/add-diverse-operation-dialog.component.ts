import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-add-diverse-operation-dialog',
  templateUrl: './add-diverse-operation-dialog.component.html',
  styleUrls: ['./add-diverse-operation-dialog.component.scss'],
  providers: [ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class AddDiverseOperationDialogComponent implements OnInit {
  private sub = new SubSink();
  selectedPaymentMethods = [];
  formAddDiverseForm: UntypedFormGroup;
  paymentMethods = ['Credit', 'Debit'];
  operationNameListTypeCash = [
    {
      key: 'Cash transfer',
      value: 'cash_transfer',
    },
  ];
  operationNameListTypeAdjustment = [
    {
      key: 'Student Balance Adjustment',
      value: 'student_balance_adjustment',
    },
  ];

  ODTypeList = [
    {
      key: 'Cash transfer',
      value: 'cash_transfer',
    },
    {
      key: 'Student Balance Adjustment',
      value: 'student_balance_adjustment',
    },
  ];
  legalEntityList = [];
  LegalEntitasDestinationList = [];
  isPayeur = false;
  candidateList = [];
  comingFromFC = false;
  dataFinanceList = [];
  payerSelectedEdit: string;

  payer: any;
  isUpdate = false;
  isDebit = false;

  isWaitingForResponse = false;

  constructor(
    public dialogRef: MatDialogRef<AddDiverseOperationDialogComponent>,
    public translate: TranslateService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private finance: FinancesService,
    private userService: AuthService,
    private parseToUTC: ParseLocalToUtcPipe,
    private parseToLocal: ParseUtcToLocalPipe,
    private financeService: FinancesService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getInitialLegalEntitas();
    this.setPayerData();
  }

  initForm() {
    this.formAddDiverseForm = this.fb.group({
      od_type: [null, Validators.required],
      amount: [null, Validators.required],
      operation_name: [null, Validators.required],
      date: [null, Validators.required],
      legal_entity: [null, Validators.required],
      legal_entity_of_destination: [null, Validators.required],
      select_payment_method_available: [null, Validators.required],
      debit: [null, Validators.required],
      credit: [null],
      payeur: [null],
      reference: [null, Validators.required],
      note: [null],
    });
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  setPayerData() {
    this.payer = {
      billing_id: this.data?.billing_id?._id,
      payer_name: '',
    };

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
      }
    }
    if (this.data?.isUpdate) {
      this.isUpdate = true;
      this.selectedPaymentMethods = [];
      if (this.data?.credit) {
        this.selectedPaymentMethods.push('Credit');
      } else if (this.data?.debit) {
        this.selectedPaymentMethods.push('Debit');
      }
      this.payerSelectedEdit =
        this.data?.od_type === 'cash_transfer'
          ? null
          : this.data?.billing_id?._id
          ? this.data?.billing_id?._id
          : this.data?.finance_organization_id?._id;

      const temp = {
        od_type: this.data?.od_type ? this.data?.od_type : null,
        amount: this.data?.credit ? this.data?.credit : this.data?.debit,
        operation_name: this.data?.operation_name ? this.data?.operation_name : '',
        date: this.data?.date_action?.date
        ? this.parseToLocal.transformDateToJavascriptDate(this.data.date_action.date, this.data.date_action.time)
        : null,
        legal_entity: this.data?.initial_legal_entity_id?._id ? this.data?.initial_legal_entity_id?._id : null,
        legal_entity_of_destination: this.data?.destination_legal_entity_id?._id ? this.data?.destination_legal_entity_id?._id : null,
        select_payment_method_available: this.selectedPaymentMethods?.length ? this.selectedPaymentMethods : [],
        debit: this.selectedPaymentMethods?.includes('Debit') ? true : false,
        credit: this.selectedPaymentMethods?.includes('Credit') ? true : false,
        payeur: this.payerSelectedEdit,
        reference: this.data?.reference ? this.data?.reference : '',
        note: this.data?.note ? this.data?.note : '',
      };
      this.formAddDiverseForm.patchValue(temp);
      if (this.data?.od_type === 'student_balance_adjustment' && temp?.debit) {
        if (temp?.debit) {
          this.isDebit = true;
        }

        const found = this.data?.dropdown.find((resp) => resp?._id === this.payerSelectedEdit);
        if (found?.company_branch_id) {
          this.payer = {
            billing_id: this.data?.billing_id?._id,
            payer_name: found?.company_branch_id?.company_name,
          };
        }

        if (found?.organization_id) {
          this.payer = {
            billing_id: this.data?.billing_id?._id,
            payer_name: found?.organization_id?.name,
          };
        }
      } else if (this.data?.od_type === 'cash_transfer') {
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
        }
      }
      this.onSelectODType({ value: this.data?.od_type });
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
          // this.formAddDiverseForm.get('payeur').setValue(isStudent[0]?._id);
        }
      }
    }
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
      } else if (data?.company_branch_id) {
        this.payer.payer_name = data?.company_branch_id?.company_name;
      } else if (data?.organization_id) {
        this.payer.payer_name = data?.organization_id?.name;
      }
    }
  }

  onSelectPaymentMethod(index: number) {
    const methodIndex = this.selectedPaymentMethods ? this.selectedPaymentMethods.indexOf(this.paymentMethods[index]) : null;
    if (methodIndex >= 0) {
      this.selectedPaymentMethods = this.selectedPaymentMethods.filter((method) => method !== this.paymentMethods[index]);
      this.formAddDiverseForm.controls['select_payment_method_available'].patchValue(
        this.selectedPaymentMethods.filter((method) => method !== this.paymentMethods[index]),
      );
    } else {
      this.selectedPaymentMethods.push(this.paymentMethods[index]);
      this.formAddDiverseForm.controls['select_payment_method_available'].patchValue(this.selectedPaymentMethods);
    }
    this.formAddDiverseForm.updateValueAndValidity();
  }

  onSelectODType(event) {
    this.isPayeur = event.value === 'student_balance_adjustment';
    if (this.isPayeur) {
      // this.setPayerData();
      this.formAddDiverseForm.get('payeur').setValidators(Validators.required);
      this.formAddDiverseForm.get('legal_entity').removeValidators(Validators.required);
      this.formAddDiverseForm.get('legal_entity_of_destination').removeValidators(Validators.required);
      this.formAddDiverseForm.get('debit').setValidators(Validators.required);
      this.formAddDiverseForm.get('debit').updateValueAndValidity();
      this.formAddDiverseForm.get('select_payment_method_available').removeValidators(Validators.required);
      this.formAddDiverseForm.get('select_payment_method_available').updateValueAndValidity();
      this.formAddDiverseForm.get('payeur').updateValueAndValidity();
      this.formAddDiverseForm.get('legal_entity').updateValueAndValidity();
      this.formAddDiverseForm.get('legal_entity_of_destination').updateValueAndValidity();
    } else {
      this.formAddDiverseForm.get('payeur').removeValidators(Validators.required);
      this.formAddDiverseForm.get('legal_entity').setValidators(Validators.required);
      this.formAddDiverseForm.get('legal_entity_of_destination').setValidators(Validators.required);
      this.formAddDiverseForm.get('select_payment_method_available').setValidators(Validators.required);
      this.formAddDiverseForm.get('select_payment_method_available').updateValueAndValidity();
      this.formAddDiverseForm.get('debit').removeValidators(Validators.required);
      this.formAddDiverseForm.get('debit').updateValueAndValidity();
      this.formAddDiverseForm.get('payeur').updateValueAndValidity();
      this.formAddDiverseForm.get('legal_entity').updateValueAndValidity();
      this.formAddDiverseForm.get('legal_entity_of_destination').updateValueAndValidity();
    }
  }

  onSelectDebit() {
    this.formAddDiverseForm.get('debit').patchValue(true);
  }

  getInitialLegalEntitas() {
    this.isWaitingForResponse = true;
    this.sub.sink = this.finance.getInitialLegalEntitas().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          this.legalEntityList = _.cloneDeep(resp.sort((a, b) => (a.legal_entity_name > b.legal_entity_name ? 1 : -1)));
        } else {
          this.legalEntityList = [];
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
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

  submitVerification() {
    if (this.formAddDiverseForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.formAddDiverseForm.markAllAsTouched();
    } else {
      if (this.formAddDiverseForm.get('od_type').value === 'cash_transfer') {
        this.submitCashTransfer();
      } else if (this.formAddDiverseForm.get('od_type').value === 'student_balance_adjustment') {
        this.submitStudentBalanceAdjustment();
      }
    }
  }

  cashTransferPayload(data) {
    const form = _.cloneDeep(data);
    const payload = {
      od_type: form?.od_type ? form?.od_type : null,
      amount: form?.amount ? form?.amount : 0,
      operation_name: form?.operation_name ? form?.operation_name : '',
      date: form?.date ? this.parseToUTC.transformDate(form?.date.toLocaleDateString('en-GB'), '15:59') : '',
      initial_legal_entity_id: form?.legal_entity ? form?.legal_entity : null,
      destination_legal_entity_id: form?.legal_entity_of_destination ? form?.legal_entity_of_destination : null,
      is_debit: form?.select_payment_method_available?.includes('Debit') ? true : false,
      is_credit: form?.select_payment_method_available?.includes('Credit') ? true : false,
      reference: form?.reference ? form?.reference : '',
      note: form?.note ? form?.note : '',
      candidate_id: this.data?.candidate_id ? this.data?.candidate_id : null,
      intake_channel_id: this.data?.intake_channel_id ? this.data?.intake_channel_id : null,
      billing_id: this.payer?.billing_id ? this.payer?.billing_id : null,
    };
    return payload;
  }

  submitCashTransfer() {
    this.isWaitingForResponse = true;
    if (!this.isUpdate) {
      const payload = this.cashTransferPayload(this.formAddDiverseForm.value);
      if (payload) {
        this.sub.sink = this.financeService.addODCashTransfer(payload).subscribe(
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
    } else {
      const payload = this.cashTransferPayload(this.formAddDiverseForm.value);
      if (payload && this.data?._id) {
        this.sub.sink = this.financeService.editODCashTransfer(this.data._id, payload).subscribe(
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

  studentBalanceAdjustmentPayload(data): any {
    let typeBillingOrganization = false;
    const form = _.cloneDeep(data);
    let payload = {
      od_type: form?.od_type ? form?.od_type : null,
      amount: form?.amount ? form?.amount : 0,
      operation_name: form?.operation_name ? form?.operation_name : '',
      date: form?.date ? this.parseToUTC.transformDate(form?.date.toLocaleDateString('en-GB'), '15:59') : '',
      is_debit: form?.debit ? true : false,
      reference: form?.reference ? form?.reference : '',
      note: form?.note ? form?.note : '',
    };

    if (this.isUpdate) {
      const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
      const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
      typeBillingOrganization = isOrganization || isCompany;
      if (this.data.financement && typeBillingOrganization) {
        const organizationId = {
          finance_organization_id: this.payerSelectedEdit ? this.payerSelectedEdit : null,
        };
        payload = {
          ...payload,
          ...organizationId,
        };
      } else {
        const billingId = {
          billing_id: this.payerSelectedEdit ? this.payerSelectedEdit : null,
        };
        payload = {
          ...payload,
          ...billingId,
        };
      }
    } else {
      const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
      const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
      typeBillingOrganization = isOrganization || isCompany;
      if (this.data.financement && typeBillingOrganization) {
        const organizationId = {
          finance_organization_id: this.payer?.billing_id ? this.payer?.billing_id : null,
        };
        payload = {
          ...payload,
          ...organizationId,
        };
      } else {
        const billingId = {
          billing_id: this.payer?.billing_id ? this.payer?.billing_id : null,
        };
        payload = {
          ...payload,
          ...billingId,
        };
      }
    }

    return payload;
  }

  submitStudentBalanceAdjustment() {
    let typeBillingOrganization = false;
    this.isWaitingForResponse = true;
    if (!this.isUpdate) {
      const payload = this.studentBalanceAdjustmentPayload(this.formAddDiverseForm.value);
      const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
      const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
      typeBillingOrganization = isOrganization || isCompany;
      if (payload) {
        if (this.data.financement && typeBillingOrganization) {
          this.sub.sink = this.financeService.addODStudentBalanceAdjustementFinanceOrganization(payload).subscribe(
            (resp) => {
              this.swalSuccessSubmit();
            },
            (err) => {
              this.swalErrorSubmit(err);
            },
          );
        } else {
          this.sub.sink = this.financeService.addODStudentBalanceAdjustement(payload).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.swalSuccessSubmit();
            },
            (err) => {
              this.isWaitingForResponse = false;
              this.swalErrorSubmit(err);
            },
          );
        }
      }
    } else {
      const payload = this.studentBalanceAdjustmentPayload(this.formAddDiverseForm.value);
      const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
      const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
      typeBillingOrganization = isOrganization || isCompany;

      if (payload && this.data?._id) {
        if (this.data.financement && typeBillingOrganization) {
          this.sub.sink = this.financeService.editODStudentBalanceAdjustementFinanceOrganization(this.data._id, payload).subscribe(
            (resp) => {
              this.swalSuccessSubmit();
            },
            (err) => {
              this.swalErrorSubmit(err);
            },
          );
        } else {
          this.sub.sink = this.financeService.editODStudentBalanceAdjustement(this.data._id, payload).subscribe(
            (resp) => {
              this.isWaitingForResponse = false;
              this.swalSuccessSubmit();
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
}
