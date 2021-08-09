import Parse from "parse";

/** The representation of a note on the server. */
export interface CookieServerModel extends Parse.Object {
  name: string;
  value: boolean;
}

/** The representation of a note on the client. */
export interface CookieClientModel {
  /** The cookie name: i.e. "scrumlr_cookieConsent". */
  name: string;
  /** The cookie value which tells if cookies are allowed. */
  value: boolean;
}

export const mapCookieServerModel = (cookie: CookieServerModel): CookieClientModel => ({
  name: cookie.get("cookieName"),
  value: cookie.get("value"),
});
