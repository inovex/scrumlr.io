import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import Parse from "parse";
import {FC} from "react";
import {VoteClientModel} from "types/vote";
import {NoteDialogNoteComponents} from ".";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  authorName: string;
  noteId?: string;
  votes: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
  onDeleteOfParent: () => void;
  onClose: () => void;
  showUnstackButton: boolean;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => {
  const showOptions = !props.activeModeration.status || props.currentUserIsModerator;

  return (
    <div className="note-dialog__note-footer">
      {(props.showAuthors || Parse.User.current()?.id === props.authorId) && (
        <figure className="note-dialog__note-author">
          <UserAvatar id={props.authorId} name={props.authorName} className="note-dialog__note-user-avatar" />
          <figcaption className="note-dialog__note-author-name">{props.authorName}</figcaption>
        </figure>
      )}
      {showOptions && <NoteDialogNoteComponents.Options {...props} />}
      <Votes className="note__votes" noteId={props.noteId!} votes={props.votes} activeVoting={props.activeVoting} />
    </div>
  );
};
