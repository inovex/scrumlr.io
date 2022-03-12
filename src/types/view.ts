export interface View {
  readonly moderating: boolean;

  /**
   * The offset between the client and the server time in milliseconds.
   * A negative number means the server time is ahead.
   */
  readonly serverTimeOffset: number;

  readonly enabledAuthProvider: string[];

  readonly language?: string;
}

export type ViewState = View;
