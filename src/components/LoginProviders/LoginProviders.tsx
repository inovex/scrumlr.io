import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {AppleIcon, AzureIcon, GitHubIcon, GoogleIcon, MicrosoftIcon, OpenIDIcon} from "components/Icon";
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
    GOOGLE: {label: t("LoginProviders.signInWithGoogle"), icon: <GoogleIcon className="login-providers__icon" />, signInKey: "google"},
    MICROSOFT: {label: t("LoginProviders.signInWithMicrosoft"), icon: <MicrosoftIcon className="login-providers__icon" />, signInKey: "microsoft"},
    AZURE_AD: {label: t("LoginProviders.signInWithAzureAd"), icon: <AzureIcon className="login-providers__icon" />, signInKey: "azure_ad"},
    APPLE: {label: t("LoginProviders.signInWithApple"), icon: <AppleIcon className="login-providers__icon" />, signInKey: "apple"},
    OIDC: {label: t("LoginProviders.signInWithOIDC"), icon: <OpenIDIcon className="login-providers__icon" />, signInKey: "oidc"},
    GITHUB: {label: t("LoginProviders.signInWithGitHub"), icon: <GitHubIcon className="login-providers__icon" />, signInKey: "github"},
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

  const renderProviderButton = (provider: ProviderKey, compact: boolean) => {
    const {label, icon, signInKey} = providerConfig[provider];
    return compact ? (
      <Button id={signInKey} key={provider} className="login-providers__button" color="backlog-blue" onClick={signIn(signInKey)} icon={icon} variant="ghost" hideLabel>
        {label}
      </Button>
    ) : (
      <Button
        id={signInKey}
        key={provider}
        className="login-providers__primary-button"
        color="backlog-blue"
        onClick={signIn(signInKey)}
        icon={<span className="login-providers__icon-circle">{icon}</span>}
        iconPosition="left"
      >
        <span className="login-providers__primary-label">{label}</span>
      </Button>
    );
  };

  return (
    <div className="login-providers">
      {primaryProvider && (
        <div className="primary-provider-wrapper" ref={containerRef}>
          {/* invisible measurer to decide whether the label fits */}
          <span ref={ghostRef} className="ghost-measurer" aria-hidden="true">
            {providerConfig[primaryProvider].label}
          </span>
          {renderProviderButton(primaryProvider, isCompact)}
        </div>
      )}

      {secondaryProviders.map((provider) => renderProviderButton(provider, true))}
    </div>
  );
};
