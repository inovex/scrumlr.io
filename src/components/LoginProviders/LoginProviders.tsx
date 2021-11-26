import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {useTranslation} from "react-i18next";
import {ReactComponent as GoogleIcon} from "assets/icon-google.svg";
import {ReactComponent as GitHubIcon} from "assets/icon-github.svg";
import {ReactComponent as MicrosoftIcon} from "assets/icon-microsoft.svg";
import "./LoginProviders.scss";

export interface LoginProvidersProps {
  originURL?: string;
}

// TODO: Include after deployment: <button onClick={() => AuthenticationManager.signInWithAuthProvider("apple")}>Sign in with Apple</button>
export var LoginProviders = function({originURL = window.location.href}) {
  const {t} = useTranslation();

  const signIn = (provider: string) => async () => {
    await AuthenticationManager.signInWithAuthProvider(provider, originURL);
  };

  const labelSignInWithGoogle = t("LoginProviders.signInWithGoogle");
  const labelSignInWithGitHub = t("LoginProviders.signInWithGitHub");
  const labelSignInWithMicrosoft = t("LoginProviders.signInWithMicrosoft");

  return (
    <div className="login-providers">
      <button id="google" className="login-providers__button" onClick={signIn("google")}>
        <GoogleIcon className="login-providers__icon" />
        <span className="login-providers__label">{labelSignInWithGoogle}</span>
      </button>
      <button id="github" className="login-providers__button" onClick={signIn("github")}>
        <GitHubIcon className="login-providers__icon" />
        <span className="login-providers__label">{labelSignInWithGitHub}</span>
      </button>
      <button id="microsoft" className="login-providers__button" onClick={signIn("microsoft")}>
        <MicrosoftIcon className="login-providers__icon" />
        <span className="login-providers__label">{labelSignInWithMicrosoft}</span>
      </button>
    </div>
  );
}
