import {FC} from "react";
import "./NoteDialogHeader.scss";

type NoteDialogHeaderProps = {
  columnName: string;
};

export const NoteDialogHeader: FC<NoteDialogHeaderProps> = ({columnName}: NoteDialogHeaderProps) => <h2 className="note-dialog__header">{columnName}</h2>;
