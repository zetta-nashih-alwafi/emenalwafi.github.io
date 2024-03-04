import { SubSink } from 'subsink';
import { UntypedFormControl } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { CompanyService } from 'app/service/company/company.service';
import { AddCompanyDialogComponent } from '../add-company-dialog/add-company-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { ImportContractProcessDialogComponent } from 'app/shared/components/import-contract-process-dialog/import-contract-process-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-company-header-bar',
  templateUrl: './company-header-bar.component.html',
  styleUrls: ['./company-header-bar.component.scss'],
})
export class CompanyHeaderBarComponent implements OnInit {
  @Output() isReset = new EventEmitter<boolean>();
  search = new UntypedFormControl('');
  private subs = new SubSink();
  filterBreadcrumbData: any[] = [];
  filteredValue = { search: '' };
  constructor(
    public dialog: MatDialog,
    private companyService: CompanyService,
    public translate: TranslateService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.search.valueChanges.pipe(debounceTime(400)).subscribe((resp) => {
      this.companyService.filterCompany(resp);
      this.filteredValue.search = resp;
      this.filterBreadcrumbData = [];
      this.filterBreadcrumbFormat();
    });
  }
  reset() {
    this.search.setValue('', { emitEvent: false });
    this.companyService.filterCompany(null);
    this.filteredValue.search = '';
    this.filterBreadcrumbData = [];
    this.isReset.emit(true);
  }

  addCompany() {
    this.subs.sink = this.dialog
      .open(AddCompanyDialogComponent, {
        disableClose: true,
        width: '50%',
        minHeight: '100px',
        data: 'company',
      })
      .afterClosed()
      .subscribe((result) => {
        console.log('result : ', result);
        if (result) {
        }
      });
  }

  templateForImport() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_TEMPLATE_S1.COMMA'),
      ';': this.translate.instant('IMPORT_TEMPLATE_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_TEMPLATE_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_TEMPLATE_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.OK'),
      input: 'radio',
      inputValue: ';',
      inputOptions: inputOptions,
    }).then((separator) => {
      console.log(separator);
      if (separator && separator.value) {
        this.downloadCSVTemplate(separator.value);
      }
    });
  }

  downloadCSVTemplate(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const path = '';
    const lang = this.translate.currentLang.toLowerCase();
    let importStudentTemlate = 'downloadImportCompanyTemplate';
    importStudentTemlate = importStudentTemlate + '/' + fileType + '/' + lang;
    element.href = url + importStudentTemlate + path;

    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  csvTypeSelectionUpload() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: ';',
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            resolve('');
            Swal.enableConfirmButton();
          } else {
            Swal.disableConfirmButton();
            reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
          }
        });
      },
      onOpen: function () {
        Swal.disableConfirmButton();
        Swal.getContent().addEventListener('click', function (e) {
          Swal.enableConfirmButton();
        });
        const input = Swal.getInput();
        const inputValue = input.getAttribute('value');
        if (inputValue === ';') {
          Swal.enableConfirmButton();
        }
      },
    }).then((separator) => {
      if (separator.value) {
        const fileType = separator.value;
        this.openImportDialog(fileType);
      }
    });
  }

  openImportDialog(fileType) {
    let delimeter = null;
    switch (fileType) {
      case ',':
        delimeter = ',';
        break;
      case ';':
        delimeter = ';';
        break;
      case 'tab':
        delimeter = 'tab';
        break;
      default:
        delimeter = null;
        break;
    }
    this.dialog
      .open(ImportContractProcessDialogComponent, {
        width: '500px',
        panelClass: 'certification-rule-pop-up',
        minHeight: '200px',
        disableClose: true,
        data: {
          delimeter: delimeter,
          type: 'companies',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.reset();
        }
      });
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'search', // name of the key in the object storing the filter
        column: 'COMPANY.SearchBy', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.search, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
    ];

    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }

  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValue);
    this.search.setValue('');
  }
}
