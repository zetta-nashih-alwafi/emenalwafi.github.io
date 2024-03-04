import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { BranchesListComponent } from 'app/company-file/branches-list/branches-list.component';
// import { CompanyFileComponent } from 'app/company-file/company-file/company-file.component';
import { PermissionGuard } from 'app/service/guard/auth.guard';
import { CompaniesInternshipComponent } from './companies-internship/companies-internship.component';

const routes: Routes = [
  // {
  //   path: 'entities',
  //   component: CompanyFileComponent,
  //   canActivate: [PermissionGuard],
  //   data: {},
  // },
  // {
  //   path: 'branches',
  //   component: BranchesListComponent,
  //   canActivate: [PermissionGuard],
  //   data: {},
  // },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompaniesInternshipRoutingModule {}
