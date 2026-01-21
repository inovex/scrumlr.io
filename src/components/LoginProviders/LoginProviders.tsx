import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {AppleIcon, AzureIcon, GoogleIcon, MicrosoftIcon, OpenIDIcon} from "components/Icon";
import {useAppSelector} from "store";
import {LegacyButton} from "../Button";
import "./LoginProviders.scss";

export interface LoginProvidersProps {
  originURL?: string;
}

export const LoginProviders = ({originURL = window.location.href}) => {
  const {t} = useTranslation();
  const providers = useAppSelector((state) => state.view.enabledAuthProvider);

  if (providers.length === 0) {
    return null;
  }

  const signIn = (provider: string) => async () => {
    await Auth.signInWithAuthProvider(provider, originURL);
  };

  return (
    <div className="login-providers">
      {providers.some((provider) => provider === "GOOGLE") && (
        <LegacyButton id="google" className="login-providers__button" onClick={signIn("google")} leftIcon={<GoogleIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithGoogle")}
        </LegacyButton>
      )}
      {providers.some((provider) => provider === "MICROSOFT") && (
        <LegacyButton id="microsoft" className="login-providers__button" onClick={signIn("microsoft")} leftIcon={<MicrosoftIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithMicrosoft")}
        </LegacyButton>
      )}
      {providers.some((provider) => provider === "AZURE_AD") && (
        <LegacyButton id="azure-ad" className="login-providers__button" onClick={signIn("azure_ad")} leftIcon={<AzureIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithAzureAd")}
        </LegacyButton>
      )}
      {providers.some((provider) => provider === "APPLE") && (
        <LegacyButton id="apple" className="login-providers__button" onClick={signIn("apple")} leftIcon={<AppleIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithApple")}
        </LegacyButton>
      )}
      {providers.some((provider) => provider === "OIDC") && (
        <LegacyButton id="oidc" className="login-providers__button" onClick={signIn("oidc")} leftIcon={<OpenIDIcon className="login-providers__icon" />}>
          {t("LoginProviders.signInWithOIDC")}
        </LegacyButton>
      )}
    </div>
  );
};
