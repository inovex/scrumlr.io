// the theme that's stored in the state and local storage
export type Theme = "auto" | "light" | "dark";

// the theme that's automatically set as an attribute and used by stylesheets.
// if the initial theme is auto, this will be set to either light or dark depending on the system setting
export type AutoTheme = Omit<Theme, "auto">;

export interface View {
  readonly moderating: boolean;

  /**
   * The offset between the client and the server time in milliseconds.
   * A negative number means the server time is ahead.
   */
  readonly serverTimeOffset: number;

  readonly anonymousLoginDisabled: boolean;

  readonly enabledAuthProvider: string[];

  readonly feedbackEnabled: boolean;

  readonly language?: string;

  readonly theme: Theme;

  readonly route?: string;

  readonly noteFocused: boolean;

  readonly hotkeysAreActive: boolean;

  readonly hotkeyNotificationsEnabled: boolean;

  readonly showBoardReactions: boolean;

  readonly legacyCreateBoard?: boolean;
}

export type ViewState = View;
