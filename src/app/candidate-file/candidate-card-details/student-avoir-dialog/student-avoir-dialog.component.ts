import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-student-avoir-dialog',
  templateUrl: './student-avoir-dialog.component.html',
  styleUrls: ['./student-avoir-dialog.component.scss'],
  providers: [ParseStringDatePipe, ParseUtcToLocalPipe],
})
export class StudentAvoirDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isLegalEntity = false;

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  countryList;
  filteredCountry: any[][] = [];

  bank = [
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
  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];

  regions: string[][] = [];
  filteredRegions: string[][] = [];
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  dataLegalEntity: any;
  billingId: any;

  avoirOrg: boolean;
  avoirStu: boolean;

  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];
  dataFinanceList = [];
  candidateList = [];
  isWaitingForResponse = false;
  comingFromFC = false;
  operationNameList = [
    {
      key: 'Global Avoir',
      value: 'global_avoir',
    },
    {
      key: 'Avoir scholarship fees <student program>',
      value: 'avoir_scholarship_fees <student program>',
    },
    {
      key: 'Avoir Social Security',
      value: 'avoir_social_security',
    },
    {
      key: 'Avoir schedule fees',
      value: 'avoir_schedule_fees',
    },
    {
      key: 'Avoir Administrative costs',
      value: 'avoir_administrative_costs',
    },
    {
      key: 'Avoir Additional costs - Rejection',
      value: 'avoir_additional_costs_rejection',
    },
    {
      key: 'Avoir Additional costs - Formal notice',
      value: 'avoir_additional_costs_formal_notice',
    },
    {
      key: 'Avoir Additional costs - Litigation',
      value: 'avoir_additional_costs_litigation',
    },
    {
      key: 'Avoir Additional costs - International transfer',
      value: 'avoir_additional_costs_international_transfer',
    },
    {
      key: 'Discount - Denis Huismann Solidarity Commission (CSDH)',
      value: 'discount_denis_huismann_solidarity_commission',
    },
    {
      key: 'Discount - Music Business Management',
      value: 'discount_music_business_management',
    },
    {
      key: 'Commercial discount',
      value: 'commercial_discount',
    },
    {
      key: 'Exceptional discount',
      value: 'exceptional_discount',
    },
  ];
  natureList = [
    {
      key: 'Avoir',
      value: 'avoir',
    },
    {
      key: 'Discount',
      value: 'discount',
    },
  ];

  payer;

  constructor(
    public dialogRef: MatDialogRef<StudentAvoirDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private financeService: FinancesService,
    private parseToUTC: ParseUtcToLocalPipe,
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    // this.subs.sink = this.acadJourneyService.getCurrency().subscribe((list: any[]) => {
    //   this.currencyList = list;
    // });
    if (this.data?.isFC) {
      this.comingFromFC = true;
    }
    this.getLegalEntity();
    // Need to comment this one, for Expected Case 23 Finance v2 - 21/02/2023
    // this.setPayerData();
    this.sortingAllListSelect();
    this.sortingAllListSelectTranslate();
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  setPayerData() {
    if (this.data?.dropdown?.length) {
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
          this.identityForm.get('who').setValue(isStudent[0]?._id);
        }
      }
    }
  }

  sortingAllListSelect() {
    this.operationNameList = this.operationNameList.sort((a, b) => {
      return this.translate.instant(a.key).localeCompare(this.translate.instant(b.key));
    });
    this.natureList = this.natureList.sort((a, b) => {
      return this.translate.instant('Finances.' + a.key).localeCompare(this.translate.instant('Finances.' + b.key));
    });
  }
  sortingAllListSelectTranslate() {
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.sortingAllListSelect();
    });
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      nature: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      from: [null, Validators.required],
      who: [null, Validators.required],
      currency: ['EUR'],
      date: [this.today, Validators.required],
      operation_name: [null, Validators.required],
      reference: [null, Validators.required],
      note: [null],
    });
  }

  getLegalEntity() {
    this.subs.sink = this.financeService.GetLegalEntityByCandidate(this.data?.candidate_id).subscribe(
      (resp) => {
        if (resp) {
          this.dataLegalEntity = resp;
          this.identityForm.get('from').setValue(this.dataLegalEntity.legal_entity_name);
          this.isLegalEntity = true;
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
        terms: data?.terms ? data?.terms?.map((term) => term?.term_amount - term?.term_pay_amount - term?.term_amount_not_authorised - term?.term_amount_pending) : [],
        deposit: data?.deposit ? data?.deposit : 0,
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

  countDecimalPlaces(num: any) {
    if (Math.floor(num) === num) return 0;
    return num.toString().split(".")[1].length || 0;
  };
  
  isRecalculateOfTermsOrDPValid() {
    const terms = this.payer?.terms ? this.payer?.terms : [];
    const decimalPlacesPayerTerms = terms?.map((num) => this.countDecimalPlaces(num));
    const maxDecimalPlacesPayerTerms = Math.max(...decimalPlacesPayerTerms);
    if (terms?.length) {
      if (terms?.reduce((acc, val) => acc + val, 0) <= this.identityForm?.get('amount')?.value) {
        return true;
      } else if (terms?.reduce((acc, val) => Number(acc?.toFixed(maxDecimalPlacesPayerTerms)) + Number(val?.toFixed(maxDecimalPlacesPayerTerms)), 0) > this.identityForm?.get('amount')?.value) {
        const inputtedAmountArray = Array.isArray(this.distributedInputtedAmountIntoArray()) ? this.distributedInputtedAmountIntoArray() : [];
        if (inputtedAmountArray?.length) {
          let tempAmountAfterCalculate = [];
          terms?.forEach((term, index) => {
            tempAmountAfterCalculate?.push(term - inputtedAmountArray[index]);
          });
  
          if (tempAmountAfterCalculate?.length) {
            while (tempAmountAfterCalculate?.reduce((acc, val) => acc + val, 0) > 0 && tempAmountAfterCalculate?.some((number) => number < 0)) {
              let negativeSum = 0;
  
              tempAmountAfterCalculate?.forEach((value, index) => {
                if (value < 0) {
                  negativeSum += value;
                  tempAmountAfterCalculate[index] = 0;
                }
              });
  
              const decimalPlaces = tempAmountAfterCalculate?.map((num) => this.countDecimalPlaces(num));
              const maxDecimalPlaces = Math.max(...decimalPlaces);
  
              const foundIndex = tempAmountAfterCalculate?.findIndex(number => number > 0);
              if (foundIndex !== -1) {
                tempAmountAfterCalculate[foundIndex] += Number(negativeSum?.toFixed(maxDecimalPlaces));
              } else {
                break;
              }
            }
            
            if (tempAmountAfterCalculate?.some(amount => amount > 0 && amount < 2)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }
  
  distributedInputtedAmountIntoArray() {
    if (this.payer?.terms?.length) {
      const number = this.identityForm?.get('amount')?.value ? this.identityForm?.get('amount')?.value : 0;
      const pieces = this.payer?.terms?.length;
      const baseValue = number && pieces ? number / pieces : 0;
      const distributedArray = baseValue ? new Array(pieces)?.fill(baseValue) : [];
      return distributedArray;
    } else {
      return [];
    }
  }

  submitVerification() {
    if (this.identityForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.identityForm.markAllAsTouched();
    } else if(!this.isRecalculateOfTermsOrDPValid()) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('TERM_UPDATE_S1.TITLE'),
        html: this.translate.instant('TERM_UPDATE_S1.TEXT'),
        confirmButtonText: this.translate.instant('TERM_UPDATE_S1.BUTTON'),
        onOpen: modal => {
          modal.setAttribute('data-cy', 'swal-term-update-s1')
        },
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    } else {
      // const payload = _.cloneDeep(this.identityForm.value);
      let operation = '';
      if (this.identityForm.get('operation_name').value === 'avoir_scholarship_fees <student program>') {
        operation = this.identityForm
          .get('operation_name')
          .value.replace('<student program>', this.displayProgram(this.data?.dropdown[0]?.candidate_id));
      } else {
        operation = this.identityForm.get('operation_name').value;
      }

      const payload = {
        amount: this.identityForm.get('amount').value ? this.identityForm.get('amount').value : '',
        date: this.identityForm.get('date').value ? this.identityForm.get('date').value : '',
        from: this.identityForm.get('from').value ? this.identityForm.get('from').value : '',
        to: this.payer.payer_name ? this.payer.payer_name : '',
        reference: this.identityForm.get('reference').value ? this.identityForm.get('reference').value : '',
        note: this.identityForm.get('note').value ? this.identityForm.get('note').value : '',
        nature: this.identityForm.get('nature').value ? this.identityForm.get('nature').value : '',
        operation_name: operation ? operation : '',
      };
      if (payload.date) {
        payload.date = this.identityForm.get('date').value
          ? this.parseToUTC.transformDate(this.identityForm.get('date').value.toLocaleDateString('en-GB'), '15:59')
          : '';
      }

      this.isWaitingForResponse = true;
      if (this.comingFromFC) {
        if (this.payer?.orgId) {
          this.subs.sink = this.financeService.CreateManualAvoirFinanceOrganization(payload, this.payer?.billing_id).subscribe(
            (resp) => {
              if (resp) {
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
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              if (err && err['message']?.includes('The avoir amount cannot exceed the amount billed')) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
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
          this.subs.sink = this.financeService.CreateManualAvoir(payload, this.payer?.billing_id).subscribe(
            (resp) => {
              console.log('Edit Payment Mode', resp);
              if (resp) {
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
              }
            },
            (err) => {
              this.isWaitingForResponse = false;
              if (err && err['message']?.includes('The avoir amount cannot exceed the amount billed')) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
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
        this.subs.sink = this.financeService.CreateManualAvoir(payload, this.payer?.billing_id).subscribe(
          (resp) => {
            if (resp) {
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
            }
          },
          (err) => {
            this.isWaitingForResponse = false;
            if (err && err['message']?.includes('The avoir amount cannot exceed the amount billed')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
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

  displayProgram(data) {
    let program = '';
    if (data?.intake_channel?.scholar_season_id?.scholar_season && data?.intake_channel?.program) {
      program = data?.intake_channel?.scholar_season_id?.scholar_season.concat(' ', data?.intake_channel?.program);
      return program;
    } else {
      return '';
    }
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
