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

  let isFirstButton = true;
  const getButtonProps = () => {
    if (isFirstButton) {
      isFirstButton = false;
      return {hideLabel: false, type: undefined};
    }
    return {hideLabel: true, type: "ghost" as const};
  };

  return (
    <div className="login-providers">
      {providers.some((provider) => provider === "GOOGLE") && (
        <Button className="login-providers__button" color="backlog-blue" onClick={signIn("google")} icon={<Google className="login-providers__icon" />} {...getButtonProps()}>
          {t("LoginProviders.signInWithGoogle")}
        </Button>
      )}
      {providers.some((provider) => provider === "MICROSOFT") && (
        <Button className="login-providers__button" color="backlog-blue" onClick={signIn("microsoft")} icon={<Microsoft className="login-providers__icon" />} {...getButtonProps()}>
          {t("LoginProviders.signInWithMicrosoft")}
        </Button>
      )}
      {providers.some((provider) => provider === "AZURE_AD") && (
        <Button className="login-providers__button" color="backlog-blue" onClick={signIn("azure_ad")} icon={<Azure className="login-providers__icon" />} {...getButtonProps()}>
          {t("LoginProviders.signInWithAzureAd")}
        </Button>
      )}
      {providers.some((provider) => provider === "APPLE") && (
        <Button className="login-providers__button" color="backlog-blue" onClick={signIn("apple")} icon={<Apple className="login-providers__icon" />} {...getButtonProps()}>
          {t("LoginProviders.signInWithApple")}
        </Button>
      )}
      {providers.some((provider) => provider === "OIDC") && (
        <Button className="login-providers__button" color="backlog-blue" onClick={signIn("oidc")} icon={<OpenID className="login-providers__icon" />} {...getButtonProps()}>
          {t("LoginProviders.signInWithOIDC")}
        </Button>
      )}
    </div>
  );
};
