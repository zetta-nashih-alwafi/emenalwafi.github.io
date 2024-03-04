import { Injectable, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { SubSink } from 'subsink';
import { UtilityService } from 'app/service/utility/utility.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CountryService implements OnDestroy {
  private subs = new SubSink();
  private isAllCountryAlreadyPopulated = new BehaviorSubject<boolean>(false);
  isAllCountryAlreadyPopulated$ = this.isAllCountryAlreadyPopulated.asObservable();

  getAllCountriesNationality() {
    let tempCountryList = [];
    this.isAllCountryAlreadyPopulated.next(false);
    this.subs.sink = this.getAllCountries().subscribe((resp) => {
      if (resp?.length) {
        resp?.map((country) => {
          tempCountryList.push({
            name: country?.country_id?.country,
            flagIcon: country?.nationality_id?.nationality_en,
            dialCode: country?.country_id?.phone_number_indicative,
          });
        });
        tempCountryList.sort((firstData, secondData) => {
          if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
            return -1;
          } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
            return 1;
          } else {
            return 0;
          }
        });
                
        this.isAllCountryAlreadyPopulated.next(true);
      }
    });

    return tempCountryList;
  }

  constructor(private apollo: Apollo, private utilService: UtilityService, private translate: TranslateService) {}

  getAllCountries(): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllVisaPermits {
            GetAllVisaPermits {
              country_id {
                country
                phone_number_indicative
              }
              nationality_id {
                nationality_en
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllVisaPermits']));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
