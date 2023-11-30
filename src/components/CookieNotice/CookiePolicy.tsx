import "./CookiePolicy.scss";
import {Portal} from "components/Portal";
import {useTranslation} from "react-i18next";
import {marked} from "marked";

interface CookiePolicyProps {
  decline: () => void;
  accept: () => void;
  onClose: () => void;
  show: boolean;
}

export const CookiePolicy: React.VFC<CookiePolicyProps> = ({decline, accept, onClose, show}) => {
  const {t} = useTranslation();

  if (!show) {
    return null;
  }

  const body = marked.parse(t("CookiePolicy.body") as string, {async: false}) as string;

  return (
    <Portal onClose={onClose}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="cookie-policy" onClick={(e) => e.stopPropagation()}>
        <div className="cookie-policy__title">
          <h1>{t("CookiePolicy.title")}</h1>
        </div>
        <div
          className="cookie-policy__body"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{__html: body}}
        />
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
