import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { TypeOfFormationComponent } from './type-of-formation/type-of-formation.component';
import { AddTypeOfFormationDialogComponent } from './type-of-formation/add-type-of-formation-dialog/add-type-of-formation-dialog.component';
import { AdditionalExpenseComponent } from './additional-expense/additional-expense.component';
import { PaymentModesComponent } from './payment-modes/payment-modes.component';
import { RegistrationProfileComponent } from './registration-profile/registration-profile.component';
import { RegistrationProfileFormComponent } from './registration-profile/registration-profile-form/registration-profile-form.component';
import { LegalEntityComponent } from './legal-entity/legal-entity.component';
import { SharedModule } from 'app/shared/shared.module';
import { AddAdditionalExpenseDialogComponent } from './additional-expense/add-additional-expense-dialog/add-additional-expense-dialog.component';
import { AddPaymentModesDialogComponent } from './payment-modes/add-payment-modes-dialog/add-payment-modes-dialog.component';
import { LegalEntitiesBoardingMerchantParentComponent } from './legal-entity/legal-entities-boarding-merchant-parent/legal-entities-boarding-merchant-parent.component';
import { BoardingMerchantBankAccountDetailComponent } from './legal-entity/legal-entities-boarding-merchant-parent/boarding-merchant-bank-account-detail/boarding-merchant-bank-account-detail.component';
import { BoardingMerchantCompanyDetailComponent } from './legal-entity/legal-entities-boarding-merchant-parent/boarding-merchant-company-detail/boarding-merchant-company-detail.component';
import { BoardingMerchantPciComplianceDetailComponent } from './legal-entity/legal-entities-boarding-merchant-parent/boarding-merchant-pci-compliance-detail/boarding-merchant-pci-compliance-detail.component';
import { BoardingMerchantShareholderDetailComponent } from './legal-entity/legal-entities-boarding-merchant-parent/boarding-merchant-shareholder-detail/boarding-merchant-shareholder-detail.component';
import { BoardingMerchantSignatoryDetailComponent } from './legal-entity/legal-entities-boarding-merchant-parent/boarding-merchant-signatory-detail/boarding-merchant-signatory-detail.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { PaymentModesParentComponent } from './payment-modes-parent/payment-modes-parent.component';
import { RegistrationProfileParentComponent } from './registration-profile-parent/registration-profile-parent.component';
import { AssignLegalStampDialogComponent } from './legal-entity/assign-legal-stamp-dialog/assign-legal-stamp-dialog.component';

@NgModule({
  declarations: [
    SettingsComponent,
    TypeOfFormationComponent,
    AddTypeOfFormationDialogComponent,
    AdditionalExpenseComponent,
    PaymentModesComponent,
    RegistrationProfileComponent,
    RegistrationProfileFormComponent,
    LegalEntityComponent,
    AddAdditionalExpenseDialogComponent,
    AddPaymentModesDialogComponent,
    LegalEntitiesBoardingMerchantParentComponent,
    BoardingMerchantBankAccountDetailComponent,
    BoardingMerchantCompanyDetailComponent,
    BoardingMerchantPciComplianceDetailComponent,
    BoardingMerchantShareholderDetailComponent,
    BoardingMerchantSignatoryDetailComponent,
    PaymentModesParentComponent,
    RegistrationProfileParentComponent,
    AssignLegalStampDialogComponent,
  ],
  imports: [CommonModule, SettingsRoutingModule, SharedModule, NgSelectModule, SweetAlert2Module.forRoot()],
})
export class SettingsModule {}
