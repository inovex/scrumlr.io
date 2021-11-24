import Parse from "parse";
import {API} from "api";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {AccessPolicy} from "types/board";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {columnTemplates} from "./columnTemplates";

export var NewBoard = function() {
  const {t} = useTranslation();
  const navigate = useNavigate();
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
      navigate(`/board/${boardId}`);
    } else {
      Toast.error(t("NewBoard.createBoardError"));
    }
  }

  const isCreatedBoardDisabled = accessPolicy === AccessPolicy.ByPassphrase && !passphrase;

  return (
    <div>
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
    </div>
  );
}
