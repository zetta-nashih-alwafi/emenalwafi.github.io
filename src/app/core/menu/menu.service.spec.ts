import { TestBed } from '@angular/core/testing';

import { MenuService } from './menu.service';
import { TMenu } from './menu.declaration';
import { SubSink } from 'subsink';
import { skip } from 'rxjs/operators';

describe('MenuService', () => {
  const subs = new SubSink();

  beforeEach(() => {
    subs.unsubscribe();
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(MenuService);
    expect(service).toBeTruthy();
  });

  it('should be able to move an available menu to favorite menu', () => {
    const mockAvailableMenu: TMenu[] = [
      {
        icon: 'mock-icon',
        iconType: 'mat',
        id: 'mock-menu',
        localizationKey: 'Mock Menu',
        path: 'mock-menu',
        permission: 'mock-menu-permission',
        favorable: true,
      },
      {
        icon: 'another-mock-icon',
        iconType: 'mat',
        id: 'another-mock-menu',
        localizationKey: 'Another Mock Menu',
        path: 'another-mock-menu',
        permission: 'another-mock-menu-permission',
        favorable: true,
      },
    ];

    jest.doMock('./menu.declaration', () => ({
      menus: mockAvailableMenu,
    }));

    const service = TestBed.inject(MenuService);

    subs.sink = service.favoriteMenu$.subscribe((menu) => {
      expect(menu).toEqual([
        {
          icon: 'another-mock-icon',
          iconType: 'mat',
          id: 'another-mock-menu',
          localizationKey: 'Another Mock Menu',
          path: 'another-mock-menu',
          permission: 'another-mock-menu-permission',
          favorable: true,
        },
      ]);
    });

    service.markMenuAsFavorite('another-mock-menu');
  });

  it('should be able to move a favorited menu to the available menu', () => {
    const mockAvailableMenu: TMenu[] = [
      {
        icon: 'mock-icon',
        iconType: 'mat',
        id: 'mock-menu',
        localizationKey: 'Mock Menu',
        path: 'mock-menu',
        permission: 'mock-menu-permission',
        favorable: true,
      },
      {
        icon: 'another-mock-icon',
        iconType: 'mat',
        id: 'another-mock-menu',
        localizationKey: 'Another Mock Menu',
        path: 'another-mock-menu',
        permission: 'another-mock-menu-permission',
        favorable: true,
      },
    ];

    jest.doMock('./menu.declaration', () => ({
      menus: mockAvailableMenu,
    }));

    const service = TestBed.inject(MenuService);

    subs.sink = service.availableMenu$.pipe(skip(2)).subscribe((menu) => {
      expect(menu).toEqual(mockAvailableMenu);
    });

    service.markMenuAsFavorite('another-mock-menu');
    service.markMenuAsFavorite('mock-menu');
    service.markMenuAsNotFavorite('another-mock-menu');
  });
});
