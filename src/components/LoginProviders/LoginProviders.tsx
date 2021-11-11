import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {useTranslation} from "react-i18next";

export interface LoginProvidersProps {
  originURL?: string;
}

// TODO: Include after deployment: <button onClick={() => AuthenticationManager.signInWithAuthProvider("apple")}>Sign in with Apple</button>
export const LoginProviders = ({originURL = window.location.href}) => {
  const {t} = useTranslation();

  return (
    <div className="login-control">
      <button id="google" onClick={() => AuthenticationManager.signInWithAuthProvider("google", originURL)}>
        {t("LoginProviders.signInWithGoogle")}
      </button>
      <button id="github" onClick={() => AuthenticationManager.signInWithAuthProvider("github", originURL)}>
        {t("LoginProviders.signInWithGitHub")}
      </button>
      <button id="microsoft" onClick={() => AuthenticationManager.signInWithAuthProvider("microsoft", originURL)}>
        {t("LoginProviders.signInWithMicrosoft")}
      </button>
    </div>
  );
};
