import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import Parse from "parse";
import {FC} from "react";
import {VoteClientModel} from "types/vote";
import "./NoteDialogFooter.scss";

type NoteDialogFooterProps = {
  showAuthors: boolean;
  authorId: string;
  authorName: string;
  noteId?: string;
  votes: VoteClientModel[];
  activeVoting: boolean;
};

export const NoteDialogFooter: FC<NoteDialogFooterProps> = ({showAuthors, authorId, authorName, noteId, votes, activeVoting}: NoteDialogFooterProps) => (
  <div className="note-dialog__footer">
    {(showAuthors || Parse.User.current()?.id === authorId) && (
      <figure className="note-dialog__author">
        <UserAvatar id={authorId} name={authorName} className="note-dialog__user-avatar" />
        <figcaption className="note-dialog__author-name">{authorName}</figcaption>
      </figure>
    )}
    <Votes className="note__votes" noteId={noteId!} votes={votes} activeVoting={activeVoting} />
  </div>
);
