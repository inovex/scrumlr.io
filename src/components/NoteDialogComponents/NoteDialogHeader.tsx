import {FC} from "react";
import "./NoteDialogHeader.scss";

type NoteDialogHeaderProps = {
  columnName: string;
};

export const NoteDialogHeader: FC<NoteDialogHeaderProps> = ({columnName}: NoteDialogHeaderProps) => (
  <div className="note-dialog__header">
    <h2>{columnName}</h2>
  </div>
);
