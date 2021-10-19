import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import Parse from "parse";
import {FC} from "react";
import {VoteClientModel} from "types/vote";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  authorName: string;
  noteId?: string;
  votes: VoteClientModel[];
  activeVoting: boolean;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = ({showAuthors, authorId, authorName, noteId, votes, activeVoting}: NoteDialogNoteFooterProps) => (
  <div className="note-dialog__note-footer">
    {(showAuthors || Parse.User.current()?.id === authorId) && (
      <figure className="note-dialog__note-author">
        <UserAvatar id={authorId} name={authorName} className="note-dialog__note-user-avatar" />
        <figcaption className="note-dialog__note-author-name">{authorName}</figcaption>
      </figure>
    )}
    <Votes className="note__votes" noteId={noteId!} votes={votes} activeVoting={activeVoting} />
  </div>
);
