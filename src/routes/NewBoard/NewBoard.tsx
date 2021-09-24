import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {getRandomName} from "constants/Name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import {Color} from "constants/colors";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";
import {useEffect, useState} from "react";

export const onGoogleSignIn = async () => {
  window.location.href = await API.signInWithGoogle(); // redirectURI: https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount...
};
export const onGithubSignIn = async () => {
  window.location.href = await API.signInWithGithub(); // redirectURI: https://github.com/login/oauth/authorize...
};
export const onMicrosoftSignIn = async () => {
  window.location.href = await API.signInWithMicrosoft(); // redirectURI https://login.microsoftonline.com/common/oauth2/v2.0/authorize..
};

function NewBoard(props: RouteComponentProps) {
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

  const [displayName, setDisplayName] = useState(getRandomName());
  const [boardName, setBoardName] = useState("Board Name");
  const [columnTemplate, setColumnTemplate] = useState("Positive/Negative/Actions");
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
          <option value={key}>{key}</option>
        ))}
      </select>

      <button
        onClick={async () => {
          if (!Parse.User.current()) await onAnonymousLogin();
        }}
      >
        Create new board anonymously
      </button>
      <button onClick={onGoogleSignIn}>SignIn with Google </button>
      <button onClick={onGithubSignIn}>SignIn with Github</button>
      <button onClick={onMicrosoftSignIn}>SignIn with Microsoft</button>
    </div>
  );
}

export default NewBoard;
