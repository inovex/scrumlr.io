import {AuthenticationManager} from "../../utils/authentication/AuthenticationManager";

const LoginProviders = () => (
  <div className="login-control">
    <button onClick={() => AuthenticationManager.signInWithAuthProvider("google")}>Sign in with Google</button>
    <button onClick={() => AuthenticationManager.signInWithAuthProvider("github")}>Sign in with Github</button>
    <button onClick={() => AuthenticationManager.signInWithAuthProvider("microsoft")}>Sign in with Microsoft</button>
  </div>
);
export default LoginProviders;
