import {Link, useNavigate} from "react-router-dom";
import {getRandomName} from "constants/name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {Trans, useTranslation} from "react-i18next";
import {useLocation} from "react-router";
import {HeroIllustration} from "components/HeroIllustration";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {ReactComponent as RefreshIcon} from "assets/icon-refresh.svg";
import "./LoginBoard.scss";
import {Button} from "../../components/Button";
import {TextInput} from "../../components/TextInput";
import {TextInputLabel} from "../../components/TextInputLabel";
import {ValidationError} from "../../components/ValidationError";

export var LoginBoard = function () {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(getRandomName());
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // anonymous sign in and redirection to board path that is in history
  async function handleLogin() {
    if (termsAccepted) {
      await AuthenticationManager.signInAnonymously(displayName);
      try {
        navigate(location.state.from.pathname);
      } catch (err) {
        Toast.error(t("LoginBoard.errorOnRedirect"));
      }
    }
    setSubmitted(true);
  }

  // TODO https://dribbble.com/shots/7757250-Sign-up-revamp
  // TODO https://dribbble.com/shots/11879454-Sign-Up-Form
  return (
    <div className="login-board">
      <div className="login-board__dialog">
        <div className="login-board__form-wrapper">
          <div className="login-board__form">
            <ScrumlrLogo className="login-board__logo" accentColorClassNames={["accent-color--pink"]} />

            <h1>Sign in to scrumlr.io</h1>

            <LoginProviders originURL={location.state.from.pathname} />

            <hr className="login-board__divider" data-label="or" />

            <fieldset className="login-board__fieldset">
              <legend className="login-board__fieldset-legend">Sign in without registration</legend>

              <div className="login-board__username">
                <TextInputLabel label="Username" className="login-board__form-element">
                  <TextInput
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                    maxLength={20}
                    aria-invalid={!displayName}
                  />
                </TextInputLabel>
                <button className="login-board__randomize-button" onClick={() => setDisplayName(getRandomName())}>
                  <RefreshIcon className="login-board__randomize-icon" />
                </button>
              </div>
              {!displayName && <ValidationError>Username may not be empty</ValidationError>}

              <label className="login-board__form-element login-board__terms">
                <input type="checkbox" className="login-board__checkbox" defaultChecked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
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
            </fieldset>
            {submitted && !termsAccepted && <ValidationError>You must accept the terms and privacy policy</ValidationError>}

            <Button className="login-board__anonymous-login-button" color="primary" onClick={handleLogin}>
              {t("LoginBoard.joinAnonymous")}
            </Button>
          </div>
        </div>

        <HeroIllustration className="login-board__illustration" />
      </div>
    </div>
  );
};
