import {FC} from "react";
import {NoteDialogDeleteNoteButton} from "./NoteDialogDeleteNoteButton";
import {NoteDialogUnstackNoteButton} from "./NoteDialogUnstackNoteButton";
import "./NoteDialogNoteOptions.scss";
import {Participant} from "../../../../../types/participant";

type NoteDialogNoteOptionsProps = {
  showUnstackButton: boolean;
  noteId?: string;
  parentId?: string;
  authorId: string;
  onDeleteOfParent: () => void;
  onClose: () => void;
  viewer: Participant;
};

export const NoteDialogNoteOptions: FC<NoteDialogNoteOptionsProps> = (props: NoteDialogNoteOptionsProps) => {
  const showDeleteButton = props.authorId === props.viewer.user.id || props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR";
  return (
    <ul className="note-dialog__note-options">
      {showDeleteButton && (
        <li className="note-dialog__note-option">
          <NoteDialogDeleteNoteButton {...props} />
        </li>
      )}
      {props.showUnstackButton && (
        <li className="note-dialog__note-option">
          <NoteDialogUnstackNoteButton {...props} />
        </li>
      )}
    </ul>
  );
};
