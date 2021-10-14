import classNames from "classnames";
import Parse from "parse";
import {FC} from "react";
import {VoteClientModel} from "types/vote";
import {NoteDialogNoteComponents} from "./NoteDialogNoteComponents";
import "./NoteDialogNote.scss";

export type NoteDialogNoteProps = {
  noteId?: string;
  text: string;
  authorId: string;
  show: boolean;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  votes: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
  showUnstackButton: boolean;
  key?: React.Key;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props) => {
  const showOptions = !props.activeModeration.status || props.currentUserIsModerator;

  return (
    <div key={props.key} className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === props.authorId})}>
      <NoteDialogNoteComponents.NoteDialogContent {...props} />
      <NoteDialogNoteComponents.NoteDialogFooter {...props} />
      {showOptions && <NoteDialogNoteComponents.NoteDialogOptions {...props} />}
    </div>
  );
};
