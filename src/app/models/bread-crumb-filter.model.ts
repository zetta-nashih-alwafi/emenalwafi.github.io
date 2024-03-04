import { UntypedFormControl } from '@angular/forms';

export interface FilterBreadCrumbInput {
  type: 'super_filter' | 'table_filter' | 'action_filter';
  name: string;
  column: string;
  isMultiple: boolean;
  filterValue: any;
  filterList: any[];
  filterRef: UntypedFormControl;
  displayKey: string;
  savedValue: string;
  fixedValues?: string[];
  isSelectionInput: boolean;
  translationPrefix?: string;
  resetValue?: string | null | string[];
  noTranslate?: boolean;
  nestedKey?: string;
  stepColumnName?: number | null;
}

export interface FilterBreadCrumbItem {
  type: 'super_filter' | 'table_filter' | 'action_filter';
  name: string;
  column: string;
  value: string | any[];
  key: string | any[];
  isMultiple: boolean;
  filterRef: UntypedFormControl;
  resetValue?: string | null | string[];
  noTranslate?: boolean;
  stepColumnName?: number | null;
}
