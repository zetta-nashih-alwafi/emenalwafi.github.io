import { Injectable } from '@angular/core';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';

@Injectable({
  providedIn: 'root',
})
export class FilterBreadcrumbService {
  constructor() {}

  // modify the filter bread crumb array
  filterBreadcrumb(newFilterValue: FilterBreadCrumbItem, filterBreadcrumbDataArray: FilterBreadCrumbItem[]) {
    const { type, column } = newFilterValue;

    const findFilterBreadcrumb = filterBreadcrumbDataArray.findIndex(
      (filterData) => filterData?.type === type && filterData?.column === column,
    );

    if (findFilterBreadcrumb !== -1) {
      filterBreadcrumbDataArray[findFilterBreadcrumb] = newFilterValue;
      if (
        !(Array.isArray(filterBreadcrumbDataArray[findFilterBreadcrumb]?.value)
          ? filterBreadcrumbDataArray[findFilterBreadcrumb]?.value?.length
          : filterBreadcrumbDataArray[findFilterBreadcrumb]?.value) &&
        !(Array.isArray(filterBreadcrumbDataArray[findFilterBreadcrumb]?.key)
          ? filterBreadcrumbDataArray[findFilterBreadcrumb]?.key?.length
          : filterBreadcrumbDataArray[findFilterBreadcrumb]?.key)
      ) {
        filterBreadcrumbDataArray.splice(findFilterBreadcrumb, 1);
      }
    } else if (
      findFilterBreadcrumb === -1 && Array.isArray(newFilterValue?.value) ? newFilterValue?.value?.length : newFilterValue?.value
    ) {
      filterBreadcrumbDataArray.push(newFilterValue);
    }
  }

  removeFilterBreadcrumb(
    filterItem: FilterBreadCrumbItem,
    superFilterObject?: Object,
    tableFilterObject?: Object,
    actionFilterObject?: Object,
    emitEvent: boolean = false,
  ) {
    if (filterItem.type === 'super_filter' && superFilterObject) {
      superFilterObject[filterItem.name] = null;
    } else if (filterItem.type === 'table_filter' && tableFilterObject) {
      tableFilterObject[filterItem.name] = null;
    } else if (filterItem.type === 'action_filter' && actionFilterObject) {
      actionFilterObject[filterItem.name] = null;
    }

    const value = filterItem?.resetValue ?? null;
    filterItem?.filterRef?.patchValue(value, { emitEvent });
  }

  filterSingle = (mainArray, selectedValue, savedValue, displayKey, translationPrefix = ''): string => {
    if (selectedValue === null || selectedValue === undefined) {
      return '';
    }
    // this.filterSingle(filterItem.filterList, value, filterItem.savedValue, filterItem.displayKey, filterItem.translationPrefix);
    return translationPrefix + mainArray?.find((item) => item[savedValue] === selectedValue)?.[displayKey];
  };

  filterSingleBoolean = (mainArray, selectedValue, savedValue, displayKey, translationPrefix = ''): string => {
    if (selectedValue === null || selectedValue === undefined) {
      return '';
    }
    // this.filterSingle(filterItem.filterList, value, filterItem.savedValue, filterItem.displayKey, filterItem.translationPrefix);
    return (
      translationPrefix +
      mainArray?.find((item) => {
        // *************** need to check if the value is string or boolean, because sometimes some component passing boolean value as a string
        if (typeof item[savedValue] === 'boolean') {
          return JSON.stringify(item[savedValue]) === selectedValue;
        } else if (typeof item[savedValue] === 'string') {
          return item[savedValue] === selectedValue;
        }
      })?.[displayKey]
    );
  };

  filterMultiple = (mainArray, refArray, savedValue, displayKey, translationPrefix = ''): any[] => {
    if (!refArray?.length) {
      return [];
    }
    return savedValue === null && displayKey === null
      ? mainArray.filter((item) => refArray?.includes(item)).map((filteredItem) => translationPrefix + filteredItem)
      : mainArray
          .filter((item) => refArray?.includes(item[savedValue]))
          ?.map((filteredItem) => translationPrefix + filteredItem[displayKey]);
  };

  isValueObject = (value: any) => {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
  };

  getNestedObjectValue = (object: Object, desiredKey: string): string => {
    for (const key in object) {
      if (key === desiredKey) {
        return object[desiredKey];
      }

      if (this.isValueObject(object[desiredKey])) {
        return this.getNestedObjectValue(object[key], desiredKey);
      }
    }
  };

  getKey = (filterItem: FilterBreadCrumbInput): string | any[] | null => {
    if (filterItem?.filterValue === null) {
      return null;
    }
    // we check the name if it is null because sometimes, some value is saved to a variable not an object
    // for example filter = 'foo' instead of filteredValue = {filter: 'foo'}
    // so if saved directly as a variable, make the name as null
    const value: string | any[] | object =
      filterItem?.name === null
        ? filterItem?.filterValue
        : typeof filterItem?.filterValue?.[filterItem?.name] === 'boolean'
        ? String(filterItem?.filterValue?.[filterItem.name])
        : filterItem.filterValue?.[filterItem.name];
    const isMultiple: boolean = filterItem.isMultiple;
    const isSelection: boolean = filterItem.isSelectionInput;
    const fixedValues: string[] = filterItem?.fixedValues; // for dropdown that mix fixed values with dynamic values
    // fixed values is stored in the array and saved in this fixedValues variable
    const translationPrefix: string | null = filterItem?.translationPrefix ?? '';

    if (value === null || value === undefined) {
      return null;
    } // if no value returns null
    if (!isSelection && this.isValueObject(value) && filterItem?.nestedKey) {
      // if value is an object, and the display is stored somewhere nested
      const val = this.getNestedObjectValue(value, filterItem.nestedKey);
      return translationPrefix + val;
    }
    if (!isSelection) {
      return translationPrefix + value;
    } // if it is a normal non-dropdown input, return the existing value

    let selectedValues;

    // if there are fixed values e.g. ['status1', 'status2'] check if the value selected is this fixed value.
    // if user can select both fix and dynamic at the same time, find the chosen fixed value and concat it to the selected
    // dynamic value. Else if the chosen value is a string (which mean it is not multiple selection) and user chose one of
    // the fix value, then just return this fix value
    if (fixedValues) {
      if (Array.isArray(value)) {
        selectedValues = fixedValues?.filter((fixed) => value?.includes(fixed));
      } else if (typeof value === 'string' || typeof value === 'boolean') {
        selectedValues = fixedValues?.find((fixed) => value === fixed);
        return selectedValues;
      }
    }
    const keyArray: string | any[] = isMultiple
      ? this.filterMultiple(filterItem.filterList, value, filterItem.savedValue, filterItem.displayKey, filterItem.translationPrefix)
      : typeof filterItem?.filterValue?.[filterItem?.name] === 'boolean' || filterItem?.filterValue?.[filterItem?.name] === 'false' || filterItem?.filterValue?.[filterItem?.name] === 'true'
      ? this.filterSingleBoolean(filterItem.filterList, value, filterItem.savedValue, filterItem.displayKey, filterItem.translationPrefix)
      : this.filterSingle(filterItem.filterList, value, filterItem.savedValue, filterItem.displayKey, filterItem.translationPrefix);

    if (isMultiple && selectedValues) {
      return keyArray.concat(...fixedValues);
    }

    return keyArray;
  };

  // format the filterInfo input passed from each component
  filterBreadcrumbFormat(filterInfo: FilterBreadCrumbInput[], currentFilterArrayData: FilterBreadCrumbItem[]): FilterBreadCrumbItem[] {
    const formattedBreadcrumbInput = [...currentFilterArrayData];

    for (const filterItem of filterInfo) {
      const value: string | any[] =
        filterItem.name === null // condition to check if filter value is saved directly in a variable instead of an object
          ? filterItem?.filterValue
          : typeof filterItem?.filterValue?.[filterItem.name] === 'boolean'
          ? String(filterItem?.filterValue?.[filterItem.name])
          : filterItem?.filterValue?.[filterItem.name];
      const newFilterEntry = {
        type: filterItem.type,
        name: filterItem.name,
        column: filterItem.column,
        filterList: filterItem?.filterList,
        value: value || null,
        isMultiple: filterItem.isMultiple,
        filterRef: filterItem.filterRef,
        resetValue: filterItem.resetValue,
        noTranslate: filterItem?.noTranslate,
        stepColumnName: filterItem?.stepColumnName,
        key: this.getKey(filterItem),
      };
      this.filterBreadcrumb(newFilterEntry, formattedBreadcrumbInput);
    }
    return formattedBreadcrumbInput;
  }
}
