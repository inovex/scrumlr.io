import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./Homepage.scss";
import {Trans, useTranslation, withTranslation} from "react-i18next";
import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {ReactComponent as IconArrowRight} from "assets/icon-arrow-right.svg";
import {Link, useHref, useNavigate} from "react-router-dom";
import {AppInfo} from "components/AppInfo";
import {HeroIllustration} from "components/HeroIllustration";
import {ReactComponent as LogoutIcon} from "assets/icon-logout.svg";
import {Button} from "components/Button";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {InovexAnchor} from "./InovexAnchor";
import {SHOW_LEGAL_DOCUMENTS} from "../../config";

export const Homepage = withTranslation()(() => {
  const {i18n} = useTranslation();
  const newHref = useHref("/new");
  const navigate = useNavigate();
  const {user} = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  const changeLanguage = (language: string) => () => {
    i18n.changeLanguage(language).then(() => {
      document.documentElement.lang = i18n.language;
    });
  };

  const onLogout = () => {
    dispatch(Actions.signOut());
  };

  return (
    <div className="homepage">
      <div className="homepage__hero">
        <header className="homepage__header">
          <ScrumlrLogo className="homepage__logo" accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />

          <ul className="homepage__settings">
            <li>
              <Button leftIcon={<German />} className="homepage__language" hideLabel onClick={changeLanguage("de")}>
                Deutsch
              </Button>
            </li>
            <li>
              <Button leftIcon={<English />} className="homepage__language" hideLabel onClick={changeLanguage("en")}>
                English
              </Button>
            </li>

            {!!user && (
              <li>
                <Button variant="text-link" onClick={onLogout} leftIcon={<LogoutIcon className="homepage__logout-button-icon" />} className="homepage__logout-button">
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

              <div className="homepage__buttons">
                <Button href={newHref} color="primary" className="homepage__start-button" rightIcon={<IconArrowRight className="homepage__proceed-icon" />}>
                  <Trans i18nKey="Homepage.startButton" />
                </Button>

                <button
                  className="button homepage__start-button"
                  onClick={() => {
                    dispatch(Actions.changePhase("intro"));
                    navigate("/onboarding-intro");
                  }}
                >
                  <Trans i18nKey="Homepage.onboardingButton" />
                  <IconArrowRight className="homepage__proceed-icon" />
                </button>
              </div>
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
