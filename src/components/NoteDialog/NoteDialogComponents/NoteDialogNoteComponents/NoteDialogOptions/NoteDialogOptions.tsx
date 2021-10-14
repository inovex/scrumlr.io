import {FC} from "react";
import {NoteDialogDeleteNoteButton} from "./NoteDialogDeleteNoteButton";
import "./NoteDialogOptions.scss";
import {NoteDialogUnstackNoteButton} from "./NoteDialogUnstackNoteButton";
import Parse from "parse";

type NoteDialogOptionProps = {
  showUnstackButton: boolean;
  noteId?: string;
  authorId: string;
  onDeleteOfParent: () => void;
  onClose: () => void;
};

export const NoteDialogOptions: FC<NoteDialogOptionProps> = (props: NoteDialogOptionProps) => {
  const showDeleteButton = props.authorId === Parse.User.current()?.id;
  return (
    <aside>
      <ul className="note-dialog__options">
        {showDeleteButton && <NoteDialogDeleteNoteButton {...props} />}
        {props.showUnstackButton && <NoteDialogUnstackNoteButton {...props} />}
      </ul>
    </aside>
  );
};
