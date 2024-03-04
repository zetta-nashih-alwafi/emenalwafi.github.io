import { Injectable } from '@angular/core';
import { TUserHomePageConfig } from './user-config.declaration';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserConfigService {

  private _userConfigSource = new BehaviorSubject<TUserHomePageConfig | null>(null)
  public userConfig$ = this._userConfigSource.asObservable()

  constructor() { }
}
