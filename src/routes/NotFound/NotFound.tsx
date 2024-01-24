import "./NotFound.scss";
import {ReactComponent as StanWebLight} from "assets/stan/Stan_404_Web_Light.svg";
import {ReactComponent as StanWebDark} from "assets/stan/Stan_404_Web_Dark.svg";

import {ReactComponent as StanMobileLight} from "assets/stan/Stan_404_Mobile_Light.svg";
import {ReactComponent as StanMobileDark} from "assets/stan/Stan_404_Mobile_Dark.svg";

import {ReactComponent as BackgroundFreeFormLight} from "assets/pages/404/404_Background_light.svg";
import {ReactComponent as BackgroundFreeFormDark} from "assets/pages/404/404_Background_dark.svg";
import {ReactComponent as BackgroundDetails} from "assets/pages/404/Details.svg";

import {useTranslation} from "react-i18next";
import {ScrumlrLogo} from "../../components/ScrumlrLogo";

export const NotFound = () => {
  const {t} = useTranslation();
  return (
    <div className="not-found__root">
      <div className="not-found__background">
        <BackgroundFreeFormLight className="not-found__background-form not-found__background-form--light" />
        <BackgroundFreeFormDark className="not-found__background-form not-found__background-form--dark" />
        <BackgroundDetails className="not-found__background-details" />
      </div>
      <header className="not-found__header">
        <div className="not-found__logo-container">
          <ScrumlrLogo className="not-found__scrumlr-logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
        </div>
      </header>
      <main className="not-found__main">
        <div className="not-found__content">
          <div className="not-found__title">{t("NotFoundPage.title")}</div>
          <div className="not-found__description">
            <div>{t("NotFoundPage.descriptionLine1")}</div>
            <div>{t("NotFoundPage.descriptionLine2")}</div>
          </div>
          <button
            className="not-found__return-button"
            onClick={() => {
              window.location.pathname = "/";
            }}
          >
            {t("NotFoundPage.navigateHome")}
          </button>
        </div>
        <div className="not-found__image-wrapper">
          <StanWebLight className="not-found__logo-stan not-found__logo-stan--web not-found__logo-stan--light" />
          <StanWebDark className="not-found__logo-stan not-found__logo-stan--web not-found__logo-stan--dark" />

          <StanMobileLight className="not-found__logo-stan not-found__logo-stan--mobile not-found__logo-stan--light" />
          <StanMobileDark className="not-found__logo-stan not-found__logo-stan--mobile not-found__logo-stan--dark" />
        </div>
      </main>
    </div>
  );
};
