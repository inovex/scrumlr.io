import {ScrumlrLogo} from "../../components/ScrumlrLogo";
import "./Homepage.scss";
import {Trans, withTranslation} from "react-i18next";
import {AppInfo} from "../../components/AppInfo";

export const Homepage = withTranslation()(() => (
  <div className="homepage">
    <header className="homepage__header">
      <ScrumlrLogo className="homepage__logo" />
    </header>

    <div className="homepage__hero">
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

        <button>
          <Trans i18nKey="Homepage.startButton" />
        </button>
      </main>

      <aside className="homepage__illustration">
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
        <div>E</div>
        <div>F</div>
        <div>G</div>
        <div>H</div>
        <div>I</div>
        <div>J</div>
        <div>K</div>
        <div>L</div>
      </aside>
    </div>

    <footer className="homepage__footer">
      <AppInfo />

      <ul className="homepage__footer-links">
        <li>
          <a href="">
            <Trans i18nKey="Homepage.privacyPolicy" />
          </a>
        </li>
        <li>
          <a href="">
            <Trans i18nKey="Homepage.terms" />
          </a>
        </li>
      </ul>
    </footer>
  </div>
));
