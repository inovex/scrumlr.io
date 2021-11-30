import classNames from "classnames";
import Parse from "parse";
import {FC} from "react";
import {VoteClientModel} from "types/vote";
import {NoteDialogNoteComponents} from "./NoteDialogNoteComponents";
import "./NoteDialogNote.scss";

export type NoteDialogNoteProps = {
  noteId?: string;
  parentId?: string;
  text: string;
  authorId: string;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  votes: VoteClientModel[];
  allVotesOfUser: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
  showUnstackButton: boolean;
};

export var NoteDialogNote: FC<NoteDialogNoteProps> = function (props: NoteDialogNoteProps) {
  return (
    <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === props.authorId})}>
      <NoteDialogNoteComponents.Content {...props} />
      <NoteDialogNoteComponents.Footer {...props} />
    </div>
  );
};
