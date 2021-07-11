import * as React from "react";
import {RouteComponentProps} from "react-router";
import {getRandomName} from "constants/Name";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import {Toast} from "utils/Toast";

function LoginBoard(props: RouteComponentProps) {
  const [name, setName] = React.useState(getRandomName());
  function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  async function handleLogin() {
    await AuthenticationManager.signInAnonymously(name);
    try {
      props.history.push((props.history.location.state as {from: {pathname: string}}).from.pathname);
    } catch (err) {
      Toast.error("An error occured while redirecting you");
    }
  }

  return (
    <div className="login-board">
      <Input
        className="login-board__input"
        defaultValue={name}
        type="text"
        onChange={handleChangeName}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
        inputProps={{
          maxLength: 20,
        }}
      />
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
}

export default LoginBoard;
