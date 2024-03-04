import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-financement-deduction-dialog',
  templateUrl: './financement-deduction-dialog.component.html',
  styleUrls: ['./financement-deduction-dialog.component.scss'],
})
export class FinancementDeductionDialogComponent implements OnInit {
  form: UntypedFormGroup;
  financementName;
  financementAmount;
  private subs = new SubSink();
  isWaitingForResponse = false;
  filter = {
    candidate_id: null,
  };
  cardStatus = [];
  billingData = [];

  minDeduction = false;
  maxDeduction = false;
  totalCost = false;
  totalCostAmount = false;
  isValid = true;
  financeOrganizations;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FinancementDeductionDialogComponent>,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllBilling();
  }

  calculateAvailableCostCoverage(bill: any) {
    // bill is the candidate billing object from GetAllBilling
    let totalAmountPay = 0;
    if (bill?.terms?.length) {
      // const termsData = bill?.terms.filter((termData) => termData.term_status === "not_billed")
      for (const term of bill?.terms || []) {
        totalAmountPay =
          totalAmountPay +
          (term?.term_pay_amount ? term?.term_pay_amount : 0) +
          (term?.term_amount_pending ? term?.term_amount_pending : 0);
        if (bill?.student_type?.type_of_formation !== 'classic') {
          if (term?.term_status === 'billed') {
            totalAmountPay = totalAmountPay + term?.term_amount;
          }
        }
      }
    }
    return totalAmountPay;
  }

  onWheel(event: Event) {
    event?.preventDefault();
  }

  getAllBilling() {
    this.isWaitingForResponse = true;
    this.filter.candidate_id = this.data && this.data.candidateId ? this.data.candidateId : null;
    this.filter['intake_channel'] = this.data && this.data.intakeChannelId ? this.data.intakeChannelId : null;
    this.subs.sink = this.financeService.getAllBillingDeducationDialog(this.filter).subscribe((resp) => {
      console.log('041 dialog', resp, this.data);
      if (resp) {
        const temp = _.cloneDeep(resp);
        if (temp && temp.length) {
          temp.financement = [];
          const rateHour =
            this.data && this.data.data && this.data.data.rate_per_hours ? this.data.data.rate_per_hours * this.data.data.hours : 0;
          this.financementAmount =
            this.data && this.data.data && this.data.data.total
              ? this.data?.changeData?.isRaise
                ? this.data?.changeData?.totalAmount
                : this.data.data.total
              : rateHour;
          this.financementName = this.data && this.data.financementName ? this.data.financementName : '';
          temp.forEach((value) => {
            this.cardStatus.push(false);
            let costTemp = 0;
            let termsNotBilled = false;
            if (value?.terms?.length) {
              const notBilledTerm = value.terms.filter((term) => term.term_status === 'not_billed');
              if (notBilledTerm?.length) {
                notBilledTerm.forEach((term) => {
                  costTemp += term.term_amount;
                });
                costTemp = parseFloat(costTemp.toFixed(2));
              } else {
                costTemp = 0;
              }
              termsNotBilled = value.terms.some((resp) => resp?.term_status === 'not_billed' && resp?.term_amount);
            } else {
              costTemp = value.total_amount;
              termsNotBilled = true;
            }
            if (!value.is_financial_support && value.candidate_id) {
              const data = {
                civility: value.candidate_id.civility,
                first_name: value.candidate_id.first_name,
                last_name: value.candidate_id.last_name,
                cost: costTemp > 0 ? costTemp : costTemp,
                billing_id: value._id,
                term_not_billed: termsNotBilled,
              };
              if (this.data?.from === 'delete') {
                temp.financement.push(data);
                this.addFinancialSupport();
              } else {
                if (data && data.cost > 0) {
                  temp.financement.push(data);
                  this.addFinancialSupport();
                }
              }
            } else if (value.is_financial_support === true && value.financial_support_info) {
              const data = {
                civility: value.financial_support_info.civility,
                first_name: value.financial_support_info.name,
                last_name: value.financial_support_info.family_name,
                cost: costTemp > 0 ? costTemp : costTemp,
                billing_id: value._id,
                term_not_billed: termsNotBilled,
              };
              if (this.data?.from === 'delete') {
                temp.financement.push(data);
                this.addFinancialSupport();
              } else {
                if (data && data.cost > 0) {
                  temp.financement.push(data);
                  this.addFinancialSupport();
                }
              }
            }
          });
        }
        // this.form.patchValue(temp);
        this.getAllFinanceOrganizationCandidateId(temp);
      }
      this.isWaitingForResponse = false;
    });
  }
  initForm() {
    this.form = this.fb.group({
      financement: this.fb.array([]),
    });
  }
  initFinancialSupportForm() {
    return this.fb.group({
      civility: [''],
      first_name: [''],
      last_name: [''],
      cost: [null],
      billing_id: [null],
      organization_name: [null],
      company_name: [null],
      finance_organization_id: [null],
      term_not_billed: [''],
    });
  }
  getFinancialSupport(): UntypedFormArray {
    return this.form.get('financement') as UntypedFormArray;
  }
  addFinancialSupport() {
    this.getFinancialSupport().push(this.initFinancialSupportForm());
  }
  checkSelectedCard(index) {
    if (this.cardStatus && this.cardStatus.length) {
      this.cardStatus[index] = !this.cardStatus[index];
      this.setAmount(index);
    }
  }
  setAmount(index) {
    const temp = this.form.value;
    if (temp && temp.financement && temp.financement.length) {
      const findSelectedCard = this.cardStatus.filter((status) => status === true);
      const totalSelected = findSelectedCard && findSelectedCard.length ? findSelectedCard.length : 0;
      const percentage = totalSelected > 1 ? 100 / totalSelected : 100;
      const amount = (percentage / 100) * this.financementAmount;
      const totalAmountEachCard = parseFloat(amount.toFixed(2));
      console.log('041', percentage, totalAmountEachCard);
      const fs = this.form.get('financement').value;
      if (this.cardStatus && this.cardStatus.length) {
        this.cardStatus.forEach((card, indexCard) => {
          if (fs && fs.length && card === true) {
            this.getFinancialSupport()?.at(indexCard)?.get('cost')?.patchValue(totalAmountEachCard);
          } else if (fs && fs.length) {
            this.getFinancialSupport()?.at(indexCard)?.get('cost')?.patchValue(null);
          }
        });
      }
    }
    this.checkValidation(index);
  }

  checkValidation(index) {
    if (this.checkMinDeduction(index)) {
      this.minDeduction = true;
      this.maxDeduction = false;
      this.totalCost = false;
      this.totalCostAmount = false;
    } else if (this.checkMaxDeduction(index)) {
      this.minDeduction = false;
      this.maxDeduction = true;
      this.totalCost = false;
      this.totalCostAmount = false;
    } else if (this.checkTotalCost()) {
      this.minDeduction = false;
      this.maxDeduction = false;
      this.totalCost = true;
      this.totalCostAmount = false;
    } else if (this.checkTotalCostAmount()) {
      this.minDeduction = false;
      this.maxDeduction = false;
      this.totalCost = false;
      this.totalCostAmount = true;
    } else {
      this.minDeduction = false;
      this.maxDeduction = false;
      this.totalCost = false;
      this.totalCostAmount = false;
    }
  }

  checkMinDeduction(index) {
    const form = this.getFinancialSupport().at(index).get('cost').value;
    if (form < 1 && this.data?.from !== 'delete') {
      this.minDeduction = true;
    } else {
      this.minDeduction = false;
    }
    return this.minDeduction;
  }
  checkMaxDeduction(index) {
    const cost = this.billingData[index].cost;
    const form = this.getFinancialSupport().at(index).get('cost').value;
    if (form > cost && this.data?.from !== 'delete') {
      this.maxDeduction = true;
    } else {
      this.maxDeduction = false;
    }
    return this.maxDeduction;
  }

  checkTotalCost() {
    let totalCost = 0;
    const form = this.getFinancialSupport().value;
    if (form && form.length) {
      form.forEach((card) => {
        totalCost = totalCost + card.cost;
      });
    }
    if (totalCost > this.financementAmount) {
      this.totalCost = true;
    } else {
      this.totalCost = false;
    }
    return this.totalCost;
  }
  checkTotalCostAmount() {
    let totalCost = 0;
    const form = this.getFinancialSupport().value;
    if (form && form.length) {
      form.forEach((card) => {
        totalCost = totalCost + card.cost;
      });
    }
    if (totalCost < this.financementAmount) {
      this.totalCostAmount = true;
    } else {
      this.totalCostAmount = false;
    }
    return this.totalCostAmount;
  }
  createPayload() {
    const payload = this.data.data;
    const form = this.form.value;

    // payload.candidate_id = this.data && this.data.candidateId ? this.data.candidateId : null;
    const amountSplits = [];
    if (form.financement && form.financement.length) {
      form.financement.forEach((data) => {
        const temp = {
          billing_id: data.billing_id,
          amount: data.cost,
          finance_organization_id: data?.finance_organization_id ? data?.finance_organization_id : null,
        };
        amountSplits.push(temp);
      });
    }
    payload.amount_splits = amountSplits;
    return payload;
  }

  isRaisedStatus(data) {
    const actualStatus = data?.data?.actual_status;
    return actualStatus === 'rejected' || actualStatus === 'submitted_for_validation' || actualStatus === 'in_progress_by_fc_in_charge';
  }
  checkInvalidDeducted() {
    let isInvalid = false;
    if (this.billingData?.length) {
      this.billingData.forEach((element, idx) => {
        if (element?.cost) {
          const form = this.getFinancialSupport()?.at(idx)?.get('cost').value;
          if (form > element?.cost && this.data?.from !== 'delete') {
            isInvalid = true;
          }
        }
      });
    }
    return isInvalid;
  }

  checkSelectedData() {
    return this.cardStatus?.find((resp) => resp === true);
  }

  submit() {
    const payload = this.createPayload();
    console.log('041 payload', payload, this.cardStatus);
    const isValid = this.cardStatus.find((resp) => resp === true);
    this.isValid = isValid;
    if (this.minDeduction || this.maxDeduction || this.totalCost || this.totalCostAmount || this.checkInvalidDeducted() || !isValid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.form.markAllAsTouched();
      return;
    }
    this.isWaitingForResponse = true;
    if (this.data.from === 'edit') {
      const currentLang = this.translate.currentLang;
      this.subs.sink = this.financeService.updateAdmissionFinancementDialog(this.data.id, payload, currentLang).subscribe(
        (resp) => {
          console.log('041 submit', resp);
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              confirmButtonText: this.translate.instant('OK'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close('submit');
            });
          }
          this.isWaitingForResponse = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: cannot add financement more than full rate') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('financement_s11.TITLE'),
              text: this.translate.instant('financement_s11.TEXT'),
              confirmButtonText: this.translate.instant('financement_s11.BUTTON_1'),
            }).then(() => {});
          } else if (
            err['message'] === 'GraphQL error: Cannot change status to accepted, organization must be added to table organization first'
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Finance_Error1.TITLE'),
              text: this.translate.instant('Finance_Error1.TEXT'),
              confirmButtonText: this.translate.instant('Finance_Error1.BUTTON_1'),
            }).then(() => {
              this.dialogRef.close();
            });
          } else if (err['message'] === 'GraphQL error: Cannot change status to accepted, company must be added to table company first') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('FINANCEMENT_S8.TITLE'),
              text: this.translate.instant('FINANCEMENT_S8.TEXT'),
              confirmButtonText: this.translate.instant('FINANCEMENT_S8.BUTTON'),
            }).then(() => {
              this.dialogRef.close();
            });
          } else if (
            err['message'].includes('Cannot delete financement some of term has been billed or paid') ||
            err['message'].includes('some terms are billed/paid')
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('VALIDATION_BILLING_S3.TITLE'),
              text: this.translate.instant('VALIDATION_BILLING_S3.TEXT'),
              confirmButtonText: this.translate.instant('VALIDATION_BILLING_S3.BUTTON'),
            }).then(() => {
              this.dialogRef.close();
            });
          } else if (err['message'].includes('You can’t modify it as the billing was already processed')) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: this.translate.instant('You can’t modify it as the billing was already processed'),
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then(() => {
              this.dialogRef.close();
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
    } else if (this.data.from === 'add') {
      this.subs.sink = this.financeService.CreateAdmissionFinancement(payload).subscribe(
        (res) => {
          if (res) {
            console.log(res);
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
          } else {
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          if (err['message'] === 'GraphQL error: cannot add financement more than full rate') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('financement_s11.TITLE'),
              text: this.translate.instant('financement_s11.TEXT'),
              confirmButtonText: this.translate.instant('financement_s11.BUTTON_1'),
            }).then(() => {});
          } else if (
            err['message'] === 'GraphQL error: Cannot change status to accepted, organization must be added to table organization first'
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Finance_Error1.TITLE'),
              text: this.translate.instant('Finance_Error1.TEXT'),
              confirmButtonText: this.translate.instant('Finance_Error1.BUTTON_1'),
            }).then(() => {
              this.dialogRef.close();
            });
          } else if (err['message'] === 'GraphQL error: Cannot change status to accepted, company must be added to table company first') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('FINANCEMENT_S8.TITLE'),
              text: this.translate.instant('FINANCEMENT_S8.TEXT'),
              confirmButtonText: this.translate.instant('FINANCEMENT_S8.BUTTON'),
            }).then(() => {
              this.dialogRef.close();
            });
          } else if (
            err['message'].includes('Cannot delete financement some of term has been billed or paid') ||
            err['message'].includes('some terms are billed/paid')
          ) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('VALIDATION_BILLING_S3.TITLE'),
              text: this.translate.instant('VALIDATION_BILLING_S3.TEXT'),
              confirmButtonText: this.translate.instant('VALIDATION_BILLING_S3.BUTTON'),
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
    } else if (this.data?.from === 'delete') {
      this.dialogRef.close(payload);
    }
  }
  closeDialog() {
    this.dialogRef.close();
  }

  getAllFinanceOrganizationCandidateId(dataTemp) {
    this.isWaitingForResponse = true;
    const filter = {
      candidate_id: this.data?.candidateId ? this.data?.candidateId : null,
      intake_channel: this.data?.intakeChannelId ? this.data?.intakeChannelId : null,
    };
    this.subs.sink = this.financeService.GetAllFinanceOrganizationCandidateId(filter).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp?.length) {
          console.log('org term', resp);
          resp.forEach((value) => {
            let costTemp = 0;
            const termsNotBilled = true;
            if (value?.terms?.length) {
              const notBilledTerm = value.terms.filter((term) => term.term_status === 'not_billed');
              if (notBilledTerm?.length) {
                notBilledTerm.forEach((term) => {
                  costTemp += term.term_amount;
                });
                costTemp = parseFloat(costTemp.toFixed(2));
              } else {
                costTemp = 0;
              }
            } else {
              costTemp = value.total_amount;
            }
            this.cardStatus.push(false);
            if (value?.organization_id) {
              const data = {
                cost: costTemp > 0 ? costTemp : 0,
                finance_organization_id: value?._id,
                organization_name: value?.organization_id.name,
                term_not_billed: termsNotBilled,
              };
              if (this.data?.from === 'delete') {
                if (value?.admission_financement_id?._id !== this.data?.id) {
                  dataTemp.financement.push(data);
                  this.addFinancialSupport();
                }
              } else {
                if (data && data.cost > 0) {
                  dataTemp.financement.push(data);
                  this.addFinancialSupport();
                }
              }
            } else if (value?.company_branch_id) {
              const data = {
                cost: costTemp > 0 ? costTemp : 0,
                finance_organization_id: value?._id,
                company_name: value?.company_branch_id?.company_name,
                term_not_billed: termsNotBilled,
              };
              if (this.data?.from === 'delete') {
                if (value?.admission_financement_id?._id !== this.data?.id) {
                  dataTemp.financement.push(data);
                  this.addFinancialSupport();
                }
              } else {
                if (data && data.cost > 0) {
                  dataTemp.financement.push(data);
                  this.addFinancialSupport();
                }
              }
            }
          });
          this.billingData = _.cloneDeep(dataTemp.financement);
        } else {
          if (dataTemp?.length) {
            this.billingData = _.cloneDeep(dataTemp.financement);
          }
        }
        this.form.patchValue(dataTemp);
      },
      () => {
        this.isWaitingForResponse = false;
      },
    );
  }
}
