import {CheckDoneIcon, CloseIcon, FileJsonIcon} from "components/Icon";
import {useTranslation} from "react-i18next";
import {Tooltip} from "components/Tooltip";
import {useId} from "react";
import "./FilePreview.scss";

export type FileState = "loading" | "ready";

type FilePreviewProps = {
  name: string;
  state: FileState;

  onRemove: () => void;
};

// file preview currently only supports one file, could be extended if needed
export const FilePreview = (props: FilePreviewProps) => {
  const {t} = useTranslation();

  const baseId = useId();
  const anchor = `file-preview-${baseId}`;

  return (
    <div className="file-preview">
      <div className="file-preview__file">
        <div className="file-preview__file-icon-container">
          <FileJsonIcon className="file-preview__file-icon" />
        </div>
        <div className="file-preview__file-info">
          <div className="file-preview__file-name">{props.name}</div>
          <div className="file-preview__file-state">
            {props.state === "loading" && <span className="file-preview__file-state-text">{t("ImportBoard.FilePreview.loadingState")}</span>}
            {props.state === "ready" && (
              <>
                <div className="file-preview__file-state-ready-icon-container">
                  <CheckDoneIcon className="file-preview__file-state-ready-icon" />
                </div>
                <span className="file-preview__file-state-text">{t("ImportBoard.FilePreview.uploadedState")}</span>
              </>
            )}
          </div>
        </div>
        <button id={anchor} className="file-preview__file-remove-button" onClick={props.onRemove} data-cy="file-preview__file-remove-button">
          <CloseIcon className="file-preview__file-remove-icon" />
          <Tooltip anchorId={anchor} color="backlog-blue">
            {t("ImportBoard.FilePreview.removeFile")}
          </Tooltip>
        </button>
      </div>
    </div>
  );
};
