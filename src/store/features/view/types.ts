// the theme that's stored in the state and local storage
export type Theme = "auto" | "light" | "dark";

// the theme that's automatically set as an attribute and used by stylesheets.
// if the initial theme is auto, this will be set to either light or dark depending on the system setting
export type AutoTheme = Omit<Theme, "auto">;

export type ServerInfo = {
  anonymousLoginDisabled: boolean;
  enabledAuthProvider: string[];
  serverTime: number;
  feedbackEnabled: boolean;
};

export interface View {
  moderating: boolean;

  /**
   * The offset between the client and the server time in milliseconds.
   * A negative number means the server time is ahead.
   */
  serverTimeOffset: number;

  anonymousLoginDisabled: boolean;

  enabledAuthProvider: string[];

  feedbackEnabled: boolean;

  language?: string;

  theme: Theme;

  route?: string;

  noteFocused: boolean;

  hotkeysAreActive: boolean;

  hotkeyNotificationsEnabled: boolean;

  showBoardReactions: boolean;

  readonly legacyCreateBoard?: boolean;

  snowfallEnabled: boolean;

  snowfallNotificationEnabled: boolean;
}

export type ViewState = View;
