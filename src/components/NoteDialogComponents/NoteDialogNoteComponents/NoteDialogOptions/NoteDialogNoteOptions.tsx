import {FC} from "react";
import {Participant} from "types/participant";
import {Votes} from "components/Votes";
import {NoteDialogDeleteNoteButton} from "./NoteDialogDeleteNoteButton";
import {NoteDialogUnstackNoteButton} from "./NoteDialogUnstackNoteButton";
import "./NoteDialogNoteOptions.scss";

type NoteDialogNoteOptionsProps = {
  showUnstackButton: boolean;
  noteId: string;
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
      {props.showUnstackButton && (
        <li className="note-dialog__note-option">
          <NoteDialogUnstackNoteButton {...props} />
        </li>
      )}
      {showDeleteButton && (
        <li className="note-dialog__note-option">
          <NoteDialogDeleteNoteButton {...props} />
        </li>
      )}
      <li>
        <Votes {...props} />
      </li>
    </ul>
  );
};
