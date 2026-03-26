import {useState, useRef, ChangeEvent, DragEvent} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch} from "store";
import {importBoard} from "store/features/board/thunks";
import {BoardImportData, CreateSessionAccessPolicy} from "store/features/board/types";
import {Portal} from "components/Portal";
import {AccessSettings} from "components/Templates/AccessSettings/AccessSettings";
import {CheckDoneIcon} from "components/Icon";
import {Toast} from "utils/Toast";
import classNames from "classnames";
import {SimpleModal} from "components/Templates";
import "./ImportBoard.scss";

type ImportStep = "file" | "access";

interface ImportBoardProps {
  onClose: () => void;
}
const isDragEvent = (event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>): event is DragEvent<HTMLDivElement> => "dataTransfer" in event;

export const ImportBoard = ({onClose}: ImportBoardProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<ImportStep>("file");
  const [importData, setImportData] = useState<BoardImportData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileEvent = (event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if (isDragEvent(event)) {
      event.preventDefault();
      file = event.dataTransfer?.files?.[0] || null;
    } else {
      file = event.target.files?.[0] || null;
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const data = JSON.parse(content) as BoardImportData;
        setImportData(data);
        setFileName(file.name);
        setFileError(null);
      } catch (error) {
        Toast.error({title: t("Toast.failedImport")});
        setFileError(t("ImportBoard.errorInvalid"));
        setFileName("");
        setImportData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleContinue = () => {
    if (importData) {
      setStep("access");
    }
  };

  const handleBack = () => {
    setStep("file");
  };

  const handleSelectAccessPolicy = (accessPolicy: CreateSessionAccessPolicy) => {
    if (!importData) return;

    const updatedData: BoardImportData = JSON.parse(JSON.stringify(importData));
    updatedData.board.accessPolicy = accessPolicy.policy;

    if (accessPolicy.policy === "BY_PASSPHRASE" && "passphrase" in accessPolicy) {
      updatedData.board.passphrase = accessPolicy.passphrase;
    } else {
      delete updatedData.board.passphrase;
    }

    dispatch(importBoard(JSON.stringify(updatedData)));
  };

  const handleCancel = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStep("file");
    setImportData(null);
    setFileName("");
    setFileError(null);
    onClose();
  };

  if (step === "file") {
    return (
      <Portal className="import-board__portal" align="center" closeMode="backdrop" onClose={handleCancel} backdrop="blur" hiddenOverflow disabledPadding>
        <SimpleModal
          className="import-board"
          title={t("ImportBoard.title")}
          secondaryButton={{
            label: t("ImportBoard.cancel"),
            onClick: handleCancel,
          }}
          primaryButton={{
            label: t("ImportBoard.continue"),
            onClick: handleContinue,
            disabled: !importData,
          }}
        >
          <main className="import-board__main">
            <div
              className={classNames("import-board__dropzone", {
                "import-board__dropzone--has-file": !!importData,
              })}
              onDragOver={handleDragOver}
              onDrop={handleFileEvent}
            >
              {!importData ? (
                <>
                  <p className="import-board__dropzone-text">{t("ImportBoard.dropzone")}</p>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileEvent} className="import-board__file-input" aria-label="Select JSON file" />
                  <button className="import-board__browse-button" onClick={() => fileInputRef.current?.click()} type="button">
                    {t("ImportBoard.button")}
                  </button>
                </>
              ) : (
                <div className="import-board__file-success">
                  <CheckDoneIcon className="import-board__success-icon" />
                  <span className="import-board__file-name">
                    {t("ImportBoard.successPrefix")} {fileName}
                  </span>
                </div>
              )}
            </div>

            {fileError && <p className="import-board__error-message">{fileError}</p>}
          </main>
        </SimpleModal>
      </Portal>
    );
  }

  return (
    <Portal className="import-board__portal" align="center" closeMode="backdrop" onClose={handleCancel} backdrop="blur" hiddenOverflow disabledPadding>
      <AccessSettings onCancel={handleBack} onSelectSessionPolicy={handleSelectAccessPolicy} cancelLabel={t("ImportBoard.back")} confirmLabel={t("ImportBoard.openBoard")} />
    </Portal>
  );
};
