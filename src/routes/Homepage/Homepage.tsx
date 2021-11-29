import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./Homepage.scss";
import {Trans, useTranslation, withTranslation} from "react-i18next";
import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {ReactComponent as IconArrowRight} from "assets/icon-arrow-right.svg";
import {Link, useHref} from "react-router-dom";
import {AppInfo} from "components/AppInfo";
import Parse from "parse";
import {HeroIllustration} from "components/HeroIllustration";
import {Button} from "../../components/Button";
import {InovexAnchor} from "./InovexAnchor";

export const Homepage = withTranslation()(() => {
  const {i18n} = useTranslation();
  const newHref = useHref("/new");

  const changeLanguage = (language: string) => () => {
    i18n.changeLanguage(language).then(() => {
      location.reload();
    });
  };

  const onLogout = async () => {
    await Parse.User.logOut();
    location.reload();
  };

  return (
    <div className="homepage">
      <div className="homepage__hero">
        <header className="homepage__header">
          <ScrumlrLogo className="homepage__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />

          <ul className="homepage__settings">
            <li>
              <Button leftIcon={<German />} hideLabel onClick={changeLanguage("de")}>
                Deutsch
              </Button>
            </li>
            <li>
              <Button leftIcon={<English />} hideLabel onClick={changeLanguage("en")}>
                English
              </Button>
            </li>

            {Parse.User.current() && (
              <li>
                <Button onClick={onLogout}>Logout</Button>
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

              <Button href={newHref} color="primary" className="homepage__start-button" rightIcon={<IconArrowRight className="homepage__proceed-icon" />}>
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
          <Trans
            i18nKey="Homepage.developers"
            components={{
              inovex: <InovexAnchor />,
            }}
          />
        </div>

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
      </footer>
    </div>
  );
});
