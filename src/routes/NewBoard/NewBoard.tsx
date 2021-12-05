import Parse from "parse";
import {API} from "api";
import "routes/NewBoard/NewBoard.scss";
import {Toast} from "utils/Toast";
import {useState} from "react";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {AccessPolicy} from "types/board";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {Link} from "react-router-dom";
import {columnTemplates} from "./columnTemplates";
import {TextInputLabel} from "../../components/TextInputLabel";
import {TextInput} from "../../components/TextInput";
import {Button} from "../../components/Button";
import {ScrumlrLogo} from "../../components/ScrumlrLogo";

export const NewBoard = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState<string | undefined>();
  const [columnTemplate, setColumnTemplate] = useState<string | undefined>(undefined);
  const [accessPolicy, setAccessPolicy] = useState(0);
  const [passphrase, setPassphrase] = useState("");
  const [extendedConfiguration, setExtendedConfiguration] = useState(false);

  async function onCreateBoard() {
    if (Parse.User.current()) {
      let additionalAccessPolicyOptions = {};
      if (accessPolicy === AccessPolicy.ByPassphrase && Boolean(passphrase)) {
        additionalAccessPolicyOptions = {
          passphrase,
        };
      }

      if (columnTemplate) {
        const boardId = await API.createBoard(
          boardName,
          {
            type: AccessPolicy[accessPolicy],
            ...additionalAccessPolicyOptions,
          },
          columnTemplates[columnTemplate].columns
        );
        navigate(`/board/${boardId}`);
      }
    } else {
      Toast.error(t("NewBoard.createBoardError"));
    }
  }

  const isCreatedBoardDisabled = !columnTemplate || (accessPolicy === AccessPolicy.ByPassphrase && !passphrase);

  return (
    <div className="new-board__wrapper">
      <div className="new-board">
        <div>
          <Link to="/">
            <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
          </Link>

          {!extendedConfiguration && (
            <div>
              <h1>{t("NewBoard.basicConfigurationTitle")}</h1>

              <div className="new-board__mode-selection">
                {Object.keys(columnTemplates).map((key) => (
                  <label key={key} className="new-board__mode">
                    <input className="new-board__mode-input" type="radio" name="mode" value={key} onChange={(e) => setColumnTemplate(e.target.value)} />
                    <div className="new-board__mode-label">
                      <div>
                        <div className="new-board__mode-name">{columnTemplates[key].name}</div>
                        <div className="new-board__mode-description">{columnTemplates[key].description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {extendedConfiguration && (
            <div>
              <h1>{t("NewBoard.extendedConfigurationTitle")}</h1>

              <TextInputLabel label={t("NewBoard.boardName")}>
                <TextInput onChange={(e) => setBoardName(e.target.value)} />
              </TextInputLabel>

              <AccessPolicySelection accessPolicy={accessPolicy} onAccessPolicyChange={setAccessPolicy} passphrase={passphrase} onPassphraseChange={setPassphrase} />
            </div>
          )}
        </div>

        <div className="new-board__actions">
          <Button className="new-board__action" onClick={onCreateBoard} color="primary" disabled={isCreatedBoardDisabled}>
            {t("NewBoard.createNewBoard")}
          </Button>
          {!extendedConfiguration && (
            <Button className="new-board__action" variant="outlined" color="primary" disabled={!columnTemplate} onClick={() => setExtendedConfiguration(true)}>
              {t("NewBoard.extendedConfigurationButton")}
            </Button>
          )}
          {extendedConfiguration && (
            <Button className="new-board__action" variant="outlined" color="primary" onClick={() => setExtendedConfiguration(false)}>
              {t("NewBoard.basicConfigurationButton")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
