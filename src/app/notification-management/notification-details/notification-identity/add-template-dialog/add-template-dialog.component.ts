import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationManagementService, Templates } from 'app/notification-management/notification-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

interface Program {
  _id: string;
  program: string;
}

@Component({
  selector: 'ms-add-template-dialog',
  templateUrl: './add-template-dialog.component.html',
  styleUrls: ['./add-template-dialog.component.scss'],
})
export class AddTemplateDialogComponent implements OnInit {
  seasonList = [];
  originalSeasonList = [];
  programList = [];
  templateForm: UntypedFormGroup;
  private subs = new SubSink();
  isAwaitingForResponse = false;
  selectedSeason = new UntypedFormControl(null);
  selectedPrograms = new UntypedFormControl([]);
  programListMatrix: Program[][] = [];
  programsOptions = true;

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private financeService: FinancesService,
    @Inject(MAT_DIALOG_DATA)
    public data: { notification_id: string; notification_reference: string; hasDefaultTemplate: boolean; existingData: Templates | null },
    public dialogRef: MatDialogRef<AddTemplateDialogComponent>,
    private notificationService: NotificationManagementService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // console.log('data', this.data);
    this.initTemplateForm();
    this.getScholarSeasons();
  }

  initTemplateForm() {
    this.templateForm = this.fb.group({
      notification_reference_id: [this.data?.notification_id],
      is_default_template: [false],
      program_seasons: this.fb.array([], Validators.required),
      template_name: [null, Validators.required],
    });
  }

  // on click the add yellow button
  addSeasonProgram() {
    // console.log('_se', this.programSeasons.value);

    const newScholarProgram = this.fb.group({
      scholar_season: [this.selectedSeason.value, Validators.required],
      programs: [this.selectedPrograms.value, Validators.required],
    });

    this.programListMatrix.push(this.programList);
    this.programSeasons.push(newScholarProgram);

    this.selectedPrograms.patchValue(null);
    this.selectedSeason.patchValue(null);
    this.programsOptions = true;

    const scholarSeasonsSelected = this.programSeasons.value.map((res) => res?.scholar_season);
    if (scholarSeasonsSelected && scholarSeasonsSelected.length > 0) {
      this.seasonList = this.seasonList.filter((res) => !scholarSeasonsSelected.includes(res?._id));
    }
  }

  addEmptyProgramSeasons() {
    const newScholarProgram = this.fb.group({
      scholar_season: [null, Validators.required],
      programs: [null, Validators.required],
    });
    this.programSeasons.push(newScholarProgram);
  }

  patchForm(data) {
    // console.log('pathcForm', data);
    if (data && data.program_seasons && data.program_seasons.length) {
      data.program_seasons = data.program_seasons.map((programSeason) => {
        const programs = programSeason?.programs.map((program) => program?._id); // format so programs is only an array of IDs
        const season = programSeason?.scholar_season?._id || null; // keep only the id of each scholar season (comes in object from BE)
        return { ...programSeason, programs: programs, scholar_season: season };
      });

      if (this.programSeasons?.length < data?.program_seasons?.length) {
        data.program_seasons.forEach((element, index) => {
          this.addEmptyProgramSeasons(); // create empty controllers of program_seasons to be patched with data above
          this.getProgramsForAddedProgramSeasons(element?.scholar_season, index); // populate the programs matrix to have dropdown of programs for each row of added season-program pair
        });
      }
    }
    this.templateForm.patchValue(data);
    const scholarSeasonsSelected = this.programSeasons.value.map((res) => res.scholar_season);
    if (scholarSeasonsSelected && scholarSeasonsSelected.length > 0) {
      this.seasonList = this.originalSeasonList.filter((res) => !scholarSeasonsSelected.includes(res?._id));
    }

    if (data.is_default_template) {
      this.programSeasons.clearValidators();
      this.programSeasons.updateValueAndValidity();
    }
  }

  getScholarSeasons() {
    this.isAwaitingForResponse = true;
    this.subs.sink = this.financeService.GetAllScholarSeasonsDropdown().subscribe(
      (seasons) => {
        this.isAwaitingForResponse = false;
        this.seasonList = seasons;
        this.originalSeasonList = seasons;
        if (this.data && this.data.existingData) {
          this.patchForm({ ...this.data.existingData });
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isAwaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // get programs when user select a scholar season on the form above (outside of yellow box)
  getPrograms() {
    this.subs.sink = this.financeService.getAllProgramByScholar(this.selectedSeason.value).subscribe(
      (programs) => {
        this.programList = programs;
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  // this gets called when user changes the scholar_season of already added pair of scholar-program (inside yellow box).
  onChangeAddedSeason(index: number) {
    this.programSeasons.at(index).get('programs').patchValue(null);
    const scholarSeasonAtIndex = this.programSeasons.at(index).get('scholar_season').value;
    this.getProgramsForAddedProgramSeasons(scholarSeasonAtIndex, index);
  }

  // this is used to get programs from individual scholar seasons on the array of added program seasons (inside the yellow box);
  getProgramsForAddedProgramSeasons(scholar_season_id: string, index: number) {
    // console.log('the scholar_season_id for this row is:', scholar_season_id);
    this.subs.sink = this.financeService
      .getAllProgramByScholar(scholar_season_id)
      .pipe(take(1))
      .subscribe(
        (programs: Program[]) => {
          this.programListMatrix.splice(index, 0, programs); // set the program dropdown for that particular row of season-program pair;
        },
        (err) => {
          this.authService.postErrorLog(err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  // on default template slider change, check if allowed to switch to default based on if it already exist in the previous table
  onTemplateDefaultToggle(value) {
    // if (this.data && this.data.hasDefaultTemplate && value.checked) {
    //   Swal.fire({
    //     type: 'warning',
    //     title: this.translate.instant('DEFAULT_TEMPLATE_ALREADY_EXIST.TITLE'),
    //     text: this.translate.instant('DEFAULT_TEMPLATE_ALREADY_EXIST.TEXT', { notificationRef: this.data.notification_reference }),
    //     confirmButtonText: this.translate.instant('OK'),
    //     allowEnterKey: false,
    //     allowEscapeKey: false,
    //     allowOutsideClick: false,
    //   }).then((confirm) => {
    //     if (confirm) {
    //       this.templateForm.get('is_default_template').patchValue(false);
    //       this.data.existingData ? this.updateTemplate() : this.createNewTemplate();
    //       return;
    //     }
    //   });
    // }
    if (value.checked) {
      this.programSeasons.clearValidators();
      // this.programSeasons.clear(); // remove all the existing programs-season pair on switch to default
    } else {
      this.programSeasons.setValidators([Validators.required]);
    }

    this.programSeasons.updateValueAndValidity();
  }

  get programSeasons() {
    return this.templateForm.get('program_seasons') as UntypedFormArray;
  }

  // on click red remove button
  removeSeasonProgram(programIndex: number) {
    this.programSeasons.removeAt(programIndex);
    this.programSeasons.updateValueAndValidity();

    this.programListMatrix.splice(programIndex, 1);

    const scholarSeasonsSelected = this.programSeasons.value.map((res) => res.scholar_season);
    if (scholarSeasonsSelected && scholarSeasonsSelected.length > 0) {
      this.seasonList = this.originalSeasonList.filter((res) => !scholarSeasonsSelected.includes(res._id));
    } else {
      this.seasonList = this.originalSeasonList;
    }
  }

  closeDialog(resp?) {
    this.dialogRef.close(resp);
  }

  // get all names of selected seasons to be displayed in confirmation swal
  getSelectedSeasons(): string {
    const selectedSeasons = this.programSeasons.value.map((programSeason) => programSeason.scholar_season);
    return this.originalSeasonList
      .filter((season) => season && season._id && selectedSeasons.includes(season._id))
      .map((season) => season.scholar_season)
      .join(', ');
  }

  // get all names of selected programs to be displayed in confirmation swal
  getSelectedPrograms(): string {
    const selectedPrograms = this.programSeasons.value.map((programSeason) => programSeason.programs); // get only the programs array
    const mergedSelectedPrograms = [].concat.apply([], selectedPrograms); // flatten the array of array of programs [[programs1], [programs2]]] => [programs1, programs2]
    return this.programList
      .filter((program) => program && program._id && mergedSelectedPrograms.includes(program._id))
      .map((program) => program.program)
      .join(', ');
  }

  // display confirmation swal depending on whether template is default or not
  async displayWarningSwalBeforeSubmit() {
    if (this.templateForm.get('is_default_template').value) {
      await Swal.fire({
        type: 'warning',
        title: this.translate.instant('Notif_S3.TITLE'),
        html: this.translate.instant('Notif_S3.TEXT'),
        confirmButtonText: this.translate.instant('Notif_S3.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    } else {
      const seasons = this.getSelectedSeasons();
      const programmes = this.getSelectedPrograms();
      await Swal.fire({
        type: 'warning',
        title: this.translate.instant('Notif_S5.TITLE', { templateName: this.templateForm.value.template_name }),
        html: this.translate.instant('Notif_S5.TEXT', { scholarSeasons: seasons, programmes: programmes }),
        confirmButtonText: this.translate.instant('Notif_S5.BUTTON'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
    }
  }

  submit() {
    const isSelectSeason = this.selectedSeason.value ? true : false;
    const isSelectProgram = this.selectedPrograms.value && this.selectedPrograms.value.length > 0 ? true : false;

    let isNeedAddedFirst = false;
    if (isSelectProgram && isSelectSeason) {
      if (this.programSeasons.length > 0) {
        isNeedAddedFirst = this.programSeasons.value.find((res) => res.scholar_season === this.selectedSeason.value) ? false : true;
      } else {
        isNeedAddedFirst = true;
      }
    }

    if (isNeedAddedFirst) {
      this.addSeasonProgram();
    }

    if (this.templateForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.markAllFieldsAsTouched(this.templateForm);
    } else {
      this.sendSubmit();
    }
  }

  updateTemplate() {
    this.isAwaitingForResponse = true;
    const payload = this.templateForm.getRawValue();
    if (payload.is_default_template) {
      payload.program_seasons = [];
    }
    this.notificationService.updateNotificationTemplate(this.data.existingData._id, payload).subscribe(
      (resp) => {
        this.isAwaitingForResponse = false;
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          confirmButtonText: this.translate.instant('OK'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.dialogRef.close(true);
        });
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isAwaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
        return;
      },
    );
  }

  async createNewTemplate() {
    this.isAwaitingForResponse = true;
    const payload = this.templateForm.getRawValue();
    if (payload.is_default_template) {
      payload.program_seasons = [];
    }
    await this.displayWarningSwalBeforeSubmit(); // display confirmation swal depending on whether template is default or not
    this.notificationService.createNotificationTemplate(payload).subscribe(
      (resp) => {
        this.isAwaitingForResponse = false;
        if (resp) {
          if (this.templateForm.get('is_default_template').value) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Notif_S4.TITLE'),
              text: this.translate.instant('Notif_S4.TEXT'),
              confirmButtonText: this.translate.instant('Notif_S4.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          } else {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              text: this.translate.instant('Notif_S6.TEXT', { templateName: this.templateForm.value.template_name }),
              confirmButtonText: this.translate.instant('Notif_S6.BUTTON'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.dialogRef.close(true);
            });
          }
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        if (error['message'] === 'GraphQL error: name already exists.') {
          Swal.fire({
            title: this.translate.instant('Uniquename_S1.TITLE'),
            html: this.translate.instant('Uniquename_S1.TEXT'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('Uniquename_S1.BUTTON 1'),
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
        this.isAwaitingForResponse = false;
        return;
      },
    );
  }

  async checkFormValidity(): Promise<boolean> {
    if (this.templateForm.invalid) {
      const action = await Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.markAllFieldsAsTouched(this.templateForm);
      return false;
    } else {
      return true;
    }
  }

  // make all field as touched so error can show
  markAllFieldsAsTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.markAllFieldsAsTouched(control);
      } else if (control instanceof UntypedFormArray) {
        control.markAsTouched();
        for (const arrayControl of control.controls) {
          arrayControl.markAllAsTouched();
        }
      }
    });
  }

  selectAllPrograms(event: any) {
    if (this.selectedPrograms.value.length !== this.programList.length) {
      this.programsOptions = true;
    } else {
      this.programsOptions = false;
    }
    if (event.includes('all')) {
      const arr = this.programList.map((ress) => ress._id);
      this.selectedPrograms.setValue(arr);
      // console.log(this.selectedPrograms.value);
      if (this.selectedPrograms.value.length === this.programList.length) {
        this.programsOptions = false;
      }
      // console.log(this.selectedPrograms.value.length);
    }
  }

  selectAllAddedPrograms(event: any, index: number) {
    if (event.includes('all')) {
      this.programSeasons
        .at(index)
        .get('programs')
        .patchValue(this.programListMatrix[index].map((program) => program._id));
    }
  }

  sendSubmit() {
    if (this.data && this.data.hasDefaultTemplate && this.templateForm.get('is_default_template').value && !this.data.existingData) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('DEFAULT_TEMPLATE_ALREADY_EXIST.TITLE'),
        text: this.translate.instant('DEFAULT_TEMPLATE_ALREADY_EXIST.TEXT', { notificationRef: this.data.notification_reference }),
        confirmButtonText: this.translate.instant('OK'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((confirm) => {
        this.templateForm.get('is_default_template').patchValue(false);
        return;
      });
    } else {
      this.data.existingData ? this.updateTemplate() : this.createNewTemplate();
    }
    // console.log('toggle', this.data);
    // if (this.data.hasDefaultTemplate) {
    //   Swal.fire({
    //     type: 'warning',
    //     title: this.translate.instant('DEFAULT_TEMPLATE_ALREADY_EXIST.TITLE'),
    //     text: this.translate.instant('DEFAULT_TEMPLATE_ALREADY_EXIST.TEXT', { notificationRef: this.data.notification_reference }),
    //     confirmButtonText: this.translate.instant('OK'),
    //     allowEnterKey: false,
    //     allowEscapeKey: false,
    //     allowOutsideClick: false,
    //   })
    // }
    // console.log('templateForm', this.templateForm.value);
  }
}
