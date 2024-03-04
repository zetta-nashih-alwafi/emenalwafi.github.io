import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import { MailInternshipDialogComponent } from '../mail-internship-dialog/mail-internship-dialog.component';
import { SendMultipleEmailComponent } from '../send-multiple-email/send-multiple-email.component';
import Swal from 'sweetalert2';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-internship-email-dialog',
  templateUrl: './internship-email-dialog.component.html',
  styleUrls: ['./internship-email-dialog.component.scss'],
  providers: [ParseStringDatePipe],
})
export class InternshipEmailDialogComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  identityForm: UntypedFormGroup;
  today: Date;
  studentId: any;
  studentData: any;
  dataPass: any;
  indexTab: any;
  isMainAddressSelected = false;
  isStudentSelected = false;
  isParentSelected = false;
  isUncleSelected = false;
  isContactSelected = false;

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
  userSelected: any;
  regions: string[][] = [];
  filteredRegions: string[][] = [];
  currencyList = [];
  private intVal: any;
  private timeOutVal: any;
  studentDatas = {
    email: 'jean@yopmail.com',
    first_name: 'Jean',
    last_name: 'Dupont',
    civility: 'Mr',
  };
  toFilterList = [
    { value: 'Student', key: 'Student' },
    { value: 'Finance Support', key: 'Finance Support' },
  ];
  dataFinanceList = [];
  mailStudentsDialog: MatDialogRef<MailInternshipDialogComponent>;
  constructor(
    public dialogRef: MatDialogRef<InternshipEmailDialogComponent>,
    private fb: UntypedFormBuilder,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private acadJourneyService: AcademicJourneyService,
    private candidatesService: CandidatesService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    console.log('Data Mail Student', this.data);

    this.today = new Date();
    this.iniVerificationForm();
    this.subs.sink = this.acadJourneyService.getCurrency().subscribe(
      (list: any[]) => {
        this.currencyList = list;
      },
      (err) => {
        this.authService.postErrorLog(err);
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
    if (this.data && this.data.financial_supports && this.data.financial_supports.length) {
      this.dataFinanceList = this.data.financial_supports
        .filter((filtered) => filtered.relation)
        .map((list) => {
          return {
            civility: list.civility,
            email: list.email,
            last_name: list.family_name,
            first_name: list.name,
            relation: list.relation,
            status: false,
            _id: list._id,
            intake_channel: list?.intake_channel,
            candidate: list?.candidate,
          };
        });
    } else if (this.data.note === 'finance_org') {
      this.dataFinanceList = this.data.data.map((list) => {
        return {
          civility: list.civility,
          email: list.email,
          last_name: list.last_name,
          first_name: list.first_name,
          status: false,
          intake_channel: list?.intake_channel,
          candidate: list?.candidate,
        };
      });
    }
    if (this.data && this.data.admission_financement_ids && this.data.admission_financement_ids.length) {
      this.getAllContactsOrg();
    }
    if (this.data && this.data.company_branch_id && this.data.company_branch_id.length) {
      this.getAllUserManyCompanyContract();
    }
  }

  getAllUserCompanyContract() {
    if (this.data.company_branch_id[0]) {
      this.subs.sink = this.candidatesService.getAllUsersCompanyContract(this.data.company_branch_id[0]).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataFinanceList = resp.map((list) => {
              return {
                civility: list.civility,
                email: list.email,
                last_name: list.last_name,
                first_name: list.first_name,
                status: false,
              };
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          }
        },
      );
    }
  }

  getAllUserManyCompanyContract() {
    if (this.data.company_branch_id[0]) {
      this.subs.sink = this.candidatesService.getAllUserManyCompanyContract(this.data.company_branch_id).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataFinanceList = resp.map((list) => {
              return {
                civility: list.civility,
                email: list.email,
                last_name: list.last_name,
                first_name: list.first_name,
                status: false,
              };
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          }
        },
      );
    }
  }

  getAllContactsOrg() {
    if (this.data.admission_financement_ids[0]) {
      this.subs.sink = this.candidatesService.getAllContactsOrg(this.data.admission_financement_ids).subscribe(
        (resp) => {
          if (resp && resp.length) {
            this.dataFinanceList = resp.map((list) => {
              return {
                civility: list.civility,
                email: list.email,
                last_name: list.last_name,
                first_name: list.first_name,
                status: false,
              };
            });
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          }
        },
      );
    }
  }

  iniVerificationForm() {
    this.identityForm = this.fb.group({
      civility: [null, Validators.required],
      from: [null, Validators.required],
      to: [null, Validators.required],
      amount: [null],
      method: [null],
      currency: ['EUR'],
      date_of_birth: [null, Validators.required],
      reference: [null, Validators.required],
      note: [null, Validators.required],
    });
  }

  submitVerification() {
    const filterDataSelected = this.dataFinanceList.filter((list) => list.status === true);
    let dataSelected;
    if (this.userSelected || this.isParentSelected) {
      if (this.userSelected) {
        filterDataSelected.unshift(this.userSelected);
      }
      if (this.data && this.data.triggeredFromFinance && filterDataSelected.length) {
        if (this.data?.triggeredFromStudent) {
          dataSelected = filterDataSelected.map((select) => {
            return {
              ...select,
              candidate: {
                candidate_id: select,
              },
              triggeredFromFinance: this.data?.triggeredFromFinance,
              triggeredFromStudent: this.data?.triggeredFromStudent,
            };
          });
        } else {
          dataSelected = filterDataSelected.map((select) => {
            return {
              ...select,
              candidate: {
                candidate_id: select,
              },
              triggeredFromFinance: this.data?.triggeredFromFinance,
            };
          });
        }
      } else {
        if (this.data?.triggeredFromStudent) {
          dataSelected = filterDataSelected.map((resp) => {
            return {
              ...resp,
              triggeredFromStudent: this.data?.triggeredFromStudent,
            };
          });
        } else {
          dataSelected = filterDataSelected;
        }
      }
      console.log('dataSelected', dataSelected);
      // call new dialog for multiple email student
      // if (this.data && this.data.fromCandidate) {
      dataSelected['fromCandidate'] = true;
      this.subs.sink = this.dialog
        .open(SendMultipleEmailComponent, {
          disableClose: true,
          width: '750px',
          data: dataSelected,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
            this.dialogRef.close(true);
          } else {
            this.dialogRef.close();
          }
        });
      // } else {
      //   this.subs.sink = this.dialog
      //     .open(MailInternshipDialogComponent, {
      //       disableClose: true,
      //       width: '750px',
      //       data: dataSelected,
      //     })
      //     .afterClosed()
      //     .subscribe((resp) => {
      //       if (resp) {
      //         this.dialogRef.close(true);
      //       } else {
      //         this.dialogRef.close();
      //       }
      //     });
      // }
    } else if (this.isContactSelected) {
      // if select more than one recipient
      if (this.data && this.data.triggeredFromFinance && filterDataSelected.length) {
        dataSelected = filterDataSelected.map((select) => {
          return {
            ...select,
            candidate: {
              candidate_id: select,
            },
            triggeredFromFinance: this.data.triggeredFromFinance,
            triggeredFromStudent: this.data?.triggeredFromStudent,
          };
        });
      } else {
        dataSelected = filterDataSelected.map((resp) => {
          return {
            ...resp,
            triggeredFromStudent: this.data?.triggeredFromStudent,
          };
        });
      }
      if (this.data.note === 'finance_org') {
        this.subs.sink = this.dialog
          .open(SendMultipleEmailComponent, {
            disableClose: true,
            width: '750px',
            data: filterDataSelected.map((data) => {
              // filter to match data mapping in SendMultipleEmailComponent
              return {
                candidate: data,
              };
            }),
          })
          .afterClosed()
          .subscribe((resp) => {
            this.dialogRef.close(Boolean(resp));
          });
      } else {
        dataSelected['fromCandidate'] = true;
        this.subs.sink = this.dialog
          .open(SendMultipleEmailComponent, {
            disableClose: true,
            width: '750px',
            data: dataSelected,
          })
          .afterClosed()
          .subscribe((resp) => {
            if (resp) {
              this.dialogRef.close(true);
            } else {
              this.dialogRef.close();
            }
          });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }

  selectedWhoCall(data) {
    this.isStudentSelected = !this.isStudentSelected;
    if (!this.isStudentSelected) {
      this.userSelected = null;
    } else {
      this.userSelected = data;
    }
  }

  selectedWhoCallParent(data, indexFinance) {
    this.dataFinanceList[indexFinance].status = !this.dataFinanceList[indexFinance].status;
    const selected = this.dataFinanceList.filter((list) => list.status === true);
    if (selected && selected.length) {
      this.isParentSelected = true;
    } else {
      this.isParentSelected = false;
    }
  }

  selectedWhoCallCompany(data, indexFinance) {
    console.log(data);
    this.dataFinanceList[indexFinance].status = !this.dataFinanceList[indexFinance].status;
    console.log(this.dataFinanceList);
    const selected = this.dataFinanceList.filter((list) => list.status === true);
    if (selected && selected.length) {
      this.isContactSelected = true;
    } else {
      this.isContactSelected = false;
    }
    console.log(this.isContactSelected);
  }

  selectedWhoCallUncle(data) {
    this.isUncleSelected = !this.isUncleSelected;
  }
}
