import {AuthenticationManager} from "../../utils/authentication/AuthenticationManager";

const LoginProviders = () => (
  <div className="login-control">
    <button onClick={AuthenticationManager.onGoogleSignIn}>Sign in with Google</button>
    <button onClick={AuthenticationManager.onGithubSignIn}>Sign in with Github</button>
    <button onClick={AuthenticationManager.onMicrosoftSignIn}>Sign in with Microsoft</button>
  </div>
);
export default LoginProviders;
