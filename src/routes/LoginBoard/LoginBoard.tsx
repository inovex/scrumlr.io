// external
import {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router";
import {Trans, useTranslation} from "react-i18next";
import classNames from "classnames";
// internal
import {useAppSelector} from "store";
import {Auth} from "utils/auth";
import {getRandomName} from "utils/random";
// components
import {Background} from "components/Background";
import {Button} from "components/Button";
import {HeaderBar} from "components/HeaderBar";
import {Refresh, MarkAsDone} from "components/Icon";
import {Input} from "components/Input/Input";
import {LoginProviders} from "components/LoginProviders";
import {ValidationError} from "components/ValidationError";
// assets
import StanCoffeeDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
import StanCoffeeLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.png";
import StanOkayDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.png";
import StanOkayLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.png";
// styles
import "./LoginBoard.scss";

interface LocationState {
  from: {pathname: string};
}

const FEATURE_KEYS = [
  "LoginBoard.loginFeature1",
  "LoginBoard.loginFeature2",
  // ...
];

const TERMS_LINKS = {
  terms: <Link to="/legal/termsAndConditions" target="_blank" />,
  privacy: <Link to="/legal/privacyPolicy" target="_blank" />,
};

export const LoginBoard = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const anonymousLoginDisabled = useAppSelector((state) => state.view.anonymousLoginDisabled);
  const enabledProviders = useAppSelector((state) => state.view.enabledAuthProvider);
  const providersAvailable = enabledProviders.length > 0;

  const [displayName, setDisplayName] = useState(getRandomName());
  const [showAnonymousContent, setShowAnonymousContent] = useState(false);

  const redirectPath = (location.state as LocationState)?.from?.pathname || "/";

  async function handleAnonymousLogin() {
    if (!displayName) return; // Basic safety check
    await Auth.signInAnonymously(displayName);
    navigate(redirectPath);
  }

  /**
   * Logic Section: Providers
   * Flattened logic:
   * 1. If providers exist -> Show Features, Providers, and Divider (if anonymous login is enabled).
   * 2. If no providers AND anonymous login disabled -> Show Error.
   * 3. If no providers AND anonymous login enabled -> Show Anonymous Subtitle.
   */
  const renderProvidersSectionContent = () => {
    if (providersAvailable) {
      return (
        <>
          <h1>{t("LoginBoard.subtitleLogin")}</h1>
          <div className="login-board__features">
            {FEATURE_KEYS.map((key) => (
              <div key={key} className="login-board__feature">
                <MarkAsDone className="login-board__feature-icon" />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>
          <LoginProviders originURL={`${window.location.origin}${redirectPath}`} />
          {!anonymousLoginDisabled && <hr className="login-board__divider" data-label={t("LoginBoard.dividerWord")} />}
        </>
      );
    }

    if (anonymousLoginDisabled) {
      return <ValidationError>{t("LoginBoard.noLoginAvailable")}</ValidationError>;
    }

    return <h1>{t("LoginBoard.subtitleAnonymous")}</h1>;
  };

  /**
   * Logic Section: Anonymous Form
   * Flattened logic:
   * 1. If anonymous login disabled -> Return nothing.
   * 2. Render Toggle.
   * 3. If toggle active -> Render Inputs.
   */
  const renderAnonymousSectionContent = () => {
    if (anonymousLoginDisabled) return null;

    return (
      <>
        <p
          role="button"
          aria-expanded={showAnonymousContent}
          tabIndex={showAnonymousContent ? -1 : 0} // Remove from tab order if already active
          className={classNames("login-board__anonymous-toggle", {
            "login-board__anonymous-toggle--active": showAnonymousContent,
          })}
          onClick={() => !showAnonymousContent && setShowAnonymousContent(true)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !showAnonymousContent) {
              setShowAnonymousContent(true);
            }
          }}
          style={{cursor: showAnonymousContent ? "default" : "pointer"}}
        >
          {t("LoginBoard.anonymousLogin")}
        </p>

        {showAnonymousContent && (
          <div className="login-board__anonymous-content">
            <div className="login-board__input-wrapper">
              <Input
                type="text"
                height="small"
                input={displayName}
                setInput={setDisplayName}
                maxLength={64}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handleAnonymousLogin();
                }}
              />
              <Button type="ghost" color="backlog-blue" onClick={() => setDisplayName(getRandomName())} title={t("LoginBoard.generateRandomName")} icon={<Refresh />} hideLabel />
            </div>
            <Button className="login-board__anonymous-login-button" onClick={handleAnonymousLogin} disabled={!displayName} data-cy="login-board__anonymous-login-button">
              {t("LoginBoard.login")}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Background>
      <div className="login-board">
        <HeaderBar renderTitle={() => t("LoginBoard.title")} loginBoard />
        <div className="login-board__wrapper">
          <div className="login-board__card">
            {/* Stan Images - Left */}
            <div className="login-board__stan-container login-board__stan-container--left">
              <img className="login-board__stan login-board__stan--dark" src={StanCoffeeDark} alt="Stan hanging with coffee" />
              <img className="login-board__stan login-board__stan--light" src={StanCoffeeLight} alt="Stan hanging with coffee" />
            </div>
            {/* Stan Images - Right */}
            <div className="login-board__stan-container login-board__stan-container--right">
              <img className="login-board__stan login-board__stan--dark" src={StanOkayDark} alt="Stan showing okay sign" />
              <img className="login-board__stan login-board__stan--light" src={StanOkayLight} alt="Stan showing okay sign" />
            </div>

            <div className="login-board__form-wrapper">
              <div className="login-board__form">
                {/* Providers Section */}
                <div className="login-board__providers-section">{renderProvidersSectionContent()}</div>

                {/* Anonymous Section */}
                <div className="login-board__anonymous-section">{renderAnonymousSectionContent()}</div>
              </div>

              {/* Footer Terms */}
              <span className="login-board__terms-label">
                <Trans i18nKey="LoginBoard.acceptTerms" components={TERMS_LINKS} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};
