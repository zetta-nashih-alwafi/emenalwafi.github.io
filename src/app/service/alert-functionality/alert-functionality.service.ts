import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private httpClient: HttpClient
  ) {}

  @Cacheable()
  getAlert(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/alert-functionality.json');
  }
}
