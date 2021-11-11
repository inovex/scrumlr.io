import "./CookiePolicy.scss";
import {Portal} from "components/Portal";
import {marked} from "marked";
import {useTranslation} from "react-i18next";

interface CookiePolicyProps {
  decline: () => void;
  accept: () => void;
  onClose: () => void;
  show: boolean;
  darkBackground: boolean;
}

export const CookiePolicy = ({decline, accept, onClose, show, darkBackground}: CookiePolicyProps) => {
  const {t} = useTranslation();

  if (!show) {
    return null;
  }

  const body = marked.parse(t("CookiePolicy.body"));

  return (
    <Portal onClose={onClose} darkBackground={darkBackground}>
      <div className="cookie-policy">
        <div className="cookie-policy__title">
          <h1>{t("CookiePolicy.title")}</h1>
        </div>
        <div className="cookie-policy__body" dangerouslySetInnerHTML={{__html: body}} />
        <div className="cookie-policy__footer">
          <button className="cookie-policy__button-decline" type="button" onClick={decline}>
            {t("CookiePolicy.decline")}
          </button>
          <button className="cookie-policy__button-accept" type="button" onClick={accept}>
            {t("CookiePolicy.accept")}
          </button>
        </div>
      </div>
    </Portal>
  );
};
