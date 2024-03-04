import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'apollo-utilities';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { environment } from 'environments/environment';
import { SubSink } from 'subsink';
import { TermPaymentService } from './term-payment.service';
import { CountryService } from 'app/shared/services/country.service';

@Component({
  selector: 'ms-term-payment',
  templateUrl: './term-payment.component.html',
  styleUrls: ['./term-payment.component.scss'],
})
export class TermPaymentComponent implements OnInit {
  private subs: SubSink = new SubSink();

  isWaitingForResponse = false;
  schoolLogoURL: string;
  label: string;
  student: any;
  billing: any;
  metadata = {
    student_id: null,
    billing_id: null,
    form_id: null,
    payment_support_id: null,
  };

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code

  constructor(private route: ActivatedRoute, private paymentService: TermPaymentService, private countryService: CountryService) {}

  ngOnInit() {
    this.getAllCountryCodes();
    this.fetchURLMetadata();
    this.populateLabel();
    this.populateStudent();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  get path() {
    return window.location.pathname;
  }

  populateLabel() {
    if (this.path === '/financial') this.label = 'Payment Information';
    else if (this.path === '/term-payment') this.label = 'Term Payment';
    else if (this.path === '/special-form') this.label = 'Payment terms';
  }

  fetchURLMetadata() {
    this.metadata.student_id = this.route.snapshot.queryParamMap.get('candidate') ? this.route.snapshot.queryParamMap.get('candidate') : null;
    this.metadata.billing_id = this.route.snapshot.queryParamMap.get('billing') ? this.route.snapshot.queryParamMap.get('billing') : null;
    this.metadata.form_id = this.route.snapshot.queryParamMap.get('form-id') ? this.route.snapshot.queryParamMap.get('form-id') : null;
    this.metadata.payment_support_id = this.route.snapshot.queryParamMap.get('paymentsupport') ? this.route.snapshot.queryParamMap.get('paymentsupport') : null;
  }

  populateStudent() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.paymentService.getCandidateName(this.metadata.student_id).subscribe(
      (res) => {
        if (res) {
          const logo = res.school && res.school.school_logo ? res.school.school_logo : '';
          this.student = cloneDeep(res);
          this.schoolLogoURL = logo ? environment.apiUrl.replace('/graphql', `/fileuploads/${logo}`) : null;
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        console.error('Something wrong when fetching student name: ', err);
        this.isWaitingForResponse = false;
      },
    );
  }
}
