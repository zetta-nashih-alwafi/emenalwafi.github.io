export type THomePageWidget = THomePageWidgetBase & {
  icon: string;
  iconType: 'svg' | 'mat';
  img: string;
};

export type THomePageBackgroundColour = {
  primary: string
  secondary: string
  tertiary: string
}

export type THomePageBackgroundOption = THomePageBackgroundColour & {
  name: string;
};

export type THomePageConfig = {
  _id: string;
  user_id: {
    _id: string;
  };
  homepage_widgets: THomePageWidgetBase[];
  favorite_menus: string[];
  background_colour: THomePageBackgroundColour;
  status: 'active' | 'deleted';
};

export type THomePageConfigInput = Partial<{
  user_id: string;
  homepage_widgets: THomePageWidgetBase[];
  favorite_menus: TAvailableFavoriteMenu[];
  background_colour: THomePageBackgroundColour;
}>;

type THomePageWidgetBase = {
  widget_name: 'pending_task' | 'email' | 'overdue_task' | 'news';
  size: 'half' | 'full';
};

export type TUpdateHomePageConfigurationParams = {
  _id: string;
  input: THomePageConfigInput;
};

export type TAvailableFavoriteMenu =
  | 'home'
  | 'candidate'
  | 'readmission'
  | 'students'
  | 'finance'
  | 'teacher_management'
  | 'alumni'
  | 'companies'
  | 'form_follow_up'
  | 'tasks'
  | 'mailbox'
  | 'history'
  | 'courses_sequences'
  | 'users'
  | 'intake_channel'
  | 'setting'
  | 'tutorials'
  | 'inapp_tutorials'
  | 'process'
  | 'internship'
  | 'news'
  ;
