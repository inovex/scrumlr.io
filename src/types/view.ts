export interface View {
  readonly moderating: boolean;

  /**
   * The offset between the client and the server time in milliseconds.
   * A negative number means the server time is ahead.
   *
   * FIXME: init server time
   */
  readonly serverTimeOffset: number;
}

export type ViewState = View;
