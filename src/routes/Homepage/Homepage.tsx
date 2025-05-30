import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./Homepage.scss";
import {Trans, useTranslation, withTranslation} from "react-i18next";
import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {ArrowRight, Logout} from "components/Icon";
import {Link, useHref} from "react-router";
import {AppInfo} from "components/AppInfo";
import {HeroIllustration} from "components/HeroIllustration";
import {LegacyButton} from "components/Button";
import {useAppDispatch, useAppSelector} from "store";
import {Toast} from "utils/Toast";
import {useEffect} from "react";
import {signOut} from "store/features";
import {InovexAnchor} from "./InovexAnchor";
import {SHOW_LEGAL_DOCUMENTS} from "../../config";

export const Homepage = withTranslation()(() => {
  const {i18n} = useTranslation();
  const newHref = useHref("/new");
  const {user} = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const currentYear = new Date().getFullYear();

  const changeLanguage = (language: string) => () => {
    i18n.changeLanguage(language).then(() => {
      document.documentElement.lang = i18n.language;
    });
  };

  const onLogout = () => {
    dispatch(signOut());
  };

  useEffect(() => {
    const boardDeleted = new URLSearchParams(window.location.search).get("boardDeleted");

    if (boardDeleted) {
      Toast.info({
        title: i18n.t("Error.boardDeleted"),
      });
    }
  }, [i18n]);

  return (
    <div className="homepage">
      <div className="homepage__hero">
        <header className="homepage__header">
          <ScrumlrLogo className="homepage__logo" />

          <ul className="homepage__settings">
            <li>
              <LegacyButton leftIcon={<German />} className="homepage__language" hideLabel onClick={changeLanguage("de")}>
                Deutsch
              </LegacyButton>
            </li>
            <li>
              <LegacyButton leftIcon={<English />} className="homepage__language" hideLabel onClick={changeLanguage("en")}>
                English
              </LegacyButton>
            </li>

            {!!user && (
              <li>
                <LegacyButton variant="text-link" onClick={onLogout} leftIcon={<Logout className="homepage__logout-button-icon" />} className="homepage__logout-button">
                  Logout
                </LegacyButton>
              </li>
            )}
          </ul>
        </header>

        <div className="homepage__hero-content-wrapper">
          <div className="homepage__hero-content">
            <main className="homepage__main">
              <h1 className="homepage__hero-title">
                <Trans
                  i18nKey="Homepage.teaserTitle"
                  components={{team: <span className="homepage__hero-title-team" />, retrospective: <span className="homepage__hero-title-retrospective" />}}
                />
              </h1>
              <p className="homepage__hero-text">
                <Trans i18nKey="Homepage.teaserText" />
              </p>

              <LegacyButton href={newHref} color="primary" className="homepage__start-button" rightIcon={<ArrowRight className="homepage__proceed-icon" />}>
                <Trans i18nKey="Homepage.startButton" />
              </LegacyButton>
            </main>

            <HeroIllustration className="homepage__illustration" />
          </div>
        </div>
      </div>

      <footer className="homepage__footer">
        <AppInfo className="homepage__app-info" />

        <div className="homepage__footer-developers">
          <span>
            <Trans
              i18nKey="Homepage.developers"
              components={{
                inovex: <InovexAnchor />,
              }}
              values={{currentYear}}
            />
          </span>
        </div>

        {SHOW_LEGAL_DOCUMENTS && (
          <ul className="homepage__footer-links">
            <li className="homepage__footer-link">
              <Link to="/legal/privacyPolicy" target="_blank">
                <Trans i18nKey="Homepage.privacyPolicy" />
              </Link>
            </li>
            <li className="homepage__footer-link">
              <Link to="/legal/cookiePolicy" target="_blank">
                <Trans i18nKey="Homepage.cookiePolicy" />
              </Link>
            </li>
            <li className="homepage__footer-link">
              <Link to="/legal/termsAndConditions" target="_blank">
                <Trans i18nKey="Homepage.terms" />
              </Link>
            </li>
          </ul>
        )}
      </footer>
    </div>
  );
});
