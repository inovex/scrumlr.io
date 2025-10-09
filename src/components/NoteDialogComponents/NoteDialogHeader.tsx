import {FC} from "react";
import "./NoteDialogHeader.scss";
import {TextArea} from "components/TextArea/TextArea";

type NoteDialogHeaderProps = {
  columnName: string;
  columnDescription: string;
};

export const NoteDialogHeader: FC<NoteDialogHeaderProps> = ({columnName, columnDescription}: NoteDialogHeaderProps) => (
  <div className="note-dialog-header">
    <div className="note-dialog-header__name" data-clarity-mask="True">
      {columnName}
    </div>
    <TextArea
      className="note-dialog-header__description"
      input={columnDescription}
      setInput={() => {}}
      embedded
      extendable={false}
      disabled
      border="none"
      textAlign="center"
      rows={3}
    />
  </div>
);
