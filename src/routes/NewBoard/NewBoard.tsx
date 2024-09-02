import {API} from "api";
import "routes/NewBoard/NewBoard.scss";
import React, {useRef, useState} from "react";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {AccessPolicy} from "types/board";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {TextInputLabel} from "components/TextInputLabel";
import {TextInput} from "components/TextInput";
import {Button} from "components/Button";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {Column} from "types/column";
import {Note} from "types/note";
import {Participant} from "types/participant";
import {Voting} from "types/voting";
import {PassphraseModal} from "components/PassphraseDialog/PassphraseModal/PassphraseModal";
import {columnTemplates} from "./columnTemplates";

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
  const [loadedFile, setFile] = useState<File>();
  const [completeBoard, setImportBoard] = useState<BoardContent>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ImportBoardRequest = {
    name: string;
    description?: string;
    accessPolicy: string;
    passphrase?: string;
  };

  type BoardContent = {
    board: ImportBoardRequest;
    columns: Column[];
    notes: Note[];
    participants: Participant;
    votings: Voting;
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const closeModal = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowPasswordModal(false);
    setPassphrase("");
  };

  const handleFileEvent = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ("dataTransfer" in event) {
      event.preventDefault();
      file = event.dataTransfer?.files?.[0] || null;
    } else if ("target" in event) {
      file = event.target.files?.[0] || null;
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      try {
        const data = JSON.parse(content) as BoardContent;
        const board: BoardContent = {
          board: {
            name: data.board.name,
            description: data.board.description,
            accessPolicy: data.board.accessPolicy,
          },
          columns: data.columns,
          notes: data.notes,
          participants: data.participants,
          votings: data.votings,
        };
        if (board.board.accessPolicy === "BY_PASSPHRASE") {
          setShowPasswordModal(true);
          setAccessPolicy(1);
        }
        setImportBoard(board);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    setFile(file);
    reader.readAsText(file);
  };

  const onImportBoard = async () => {
    if (completeBoard && accessPolicy === AccessPolicy.BY_PASSPHRASE && passphrase) {
      completeBoard.board.passphrase = passphrase;
    }

    const boardId = await API.importBoard(JSON.stringify(completeBoard));
    navigate(`/board/${boardId}`);
  };

  const handlePasswordSubmit = (password: string, newAccessPolicy: AccessPolicy) => {
    if (newAccessPolicy !== accessPolicy) {
      if (completeBoard) {
        completeBoard.board.accessPolicy = AccessPolicy[newAccessPolicy];
      }
    }

    setPassphrase(password);
    setShowPasswordModal(false); // Close the modal
    // Continue the method after password is set
    onImportBoard();
  };

  const onCreateBoard = async () => {
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
  };

  const isCreatedBoardDisabled = !columnTemplate || (accessPolicy === AccessPolicy.BY_PASSPHRASE && !passphrase);
  const isImportBoardDisabled = !(loadedFile && loadedFile.size > 0) || accessPolicy === AccessPolicy.BY_PASSPHRASE;

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
                  <input
                    className="new-board__mode-input"
                    type="file"
                    name="mode"
                    ref={fileInputRef}
                    onClick={() => {
                      setImportFileConfiguration(true);
                      setColumnTemplate(undefined);
                    }}
                    onChange={(event) => handleFileEvent(event)}
                  />
                  <div
                    className="new-board__mode-label"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(event) => {
                      setImportFileConfiguration(true);
                      handleFileEvent(event);
                    }}
                  >
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
          <Button className="new-board__action" onClick={onImportBoard} color="primary" disabled={isImportBoardDisabled}>
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
      {showPasswordModal && <PassphraseModal onPassphraseChange={setPassphrase} passphrase={passphrase} onSubmit={handlePasswordSubmit} onClose={closeModal} />}
    </div>
  );
};
