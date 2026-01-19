import {Auth} from "utils/auth";
import {useTranslation} from "react-i18next";
import {Apple, Azure, Google, Microsoft, OpenID} from "components/Icon";
import React, {useState, useRef, useLayoutEffect} from "react";
import {useAppSelector} from "store";
import {Button} from "../Button";
import "./LoginProviders.scss";

export interface LoginProvidersProps {
  originURL?: string;
}

export const LoginProviders = ({originURL = window.location.href}: LoginProvidersProps) => {
  const {t} = useTranslation();
  const providers = useAppSelector((state) => state.view.enabledAuthProvider);

  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // measures available space for first button
  const ghostRef = useRef<HTMLSpanElement>(null); // measures required text with for first button

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

  const primaryKey = enabledProviders[0];
  const primaryData = primaryKey ? providerConfig[primaryKey] : null;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;

    if (!container || !ghost) {
      return;
    }

    const checkFit = () => {
      const availableWidth = container.offsetWidth;
      const buffer = 70; // TODO adjust this to be in the scss and more general
      const requiredWidth = ghost.offsetWidth + buffer;
      setIsCompact(requiredWidth > availableWidth);
    };

    const resizeObserver = new ResizeObserver(() => checkFit());
    resizeObserver.observe(container);
    checkFit(); // initial check

    return () => resizeObserver.disconnect();
  }, [primaryData?.label]); // re runs if language changes

  if (enabledProviders.length === 0) return null;

  const [primaryProvider, ...secondaryProviders] = enabledProviders;

  return (
    <div className="login-providers">
      {/* --- PRIMARY PROVIDER SECTION --- */}
      {primaryProvider && (
        <div className="primary-provider-wrapper" ref={containerRef}>
          {/* 1. GHOST: Invisible, purely for measuring text width */}
          <span ref={ghostRef} className="ghost-measurer" aria-hidden="true">
            {providerConfig[primaryProvider].label}
          </span>

          {/* 2. MODE SWITCH */}
          {!isCompact ? (
            /* --- FULL MODE: Text Button + Overlay Icon --- */
            <div className="buttonWrapper">
              {/* The Blue Pill (Background + Text) */}
              <Button key={`${primaryProvider}-text`} className="login-providers__button" color="backlog-blue" onClick={signIn(providerConfig[primaryProvider].signInKey)}>
                {providerConfig[primaryProvider].label}
              </Button>

              {/* The White Circle (Icon Overlay) */}
              <Button
                key={`${primaryProvider}-overlay`}
                className="login-providers__button overlay-icon-button"
                color="backlog-blue"
                onClick={signIn(providerConfig[primaryProvider].signInKey)}
                icon={providerConfig[primaryProvider].icon}
                hideLabel
                type="ghost"
              >
                {providerConfig[primaryProvider].label}
              </Button>
            </div>
          ) : (
            /* --- COMPACT MODE: Replacement Icon Only --- */
            <Button
              key={`${primaryProvider}-compact`}
              className="login-providers__button"
              color="backlog-blue"
              onClick={signIn(providerConfig[primaryProvider].signInKey)}
              icon={providerConfig[primaryProvider].icon}
              hideLabel // Shows only icon
            >
              {providerConfig[primaryProvider].label}
            </Button>
          )}
        </div>
      )}

      {/* --- SECONDARY PROVIDERS --- */}
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

  /*
  return (
    <div className="login-providers" ref={containerRef}>
      {primaryProvider && (
        <div className="primaryWrapper">
          <span ref={ghostRef} className="ghost-text">
            {providerConfig[primaryProvider].label}
          </span>

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
              hideLabel={isCompact}
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
            hideLabel={!isCompact}
          >
            {providerConfig[primaryProvider].label}
          </Button>
        </div>
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
*/
};
