import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {Apple, Azure, Google, Microsoft, OpenID} from "components/Icon";
import {useAppSelector} from "store";
import {Button} from "../Button";
import "./LoginProviders.scss";

export interface LoginProvidersProps {
  originURL?: string;
}

export const LoginProviders = ({originURL = window.location.href}: LoginProvidersProps) => {
  const {t} = useTranslation();
  const providers = useAppSelector((state) => state.view.enabledAuthProvider);

  const signIn = (provider: string) => async () => {
    await Auth.signInWithAuthProvider(provider, originURL);
  };

  const providerConfig = {
    GOOGLE: {
      label: t("LoginProviders.signInWithGoogle"),
      icon: <Google className="login-providers__icon" />,
      signInKey: "google",
    },
    MICROSOFT: {
      label: t("LoginProviders.signInWithMicrosoft"),
      icon: <Microsoft className="login-providers__icon" />,
      signInKey: "microsoft",
    },
    AZURE_AD: {
      label: t("LoginProviders.signInWithAzureAd"),
      icon: <Azure className="login-providers__icon" />,
      signInKey: "azure_ad",
    },
    APPLE: {
      label: t("LoginProviders.signInWithApple"),
      icon: <Apple className="login-providers__icon" />,
      signInKey: "apple",
    },
    OIDC: {
      label: t("LoginProviders.signInWithOIDC"),
      icon: <OpenID className="login-providers__icon" />,
      signInKey: "oidc",
    },
  } as const;

  type ProviderKey = keyof typeof providerConfig;
  const enabledProviders = providers.filter((provider): provider is ProviderKey => provider in providerConfig);

  if (enabledProviders.length === 0) {
    return null;
  }

  const [primaryProvider, ...secondaryProviders] = enabledProviders;

  return (
    <div className="login-providers">
      {primaryProvider && (
        <>
          <div className="buttonWrapper">
            <Button key={`${primaryProvider}-full`} className="login-providers__button" color="backlog-blue" onClick={signIn(providerConfig[primaryProvider].signInKey)}>
              {providerConfig[primaryProvider].label}
            </Button>
            <Button
              key={`${primaryProvider}-icon`}
              className="login-providers__button"
              color="backlog-blue"
              onClick={signIn(providerConfig[primaryProvider].signInKey)}
              icon={providerConfig[primaryProvider].icon}
              hideLabel
              type="ghost"
            >
              {providerConfig[primaryProvider].label}
            </Button>
          </div>
          <Button
            key={`${primaryProvider}-icon-replacement`}
            className="login-providers__button login-providers__button--icon-replacement"
            color="backlog-blue"
            onClick={signIn(providerConfig[primaryProvider].signInKey)}
            icon={providerConfig[primaryProvider].icon}
            hideLabel
          >
            {providerConfig[primaryProvider].label}
          </Button>
        </>
      )}
      {secondaryProviders.map((provider) => (
        <Button
          key={provider}
          className="login-providers__button"
          color="backlog-blue"
          onClick={signIn(providerConfig[provider].signInKey)}
          icon={providerConfig[provider].icon}
          hideLabel
          type="ghost"
        >
          {providerConfig[provider].label}
        </Button>
      ))}
    </div>
  );
};
