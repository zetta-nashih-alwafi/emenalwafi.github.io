import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatCommonModule,
  MatDialogModule,
  MatIconModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatTooltipModule,
  Sort,
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { NgxPermissionsModule } from 'ngx-permissions';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { SpecialityComponent } from './speciality.component';

describe('SpecialityComponent', () => {
  let component: SpecialityComponent;
  let fixture: ComponentFixture<SpecialityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpecialityComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have #getSpecialityDropdown to get the speciality dropdown', () => {
    const service = TestBed.get(IntakeChannelService);
    const mockResponse = [{ name: 'random-name' }, { name: 'random-name' }];

    spyOn(service, 'GetAllSpecializationsByScholar').and.returnValue(of(mockResponse));

    component.getSpecialityDropdown();

    expect(component.speciality).toEqual(['random-name']);
  });

  it('should have #getSpecialityDropdown to handle error response', () => {
    const service = TestBed.get(IntakeChannelService);
    const mockError = { message: 'hello from testing' };

    spyOn(Swal, 'fire');
    spyOn(service, 'GetAllSpecializationsByScholar').and.returnValue(throwError(mockError));

    component.getSpecialityDropdown();

    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        text: 'hello from testing',
      }),
    );
  });

  it('should have #getSpecialityData to get the speciality data', () => {
    const service = TestBed.get(IntakeChannelService);
    const mockResponse = [{ mock: 'response' }];

    spyOn(service, 'GetAllSpecializations').and.returnValue(of(mockResponse));

    component.scholarSeasonId = 'random-scholar-id';
    component.getSpecialityData();

    expect(component.dataSource.data).toEqual(mockResponse);
  });

  it('should have #getSpecialityData to handle error response', () => {
    const service = TestBed.get(IntakeChannelService);
    const mockError = { message: 'hello from testing' };

    spyOn(Swal, 'fire');
    spyOn(service, 'GetAllSpecializations').and.returnValue(throwError(mockError));

    component.scholarSeasonId = 'random-scholar-id';
    component.getSpecialityData();

    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        text: 'hello from testing',
      }),
    );
  });

  it('should have #sortData to set the correct value for sorting', () => {
    const sort: Sort = { active: 'random-active-thing', direction: 'asc' };
    const expected = { 'random-active-thing': 'asc' };
    component.sortData(sort);
    expect(component.sortValue).toEqual(expected);
  });

  it('should have #sortData to set the paginator page index to 0 when dataLoaded is truthy', () => {
    const sort: Sort = { active: 'random-active-thing', direction: 'asc' };
    component.dataLoaded = true;
    component.sortData(sort);
    expect(component.paginator.pageIndex).toBe(0);
  });

  it('should have #sortData to get the speciality data when dataLoaded is truthy and isReset is falsy', () => {
    const sort: Sort = { active: 'random-active-thing', direction: 'asc' };
    spyOn(component, 'getSpecialityData');
    component.dataLoaded = true;
    component.isReset = false;
    component.sortData(sort);
    expect(component.getSpecialityData).toHaveBeenCalled();
  });

  it('should have #checkboxLabel to return `select all` when there are unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(false);
    const result = component.checkboxLabel();
    expect(result).toBe('select all');
  });

  it('should have #checkboxLabel to return `deselect all` when there are no unselected item', () => {
    spyOn(component, 'isAllSelected').and.returnValue(true);
    const result = component.checkboxLabel();
    expect(result).toBe('deselect all');
  });

  it('should have #checkboxLabel to return `select row 1` when passed unselected row', () => {
    const row = { position: 0 };
    spyOn(component.selection, 'isSelected').and.returnValue(false);
    const result = component.checkboxLabel(row);
    expect(result).toBe('select row 1');
  });

  it('should have #checkboxLabel to return `deselect row 1` when passed selected row', () => {
    const row = { position: 0 };
    spyOn(component.selection, 'isSelected').and.returnValue(true);
    const result = component.checkboxLabel(row);
    expect(result).toBe('deselect row 1');
  });

  it('should have #isAllSelected to return `false` when there are unselected item left', () => {
    component.selection.select(['random-selection']);
    component.dataSource.data = [{ randomKey: 'random-data' }, { randomKey: 'random-data-but-with-longer-string' }];
    const result = component.isAllSelected();
    expect(result).toBe(false);
  });

  it('should have #isAllSelected to return `true` when there are no unselected item left', () => {
    component.selection.select(['random-selection']);
    component.dataSource.data = [{ randomKey: 'random-data' }];
    const result = component.isAllSelected();
    expect(result).toBe(true);
  });

  it('should have #isAllSelected to return `true` when the selection length is more than the data length', () => {
    component.selection.select(['random-selection', 'random-selection-but-with-longer-name']);
    component.dataSource.data = [{ randomKey: 'random-data' }];
    const result = component.isAllSelected();
    expect(result).toBe(true);
  });

  it('should have #masterToggle to clear the selection when there are no unselected item left', () => {
    spyOn(component.selection, 'clear');
    spyOn(component, 'isAllSelected').and.returnValue(true);
    component.masterToggle();
    expect(component.selection.clear).toHaveBeenCalled();
  });

  it('should have #masterToggle to set dataSelected to an empty array when there are no unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(true);
    component.masterToggle();
    expect(component.dataSelected.length).toBeFalsy();
  });

  it('should have #masterToggle to set pageSelected to an empty array when there are no unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(true);
    component.masterToggle();
    expect(component.pageSelected.length).toBeFalsy();
  });

  it('should have #masterToggle to set isCheckedAll to `false` when there are no unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(true);
    component.masterToggle();
    expect(component.isCheckedAll).toBe(false);
  });

  it('should have #masterToggle to select any of the item left when there are unselected item left', () => {
    spyOn(component, 'getDataAllForCheckbox');
    spyOn(component, 'isAllSelected').and.returnValue(false);
    component.masterToggle();
    expect(component.getDataAllForCheckbox).toHaveBeenCalledWith(0);
  });

  it('should have #masterToggle to set dataSelected to an empty array when there are unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(false);
    component.masterToggle();
    expect(component.dataSelected.length).toBeFalsy();
  });

  it('should have #masterToggle to set allStudentForCheckbox to an empty array when there are unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(false);
    component.masterToggle();
    expect(component.allStudentForCheckbox.length).toBeFalsy();
  });

  it('should have #masterToggle to set isCheckedAll to `true` when there are unselected item left', () => {
    spyOn(component, 'isAllSelected').and.returnValue(false);
    component.masterToggle();
    expect(component.isCheckedAll).toBe(true);
  });

  it('should have #getDataAllForCheckbox to call GetAllSpecializations with correct arguments', () => {
    const service = TestBed.get(IntakeChannelService);
    const filter = {
      name: 'random-name',
      description: 'random-description',
      intake_channel: 'random-intake-channel',
      programs: 'random-programs',
      scholar_season_id: 'random-scholar-season-id',
    };
    spyOn(service, 'GetAllSpecializations').and.returnValue(of([]));
    component.sortValue = { 'random-key': 'asc' };
    component.filteredValues = filter;
    component.getDataAllForCheckbox(0);
    expect(service.GetAllSpecializations).toHaveBeenCalledWith({ limit: 300, page: 0 }, { 'random-key': 'asc' }, filter);
  });

  it('should have #getDataAllForCheckbox to set allStudentForCheckbox with the response', () => {
    let i = 0;
    const service = TestBed.get(IntakeChannelService);
    const mockResponse = [{ 'random-key': 'random-value' }];
    const filter = {
      name: 'random-name',
      description: 'random-description',
      intake_channel: 'random-intake-channel',
      programs: 'random-programs',
      scholar_season_id: 'random-scholar-season-id',
    };
    spyOn(component, 'getDataAllForCheckbox').and.callThrough();
    spyOn(service, 'GetAllSpecializations').and.callFake(() => {
      i++;
      return i < 2 ? of(mockResponse) : of([]);
    });
    component.sortValue = { 'random-key': 'asc' };
    component.filteredValues = filter;
    component.getDataAllForCheckbox(0);
    expect(component.allStudentForCheckbox).toEqual(mockResponse);
  });

  it('should have #getDataAllForCheckbox to call itself when the response array has length', () => {
    let i = 0;
    const service = TestBed.get(IntakeChannelService);
    const mockResponse = [{ 'random-key': 'random-value' }];
    const filter = {
      name: 'random-name',
      description: 'random-description',
      intake_channel: 'random-intake-channel',
      programs: 'random-programs',
      scholar_season_id: 'random-scholar-season-id',
    };
    spyOn(service, 'GetAllSpecializations').and.callFake(() => {
      i++;
      return i < 2 ? of(mockResponse) : of([]);
    });
    spyOn(component, 'getDataAllForCheckbox').and.callThrough();
    component.sortValue = { 'random-key': 'asc' };
    component.filteredValues = filter;
    component.getDataAllForCheckbox(0);
    expect(component.getDataAllForCheckbox).toHaveBeenCalledWith(1);
  });

  it('should have #getDataAllForCheckbox to populate the selection when the response has no length already', () => {
    let i = 0;
    const service = TestBed.get(IntakeChannelService);
    const mockResponse = [{ _id: 'random-id' }];
    const filter = {
      name: 'random-name',
      description: 'random-description',
      intake_channel: 'random-intake-channel',
      programs: 'random-programs',
      scholar_season_id: 'random-scholar-season-id',
    };
    spyOn(service, 'GetAllSpecializations').and.callFake(() => {
      i++;
      return i < 2 ? of(mockResponse) : of([]);
    });
    spyOn(component, 'getDataAllForCheckbox').and.callThrough();
    component.sortValue = { 'random-key': 'asc' };
    component.filteredValues = filter;
    component.isCheckedAll = true;
    component.getDataAllForCheckbox(0);
    expect(component.selection.selected).toEqual(['random-id']);
  });
});
