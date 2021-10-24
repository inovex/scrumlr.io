import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {getRandomName} from "constants/name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import {Color} from "constants/colors";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";
import {useEffect, useState} from "react";
import {LoginProviders} from "components/LoginProviders";

export function NewBoard(props: RouteComponentProps) {
  const columnTemplates: {[key: string]: {name: string; hidden: boolean; color: Color}[]} = {
    "Lean Coffee": [
      {name: "Lean Coffee", hidden: false, color: "grooming-green"},
      {name: "Actions", hidden: true, color: "backlog-blue"},
    ],
    "Positive/Negative": [
      {name: "Positive", hidden: false, color: "backlog-blue"},
      {name: "Negative", hidden: false, color: "lean-lilac"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
    "Start/Stop/Continue": [
      {name: "Start", hidden: false, color: "grooming-green"},
      {name: "Stop", hidden: false, color: "retro-red"},
      {name: "Continue", hidden: false, color: "backlog-blue"},
    ],
    "Mad/Sad/Glad": [
      {name: "Mad", hidden: false, color: "online-orange"},
      {name: "Sad", hidden: false, color: "retro-red"},
      {name: "Glad", hidden: false, color: "poker-purple"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
    "KALM (Keep/Add/Less/More)": [
      {name: "Keep", hidden: false, color: "grooming-green"},
      {name: "Add", hidden: false, color: "retro-red"},
      {name: "Less", hidden: false, color: "backlog-blue"},
      {name: "More", hidden: false, color: "poker-purple"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
    "Plus & Delta": [
      {name: "Plus", hidden: false, color: "backlog-blue"},
      {name: "Delta", hidden: false, color: "lean-lilac"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
    "4L (Liked, Learned, Lacked, Longed for)": [
      {name: "Liked", hidden: false, color: "grooming-green"},
      {name: "Learned", hidden: false, color: "retro-red"},
      {name: "Lacked", hidden: false, color: "backlog-blue"},
      {name: "Longed for", hidden: false, color: "poker-purple"},
      {name: "Actions", hidden: true, color: "planning-pink"},
    ],
  };

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
    </div>
  );
}
