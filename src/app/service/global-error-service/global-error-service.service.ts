import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorService {

  static isWatingForResponse=false;
  private globalErrorSource = new BehaviorSubject<boolean>(false);
  public globalErrorData$ = this.globalErrorSource.asObservable();

  constructor() { }

  setGlobalError(data: boolean) {
    console.log('data inside setlobalError ',data);
    this.globalErrorSource.next(data);
    GlobalErrorService.isWatingForResponse=data;
  }
}
