import {CheckDoneIcon, CloseIcon, FileJsonIcon} from "components/Icon";
import "./FilePreview.scss";

type FileState = "loading" | "ready";

type FilePreviewProps = {
  name: string;
  state: FileState;

  onRemove: () => void;
};

// file preview currently only supports one file, could be extended if needed
export const FilePreview = (props: FilePreviewProps) => (
    <div className="file-preview">
      <div className="file-preview__file">
        <div className="file-preview__file-icon-container">
          <FileJsonIcon className="file-preview__file-icon" />
        </div>
        <div className="file-preview__file-info">
          <div className="file-preview__file-name">{props.name}</div>
          <div className="file-preview__file-state">{props.state}</div>
        </div>
        <button className="file-preview__file-remove-button" onClick={props.onRemove}>
          <CloseIcon className="file-preview__file-remove-icon" />
        </button>
      </div>
    </div>
  );
