import {useTranslation} from "react-i18next";
import {PlusIcon} from "components/Icon";
import {ChangeEvent, DragEvent, useRef, useState} from "react";
import classNames from "classnames";
import "components/ImportBoard/FileDropzoneCard/FileDropzoneCard.scss";

type FileDropzoneCardProps = {
  onFileSelect: (file: File) => void;
};

const isDragEvent = (event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>): event is DragEvent<HTMLDivElement> => "dataTransfer" in event;

export const FileDropzoneCard = (props: FileDropzoneCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);

  const {t} = useTranslation();

  const handleFileEvent = (event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
    let file: File | null;
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
    setIsDraggingOverDropzone(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOverDropzone(false);
  };

  return (
    <div
      className={classNames("file-dropzone-card", {"file-dropzone-card--dragging-over": isDraggingOverDropzone})}
      role="button"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleFileEvent}
      tabIndex={0}
      data-cy="file-dropzone"
    >
      <PlusIcon className="file-dropzone-card__icon" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        hidden
        onChange={handleFileEvent}
        className="file-dropzone-card__file-input"
        aria-label="Select JSON file"
        data-cy="file-input"
      />
      <div className="file-dropzone-card__title">{t("ImportBoard.FileDropzoneCard.title")}</div>
      <div className="file-dropzone-card__description">{t("ImportBoard.FileDropzoneCard.description")}</div>
    </div>
  );
};
