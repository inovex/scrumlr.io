import {FC} from "react";
import "./NoteDialogHeader.scss";

type NoteDialogHeaderProps = {
  columnName: string;
  columnDescription: string;
};

export const NoteDialogHeader: FC<NoteDialogHeaderProps> = ({columnName, columnDescription}: NoteDialogHeaderProps) => (
  <div className="note-dialog-header">
    <h2 data-clarity-mask="True" onClick={(e) => e.stopPropagation()}>
      {columnName}
    </h2>
    <div className="note-dialog-header__description">{columnDescription}</div>
  </div>
);
