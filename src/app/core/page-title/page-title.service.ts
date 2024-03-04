import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PageTitleService {
  public title: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public message: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public messageFinance: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public icon: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  setTitle(value: string) {
    this.title.next(value);
  }

  setIcon(value: string) {
    this.icon.next(value);
  }

  setMessage(value: string) {
    this.message.next(value);
  }

  setMessageFinance(value: string) {
    this.messageFinance.next(value);
  }
}
