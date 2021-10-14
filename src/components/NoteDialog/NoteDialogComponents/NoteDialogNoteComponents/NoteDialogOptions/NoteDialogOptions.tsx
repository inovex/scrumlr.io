import {FC} from "react";
import {NoteDialogDeleteNote} from "./NoteDialogDeleteNote";
import "./NoteDialogOptions.scss";
import {NoteDialogUnstackNote} from "./NoteDialogUnstackNote";

type NoteDialogOptionProps = {
  showUnstackButton: boolean;
  noteId?: string;
  onDeleteOfParent: () => void;
  onClose: () => void;
};

export const NoteDialogOptions: FC<NoteDialogOptionProps> = (props: NoteDialogOptionProps) => (
  <aside>
    <ul className="note-dialog__options">
      <NoteDialogDeleteNote {...props} />
      {props.showUnstackButton && <NoteDialogUnstackNote {...props} />}
    </ul>
  </aside>
);
