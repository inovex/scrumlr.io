import * as React from "react";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import getRandomName from "constants/Name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import {getColorForIndex} from "constants/colors";

function NewBoard(props: RouteComponentProps) {
  const [name, setName] = React.useState(getRandomName());
  function handleChangeName(e: any) {
    const name = (e.target as HTMLInputElement).value;
    setName(name);
  }

  async function onAnonymousLogin() {
    await AuthenticationManager.signInAnonymously(name);
    await onCreateBoard();
  }

  async function onLogout() {
    await Parse.User.logOut();
    props.history.push("/");
  }

  async function onGoogleSignIn() {
    const redirectURI = await API.signInWithGoogle();
    window.location.href = redirectURI;
  }

  async function onCreateBoard() {
    if (Parse.User.current()) {
      const boardId = await API.createBoard([
        {name: "Positive", hidden: false, color: getColorForIndex(0)},
        {name: "Negative", hidden: false, color: getColorForIndex(1)},
        {name: "Actions", hidden: true, color: getColorForIndex(2)},
      ]);
      props.history.push(`/board/${boardId}`);
    }
    // TODO report error
  }

  if (Parse.User.current()) {
    return (
      <div>
        <Button onClick={onCreateBoard}>Create Board</Button>
        <Button onClick={onLogout}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="new-board">
      <Input
        className="new-board__input"
        defaultValue={name}
        type="text"
        onChange={handleChangeName}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            onAnonymousLogin();
          }
        }}
        inputProps={{
          maxLength: 20,
        }}
      />
      <Button onClick={onAnonymousLogin}>Login</Button>
      <Button onClick={onGoogleSignIn}>Sign in with Google</Button>
    </div>
  );
}

export default NewBoard;
