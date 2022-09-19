import {UserAvatar} from "components/BoardUsers";
import {FC} from "react";
import classNames from "classnames";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {Participant} from "types/participant";
import {AvataaarProps} from "components/Avatar";
import _ from "underscore";
import "./NoteDialogNoteFooter.scss";
import {Votes} from "components/Votes";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  noteId: string;
  viewer: Participant;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = ({showAuthors, authorId, avatar, authorName, noteId, viewer}: NoteDialogNoteFooterProps) => {
  const {t} = useTranslation();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId), _.isEqual);
  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self;
    const isSelf = noteAuthor?.user.id === state.participants?.self.user.id;
    const displayName = isSelf ? t("Note.me") : noteAuthor!.user.name;
    return {
      ...noteAuthor,
      displayName,
      isSelf,
    };
  }, _.isEqual);
  return (
    <div className="note-dialog__note-footer">
      {(showAuthors || viewer.user.id === authorId) && (
        <figure className={classNames("note-dialog__note-author", {"note-dialog__note-author--self": author.isSelf})}>
          <UserAvatar id={authorId} avatar={avatar} name={authorName} className="note-dialog__note-user-avatar" avatarClassName="note-dialog__note-user-avatar" />
          <figcaption className="note-dialog__note-author-name">{authorName}</figcaption>
        </figure>
      )}
      <Votes noteId={noteId} className="note-dialog__note-votes" />
    </div>
  );
};
