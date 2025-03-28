import {FC} from "react";
import "./NoteDialogHeader.scss";

type NoteDialogHeaderProps = {
  columnName: string;
};

export const NoteDialogHeader: FC<NoteDialogHeaderProps> = ({columnName}: NoteDialogHeaderProps) => (
  <div className="note-dialog__header">
    <h2 data-clarity-mask="True" onClick={(e) => e.stopPropagation()}>
      {columnName}
    </h2>
  </div>
);
