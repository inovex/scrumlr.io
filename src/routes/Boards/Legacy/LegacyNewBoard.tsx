import {API} from "api";
import React, {useRef, useState} from "react";
import {AccessPolicy, BoardImportData} from "store/features/board/types";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {useAppDispatch} from "store";
import {importBoard} from "store/features";
import {Toast} from "utils/Toast";
import {AccessPolicySelection} from "components/AccessPolicySelection";
import {TextInputLabel} from "components/TextInputLabel";
import {TextInput} from "components/TextInput";
import {LegacyButton} from "components/Button";
import {ScrumlrLogo} from "components/ScrumlrLogo";
import {PassphraseModal} from "components/PassphraseDialog/PassphraseModal/PassphraseModal";
import {legacyColumnTemplates} from "./legacyColumnTemplates";
import "./LegacyNewBoard.scss";

export const LegacyNewBoard = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState<string | undefined>();
  const [columnTemplate, setColumnTemplate] = useState<string | undefined>(undefined);
  const [accessPolicy, setAccessPolicy] = useState<AccessPolicy>("PUBLIC");
  const [passphrase, setPassphrase] = useState("");
  const [extendedConfiguration, setExtendedConfiguration] = useState(false);
  const [importFile, setImportFileConfiguration] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loadedFile, setFile] = useState<File>();
  const [completeBoard, setImportBoard] = useState<BoardImportData>();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFile(new File([], ""));
    setAccessPolicy("PUBLIC");
    setPassphrase("");
    setShowPasswordModal(false);
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
        const data = JSON.parse(content) as BoardImportData;
        if (data.board.accessPolicy === "BY_PASSPHRASE") {
          setShowPasswordModal(true);
          setAccessPolicy("BY_PASSPHRASE");
        }
        setImportBoard(data);
      } catch (error) {
        Toast.error({title: t("Toast.failedImport")});
        setFile(new File([], ""));
      }
    };
    setFile(file);
    reader.readAsText(file);
  };

  const onImportBoard = () => {
    if (completeBoard && accessPolicy === "BY_PASSPHRASE" && passphrase) {
      completeBoard.board.passphrase = passphrase;
    }
    dispatch(importBoard(JSON.stringify(completeBoard)));
  };

  const handlePasswordSubmit = (password: string, newAccessPolicy: AccessPolicy) => {
    if (newAccessPolicy !== accessPolicy) {
      if (completeBoard) {
        completeBoard.board.accessPolicy = newAccessPolicy;
      }
    }

    setPassphrase(password);
    setShowPasswordModal(false); // Close the modal
    // Continue the method after password is set
    onImportBoard();
  };

  const onCreateBoard = async () => {
    let additionalAccessPolicyOptions = {};
    if (accessPolicy === "BY_PASSPHRASE" && Boolean(passphrase)) {
      additionalAccessPolicyOptions = {
        passphrase,
      };
    }

    if (columnTemplate) {
      // todo: use thunk instead
      const boardId = await API.createBoard(
        boardName,
        {
          type: accessPolicy,
          ...additionalAccessPolicyOptions,
        },
        legacyColumnTemplates[columnTemplate].columns
      );
      navigate(`/board/${boardId}`);
    }
  };

  const isCreatedBoardDisabled = !columnTemplate || (accessPolicy === "BY_PASSPHRASE" && !passphrase);
  const isImportBoardDisabled = !(loadedFile && loadedFile.size > 0) || accessPolicy === "BY_PASSPHRASE";
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
                      onClick={() => setImportFileConfiguration(false)}
                    />
                    <div className="new-board__mode-label">
                      <div>
                        <div className="new-board__mode-name">{legacyColumnTemplates[key].name}</div>
                        <div className="new-board__mode-description">{legacyColumnTemplates[key].description}</div>
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
                      <div className="new-board__mode-name">{t("LegacyNewBoard.importBoard")}</div>
                      <div className="new-board__mode-description">{t("LegacyNewBoard.uploadFile")}</div>
                    </div>
                  </div>
                </label>
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
        {!importFile ? (
          <LegacyButton className="new-board__action" onClick={onCreateBoard} color="primary" disabled={isCreatedBoardDisabled}>
            {t("LegacyNewBoard.createNewBoard")}
          </LegacyButton>
        ) : (
          <LegacyButton className="new-board__action" onClick={onImportBoard} color="primary" disabled={isImportBoardDisabled}>
            {t("LegacyNewBoard.importNewBoard")}
          </LegacyButton>
        )}
        {!extendedConfiguration && (
          <LegacyButton className="new-board__action" variant="outlined" color="primary" disabled={!columnTemplate} onClick={() => setExtendedConfiguration(true)}>
            {t("LegacyNewBoard.extendedConfigurationButton")}
          </LegacyButton>
        )}
        {extendedConfiguration && (
          <LegacyButton className="new-board__action" variant="outlined" color="primary" onClick={() => setExtendedConfiguration(false)}>
            {t("LegacyNewBoard.basicConfigurationButton")}
          </LegacyButton>
        )}
      </div>
      {showPasswordModal && <PassphraseModal onPassphraseChange={setPassphrase} passphrase={passphrase} onSubmit={handlePasswordSubmit} onClose={closeModal} />}
    </div>
  );
};
