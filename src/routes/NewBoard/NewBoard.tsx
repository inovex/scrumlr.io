import {AuthenticationManager} from "utils/authentication/AuthenticationManager";
import {getRandomName} from "constants/name";
import {RouteComponentProps} from "react-router";
import Parse from "parse";
import {API} from "api";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";
import {useEffect, useState} from "react";
import {LoginProviders} from "components/LoginProviders";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {AccessPolicy} from "types/board";
import {AppInfo} from "components/AppInfo";
import {useTranslation} from "react-i18next";
import {columnTemplates} from "./columnTemplates";

export function NewBoard(props: RouteComponentProps) {
  const {t} = useTranslation();

  const [displayName, setDisplayName] = useState(getRandomName());
  const [boardName, setBoardName] = useState("Board Name");
  const [columnTemplate, setColumnTemplate] = useState("Lean Coffee");
  const [accessPolicy, setAccessPolicy] = useState(0);
  const [passphrase, setPassphrase] = useState("");

  async function onCreateBoard() {
    if (Parse.User.current()) {
      let additionalAccessPolicyOptions = {};
      if (accessPolicy === AccessPolicy.ByPassphrase && Boolean(passphrase)) {
        additionalAccessPolicyOptions = {
          passphrase,
        };
      }

      const boardId = await API.createBoard(
        boardName,
        {
          type: AccessPolicy[accessPolicy],
          ...additionalAccessPolicyOptions,
        },
        columnTemplates[columnTemplate]
      );
      props.history.push(`/board/${boardId}`);
    } else {
      Toast.error(t("NewBoard.createBoardError"));
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

  const isCreatedBoardDisabled = accessPolicy === AccessPolicy.ByPassphrase && !passphrase;

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

        <AccessPolicySelection accessPolicy={accessPolicy} onAccessPolicyChange={setAccessPolicy} passphrase={passphrase} onPassphraseChange={setPassphrase} />

        <select onChange={(e) => setColumnTemplate(e.target.value)} defaultValue={columnTemplate}>
          {Object.keys(columnTemplates).map((key) => (
            <option value={key}>{key}</option>
          ))}
        </select>
        <button onClick={onCreateBoard} disabled={isCreatedBoardDisabled}>
          {t("NewBoard.createNewBoard")}
        </button>
        <button onClick={onLogout}>{t("NewBoard.logout")}</button>
        <AppInfo />
      </div>
    );
  }

  return (
    <div className="new-board">
      {!Parse.User.current() && <input className="new-board__input" defaultValue={displayName} type="text" onChange={(e) => setDisplayName(e.target.value)} maxLength={20} />}
      <input className="new-board__input" defaultValue={boardName} type="text" onChange={(e) => setBoardName(e.target.value)} />
      <AccessPolicySelection accessPolicy={accessPolicy} onAccessPolicyChange={setAccessPolicy} passphrase={passphrase} onPassphraseChange={setPassphrase} />

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
        disabled={isCreatedBoardDisabled}
      >
        {t("NewBoard.createNewBoardAnonymous")}
      </button>
      <LoginProviders />

      <AppInfo />
    </div>
  );
}
