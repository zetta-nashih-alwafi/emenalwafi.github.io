import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InternCandidatesTableComponent } from './intern-candidates-table/intern-candidates-table.component';
import { AgreementTableComponent } from './agreement-table/agreement-table.component';
import { InternProfileTableComponent } from './intern-profile-table/intern-profile-table.component';
import { JobOfferTableComponent } from './job-offer-table/job-offer-table.component';
import { JobOfferDetailComponent } from './job-offer-table/job-offer-detail/job-offer-detail.component';
import { InternshipTableComponent } from './internship-follow-up/internship-follow-up.component';
import { InternshipSettingComponent } from './internship-setting/internship-setting.component';
import { UsersTableComponent } from './users-table/users-table.component';
import { UserEntityComponent } from './users-table/user-entity/user-entity.component';

const routes: Routes = [
  {
    path: 'job-offer',
    pathMatch: 'full',
    component: JobOfferTableComponent,
  },
  {
    path: 'job-offer/:jobId',
    pathMatch: 'full',
    component: JobOfferDetailComponent,
  },
  {
    path: 'intern-candidates',
    pathMatch: 'full',
    component: InternCandidatesTableComponent,
  },
  {
    path: 'intern-profile',
    pathMatch: 'full',
    component: InternProfileTableComponent,
  },
  {
    path: 'agreement',
    pathMatch: 'full',
    component: AgreementTableComponent,
  },
  {
    path: 'follow-up',
    pathMatch: 'full',
    component: InternshipTableComponent,
  },
  {
    path: 'settings',
    pathMatch: 'full',
    component: InternshipSettingComponent,
  },
  {
    path: 'users',
    pathMatch: 'full',
    component: UsersTableComponent,
  },
  {
    path: 'users/details/:id',
    pathMatch: 'full',
    component: UserEntityComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternshipRoutingModule {}
