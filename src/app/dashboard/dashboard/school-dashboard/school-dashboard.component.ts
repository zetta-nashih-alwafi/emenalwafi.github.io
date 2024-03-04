import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

export interface PeriodicElement {
  photo: string;
  civility: string;
  first_name: string;
  last_name: string;
  priority: string;
  weight: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    photo: 'assets/img/user-2.jpg',
    civility: 'Mrs',
    first_name: 'Valentine',
    last_name: 'Valois',
    weight: 8546321232,
    priority: 'hight',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mr',
    first_name: 'Thomas',
    last_name: 'Martin',
    weight: 8546321232,
    priority: 'lost',
  },
  {
    photo: 'assets/img/user-2.jpg',
    civility: 'Mrs',
    first_name: 'Cindy',
    last_name: 'Lacour',
    weight: 8546321232,
    priority: 'modert',
  },
  {
    photo: 'assets/img/user-2.jpg',
    civility: 'Mrs',
    first_name: 'Valentine',
    last_name: 'Valois',
    weight: 8546321232,
    priority: 'hight',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mr',
    first_name: 'Thomas',
    last_name: 'Martin',
    weight: 8546321232,
    priority: 'low',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mrs',
    first_name: 'Cindy',
    last_name: 'Lacour',
    weight: 8546321232,
    priority: 'hight',
  },
  {
    photo: 'assets/img/user-2.jpg',
    civility: 'Mrs',
    first_name: 'Valentine',
    last_name: 'Valois',
    weight: 8546321232,
    priority: 'hight',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mr',
    first_name: 'Thomas',
    last_name: 'Martin',
    weight: 8546321232,
    priority: 'hight',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mrs',
    first_name: 'Cindy',
    last_name: 'Lacour',
    weight: 8546321232,
    priority: 'modert',
  },
  {
    photo: 'assets/img/user-2.jpg',
    civility: 'Mrs',
    first_name: 'Valentine',
    last_name: 'Valois',
    weight: 8546321232,
    priority: 'hight',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mr',
    first_name: 'Thomas',
    last_name: 'Martin',
    weight: 8546321232,
    priority: 'lost',
  },
  {
    photo: 'assets/img/user-1.jpg',
    civility: 'Mrs',
    first_name: 'Cindy',
    last_name: 'Lacour',
    weight: 8546321232,
    priority: 'low',
  },
];

@Component({
  selector: 'ms-school-dashboard',
  templateUrl: './school-dashboard.component.html',
  styleUrls: ['./school-dashboard.component.scss'],
})
export class SchoolDashboardComponent implements OnInit {
  @Input() filteredSchool: any;
  displayedColumns: string[] = ['name', 'priority', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  selection = new SelectionModel(true, []);
  selectCandidate: any;

  listOfCampus = [
    {
      name: 'All',
      value: '',
      selected: false,
    },
    {
      name: 'Aix',
      value: 'aix',
      selected: false,
    },
    {
      name: 'Bordeaux',
      value: 'bordeaux',
      selected: false,
    },
    {
      name: 'Lille',
      value: 'lille',
      selected: false,
    },
    {
      name: 'Lyon',
      value: 'lyon',
      selected: false,
    },
    {
      name: 'Montpellier',
      value: 'montpellier',
      selected: false,
    }
  ];

  listOfProgrammes = [
    {
      name: 'All',
      value: '',
      selected: false,
    },
    {
      name: 'GE 1',
      value: 'ge1',
      selected: false,
    },
    {
      name: 'GE 2',
      value: 'ge2',
      selected: false,
    },
    {
      name: 'GE 3',
      value: 'ge3',
      selected: false,
    },
    {
      name: 'GE 4',
      value: 'ge4',
      selected: false,
    },
    {
      name: 'GE 5',
      value: 'ge5',
      selected: false,
    }
  ];

  constructor() {}

  ngOnInit() {
    console.log('filteredSchool', this.filteredSchool);
  }

  candidateSelected(data) {
    this.selectCandidate = data;
    console.log('candidate data', data);
  }
}
