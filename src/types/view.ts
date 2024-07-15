export type Theme = "auto" | "light" | "dark";

export interface View {
  readonly moderating: boolean;

  /**
   * The offset between the client and the server time in milliseconds.
   * A negative number means the server time is ahead.
   */
  readonly serverTimeOffset: number;

  readonly enabledAuthProvider: string[];

  readonly feedbackEnabled: boolean;

  readonly language?: string;

  readonly theme: Theme;

  readonly route?: string;

  readonly noteFocused: boolean;

  readonly hotkeysAreActive: boolean;

  readonly hotkeyNotificationsEnabled: boolean;

  readonly showBoardReactions: boolean;
}

export type ViewState = View;
