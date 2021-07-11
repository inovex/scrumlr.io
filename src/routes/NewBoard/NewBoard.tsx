import * as React from "react";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {getRandomName} from "constants/Name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import {getColorForIndex} from "constants/colors";

export type NewBoardProps = RouteComponentProps;

function NewBoard(props: NewBoardProps) {
  const [name, setName] = React.useState(getRandomName());
  function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
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

  async function onLogin() {
    await AuthenticationManager.signInAnonymously(name);
    await onCreateBoard();
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
            onLogin();
          }
        }}
        inputProps={{
          maxLength: 20,
        }}
      />
      <Button onClick={onLogin}>Login</Button>
    </div>
  );
}

export default NewBoard;
