import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {Apple, Azure, GitHub, Google, Microsoft, OpenID} from "components/Icon";
import {useState, useRef, ReactNode, useEffect} from "react";
import {useSize} from "utils/hooks/useSize";
import {useAppSelector} from "store";
import {Button} from "../Button";
import "./LoginProviders.scss";

export interface LoginProvidersProps {
  originURL?: string;
}
interface ProviderConfigEntry {
  label: string;
  icon: ReactNode;
  signInKey: string;
}

export const LoginProviders = ({originURL = window.location.href}: LoginProvidersProps) => {
  const {t} = useTranslation();
  const providers = useAppSelector((state) => state.view.enabledAuthProvider);

  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);

  const signIn = (provider: string) => async () => {
    await Auth.signInWithAuthProvider(provider, originURL);
  };

  const providerConfig: Record<string, ProviderConfigEntry> = {
    GOOGLE: {label: t("LoginProviders.signInWithGoogle"), icon: <Google className="login-providers__icon" />, signInKey: "google"},
    MICROSOFT: {label: t("LoginProviders.signInWithMicrosoft"), icon: <Microsoft className="login-providers__icon" />, signInKey: "microsoft"},
    AZURE_AD: {label: t("LoginProviders.signInWithAzureAd"), icon: <Azure className="login-providers__icon" />, signInKey: "azure_ad"},
    APPLE: {label: t("LoginProviders.signInWithApple"), icon: <Apple className="login-providers__icon" />, signInKey: "apple"},
    OIDC: {label: t("LoginProviders.signInWithOIDC"), icon: <OpenID className="login-providers__icon" />, signInKey: "oidc"},
    GITHUB: {label: t("LoginProviders.signInWithGitHub"), icon: <GitHub className="login-providers__icon" />, signInKey: "github"},
  } as const;

  type ProviderKey = keyof typeof providerConfig;
  const enabledProviders = providers.filter((provider): provider is ProviderKey => provider in providerConfig);

  const containerSize = useSize(containerRef);
  const ghostSize = useSize(ghostRef);

  useEffect(() => {
    if (containerSize && ghostSize) {
      setIsCompact(ghostSize.width > containerSize.width);
    }
  }, [containerSize, ghostSize]);

  if (enabledProviders.length === 0) return null;

  const [primaryProvider, ...secondaryProviders] = enabledProviders;

  return (
    <div className="login-providers">
      {/* --- PRIMARY PROVIDER --- */}
      {primaryProvider && (
        <div className="primary-provider-wrapper" ref={containerRef}>
          {/* Ghost: Invisible measurer */}
          <span ref={ghostRef} className="ghost-measurer" aria-hidden="true">
            {providerConfig[primaryProvider].label}
          </span>

          {!isCompact ? (
            /* --- FULL MODE --- */
            <div className="full-stack-wrapper">
              <Button
                id={providerConfig[primaryProvider].signInKey}
                key={`${primaryProvider}-text`}
                className="login-providers__button text-button"
                color="backlog-blue"
                onClick={signIn(providerConfig[primaryProvider].signInKey)}
              >
                {providerConfig[primaryProvider].label}
              </Button>
              <Button
                key={`${primaryProvider}-overlay`}
                className="login-providers__button overlay-icon-button"
                color="backlog-blue"
                icon={providerConfig[primaryProvider].icon}
                hideLabel
                type="ghost"
                aria-hidden="true"
                tabIndex={-1}
              >
                {providerConfig[primaryProvider].label}
              </Button>
            </div>
          ) : (
            /* --- COMPACT MODE --- */
            <Button
              id={providerConfig[primaryProvider].signInKey}
              key={`${primaryProvider}-compact`}
              className="login-providers__button"
              color="backlog-blue"
              onClick={signIn(providerConfig[primaryProvider].signInKey)}
              icon={providerConfig[primaryProvider].icon}
              hideLabel
              type="ghost"
            >
              {providerConfig[primaryProvider].label}
            </Button>
          )}
        </div>
      )}

      {/* --- SECONDARY PROVIDERS --- */}
      {secondaryProviders.map((provider) => (
        <Button
          id={providerConfig[provider].signInKey}
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
