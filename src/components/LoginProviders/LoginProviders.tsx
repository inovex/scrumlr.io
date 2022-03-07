import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {ReactComponent as GoogleIcon} from "assets/icon-google.svg";
import {ReactComponent as GitHubIcon} from "assets/icon-github.svg";
import {ReactComponent as MicrosoftIcon} from "assets/icon-microsoft.svg";
import {ReactComponent as AppleIcon} from "assets/icon-apple.svg";
import "./LoginProviders.scss";
import {Button} from "../Button";

export interface LoginProvidersProps {
  originURL?: string;
}

export const LoginProviders = ({originURL = window.location.href}) => {
  const {t} = useTranslation();

  const signIn = (provider: string) => async () => {
    await Auth.signInWithAuthProvider(provider, originURL);
  };

  return (
    <div className="login-providers">
      <Button id="google" className="login-providers__button" onClick={signIn("google")} leftIcon={<GoogleIcon className="login-providers__icon" />}>
        {t("LoginProviders.signInWithGoogle")}
      </Button>
      <Button id="github" className="login-providers__button" onClick={signIn("github")} leftIcon={<GitHubIcon className="login-providers__icon" />} hideLabel>
        {t("LoginProviders.signInWithGitHub")}
      </Button>
      <Button id="microsoft" className="login-providers__button" onClick={signIn("microsoft")} leftIcon={<MicrosoftIcon className="login-providers__icon" />} hideLabel>
        {t("LoginProviders.signInWithMicrosoft")}
      </Button>
      <Button id="apple" className="login-providers__button" onClick={signIn("apple")} leftIcon={<AppleIcon className="login-providers__icon" />} hideLabel>
        {t("LoginProviders.signInWithApple")}
      </Button>
    </div>
  );
};
