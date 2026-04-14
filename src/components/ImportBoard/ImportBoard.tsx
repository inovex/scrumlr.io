import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch} from "store";
import {importBoard} from "store/features/board/thunks";
import {BoardImportData, CreateSessionAccessPolicy} from "store/features/board/types";
import {Portal} from "components/Portal";
import {AccessSettings} from "components/Templates/AccessSettings/AccessSettings";
import {Toast} from "utils/Toast";
import {SimpleModal} from "components/Templates";
import {WarningIcon} from "components/Icon";
import {FileDropzoneCard, FilePreview} from "components/ImportBoard";
import "./ImportBoard.scss";

type ImportStep = "file" | "access";

interface ImportBoardProps {
  onClose: () => void;
}
export const ImportBoard = ({onClose}: ImportBoardProps) => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<ImportStep>("file");
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [importData, setImportData] = useState<BoardImportData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);

  const readFile = (file: File) => {
    setIsFileLoading(true);
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const data = JSON.parse(content) as BoardImportData;
        setImportData(data);
        setFileName(file.name);
        setFileError(null);
      } catch (error) {
        // error due to invalid JSON format
        Toast.error({title: t("Toast.failedImport")});
        setFileError(t("ImportBoard.errorInvalid"));
        setFileName("");
        setImportData(null);
      } finally {
        // small artificial delay to give users visual feedback
        setTimeout(() => {
          setIsFileLoading(false);
        }, 500);
      }
    };

    // error due to file reading (e.g., file not found, permission denied, etc.)
    reader.onerror = () => {
      Toast.error({title: t("Toast.failedImport")});
      setFileError(t("ImportBoard.errorRead"));
      setFileName("");
      setImportData(null);
      setIsFileLoading(false);
    };

    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setImportData(null);
    setFileName("");
    setFileError(null);
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

    const updatedData: BoardImportData = {
      ...importData,
      board: {
        ...importData.board,
        accessPolicy: accessPolicy.policy,
        passphrase: accessPolicy.policy === "BY_PASSPHRASE" ? accessPolicy.passphrase : undefined,
      },
    };

    setImportData(updatedData);
    dispatch(importBoard(importData));
  };

  const handleCancel = () => {
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
          className="modal__import-board"
          title={t("ImportBoard.title")}
          secondaryButton={{
            label: t("ImportBoard.cancel"),
            onClick: handleCancel,
          }}
          primaryButton={{
            label: t("ImportBoard.continue"),
            onClick: handleContinue,
            disabled: !importData || isFileLoading,
          }}
        >
          <div className="import-board">
            {!importData ? <FileDropzoneCard onFileSelect={readFile} /> : <FilePreview state={isFileLoading ? "loading" : "ready"} name={fileName} onRemove={handleRemoveFile} />}

            {fileError && (
              <div className="import-board__error-container">
                <WarningIcon className="import-board__error-icon" />
                <p className="import-board__error-message">{fileError}</p>
              </div>
            )}
          </div>
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
