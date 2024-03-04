import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CompanyService } from 'app/service/company/company.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-ask-new-agreement-dialog',
  templateUrl: './ask-new-agreement-dialog.component.html',
  styleUrls: ['./ask-new-agreement-dialog.component.scss']
})
export class AskNewAgreementDialogComponent implements OnInit {
  @ViewChild('siret', { static: true }) siretInput: ElementRef;
  private subs = new SubSink();
  addNewCompanyCountryDialog: UntypedFormGroup;

  countryListFilter: Observable<any[]>;
  showSiret = true;
  optionDefault = {
    code: 'all',
    name: 'All',
  };

  firsTime = true;
  isUserOperator = false;
  isUserAcadir = false;

  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<AskNewAgreementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private companyServ: CompanyService,
    private permissions: NgxPermissionsService,
    private utilService: UtilityService,
    private userService: AuthService,
    public translate: TranslateService,
  ) {}

  ngOnInit() {
    console.log(this.data);
    this.firsTime = true;
    this.isUserAcadir = !!this.permissions.getPermission('Academic Director');
    this.isUserOperator = this.utilService.isUserEntityOPERATOR();
    this.currentUser = this.getCurrentUser();
    console.log(this.currentUser);
    this.initForm();
    this.initFilter();
  }

  getCurrentUser() {
    return this.userService.getLocalStorageUser();
  }

  initForm() {
    this.addNewCompanyCountryDialog = this.fb.group({
      country: ['France', Validators.required],
      siret: [null, [Validators.required, Validators.minLength(14), Validators.maxLength(14), Validators.pattern('^[0-9]*$')]],
    });
  }

  initFilter() {
    this.countryListFilter = this.addNewCompanyCountryDialog.get('country').valueChanges.pipe(
      startWith(''),
      map((searchText: string | null) => {
        if (this.firsTime) {
          searchText = searchText ? searchText : 'France';
          this.firsTime = false;
        }
        return this.data ? this.data
          .filter((country) => (country ? country.name.toLowerCase().includes(searchText.toLowerCase()) : false))
          .sort((a: any, b: any) => a.name.localeCompare(b.name)) : [];
      }),
    );
  }

  countrySelected(value) {
    if (value.code === 'FR') {
      this.showSiret = true;
      this.addNewCompanyCountryDialog
        .get('siret')
        .setValidators([Validators.required, Validators.minLength(14), Validators.maxLength(14), Validators.pattern('^[0-9]*$')]);
      this.addNewCompanyCountryDialog.updateValueAndValidity();
    } else {
      this.showSiret = false;
      this.addNewCompanyCountryDialog.get('siret').setErrors(null);
      this.addNewCompanyCountryDialog.get('siret').clearValidators();
      this.addNewCompanyCountryDialog.updateValueAndValidity();
      const payload = {
        country: this.addNewCompanyCountryDialog.get('country').value,
        company_data: null,
      };
      this.dialogRef.close(payload);
    }
  }

  save() {
    //.. call API here...
    const payload = {
      country: this.addNewCompanyCountryDialog.get('country').value,
      company_data: "// some company data here..",
    };
    this.dialogRef.close(payload);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
