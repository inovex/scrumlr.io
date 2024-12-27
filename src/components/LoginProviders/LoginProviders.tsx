import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {Apple, Azure, Google, Microsoft, OpenID} from "components/Icon";
import {useAppSelector} from "store";
import {Button} from "../Button";
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
        <Button id="google" className="login-providers__button" onClick={signIn("google")} leftIcon={<Google className="login-providers__icon" />}>
          {t("LoginProviders.signInWithGoogle")}
        </Button>
      )}
      {providers.some((provider) => provider === "MICROSOFT") && (
        <Button id="microsoft" className="login-providers__button" onClick={signIn("microsoft")} leftIcon={<Microsoft className="login-providers__icon" />}>
          {t("LoginProviders.signInWithMicrosoft")}
        </Button>
      )}
      {providers.some((provider) => provider === "AZURE_AD") && (
        <Button id="azure-ad" className="login-providers__button" onClick={signIn("azure_ad")} leftIcon={<Azure className="login-providers__icon" />}>
          {t("LoginProviders.signInWithAzureAd")}
        </Button>
      )}
      {providers.some((provider) => provider === "APPLE") && (
        <Button id="apple" className="login-providers__button" onClick={signIn("apple")} leftIcon={<Apple className="login-providers__icon" />}>
          {t("LoginProviders.signInWithApple")}
        </Button>
      )}
      {providers.some((provider) => provider === "OIDC") && (
        <Button id="oidc" className="login-providers__button" onClick={signIn("oidc")} leftIcon={<OpenID className="login-providers__icon" />}>
          {t("LoginProviders.signInWithOIDC")}
        </Button>
      )}
    </div>
  );
};
