import {API} from "api";
import {useState} from "react";
import {AccessPolicy} from "types/board";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {TextInputLabel} from "components/TextInputLabel";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {TextInput} from "components/TextInput";
import {Button} from "components/Button";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {legacyColumnTemplates} from "./legacyColumnTemplates";
import "./LegacyNewBoard.scss";

export const LegacyNewBoard = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState<string | undefined>();
  const [columnTemplate, setColumnTemplate] = useState<string | undefined>(undefined);
  const [accessPolicy, setAccessPolicy] = useState(0);
  const [passphrase, setPassphrase] = useState("");
  const [extendedConfiguration, setExtendedConfiguration] = useState(false);

  async function onCreateBoard() {
    let additionalAccessPolicyOptions = {};
    if (accessPolicy === AccessPolicy.BY_PASSPHRASE && Boolean(passphrase)) {
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
        legacyColumnTemplates[columnTemplate].columns
      );
      navigate(`/board/${boardId}`);
    }
  }

  const isCreatedBoardDisabled = !columnTemplate || (accessPolicy === AccessPolicy.BY_PASSPHRASE && !passphrase);

  return (
    <div className="new-board__wrapper">
      <div className="new-board">
        <div>
          <a href="/" aria-label="Homepage">
            <ScrumlrLogo />
          </a>

          {!extendedConfiguration && (
            <div>
              <h1>{t("LegacyNewBoard.basicConfigurationTitle")}</h1>

              <div className="new-board__mode-selection">
                {Object.keys(legacyColumnTemplates).map((key) => (
                  <label key={key} className="new-board__mode">
                    <input
                      className="new-board__mode-input"
                      type="radio"
                      name="mode"
                      value={key}
                      onChange={(e) => setColumnTemplate(e.target.value)}
                      checked={columnTemplate === key}
                    />
                    <div className="new-board__mode-label">
                      <div>
                        <div className="new-board__mode-name">{legacyColumnTemplates[key].name}</div>
                        <div className="new-board__mode-description">{legacyColumnTemplates[key].description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {extendedConfiguration && (
            <div>
              <h1>{t("LegacyNewBoard.extendedConfigurationTitle")}</h1>

              <TextInputLabel label={t("LegacyNewBoard.boardName")}>
                <TextInput onChange={(e) => setBoardName(e.target.value)} />
              </TextInputLabel>

              <AccessPolicySelection accessPolicy={accessPolicy} onAccessPolicyChange={setAccessPolicy} passphrase={passphrase} onPassphraseChange={setPassphrase} />
            </div>
          )}
        </div>
      </div>
      <div className="new-board__actions">
        <Button className="new-board__action" onClick={onCreateBoard} color="primary" disabled={isCreatedBoardDisabled}>
          {t("LegacyNewBoard.createNewBoard")}
        </Button>
        {!extendedConfiguration && (
          <Button className="new-board__action" variant="outlined" color="primary" disabled={!columnTemplate} onClick={() => setExtendedConfiguration(true)}>
            {t("LegacyNewBoard.extendedConfigurationButton")}
          </Button>
        )}
        {extendedConfiguration && (
          <Button className="new-board__action" variant="outlined" color="primary" onClick={() => setExtendedConfiguration(false)}>
            {t("LegacyNewBoard.basicConfigurationButton")}
          </Button>
        )}
      </div>
    </div>
  );
};
