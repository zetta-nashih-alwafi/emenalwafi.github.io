import { Component, OnDestroy, OnInit, ɵbypassSanitizationTrustStyle } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from '../../core/page-title/page-title.service';

@Component({
  selector: 'ms-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  menSelected: any;
  filteredSchool: any;
  dataMentor = {
    photo: '',
    civility: '',
    first_name: 'Tous les Dev.',
    last_name: '',
  };
  panelColor = new UntypedFormControl('');
  mentorList: any[] = [
    {
      photo: 'assets/img/user-2.jpg',
      civility: 'Mrs',
      first_name: 'Valentine',
      last_name: 'Valois',
    },
    {
      photo: 'assets/img/user-1.jpg',
      civility: 'Mr',
      first_name: 'Thomas',
      last_name: 'Martin',
    },
    {
      photo: 'assets/img/user-1.jpg',
      civility: 'Mrs',
      first_name: 'Cindy',
      last_name: 'Lacour',
    },
  ]
  schoolList = {
      campus: true,
      candidate: true,
  }
  listOfSchool = ['EFAP', 'ICART', 'EFJ', 'BRASSART'];
  constructor(
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    ) {}

  ngOnInit() {
    // let name = this.translate.instant('Dashboard') + ' / ' + this.translate.instant('Cash In');
    // this.pageTitleService.setTitle(name);
    // this.pageTitleService.setIcon('dashboard');
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   name = this.translate.instant('Dashboard') + ' / ' + this.translate.instant('Cash In');
    //   this.pageTitleService.setTitle(name);
    //   this.pageTitleService.setIcon('dashboard');
    // });
    this.menSelected = this.dataMentor;
    this.filteredSchool = this.schoolList;
  }

  mentorSelected(data) {
    console.log('this.data', data);
    this.menSelected = data;
  };

  // Filter School for candidate
  filterSchool(school: string, event: any) {
    if (school === 'all' || school === '' || school === 'All' || school === 'Tous') {
      this.filteredSchool = this.schoolList;
    } else {
      this.filteredSchool = this.schoolList;
    }
  }
  ngOnDestroy() {
  }
}
