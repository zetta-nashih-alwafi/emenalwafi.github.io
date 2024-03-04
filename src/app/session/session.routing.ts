import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LockScreenV2Component } from './lockscreenV2/lockscreenV2.component';
import { ForgotPasswordV2Component } from './forgot-passwordV2/forgot-passwordV2.component';
import { RegisterV2Component } from './registerV2/registerV2.component';
import { LoginV2Component } from './loginV2/loginV2.component';
import { SetPasswordV2Component } from './set-passwordV2/set-passwordV2.component';
import { AdmissionFormComponent } from './admission-form/admission-form.component';
import { SuccessPageComponent } from './admission-form/success-page/success-page.component';
import { CancelPageComponent } from './admission-form/cancel-page/cancel-page.component';

export const routes: Routes = [
   {
      path: '', redirectTo: 'login', pathMatch: 'full'
   },
   {
      path: '',
      children: [
         {
            path: 'login',
            component: LoginV2Component
         },
         // {
         //    path: 'register',
         //    component: RegisterV2Component
         // },
         {
            path: 'register',
            component: AdmissionFormComponent
         },
         {
            path: 'success',
            component: SuccessPageComponent
         },
         {
            path: 'cancel',
            component: CancelPageComponent
         },
         {
            path: 'forgot-password',
            component: ForgotPasswordV2Component
         },
         {
            path: 'lockscreen',
            component: LockScreenV2Component
         },
         {
            path: 'setPassword/:userId',
            component: SetPasswordV2Component
         },
         {
            path: 'login/:success',
            component: LoginV2Component
         }
      ]
   },
   {
      path: 'contract-amendment',
      pathMatch:'full',
      loadChildren: () => import('../contract-amendment/contract-amendment.module').then((m) => m.ContractAmendmentModule),
    },
   {
      path: '**', redirectTo: 'login', pathMatch: 'full'
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class SessionRoutingModule { }
