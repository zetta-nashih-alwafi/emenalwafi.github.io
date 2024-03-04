import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import _ from 'lodash';
import * as DecoupledEditor from 'assets/ckeditor5-custom/ckeditor.js';
import { SpeechToTextDialogComponent } from 'app/shared/components/speech-to-text-dialog/speech-to-text-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InternshipService } from 'app/service/internship/internship.service';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-internship-setup-condition-tab',
  templateUrl: './internship-setup-condition-tab.component.html',
  styleUrls: ['./internship-setup-condition-tab.component.scss'],
})
export class InternshipSetupConditionTabComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  campusList = ['Paris', 'Toulouse'];
  levelList = ['1', '2', '3', '4', '5'];
  schoolSelected = 'EFAP';
  formCampus = new UntypedFormControl(null);
  formLevel = new UntypedFormControl(null);
  formCondition = new UntypedFormControl(null);
  selectedCampusList = [];
  selectedLevelList = [];
  schoolData: any;
  conditionForm: UntypedFormGroup;
  selectedLevelLists = [];
  originalAgreementConditions: any;
  updateCondition = false;
  campusSelected = true;
  agreementConditionId: any;
  public Editor = DecoupledEditor;
  @ViewChild('editor', { static: true }) editor: DecoupledEditor;
  public config = {
    toolbar: [
      'heading',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      'todoList',
      '|',
      'indent',
      'outdent',
      '|',
      'link',
      'blockQuote',
      'imageUpload',
      'insertTable',
      'horizontalLine',
      'pageBreak',
      '|',
      'undo',
      'redo',
    ],
    link: {
      addTargetToExternalLinks: true,
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
    },
  };
  schoolLoginList: any;
  isDirectorCompany = false;
  isMemberCompany = false;
  isPermission: any;
  entityList: any;
  currentUser;
  constructor(
    private dialog: MatDialog,
    private internshipService: InternshipService,
    private authService: AuthService,
    private permissionsService: NgxPermissionsService,
    private fb: UntypedFormBuilder,
    private candidateService: CandidatesService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.isDirectorCompany = !!this.permissionsService.getPermission('Company Relation Director');
    this.isMemberCompany = !!this.permissionsService.getPermission('Company Relation Member');
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    if (this.isPermission && this.isPermission.length) {
      if (this.currentUser && this.currentUser.entities && this.currentUser.entities.length) {
        this.subs.sink = this.candidateService.GetOneUserCRM(this.currentUser._id).subscribe(
          (res) => {
            // console.log(res);
            if (res) {
              this.entityList = res.entities.filter((resp) => resp.type && resp.type.name === this.isPermission[0]);
            }
            this.getSelectedSchool();
            this.getAllAgreementCondition();
          },
          (err) => {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    }
  }

  getOneUser(id) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getSelectedSchool() {
    if (this.isDirectorCompany || this.isMemberCompany) {
      this.campusList = [];
      this.levelList = [];
      this.subs.sink = this.internshipService.schoolData.subscribe((resp) => {
        if (resp) {
          this.schoolData = _.cloneDeep(resp);
          this.schoolSelected = resp.short_name;
          const campusList = this.entityList.map((list) => list.campus);
          const levelList = this.entityList.map((list) => list.level);
          this.campusList = _.uniqBy(campusList);
          this.levelList = _.uniqBy(levelList);
          // console.log('list', this.campusList, this.levelList);
          this.initForm();
        }
      });
    } else {
      this.subs.sink = this.internshipService.schoolData.subscribe((resp) => {
        this.campusList = [];
        this.levelList = [];
        if (resp) {
          // console.log('resp', resp);
          this.schoolData = _.cloneDeep(resp);
          this.schoolSelected = resp.short_name;
          const campusList = [];
          resp.campuses.forEach((campus) => {
            if (campus) {
              campusList.push(campus.name);
            }
          });
          const levelList = [];
          resp.levels.forEach((level) => {
            if (level) {
              levelList.push(level.name);
            }
          });
          this.campusList = campusList;
          this.levelList = levelList;

          // console.log('list', this.campusList, this.levelList);
          this.initForm();
        }
      });
    }
  }

  initForm() {
    this.conditionForm = this.fb.group({
      schools_id: [[this.schoolData._id]],
      scholar_season_id: [this.schoolData.scholar_season_id],
      campuses: [null, Validators.required],
      levels: [null, Validators.required],
      condition_agreement: [null, Validators.required],
    });
    console.log('forms', this.conditionForm, this.conditionForm.value);
  }

  get levels(): UntypedFormArray {
    return <UntypedFormArray>this.conditionForm.controls.levels;
  }
  get campuses(): UntypedFormArray {
    return <UntypedFormArray>this.conditionForm.controls.campuses;
  }

  getAllAgreementCondition() {
    const payload = this.conditionForm.value;
    delete payload.condition_agreement;
    // console.log('payload ini', payload);
    this.subs.sink = this.internshipService.getAllAgreementConditionsTable(payload).subscribe(
      (resp) => {
        if (resp) {
          this.originalAgreementConditions = _.cloneDeep(resp);
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  selectCampus(event) {
    this.campusSelected = false;
    if (this.originalAgreementConditions && this.originalAgreementConditions.length) {
      this.checkSelectedCampus(event);
    } else {
      this.updateCondition = false;
      this.formCampus.setValue(null);
      this.selectedCampusList.push(event);
      this.selectedCampusList = _.uniqBy(this.selectedCampusList);
      this.campuses.patchValue(this.selectedCampusList, { emitEvent: true });
    }
  }
  selectLevel(event) {
    // console.log(event);
    this.formLevel.setValue(null);
    let levelName = event;
    if (parseInt(event)) {
      levelName = 'GE' + ' ' + event;
    } else {
      levelName = event;
    }
    this.selectedLevelList.push(levelName);
    this.selectedLevelList = _.uniqBy(this.selectedLevelList);
    this.selectedLevelLists.push(event);
    this.selectedLevelLists = _.uniqBy(this.selectedLevelLists);
    this.levels.patchValue(this.selectedLevelLists, { emitEvent: true });
  }
  saveConditionAgreement() {
    if (this.updateCondition) {
      const payload = this.conditionForm.value;
      // console.log('payload-->', payload, this.conditionForm.value);
      this.subs.sink = this.internshipService.UpdateAgreementCondition(this.agreementConditionId, payload).subscribe(
        (resp) => {
          // console.log('resp', resp);
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.internshipService.setIndexStep(0);
            });
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      const payload = this.conditionForm.value;
      // console.log('shaped payload', payload, this.conditionForm.value);
      this.subs.sink = this.internshipService.CreateAgreementCondition(payload).subscribe(
        (resp) => {
          // console.log('resp', resp);
          if (resp) {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.internshipService.setIndexStep(0);
            });
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
  goToCancleConditionAgreement() {
    this.internshipService.setIndexStep(0);
  }
  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }
  deleteCampus(i) {
    this.selectedCampusList.splice(i, 1);
    this.campuses.patchValue(this.selectedCampusList, { emitEvent: true });
    if (this.selectedCampusList.length === 0) {
      console.log('true masuk campus kosong');
      this.selectedLevelList = [];
      this.selectedLevelLists = [];
      this.conditionForm.get('condition_agreement').patchValue(null, { emitEvent: true });
      this.updateCondition = false;
      this.campusSelected = false;
    }
    console.log('form', this.campuses.value);
  }
  deleteLevel(i) {
    this.selectedLevelList.splice(i, 1);
    this.selectedLevelLists.splice(i, 1);
    this.levels.patchValue(this.selectedLevelLists, { emitEvent: true });
    if (this.selectedLevelLists.length === 0) {
      console.log('true masuk level kosong');
    }
    console.log('form', this.levels.value);
  }

  recordNote() {
    this.dialog
      .open(SpeechToTextDialogComponent, {
        width: '800px',
        minHeight: '300px',
        panelClass: 'candidate-note-record',
        disableClose: true,
        data: '',
      })
      .afterClosed()
      .subscribe((text) => {
        if (text.trim()) {
          const voiceText = text ? `${text}` : ``;
          this.formCondition.setValue(voiceText);
          const parentValue = this.conditionForm.get('condition_agreement').value;
          const groupValue = parentValue ? parentValue + ' ' + voiceText : voiceText;
          this.conditionForm.get('condition_agreement').setValue(groupValue);
        }
      });
  }

  checkSelectedCampus(event) {
    this.formCampus.setValue(null);
    const dataFound = this.originalAgreementConditions.find((campus) => {
      return campus.campuses.find((list) => list === event);
    });
    console.log('list campus', dataFound, this.originalAgreementConditions);
    if (dataFound) {
      this.updateCondition = true;
      this.agreementConditionId = dataFound._id;
      console.log('id?', this.agreementConditionId);
      this.selectedCampusList = dataFound.campuses;
      this.selectedCampusList = _.uniqBy(this.selectedCampusList);
      this.campuses.patchValue(this.selectedCampusList, { emitEvent: true });
      const conditionAgreement = dataFound.condition_agreement.replace(/<[^>]*>/g, '');
      this.conditionForm.get('condition_agreement').patchValue(conditionAgreement, { emitEvent: true });
      this.selectedLevelList = [];
      this.selectedLevelLists = [];
      this.levels.patchValue(null, { emitEvent: true });
      dataFound.levels.forEach((level) => {
        this.selectLevel(level);
      });
    } else {
      this.formCampus.setValue(null);
      this.selectedCampusList.push(event);
      this.selectedCampusList = _.uniqBy(this.selectedCampusList);
      this.campuses.patchValue(this.selectedCampusList, { emitEvent: true });
    }
  }
}
