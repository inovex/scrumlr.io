import {RouteComponentProps} from "react-router";
import {getRandomName} from "constants/Name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";
import {useState} from "react";
import Parse from "parse";
import {onGithubSignIn, onGoogleSignIn, onMicrosoftSignIn} from "../NewBoard/NewBoard";

function LoginBoard(props: RouteComponentProps) {
  const [displayName, setDisplayName] = useState(getRandomName());

  if (Parse.User.current() && sessionStorage.getItem("boardId")) {
    try {
      props.history.push(sessionStorage.getItem("boardId")!);
    } catch (err) {
      Toast.error("An error occured while redirecting you");
    }
    sessionStorage.clear();
  }

  if (props.history.location.state !== undefined && !sessionStorage.getItem("boardId")) {
    sessionStorage.setItem("boardId", (props.history.location.state as {from: {pathname: string}}).from.pathname);
  }

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
      <button onClick={handleLogin}>Join Board</button>
      <button onClick={onGoogleSignIn}>Sign in with Google</button>
      <button onClick={onGithubSignIn}>Sign in with Github</button>
      <button onClick={onMicrosoftSignIn}>Sign in with Microsoft</button>
    </div>
  );
}

export default LoginBoard;
