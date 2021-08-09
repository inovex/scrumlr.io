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
const stringToBoolean = (input: string) => {
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
      return Boolean(input);
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

  const shouldShowCookieConsent = () => !localStorage.getItem(scrumlrCookieName); // function: checks if scrumlrCookieName is present in localStorage.
  // If not, shouldShowCookieConsent becomes true.
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
    if (shouldShowCookieConsent()) {
      saveToStorage(scrumlrCookieName, "true");
      setShowCookieNotice(!showCookieNotice);
      store.dispatch(CookieActionFactory.addCookie(scrumlrCookieName, true));
    }
  };

  /**
   * Sets cookie consent value i.e. scrumlrCookieName false.
   */
  const declineFunction = () => {
    if (shouldShowCookieConsent()) {
      saveToStorage(scrumlrCookieName, "false");
      setShowCookieNotice(!showCookieNotice);
      store.dispatch(CookieActionFactory.addCookie(scrumlrCookieName, false));
    }
  };

  if (!shouldShowCookieConsent()) return null; // prevents cookie notice being shown if scrumlrCookieName is set.

  // cookie notice rendering
  return (
    <div className={showCookieNotice ? "cookie-consent--show" : "cookie-consent--hidden"}>
      <Backdrop
        className="cookie-consent__backdrop"
        invisible
        open={open}
        onClick={() => {
          setOpen(false);
          acceptFunction();
        }}
      />

      <div className="cookie-consent__heading">
        <h3>Cookies</h3>
      </div>

      <div className="cookie-consent__body">
        <p>
          We and selected partners use cookies or similar technologies as specified in the cookie policy. You can consent to the use of such technologies by closing this notice, by
          scrolling this page, by interacting with any link or button outside of this notice or by continuing to browse otherwise.
        </p>
      </div>
      <div className="cookie-consent__buttons">
        <button className="cookie-consent__consent-button-accept" type="button" color="primary" onClick={acceptFunction}>
          Accept
        </button>

        <button className="cookie-consent__consent-button-decline" type="button" onClick={declineFunction}>
          Decline
        </button>

        <CookiePolicy scrumlrCookieName={scrumlrCookieName} acceptFunction={acceptFunction} />
      </div>
    </div>
  );
};

export default CookieNotice;
