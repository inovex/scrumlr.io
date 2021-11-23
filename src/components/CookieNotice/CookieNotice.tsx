import "./CookieNotice.scss";
import React from "react";
import {Portal} from "components/Portal";
import {useTranslation} from "react-i18next";
import {CookiePolicy} from "./CookiePolicy";

const COOKIE_CONSENT_NAME = "scrumlr_cookieConsent";

export var CookieNotice = function() {
  const {t} = useTranslation();

  const [showCookieNotice, setShowCookieNotice] = React.useState<boolean>(true);
  const [showCookiePolicy, setShowCookiePolicy] = React.useState<boolean>(false);
  const toggleShowCookiePolicy = () => {
    setShowCookiePolicy((currValue) => !currValue);
  };

  // show cookie notice if there's no cookie in local storage
  const shouldShowCookieNotice = !localStorage.getItem(COOKIE_CONSENT_NAME);

  /**
   * Saves cookie consent to storage.
   * @param value: true or false, depending on given consent for cookies
   * @param key: scrumlrCookieName, i.e. scrumlr_consent
   */
  const saveToStorage = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  /**
   * Sets cookie consent value i.e. scrumlrCookieName true.
   */
  const accept = () => {
    if (shouldShowCookieNotice) {
      saveToStorage(COOKIE_CONSENT_NAME, "true");
      setShowCookieNotice(false);
    }
  };

  /**
   * Sets cookie consent value i.e. scrumlrCookieName false.
   */
  const decline = () => {
    if (shouldShowCookieNotice) {
      saveToStorage(COOKIE_CONSENT_NAME, "false");
      setShowCookieNotice(false);
    }
  };

  const openPolicy = () => {
    setShowCookiePolicy(true);
  };
  // prevents cookie notice from being shown if scrumlrCookieName is set in localStorage
  if (!shouldShowCookieNotice || !showCookieNotice) return null;

  return (
    <Portal
      onClose={() => {
        setShowCookieNotice(false);
        accept();
      }}
      darkBackground={false}
    >
      <div className="cookie-notice">
        <div className="cookie-notice__header">
          <h3>Cookies</h3>
        </div>

        <div className="cookie-notice__body">
          <p>{t("CookieNotice.description")}</p>
        </div>
        <div className="cookie-notice__buttons">
          <button className="cookie-notice__button-cookie-policy" type="button" onClick={openPolicy}>
            {t("CookieNotice.learnMore")}
          </button>

          <button className="cookie-notice__button-decline" type="button" onClick={decline}>
            {t("CookieNotice.decline")}
          </button>

          <button className="cookie-notice__button-accept" type="button" color="primary" onClick={accept}>
            {t("CookieNotice.accept")}
          </button>
        </div>
        <CookiePolicy accept={accept} decline={decline} onClose={toggleShowCookiePolicy} show={showCookiePolicy} darkBackground />
      </div>
    </Portal>
  );
}
