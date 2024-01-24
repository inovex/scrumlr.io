import {useTranslation} from "react-i18next";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {ReactComponent as StanLight} from "assets/stan/Stan_Toilette_Light.svg";
import {ReactComponent as StanDark} from "assets/stan/Stan_Toilette_Dark.svg";
import {ReactComponent as BackgroundFreeFormLight} from "assets/pages/404/404_Background_light.svg";
import {ReactComponent as BackgroundFreeFormDark} from "assets/pages/404/404_Background_dark.svg";
import {ReactComponent as BackgroundDetails} from "assets/pages/404/Details.svg";
import "./RejectionPage.scss";

export const RejectionPage = () => {
  const {t} = useTranslation();
  return (
    <div className="rejection-page__root">
      <div className="rejection-page__background">
        <BackgroundFreeFormLight className="rejection-page__background-form rejection-page__background-form--light" />
        <BackgroundFreeFormDark className="rejection-page__background-form rejection-page__background-form--dark" />
        <BackgroundDetails className="rejection-page__background-details" />
      </div>
      <header className="rejection-page__header">
        <div className="rejection-page__logo-container">
          <ScrumlrLogo
            className="rejection-page__scrumlr-logo"
            accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]}
          />
        </div>
      </header>
      <main className="rejection-page__main">
        <div className="rejection-page__content">
          <div className="rejection-page__title">{t("RejectionPage.title")}</div>
          <div className="rejection-page__description">{t("RejectionPage.description")}</div>
          <button className="rejection-page__return-button" onClick={() => (window.location.pathname = "/")}>
            {t("RejectionPage.button")}
          </button>
        </div>
        <div className="rejection-page__image-wrapper">
          <StanLight className="rejection-page__logo-stan rejection-page__logo-stan--light" />
          <StanDark className="rejection-page__logo-stan rejection-page__logo-stan--dark" />
        </div>
      </main>
    </div>
  );
};
