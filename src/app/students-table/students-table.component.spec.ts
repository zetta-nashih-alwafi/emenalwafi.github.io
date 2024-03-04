import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';

import { StudentsTableComponent } from './students-table.component';

xdescribe('StudentsTableComponent', () => {
  let component: StudentsTableComponent;
  let fixture: ComponentFixture<StudentsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudentsTableComponent],
      imports: [
        MatCommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [{ provide: PageTitleService, useValue: {} }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsTableComponent);
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

  it('should set the page title [EN] Students [FR] Apprenant', () => {
    const service = TestBed.get(PageTitleService);
    const translate = TestBed.get(TranslateService);
    const spy = spyOn(service, 'setTitle');
    spyOn(translate, 'instant').and.returnValue('Students');
    component.setTitle();
    expect(spy).toHaveBeenCalledWith('Students');
  });

  it('should set the page icon using `student` icon', () => {
    const icon = 'school';
    const service = TestBed.get(PageTitleService);
    const spy = spyOn(service, 'setIcon');
    component.setTitle();
    expect(spy).toHaveBeenCalledWith(icon);
  });
});
