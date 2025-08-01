import {getRandomName} from "utils/random";
import {Auth} from "utils/auth";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {Trans, useTranslation} from "react-i18next";
import {Link, useLocation} from "react-router";
import {HeroIllustration} from "components/HeroIllustration";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {Refresh} from "components/Icon";
import {TextInputAction} from "components/TextInputAction";
import {LegacyButton} from "components/Button";
import {TextInput} from "components/TextInput";
import {TextInputLabel} from "components/TextInputLabel";
import {ValidationError} from "components/ValidationError";
import {useAppSelector} from "store";
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

  // https://dribbble.com/shots/7757250-Sign-up-revamp
  return (
    <div className="login-board">
      <div className="login-board__dialog">
        <div className="login-board__form-wrapper">
          <div className="login-board__form">
            <a href="/" aria-label="Homepage">
              <ScrumlrLogo className="login-board__logo" />
            </a>

            <h1>{t("LoginBoard.title")}</h1>

            <LoginProviders originURL={`${window.location.origin}${redirectPath}`} />

            <hr className="login-board__divider" data-label="or" />

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

        <HeroIllustration className="login-board__illustration" />
      </div>
    </div>
  );
};
