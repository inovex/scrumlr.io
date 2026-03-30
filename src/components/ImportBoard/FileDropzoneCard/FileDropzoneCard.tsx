import {useTranslation} from "react-i18next";
import {PlusIcon} from "components/Icon";
import {ChangeEvent, DragEvent, useRef} from "react";
import "./AddFileCard.scss";
import classNames from "classnames";

type FileDropzoneCardProps = {
  onFileSelect: (file: File) => void;
  disabled: boolean;
};

const isDragEvent = (event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>): event is DragEvent<HTMLDivElement> => "dataTransfer" in event;

export const FileDropzoneCard = (props: FileDropzoneCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {t} = useTranslation();

  const handleFileEvent = (event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if (isDragEvent(event)) {
      event.preventDefault();
      file = event.dataTransfer?.files?.[0] ?? null;
    } else {
      file = event.target.files?.[0] ?? null;
    }

    if (file) props.onFileSelect(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className={classNames("file-dropzone-card", {"file-dropzone-card--disabled": props.disabled})}
      role="button"
      tabIndex={props.disabled ? -1 : 0}
      onClick={() => !props.disabled && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleFileEvent}
      data-cy="file-dropzone-card"
      aria-disabled={props.disabled}
    >
      <PlusIcon className="file-dropzone-card__icon" />
      <input ref={fileInputRef} type="file" accept=".json" hidden onChange={handleFileEvent} className="file-dropzone-card__file-input" aria-label="Select JSON file" />
      <div className="file-dropzone-card__title">{t("ImportBoard.FileDropzoneCard.title")}</div>
    </div>
  );
};
