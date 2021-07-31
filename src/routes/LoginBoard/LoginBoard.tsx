import * as React from "react";
import {RouteComponentProps} from "react-router";
import {getRandomName} from "constants/Name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {Toast} from "utils/Toast";

function LoginBoard(props: RouteComponentProps) {
  const [displayName, setDisplayName] = React.useState(getRandomName());

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
    </div>
  );
}

export default LoginBoard;
