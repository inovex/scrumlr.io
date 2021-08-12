/** The representation of a note on the client. */
export interface CookieClientModel {
  /** The cookie name: i.e. "scrumlr_cookieConsent". */
  name: string | null;
  /** The cookie value which tells if cookies are allowed. */
  value: boolean | null;
}
