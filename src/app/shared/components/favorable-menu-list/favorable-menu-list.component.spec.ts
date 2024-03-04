import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorableMenuListComponent } from './favorable-menu-list.component';

describe('FavorableMenuListComponent', () => {
  let component: FavorableMenuListComponent;
  let fixture: ComponentFixture<FavorableMenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FavorableMenuListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavorableMenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
