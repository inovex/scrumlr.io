import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {getRandomName} from "constants/name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";
import {useEffect, useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {AppInfo} from "components/AppInfo";
import {columnTemplates} from "./columnTemplates";

export function NewBoard(props: RouteComponentProps) {
  const [displayName, setDisplayName] = useState(getRandomName());
  const [boardName, setBoardName] = useState("Board Name");
  const [columnTemplate, setColumnTemplate] = useState("Lean Coffee");
  const [joinConfirmationRequired, setJoinConfirmationRequired] = useState(false);

  async function onCreateBoard() {
    if (Parse.User.current()) {
      const boardId = await API.createBoard(boardName, joinConfirmationRequired, columnTemplates[columnTemplate]);
      props.history.push(`/board/${boardId}`);
    } else {
      Toast.error("You must be logged in to create a board. Reload the page and try again");
    }
  }

  async function onAnonymousLogin() {
    await AuthenticationManager.signInAnonymously(displayName);
    await onCreateBoard();
  }

  async function onLogout() {
    await Parse.User.logOut();
    props.history.push("/");
  }

  useEffect(() => {
    if (localStorage.getItem("Parse/Scrumlr/currentUser")) {
      setDisplayName(JSON.parse(localStorage.getItem("Parse/Scrumlr/currentUser")!).displayName);
    }
  }, []);

  if (Parse.User.current()) {
    return (
      <div>
        <p>User: {displayName}</p>
        <input className="new-board__input" defaultValue={boardName} type="text" onChange={(e) => setBoardName(e.target.value)} />
        <label>
          <input type="checkbox" checked={joinConfirmationRequired} onChange={(e) => setJoinConfirmationRequired(e.target.checked)} />
          JoinConfirmationRequired
        </label>
        <select onChange={(e) => setColumnTemplate(e.target.value)} defaultValue={columnTemplate}>
          {Object.keys(columnTemplates).map((key) => (
            <option value={key}>{key}</option>
          ))}
        </select>
        <button onClick={onCreateBoard}>Create new Board</button>
        <button onClick={onLogout}>Logout</button>

        <AppInfo />
      </div>
    );
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
          if (!Parse.User.current()) await onAnonymousLogin();
        }}
      >
        Create new board anonymously
      </button>
      <LoginProviders />

      <AppInfo />
    </div>
  );
}
