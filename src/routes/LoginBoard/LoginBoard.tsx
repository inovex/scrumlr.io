import {useNavigate} from "react-router-dom";
import {getRandomName} from "constants/name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {useTranslation} from "react-i18next";
import {useLocation} from "react-router";
import {HeroIllustration} from "components/HeroIllustration";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import "./LoginBoard.scss";

export var LoginBoard = function () {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(getRandomName());
  const [termsAccepted, setTermsAccepted] = useState(false);

  // anonymous sign in and redirection to board path that is in history
  async function handleLogin() {
    await AuthenticationManager.signInAnonymously(displayName);
    try {
      navigate(location.state.from.pathname);
    } catch (err) {
      Toast.error(t("LoginBoard.errorOnRedirect"));
    }
  }

  // TODO https://dribbble.com/shots/7757250-Sign-up-revamp
  // TODO https://dribbble.com/shots/11879454-Sign-Up-Form
  return (
    <div className="login-board">
      <HeroIllustration className="login-board__illustration" />

      <div>
        <ScrumlrLogo accentColorClassNames={["accent-color--pink"]} />

        <h1>Sign in to scrumlr.io</h1>

        <LoginProviders originURL={location.state.from.pathname} />

        <span>or</span>

        <fieldset>
          <legend>Anonymous login</legend>

          <label className="login-board__form-element">
            <span>Username</span>
            <input
              className="login-board__input"
              defaultValue={displayName}
              type="text"
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              maxLength={20}
            />
          </label>

          <label>
            <input type="checkbox" defaultChecked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
            <span>I agree to the terms and privacy policy</span>
          </label>
        </fieldset>

        <button onClick={handleLogin}>{t("LoginBoard.joinAnonymous")}</button>
      </div>
    </div>
  );
};
