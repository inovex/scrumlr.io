import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {ReactComponent as GoogleIcon} from "assets/icon-google.svg";
import {ReactComponent as GitHubIcon} from "assets/icon-github.svg";
import {ReactComponent as MicrosoftIcon} from "assets/icon-microsoft.svg";
import {ReactComponent as AppleIcon} from "assets/icon-apple.svg";
import "./LoginProviders.scss";
import {Button} from "../Button";
import {useAppSelector} from "../../store";

export interface LoginProvidersProps {
  originURL?: string;
}

export const LoginProviders = ({originURL = window.location.href}) => {
  const {t} = useTranslation();
  const providers = useAppSelector((state) => state.view.enabledAuthProvider);

  /* if (providers.length === 0) {
    return null;
  } */

  const signIn = (provider: string) => async () => {
    await Auth.signInWithAuthProvider(provider, originURL);
  };

  return (
    <div className="login-providers">
      <Button id="google" className="login-providers__button" onClick={signIn("google")} leftIcon={<GoogleIcon className="login-providers__icon" />}>
        {t("LoginProviders.signInWithGoogle")}
      </Button>

      {providers.some((provider) => provider === "GITHUB") && (
        <Button id="github" className="login-providers__button" onClick={signIn("github")} leftIcon={<GitHubIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithGitHub")}
        </Button>
      )}
      {providers.some((provider) => provider === "MICROSOFT") && (
        <Button id="microsoft" className="login-providers__button" onClick={signIn("microsoft")} leftIcon={<MicrosoftIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithMicrosoft")}
        </Button>
      )}
      {providers.some((provider) => provider === "AZURE_AD") && (
        <Button id="azure-ad" className="login-providers__button" onClick={signIn("azure_ad")} leftIcon={<MicrosoftIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithAzureAd")}
        </Button>
      )}
      {providers.some((provider) => provider === "APPLE") && (
        <Button id="apple" className="login-providers__button" onClick={signIn("apple")} leftIcon={<AppleIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithApple")}
        </Button>
      )}
    </div>
  );
};
