import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./Homepage.scss";
import {Trans, useTranslation, withTranslation} from "react-i18next";
import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {Link} from "react-router-dom";
import {AppInfo} from "components/AppInfo";
import Parse from "parse";

export const Homepage = withTranslation()(() => {
  const {i18n} = useTranslation();

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
          <ScrumlrLogo className="homepage__logo" accentColorClassNames={["accent-color--pink"]} />

          <ul className="homepage__settings">
            <li>
              <button onClick={changeLanguage("de")}>
                <German className="homepage__language" />
              </button>

              <button onClick={changeLanguage("en")}>
                <English className="homepage__language" />
              </button>
            </li>

            {Parse.User.current() && (
              <li>
                <button onClick={onLogout}>Logout</button>
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

              <Link to="/new" className="homepage__start-link">
                <Trans i18nKey="Homepage.startButton" />
              </Link>
            </main>

            <aside className="homepage__illustration">
              <div className="homepage__illustration-tile">
                <German className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <English className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <German className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <English className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <German className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <English className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <German className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <English className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <German className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <English className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <German className="homepage__illustration-tile-image" />
              </div>
              <div className="homepage__illustration-tile">
                <English className="homepage__illustration-tile-image" />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <footer className="homepage__footer">
        <AppInfo className="homepage__app-info" />

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
