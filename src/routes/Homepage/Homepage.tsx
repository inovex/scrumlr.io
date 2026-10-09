import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./Homepage.scss";
import {Trans, useTranslation, withTranslation} from "react-i18next";
import German from "assets/flags/DE.svg?react";
import English from "assets/flags/US.svg?react";
import French from "assets/flags/FR.svg?react";
import {ArrowRightIcon, LogoutIcon} from "components/Icon";
import {Link, useNavigate} from "react-router";
import {AppInfo} from "components/AppInfo";
import {HeroIllustration} from "components/HeroIllustration";
import {useAppDispatch, useAppSelector} from "store";
import {Toast} from "utils/Toast";
import {useEffect} from "react";
import {setLanguage, signOut} from "store/features";
import {InovexAnchor} from "./InovexAnchor";
import {SHOW_LEGAL_DOCUMENTS} from "../../config";
import {Button} from "components/Button";

export const Homepage = withTranslation()(() => {
  const {i18n} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const currentYear = new Date().getFullYear();

  const changeLanguage = (language: string) => () => {
    dispatch(setLanguage(language));
  };

  const onLogout = () => {
    dispatch(signOut());
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const boardDeleted = searchParams.get("boardDeleted");

    if (boardDeleted) {
      Toast.info({
        title: i18n.t("Error.boardDeleted"),
      });

      queueMicrotask(() => {
        searchParams.delete("boardDeleted");
        const newSearch = searchParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, document.title, newUrl);
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
              <Button icon={<German />} iconPosition="left" className="homepage__language" hideLabel onClick={changeLanguage("de")}>
                Deutsch
              </Button>
            </li>
            <li>
              <Button icon={<English />} iconPosition="left" className="homepage__language" hideLabel onClick={changeLanguage("en")}>
                English
              </Button>
            </li>
            <li>
              <Button icon={<French />} iconPosition="left" className="homepage__language" hideLabel onClick={changeLanguage("fr")}>
                Français
              </Button>
            </li>

            {!!user && (
              <li>
                <Button variant="primary" onClick={onLogout} icon={<LogoutIcon className="homepage__logout-button-icon" />} iconPosition="left" className="homepage__logout-button">
                  Logout
                </Button>
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

              <Button onClick={() => navigate("/new")} className="homepage__start-button" icon={<ArrowRightIcon className="homepage__proceed-icon" />} iconPosition="right">
                <Trans i18nKey="Homepage.startButton" />
              </Button>
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
