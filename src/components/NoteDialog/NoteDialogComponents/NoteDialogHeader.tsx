import "./NoteDialogHeader.scss";

type NoteDialogHeaderProps = {
  columnName: string;
};

export const NoteDialogHeader = ({columnName}: NoteDialogHeaderProps) => <h2 className="note-dialog__header">{columnName}</h2>;
