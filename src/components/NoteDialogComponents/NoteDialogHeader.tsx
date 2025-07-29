import {FC} from "react";
import "./NoteDialogHeader.scss";
import {TextArea} from "components/TextArea/TextArea";

type NoteDialogHeaderProps = {
  columnName: string;
  columnDescription: string;
};

export const NoteDialogHeader: FC<NoteDialogHeaderProps> = ({columnName, columnDescription}: NoteDialogHeaderProps) => (
  <div className="note-dialog-header">
    <h2 data-clarity-mask="True" onClick={(e) => e.stopPropagation()}>
      {columnName}
    </h2>
    <TextArea className="note-dialog-header__description" input={columnDescription} embedded extendable={false} disabled border="none" textAlign="center" rows={3} />
  </div>
);
