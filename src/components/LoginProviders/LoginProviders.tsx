import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {Google, Microsoft, OpenID} from "components/Icon";
import {Button} from "../Button";
import {useAppSelector} from "../../store";
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
      {providers.some((provider) => provider === "OIDC") && (
        <Button id="oidc" className="login-providers__button" onClick={signIn("oidc")} leftIcon={<OpenID className="login-providers__icon" />}>
          {t("LoginProviders.signInWithOIDC")}
        </Button>
      )}
    </div>
  );
};
