import { THomePageWidget } from 'app/homepage/homepage.declaration';

export type TUserHomePageConfig = {
  homepage_widgets: THomePageWidget[];
  favorite_menus: string[];
  background_colour: string; // hex code
};
