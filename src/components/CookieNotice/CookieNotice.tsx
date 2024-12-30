import "./CookieNotice.scss";
import {useState} from "react";
import {Portal} from "components/Portal";
import {useTranslation} from "react-i18next";
import {COOKIE_CONSENT_STORAGE_KEY} from "constants/storage";
import {getFromStorage, saveToStorage} from "utils/storage";
import {CookiePolicy} from "./CookiePolicy";

declare global {
  interface Window {
    clarity: (consent: string) => void;
  }
}

export const CookieNotice = () => {
  const {t} = useTranslation();

  const [showCookieNotice, setShowCookieNotice] = useState<boolean>(true);
  const [showCookiePolicy, setShowCookiePolicy] = useState<boolean>(false);
  const toggleShowCookiePolicy = () => {
    setShowCookiePolicy((currValue) => !currValue);
  };

  // show cookie notice if there's no cookie in local storage
  const cookieConsentValue = getFromStorage(COOKIE_CONSENT_STORAGE_KEY);

  if (cookieConsentValue === "true" && Object.hasOwn(window, "clarity")) {
    window.clarity("consent");
  }

  // prevents cookie notice from being shown if scrumlrCookieName is set in localStorage
  if (cookieConsentValue != null || !showCookieNotice) return null;

  /**
   * Sets cookie consent value i.e. scrumlrCookieName true.
   */
  const accept = () => {
    if (cookieConsentValue == null) {
      saveToStorage(COOKIE_CONSENT_STORAGE_KEY, "true");
      setShowCookieNotice(false);
    }
  };

  /**
   * Sets cookie consent value i.e. scrumlrCookieName false.
   */
  const decline = () => {
    if (cookieConsentValue == null) {
      saveToStorage(COOKIE_CONSENT_STORAGE_KEY, "false");
      setShowCookieNotice(false);
    }
  };

  const openPolicy = () => {
    setShowCookiePolicy(true);
  };

  return (
    <Portal
      onClose={() => {
        setShowCookieNotice(false);
        accept();
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="cookie-notice" onClick={(e) => e.stopPropagation()}>
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
        <CookiePolicy accept={accept} decline={decline} onClose={toggleShowCookiePolicy} show={showCookiePolicy} />
      </div>
    </Portal>
  );
};
