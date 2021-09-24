import {RouteComponentProps} from "react-router";
import {getRandomName} from "constants/Name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";
import {useState} from "react";
import Parse from "parse";
import {onGithubSignIn, onGoogleSignIn, onMicrosoftSignIn} from "../NewBoard/NewBoard";

function LoginBoard(props: RouteComponentProps) {
  const [displayName, setDisplayName] = useState(getRandomName());

  // after oauth-redirection to current page, redirect to board path that was set before oauth
  if (Parse.User.current() && sessionStorage.getItem("boardId")) {
    try {
      props.history.push(sessionStorage.getItem("boardId")!);
    } catch (err) {
      Toast.error("An error occured while redirecting you");
    }
    sessionStorage.clear();
  }

  // safe board path in sessionStorage if there was an internal redirect because of lacking authentification
  if (props.history.location.state && !sessionStorage.getItem("boardId")) {
    sessionStorage.setItem("boardId", (props.history.location.state as {from: {pathname: string}}).from.pathname);
  }

  // anonymous sign in after internal redirection, so boardpath is still in history
  async function handleLogin() {
    await AuthenticationManager.signInAnonymously(displayName);
    try {
      props.history.push((props.history.location.state as {from: {pathname: string}}).from.pathname);
    } catch (err) {
      Toast.error("An error occured while redirecting you");
    }
  }

  return (
    <div className="login-board">
      <input
        className="login-board__input"
        defaultValue={displayName}
        type="text"
        onChange={(e) => setDisplayName(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
        maxLength={20}
      />
      <button onClick={handleLogin}>Join Board Anonymously</button>
      <button onClick={onGoogleSignIn}>Join with Google SignIn</button>
      <button onClick={onGithubSignIn}>Join with Github SignIn</button>
      <button onClick={onMicrosoftSignIn}>Join with Microsoft SignIn</button>
    </div>
  );
}

export default LoginBoard;
