import classNames from "classnames";
import {getRandomName} from "utils/random";
import {Auth} from "utils/auth";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {Trans, useTranslation} from "react-i18next";
import {Link, useLocation} from "react-router";
import StanCoffeeDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
import StanCoffeeLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.png";
import StanOkayDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.png";
import StanOkayLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.png";
import {Refresh, MarkAsDone} from "components/Icon";
import {Button} from "components/Button";
import {Input} from "components/Input/Input";
import {ValidationError} from "components/ValidationError";
import {useAppSelector} from "store";
import {Background} from "components/Background";
import {HeaderBar} from "components/HeaderBar";

import "./LoginBoard.scss";

interface State {
  from: {pathname: string};
}

export const LoginBoard = () => {
  const anonymousLoginDisabled = useAppSelector((state) => state.view.anonymousLoginDisabled);
  const providersAvailable = useAppSelector((state) => state.view.enabledAuthProvider).length > 0;

  const {t} = useTranslation();
  const location = useLocation();

  const [displayName, setDisplayName] = useState(getRandomName());
  const [showAnonymousContent, setShowAnonymousContent] = useState(false);

  let redirectPath = "/";
  if (location.state) {
    redirectPath = (location.state as State).from.pathname;
  }

  // anonymous sign in and redirection to board path that is in history
  async function handleLogin() {
    await Auth.signInAnonymously(displayName);
    window.location.pathname = redirectPath;
  }

  const FEATURE_KEYS = [
    "LoginBoard.loginFeature1",
    "LoginBoard.loginFeature2",
    // ...
  ];

  // TODO delete variable and replace with providersAvailable later everywhere
  const providerAvailableDev = true; // set to false or

  return (
    <Background>
      <div className="login-board">
        <HeaderBar renderTitle={() => t("LoginBoard.title")} loginBoard />
        <div className="login-board__wrapper">
          <div className="login-board__card">
            <div className={classNames("login-board__stan-container", "login-board__stan-container--left")}>
              <img className={classNames("login-board__stan", "login-board__stan--dark")} src={StanCoffeeDark} alt="Stan just hanging there with a coffee" />
              <img className={classNames("login-board__stan", "login-board__stan--light")} src={StanCoffeeLight} alt="Stan just hanging there with a coffee" />
            </div>
            <div className={classNames("login-board__stan-container", "login-board__stan-container--right")}>
              <img className={classNames("login-board__stan", "login-board__stan--dark")} src={StanOkayDark} alt="Stan showing okay sign" />
              <img className={classNames("login-board__stan", "login-board__stan--light")} src={StanOkayLight} alt="Stan showing okay sign" />
            </div>
            <div className="login-board__form-wrapper">
              <div className="login-board__form">
                <div className="login-board__providers-section">
                  {providerAvailableDev ? (
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

                      <hr className="login-board__divider" data-label={t("LoginBoard.dividerWord")} />
                    </>
                  ) : (
                    <h1>{t("LoginBoard.subtitleAnonymous")}</h1>
                  )}
                </div>
                <div className="login-board__anonymous-section">
                  <p
                    className={classNames("login-board__anonymous-toggle", {"login-board__anonymous-toggle--active": showAnonymousContent})}
                    onClick={() => !showAnonymousContent && setShowAnonymousContent(true)}
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
                            if (e.key === "Enter") handleLogin();
                          }}
                        />
                        <Button
                          type="ghost"
                          color="backlog-blue"
                          onClick={() => setDisplayName(getRandomName())}
                          title={t("LoginBoard.generateRandomName")}
                          icon={<Refresh />}
                          hideLabel
                        />
                      </div>

                      {!displayName && <ValidationError>{t("LoginBoard.usernameValidationError")}</ValidationError>}

                      <Button className="login-board__anonymous-login-button" onClick={handleLogin} disabled={anonymousLoginDisabled} data-cy="login-board__anonymous-login-button">
                        {t("LoginBoard.login")}
                      </Button>
                      {anonymousLoginDisabled && providersAvailable && <ValidationError>{t("LoginBoard.anonymousLoginDisabledError")}</ValidationError>}
                      {/* admin messed something up */}
                      {anonymousLoginDisabled && !providersAvailable && <ValidationError>{t("LoginBoard.noLoginAvailable")}</ValidationError>}
                    </div>
                  )}
                </div>
              </div>
              <span className="login-board__terms-label">
                <Trans
                  i18nKey="LoginBoard.acceptTerms"
                  components={{
                    terms: <Link to="/legal/termsAndConditions" target="_blank" />,
                    privacy: <Link to="/legal/privacyPolicy" target="_blank" />,
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};
