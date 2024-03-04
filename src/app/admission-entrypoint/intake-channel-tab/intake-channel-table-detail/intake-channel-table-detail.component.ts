import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as moment from 'moment';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-intake-channel-table-detail',
  templateUrl: './intake-channel-table-detail.component.html',
  styleUrls: ['./intake-channel-table-detail.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class IntakeChannelTableDetailComponent implements OnInit {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;

  nationalitiesList = [];
  nationalList = [];
  nationalitySelected: string;

  countries;
  countryList;
  filteredCountry: any[][] = [];

  cities: string[][] = [];
  filteredCities: string[][] = [];

  departments: string[][] = [];
  filteredDepartments: string[][] = [];

  regions: string[][] = [];
  filteredRegions: string[][] = [];
  intakeList = [];
  intakeOriList = [];
  sectorList:any = [];
  sectorOriList = [];
  private intVal: any;
  private timeOutVal: any;
  toFilterList = [
    { civility: 'Mrs', value: ' Mrs Anne CHAMBIER', key: 'Anne CHAMBIER' },
    { civility: 'Mr', value: 'Mr Fabien CHAMBIER', key: 'Fabien CHAMBIER' },
  ];

  constructor(
    public dialogRef: MatDialogRef<IntakeChannelTableDetailComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private financeService: FinancesService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.iniVerificationForm();
    if (this.data) {
      console.log('Data Edit', this.data);
      this.patchDataScholar();
    }
  }

  patchDataScholar() {
    const dataEdit = _.cloneDeep(this.data);
    console.log('dataEdit', dataEdit);
    this.identityForm.patchValue(dataEdit);
    console.log(this.identityForm.value);
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      intake_channel: [''],
      school: [''],
      season: [''],
      level: [''],
      campus: [''],
      intake_channel_detail: [''],
      legal_entities_id: [null],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

}
