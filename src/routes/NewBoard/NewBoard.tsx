import {API} from "api";
import "routes/NewBoard/NewBoard.scss";
import {DragEvent, useState} from "react";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {AccessPolicy, Board} from "types/board";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {columnTemplates} from "./columnTemplates";
import {TextInputLabel} from "../../components/TextInputLabel";
import {TextInput} from "../../components/TextInput";
import {Button} from "../../components/Button";
import {ScrumlrLogo} from "../../components/ScrumlrLogo";
import {PassphraseDialog} from "../../components/PassphraseDialog";

export const NewBoard = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState<string | undefined>();
  const [columnTemplate, setColumnTemplate] = useState<string | undefined>(undefined);
  const [accessPolicy, setAccessPolicy] = useState(0);
  const [passphrase, setPassphrase] = useState("");
  const [extendedConfiguration, setExtendedConfiguration] = useState(false);
  const [importFile, setImportFileConfiguration] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [fileContent, setFileContent] = useState<string>();
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.dataTransfer) return;

    // Fetch the files
    const droppedFile = event.dataTransfer.files[0];

    // Use FileReader to read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      // The file's text will be available in e.target.result
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(droppedFile); // You can use other methods like readAsDataURL, readAsArrayBuffer, etc., based on your needs
    if (!fileContent) return;
    const obj = JSON.parse(fileContent) as Board;
    console.log(obj);
    if (obj.accessPolicy == "BY_PASSPHRASE") {
      console.log("trest");
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setPassphrase(password);
    onCreateBoard(); // Continue the method after password is set
  };

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
        columnTemplates[columnTemplate].columns
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
            <ScrumlrLogo accentColorClassNames={["accent-color--blue", "accent-color--purple", "accent-color--lilac", "accent-color--pink"]} />
          </a>

          {!extendedConfiguration && (
            <div>
              <h1>{t("NewBoard.basicConfigurationTitle")}</h1>

              <div className="new-board__mode-selection">
                {Object.keys(columnTemplates).map((key) => (
                  <label key={key} className="new-board__mode">
                    <input
                      className="new-board__mode-input"
                      type="radio"
                      name="mode"
                      value={key}
                      onChange={(e) => setColumnTemplate(e.target.value)}
                      checked={columnTemplate === key}
                      onClick={() => setImportFileConfiguration(false)}
                    />
                    <div className="new-board__mode-label">
                      <div>
                        <div className="new-board__mode-name">{columnTemplates[key].name}</div>
                        <div className="new-board__mode-description">{columnTemplates[key].description}</div>
                      </div>
                    </div>
                  </label>
                ))}
                <label className="new-board__mode">
                  <input className="new-board__mode-input" type="radio" name="mode" onClick={() => setImportFileConfiguration(true)} />
                  <div className="new-board__mode-label" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <div>
                      <div className="new-board__mode-name">{t("NewBoard.importBoard")}</div>
                      <div className="new-board__mode-description">{t("NewBoard.uploadFile")}</div>
                    </div>
                  </div>
                </label>
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
      </div>
      <div className="new-board__actions">
        {!importFile ? (
          <Button className="new-board__action" onClick={onCreateBoard} color="primary" disabled={isCreatedBoardDisabled}>
            {t("NewBoard.createNewBoard")}
          </Button>
        ) : (
          <Button className="new-board__action" onClick={onCreateBoard} color="primary" disabled={isCreatedBoardDisabled}>
            {t("NewBoard.importNewBoard")}
          </Button>
        )}

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
      {showPasswordModal && (
        <PassphraseDialog onSubmit={handlePasswordSubmit} incorrectPassphrase={false} />
        // <PasswordModal
        //   onClose={() => setShowPasswordModal(false)}
        //   onSubmit={handlePasswordSubmit}
        // />
      )}
    </div>
  );
};
