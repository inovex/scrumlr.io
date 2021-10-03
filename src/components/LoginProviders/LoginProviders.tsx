import {AuthenticationManager} from "../../utils/authentication/AuthenticationManager";

// TODO: Include after deployment: <button onClick={() => AuthenticationManager.signInWithAuthProvider("apple")}>Sign in with Apple</button>
const LoginProviders = () => (
  <div className="login-control">
    <button id="google" onClick={() => AuthenticationManager.signInWithAuthProvider("google")}>
      Sign in with Google
    </button>
    <button id="github" onClick={() => AuthenticationManager.signInWithAuthProvider("github")}>
      Sign in with Github
    </button>
    <button id="microsoft" onClick={() => AuthenticationManager.signInWithAuthProvider("microsoft")}>
      Sign in with Microsoft
    </button>
  </div>
);
export default LoginProviders;
