import * as React from "react";
import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {getRandomName} from "constants/name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import {Color} from "constants/colors";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";

export type NewBoardProps = RouteComponentProps;

function NewBoard(props: NewBoardProps) {
  const columnTemplates: {[key: string]: {name: string; hidden: boolean; color: Color}[]} = {
    "Positive/Negative/Actions": [
      {name: "Positive", hidden: false, color: "backlog-blue"},
      {name: "Negative", hidden: false, color: "lean-lilac"},
      {name: "Actions", hidden: false, color: "planning-pink"},
    ],
    "Mad/Sad/Glad": [
      {name: "Mad", hidden: false, color: "online-orange"},
      {name: "Sad", hidden: false, color: "retro-red"},
      {name: "Glad", hidden: false, color: "poker-purple"},
    ],
    "Start/Stop/Continue": [
      {name: "Start", hidden: false, color: "grooming-green"},
      {name: "Stop", hidden: false, color: "retro-red"},
      {name: "Continue", hidden: false, color: "backlog-blue"},
    ],
    "KALM (Keep/Add/Less/More": [
      {name: "Keep", hidden: false, color: "grooming-green"},
      {name: "Add", hidden: false, color: "retro-red"},
      {name: "Less", hidden: false, color: "backlog-blue"},
      {name: "More", hidden: false, color: "poker-purple"},
    ],
  };

  const [displayName, setDisplayName] = React.useState(getRandomName());
  const [boardName, setBoardName] = React.useState("BoardName");
  const [columnTemplate, setColumnTemplate] = React.useState("Positive/Negative/Actions");
  const [joinConfirmationRequired, setJoinConfirmationRequired] = React.useState(false);

  async function onCreateBoard() {
    if (Parse.User.current()) {
      const boardId = await API.createBoard(boardName, joinConfirmationRequired, columnTemplates[columnTemplate]);
      props.history.push(`/board/${boardId}`);
    } else {
      Toast.error("You must be logged in to create a board. Reload the page and try again");
    }
  }

  async function onLogin() {
    await AuthenticationManager.signInAnonymously(displayName);
  }

  return (
    <div className="new-board">
      {!Parse.User.current() && <input className="new-board__input" defaultValue={displayName} type="text" onChange={(e) => setDisplayName(e.target.value)} maxLength={20} />}
      <input className="new-board__input" defaultValue={boardName} type="text" onChange={(e) => setBoardName(e.target.value)} />
      <label>
        <input type="checkbox" checked={joinConfirmationRequired} onChange={(e) => setJoinConfirmationRequired(e.target.checked)} />
        JoinConfirmationRequired
      </label>

      <select onChange={(e) => setColumnTemplate(e.target.value)} defaultValue={columnTemplate}>
        {Object.keys(columnTemplates).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      <button
        onClick={async () => {
          if (!Parse.User.current()) await onLogin();
          onCreateBoard();
        }}
      >
        Create new Board
      </button>
    </div>
  );
}

export default NewBoard;
