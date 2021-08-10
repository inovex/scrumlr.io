import "./CookieNotice.scss";
import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import store from "store";
import {useSelector} from "react-redux";
import CookiePolicy from "./CookiePolicy";
import {CookieActionFactory} from "../../store/action/cookie";
import {ApplicationState} from "../../types/store";

/**
 * Converts string value to boolean value.
 * @param input string that needs conversion to boolean value.
 */
const stringToBoolean = (input: string): boolean => {
  switch (input.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return false;
  }
};

const CookieNotice = () => {
  /** cookie name */
  const scrumlrCookieName = "scrumlr_cookieConsent";

  const cookieState = useSelector((applicationState: ApplicationState) => ({
    cookieConsent: applicationState.cookieConsent,
  }));

  if (localStorage.getItem(scrumlrCookieName)) {
    cookieState.cookieConsent.name = scrumlrCookieName;
    cookieState.cookieConsent.value = stringToBoolean(localStorage[scrumlrCookieName]);
  }

  const [showCookieNotice, setShowCookieNotice] = React.useState(true); // state: states whether cookie notice is shown.
  const [open, setOpen] = React.useState(true); // state: states whether backdrop is open.

  const shouldShowCookieNotice = () => !localStorage.getItem(scrumlrCookieName); // function: checks if scrumlrCookieName is present in localStorage.
  // If not, shouldShowCookieNotice becomes true.
  /**
   * Saves cookie consent to storage.
   * @param value: true or false, depending on given consent for cookies
   * @param key: scrumlrCookieName, i.e. scrumlr_consent
   */
  const saveToStorage = (key: string, value: string) => {
    localStorage.setItem(key, value);
    document.cookie = `${key}=${value};`;
  };

  /**
   * Sets cookie consent value i.e. scrumlrCookieName true.
   */
  const acceptFunction = () => {
    if (shouldShowCookieNotice()) {
      saveToStorage(scrumlrCookieName, "true");
      setShowCookieNotice(!showCookieNotice);
      store.dispatch(CookieActionFactory.addCookie(scrumlrCookieName, true));
    }
  };

  /**
   * Sets cookie consent value i.e. scrumlrCookieName false.
   */
  const declineFunction = () => {
    if (shouldShowCookieNotice()) {
      saveToStorage(scrumlrCookieName, "false");
      setShowCookieNotice(!showCookieNotice);
      store.dispatch(CookieActionFactory.addCookie(scrumlrCookieName, false));
    }
  };

  if (!shouldShowCookieNotice()) return null; // prevents cookie notice being shown if scrumlrCookieName is set.

  // cookie notice rendering
  return (
    <div className={showCookieNotice ? "cookie-notice--show" : "cookie-notice--hidden"}>
      <Backdrop
        className="cookie-notice__backdrop"
        invisible
        open={open}
        onClick={() => {
          setOpen(false);
          acceptFunction();
        }}
      />

      <div className="cookie-notice__header">
        <h3>Cookies</h3>
      </div>

      <div className="cookie-notice__body">
        <p>
          We and selected partners use cookies or similar technologies as specified in the cookie policy. You can consent to the use of such technologies by closing this notice, by
          interacting with any link or button outside of this notice or by continuing to browse otherwise.
        </p>
      </div>
      <div className="cookie-notice__buttons">
        <button className="cookie-notice__button-accept" type="button" color="primary" onClick={acceptFunction}>
          Accept
        </button>

        <button className="cookie-notice__button-decline" type="button" onClick={declineFunction}>
          Decline
        </button>

        <CookiePolicy scrumlrCookieName={scrumlrCookieName} acceptFunction={acceptFunction} />
      </div>
    </div>
  );
};

export default CookieNotice;
