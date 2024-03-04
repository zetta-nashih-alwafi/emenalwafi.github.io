import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileButtonMenuComponent } from './profile-button-menu.component';

describe('ProfileButtonMenuComponent', () => {
  let component: ProfileButtonMenuComponent;
  let fixture: ComponentFixture<ProfileButtonMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ProfileButtonMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileButtonMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
