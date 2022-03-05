import classNames from "classnames";
import {FC} from "react";
import {Vote} from "types/vote";
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
  votes: Vote[];
  allVotesOfUser: Vote[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
  showUnstackButton: boolean;
};

export const NoteDialogNote: FC<NoteDialogNoteProps> = (props: NoteDialogNoteProps) => (
  <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === props.authorId})}>
    <NoteDialogNoteComponents.Content {...props} />
    <NoteDialogNoteComponents.Footer {...props} />
  </div>
);
