import { Component } from '@angular/core';
import { VersionService } from '../version.service';

@Component({
  selector: 'ms-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
})
export class VersionComponent {
  version$ = this.versionService.getBackendVersion();

  constructor(private versionService: VersionService) {}
}
