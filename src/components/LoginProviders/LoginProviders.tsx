import {AuthenticationManager} from "utils/authentication/AuthenticationManager";

export interface LoginProvidersProps {
  originURL?: string;
}

// TODO: Include after deployment: <button onClick={() => AuthenticationManager.signInWithAuthProvider("apple")}>Sign in with Apple</button>
export const LoginProviders = ({originURL = window.location.href}) => (
  <div className="login-control">
    <button id="google" onClick={() => AuthenticationManager.signInWithAuthProvider("google", originURL)}>
      Sign in with Google
    </button>
    <button id="github" onClick={() => AuthenticationManager.signInWithAuthProvider("github", originURL)}>
      Sign in with Github
    </button>
    <button id="microsoft" onClick={() => AuthenticationManager.signInWithAuthProvider("microsoft", originURL)}>
      Sign in with Microsoft
    </button>
  </div>
);
