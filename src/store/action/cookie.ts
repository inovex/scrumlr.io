import {CookieClientModel} from "types/cookie";

/** This object lists cookie object specific internal Redux Action types. */
export const CookieActionType = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  AddCookie: "@@SCRUMLR/addCookie" as const,
  InitializeCookies: "@@SCRUMLR/initializeCookies" as const,
};

/** Factory or creator class of internal Redux note object specific actions. */
export const CookieActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `CookieReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */
  /**
   * Creates an action which should be dispatched when the user reacts to the cookie notice.
   *
   * @param cookieName the cookie name
   * @param cookieValue the value depending on given consent
   */
  addCookie: (cookieName: string, cookieValue: boolean) => ({
    type: CookieActionType.AddCookie,
    cookieName,
    cookieValue,
  }),
  /**
   * Creates an action which should be dispatched when the site is loaded for the first time.
   *
   * @param cookie the cookie values upon initialization.
   */
  initializeCookies: (cookie: CookieClientModel) => ({
    type: CookieActionType.InitializeCookies,
    cookie,
  }),
};

export type CookieReduxAction = ReturnType<typeof CookieActionFactory.addCookie> | ReturnType<typeof CookieActionFactory.initializeCookies>;
