import classNames from "classnames";
import {getRandomName} from "utils/random";
import {Auth} from "utils/auth";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {Trans, useTranslation} from "react-i18next";
import {Link, useLocation} from "react-router";
import StanCoffeeDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
import StanCoffeeLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.png";
import StanOkayDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.png";
import StanOkayLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.png";
import {Refresh,MarkAsDone2} from "components/Icon";
import {TextInputAction} from "components/TextInputAction";
import {LegacyButton} from "components/Button";
import {TextInput} from "components/TextInput";
import {TextInputLabel} from "components/TextInputLabel";
import {ValidationError} from "components/ValidationError";
import {useAppSelector} from "store";
import {Background} from "components/Background";
import {HeaderBar} from "components/HeaderBar";
import {SHOW_LEGAL_DOCUMENTS} from "../../config";

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
  const [termsAccepted, setTermsAccepted] = useState(!SHOW_LEGAL_DOCUMENTS);
  const [submitted, setSubmitted] = useState(false);

  let redirectPath = "/";
  if (location.state) {
    redirectPath = (location.state as State).from.pathname;
  }

  // anonymous sign in and redirection to board path that is in history
  async function handleLogin() {
    if (termsAccepted) {
      try {
        await Auth.signInAnonymously(displayName);
        window.location.pathname = redirectPath;
      } catch (err) {
        Toast.error({title: t("LoginBoard.errorOnRedirect")});
      }
    }
    setSubmitted(true);
  }

  // TODO delete variable and replace with providersAvailable later everywhere
  const providerAvailableDev = true; // set to false or

  // https://dribbble.com/shots/7757250-Sign-up-revamp
  return (
    <Background>
      <div className="login-boardN">
        <HeaderBar renderTitle={() => t("LoginBoard.title")} loginBoard />
        <div className="login-boardN__wrapper">
          <div className="login-boardN__card">
            <div className={classNames("login-boardN__stan-container", "login-boardN__stan-container--left")}>
              <img className={classNames("login-boardN__stan", "login-boardN__stan--dark")} src={StanCoffeeDark} alt="Stan just hanging there with a coffee" />
              <img className={classNames("login-boardN__stan", "login-boardN__stan--light")} src={StanCoffeeLight} alt="Stan just hanging there with a coffee" />
            </div>
            <div className={classNames("login-boardN__stan-container", "login-boardN__stan-container--right")}>
              <img className={classNames("login-boardN__stan", "login-boardN__stan--dark")} src={StanOkayDark} alt="Stan showing okay sign" />
              <img className={classNames("login-boardN__stan", "login-boardN__stan--light")} src={StanOkayLight} alt="Stan showing okay sign" />
            </div>
            <div className="login-boardN__form">
              <div className="login-boardN__providers-section">
                {providerAvailableDev ? (
                  <>
                    <h1>{t("LoginBoard.subtitleLogin")}</h1>

                    <div className="login-boardN__features">
                      <div className="login-boardN__feature">
                        <MarkAsDone2 className="login-boardN__feature-icon" />
                        <span>Eigene Vorlagen erstellen und dauerhaft speichern</span>
                      </div>
                      <div className="login-boardN__feature">
                        <MarkAsDone2 className="login-boardN__feature-icon" />
                        <span>blubbiblubb</span>
                      </div>
                      {/* ... */}
                    </div>

                    <LoginProviders originURL={`${window.location.origin}${redirectPath}`} />

                    <hr className="login-board__divider" data-label="or" />
                  </>
                ) : (
                  <h1>{t("LoginBoard.subtitleAnonymous")}</h1>
                )}
              </div>

              <fieldset className="login-board__fieldset">
                <legend className="login-board__fieldset-legend">{t("LoginBoard.anonymousLogin")}</legend>

                <div className="login-board__username">
                  <TextInputLabel label={t("LoginBoard.username")} htmlFor="login-board__username" />
                  <TextInput
                    id="login-board__username"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                    maxLength={64}
                    aria-invalid={!displayName}
                    actions={
                      <TextInputAction title={t("LoginBoard.generateRandomName")} onClick={() => setDisplayName(getRandomName())}>
                        <Refresh />
                      </TextInputAction>
                    }
                    data-cy="login-board__username"
                  />
                </div>
                {!displayName && <ValidationError>{t("LoginBoard.usernameValidationError")}</ValidationError>}

                {SHOW_LEGAL_DOCUMENTS && (
                  <label className="login-board__form-element login-board__terms">
                    <input
                      type="checkbox"
                      className="login-board__checkbox"
                      defaultChecked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      data-cy="login-board__checkbox"
                    />
                    <span className="login-board__terms-label">
                      <Trans
                        i18nKey="LoginBoard.acceptTerms"
                        components={{
                          terms: <Link to="/legal/termsAndConditions" target="_blank" />,
                          privacy: <Link to="/legal/privacyPolicy" target="_blank" />,
                        }}
                      />
                    </span>
                  </label>
                )}
              </fieldset>
              {submitted && !termsAccepted && <ValidationError>{t("LoginBoard.termsValidationError")}</ValidationError>}

              <LegacyButton
                className="login-board__anonymous-login-button"
                color="primary"
                onClick={handleLogin}
                disabled={anonymousLoginDisabled}
                data-cy="login-board__anonymous-login-button"
              >
                {t("LoginBoard.login")}
              </LegacyButton>
              {anonymousLoginDisabled && providersAvailable && <ValidationError>{t("LoginBoard.anonymousLoginDisabledError")}</ValidationError>}
              {/* admin messed something up */}
              {anonymousLoginDisabled && !providersAvailable && <ValidationError>{t("LoginBoard.noLoginAvailable")}</ValidationError>}
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};
