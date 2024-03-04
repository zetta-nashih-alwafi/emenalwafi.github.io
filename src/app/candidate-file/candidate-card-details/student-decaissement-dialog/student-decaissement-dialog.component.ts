import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-student-decaissement-dialog',
  templateUrl: './student-decaissement-dialog.component.html',
  styleUrls: ['./student-decaissement-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseUtcToLocalPipe],
})
export class StudentDecaissementDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isLegalEntity = false;
  billingId: any;
  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  countryList;
  filteredCountry: any[][] = [];
  payerSelectedEdit: string;

  refundOrg: boolean;
  refundStu: boolean;
  isUpdate = false;

  bank = [
    'Banque Tarneaud',
    'BNP Paribas',
    'Credit Agricole',
    'BPCE',
    'Societe Generale',
    'Groupe Crédit Mutuel',
    'Crédit Cooperatif',
    'La Banque Postale',
    'Crédit du Nord',
    'AXA Banque',
    'Banque Palatine',
    'HSBC France',
    'CIC Banque Transatlantique',
    'BRED Banque Populaire',
  ];
  operationNameList = [
    {
      key: 'Refund',
      value: 'refund',
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

  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];
  dataLegalEntity: any;
  regions: string[][] = [];
  filteredRegions: string[][] = [];
  dataFinanceList = [];
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  isWaitingForResponse = false;

  payer;

  constructor(
    public dialogRef: MatDialogRef<StudentDecaissementDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private acadJourneyService: AcademicJourneyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private financeService: FinancesService,
    private parseToUTC: ParseUtcToLocalPipe,
    private parseToLocal: ParseUtcToLocalPipe,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    this.setPayerData();
    // this.sortingAllListSelect();
    // this.sortingAllListSelectTranslate();
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  setPayerData() {
    this.payer = {
      billing_id: this.data?.billing_id,
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
      this.isUpdate = true
      this.identityForm?.get('note')?.disable();
      this.identityForm?.get('reference')?.disable();
      this.identityForm?.get('from')?.disable();
      this.identityForm?.get('date')?.disable();
      this.payerSelectedEdit = this.data?.finance_organization_id?._id ? this.data?.finance_organization_id?._id : this.data?.billing_id;
      const tempForm = {
        payment_method: this.data?.method_of_payment ? this.data?.method_of_payment : '',
        from: this.data?.legal_entity_id?.legal_entity_name ? this.data?.legal_entity_id?.legal_entity_name : '',
        who: this.payerSelectedEdit,
        amount: this.data?.debit ? this.data?.debit : 0,
        operation_name: this.data?.operation_name?.includes('scholarship_fees')
          ? 'scholarship_fees <student program>'
          : this.data?.operation_name,
        date: this.data?.date_action?.date
          ? this.parseToLocal.transformDateToJavascriptDate(this.data?.date_action?.date, this.data?.date_action?.time)
          : null,
        reference: this.data?.reference ? this.data?.reference : '',
        note: this.data?.note ? this.data?.note : '',
      };
      this.identityForm.patchValue(tempForm);

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
          // this.identityForm.get('who').setValue(isStudent[0]?._id);
        }
        this.getLegalEntity();
      }
    }
  }

  sortingAllListSelect() {
    this.operationNameList = this.operationNameList.sort((a, b) => {
      return this.translate.instant(a.key).localeCompare(this.translate.instant(b.key));
    });

    this.methodOfPaymentList = this.methodOfPaymentList.sort((a, b) => {
      return this.translate.instant(a.key).localeCompare(this.translate.instant(b.key));
    });
  }
  sortingAllListSelectTranslate() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingAllListSelect();
    });
  }

  getFinanceList() {
    this.bank = this.bank.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
      this.currencyList = list;
    });
    if (this.data && this.data.data && this.data.data.financial_supports && this.data.data.financial_supports.length) {
      this.dataFinanceList = this.data.data.financial_supports.map((list) => {
        return {
          civility: list && list.civility && list.civility !== 'neutral' ? list.civility : '',
          email: list.email,
          last_name: list.family_name + ' (' + this.translate.instant('CARDDETAIL.RELATION.' + list.relation) + ')',
          first_name: list.name,
          billing_id: this.data.data._id,
          is_student: false,
          value:
            (list && list.civility && list.civility !== 'neutral' ? this.translate.instant(list.civility) + ' ' : '') +
            list.name +
            ' ' +
            list.family_name +
            ' (' +
            this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
            ')',
        };
      });
    } else if (this.data && this.data.dataFinance) {
      const financeInfo = [this.data.dataFinance.financial_support_info];
      this.dataFinanceList = financeInfo.map((list) => {
        return {
          civility: list && list.civility && list.civility !== 'neutral' ? list.civility : '',
          email: list.email,
          last_name: list.family_name + ' (' + this.translate.instant('CARDDETAIL.RELATION.' + list.relation) + ')',
          first_name: list.name,
          billing_id: this.data.dataFinance._id,
          is_student: false,
          value:
            (list && list.civility && list.civility !== 'neutral' ? this.translate.instant(list.civility) + ' ' : '') +
            list.name +
            ' ' +
            list.family_name +
            ' (' +
            this.translate.instant('CARDDETAIL.RELATION.' + list.relation) +
            ')',
        };
      });
    }
    if (this.data && this.data.data && this.data.data.candidate_id && this.data.data.candidate_id._id) {
      this.getLegalEntity();
      const dataStudent = {
        civility:
          this.data &&
          this.data.data &&
          this.data.data.candidate_id &&
          this.data.data.candidate_id.civility &&
          this.data.data.candidate_id.civility !== 'neutral'
            ? this.data.data.candidate_id.civility
            : '',
        email: this.data.data.candidate_id.email,
        last_name: this.data.data.candidate_id.last_name,
        first_name: this.data.data.candidate_id.first_name,
        billing_id: this.data.data._id,
        is_student: true,
        value:
          (this.data &&
          this.data.data &&
          this.data.data.candidate_id &&
          this.data.data.candidate_id.civility &&
          this.data.data.candidate_id.civility !== 'neutral'
            ? this.translate.instant(this.data.data.candidate_id.civility) + ' '
            : '') +
          this.data.data.candidate_id.first_name +
          ' ' +
          this.data.data.candidate_id.last_name,
      };
      this.dataFinanceList.push(dataStudent);
    }
    // if (this.data.isFC) {
    //   if (this.data && this.data.orgList && this.data.orgList.length === 1) {
    //     this.identityForm.get('who').patchValue(this.data.orgList[0].organization_id.name);
    //   }
    // }
    if (!this.data?.isUpdate) {
      this.isUpdate = false;
      const studentName = this.dataFinanceList && this.dataFinanceList.length ? this.dataFinanceList.find((list) => list.is_student) : '';
      this.identityForm.get('who').setValue(studentName ? studentName.value : '');
      this.billingId = studentName.billing_id;
    } else {
      this.isUpdate = true;
      const studentName = this.dataFinanceList && this.dataFinanceList.length ? this.dataFinanceList.find((list) => list.is_student) : '';
      this.setRefundData(studentName);
    }
  }

  setRefundData(studentName) {
    const studentNameFilter = studentName.billing_id === this.data?.billing_id ? studentName : '';
    const dateTransform = this.data?.date_action?.date
      ? this.parseToLocal.transformDateToJavascriptDate(this.data?.date_action?.date, this.data?.date_action?.time)
      : null;
    if (this.data?.isUpdate) {
      const payload = {
        billing_id: this.data?.billingId ? this.data?.billingId : null,
        amount: this.data?.debit ? this.data?.debit : '',
        from: this.data?.from ? this.data?.from : '',
        who: this.data?.billing_id ? studentNameFilter.value : '',
        date: dateTransform ? dateTransform : '',
        operation_name: this.data?.operation_name ? this.data?.operation_name : '',
        payment_method: this.data?.nature ? this.data?.nature : '',
        reference: this.data?.reference ? this.data?.reference : '',
        note: this.data?.note ? this.data?.note : '',
      };
      this.identityForm.patchValue(payload);
    }
  }

  selectBillingId(data) {
    this.billingId = data && data.billing_id ? data.billing_id : null;
  }
  iniVerificationForm() {
    this.identityForm = this.fb.group({
      payment_method: [null, Validators.required],
      from: [null, Validators.required],
      who: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      operation_name: [null, Validators.required],
      credit: [false],
      transfer: [false],
      cheque: [false],
      cash: [false],
      currency: ['EUR'],
      date: [this.today, Validators.required],
      reference: [null, Validators.required],
      note: [null],
      bank: [null],
    });
  }

  checkPayment(data) {
    const credit = this.identityForm.get('credit').value;
    const transfer = this.identityForm.get('transfer').value;
    const cheque = this.identityForm.get('cheque').value;
    const cash = this.identityForm.get('cash').value;
    if (!credit && !transfer && !cheque && !cash) {
      this.identityForm.get('payment_method').setValue(null);
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('cash').setValue(false);
      return;
    }
    if (data === 'credit') {
      this.identityForm.get('payment_method').setValue('credit_card');
      this.identityForm.get('credit').setValue(true);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'transfer') {
      this.identityForm.get('payment_method').setValue('transfer');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(true);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'cheque') {
      this.identityForm.get('payment_method').setValue('check');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(true);
      this.identityForm.get('cash').setValue(false);
    } else if (data === 'cash') {
      this.identityForm.get('payment_method').setValue('cash');
      this.identityForm.get('credit').setValue(false);
      this.identityForm.get('transfer').setValue(false);
      this.identityForm.get('cheque').setValue(false);
      this.identityForm.get('cash').setValue(true);
    }
  }

  getLegalEntity() {
    this.subs.sink = this.financeService.GetLegalEntityByCandidate(this.data.candidate_id).subscribe(
      (resp) => {
        if (resp) {
          this.dataLegalEntity = resp;
          this.identityForm.get('from').setValue(this.dataLegalEntity.legal_entity_name);
          this.isLegalEntity = true;
          this.identityForm?.get('from')?.disable();
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  payerSelect(data) {
    if (data) {
      this.payer = {
        billing_id: data._id,
        orgId: null,
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
        this.payer.orgId = data?.company_branch_id?._id;
      } else if (data?.organization_id) {
        this.payer.payer_name = data?.organization_id?.name;
        this.payer.orgId = data?.organization_id?._id;
      }
    }
    console.log('payer', this.payer);
  }

  submitVerification() {
    let typeBillingOrganization = false;

    if (this.identityForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.identityForm.markAllAsTouched();
    } else {
      this.isWaitingForResponse = true;
      // const payload = _.cloneDeep(this.identityForm.value);
      const dateParseUTC = this.identityForm.get('date').value
        ? this.parseToUTC.transformDate(this.identityForm.get('date').value.toLocaleDateString('en-GB'), '15:59')
        : '';
      let payload = {
        // billing_id: this.payer.billing_id ? this.payer.billing_id : null,
        amount: this.identityForm.get('amount').value ? this.identityForm.get('amount').value : '',
        from: this.identityForm.get('from').value ? this.identityForm.get('from').value : '',
        to: this.payer.payer_name ? this.payer.payer_name : '',
        date: dateParseUTC ? dateParseUTC : '',
        operation_name: this.identityForm.get('operation_name').value ? this.identityForm.get('operation_name').value : '',
        payment_method: this.identityForm.get('payment_method').value ? this.identityForm.get('payment_method').value : '',
        reference: this.identityForm.get('reference').value ? this.identityForm.get('reference').value : '',
        note: this.identityForm.get('note').value ? this.identityForm.get('note').value : '',
      };

      if (!this.isUpdate) {
        const isOrganization = this.data?.dropdown.some((res) => res?.organization_id?.name === this.payer?.payer_name);
        const isCompany = this.data?.dropdown.some((res) => res?.company_branch_id?.company_name === this.payer?.payer_name);
        typeBillingOrganization = isOrganization || isCompany;

        if (typeBillingOrganization) {
          const organizationId = {
            finance_organization_id: this.payer?.billing_id ? this.payer?.billing_id : null,
          };
          payload = {
            ...payload,
            ...organizationId,
          };

          this.subs.sink = this.financeService.createManualRefundFinanceOrganization(payload).subscribe(
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
          const billingId = {
            billing_id: this.payer?.billing_id ? this.payer?.billing_id : null,
          };
          payload = {
            ...payload,
            ...billingId,
          };

          this.subs.sink = this.financeService.createManualRefund(payload).subscribe(
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

        const payloadUpdate = {
          master_transaction_id: this.data?._id ? this.data?._id : null,
          new_amount: this.identityForm.get('amount').value ? this.identityForm.get('amount').value : '',
        };

        if (typeBillingOrganization) {
          this.subs.sink = this.financeService.updateManualRefundFinanceOrganization(payloadUpdate).subscribe(
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
          this.subs.sink = this.financeService.updateManualRefund(payloadUpdate).subscribe(
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
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
