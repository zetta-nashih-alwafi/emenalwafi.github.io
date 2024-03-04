import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {

  constructor(private httpClient: HttpClient) { }

  getJobOfferList(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/job-offer.json');
  }
}
