import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import {FC} from "react";
import classNames from "classnames";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {Participant} from "types/participant";
import {AvataaarProps} from "components/Avatar";
import _ from "underscore";
import {NoteDialogNoteOptions} from "./NoteDialogOptions";
import "./NoteDialogNoteFooter.scss";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  noteId?: string;
  parentId?: string;
  onDeleteOfParent: () => void;
  onClose: () => void;
  showUnstackButton: boolean;
  viewer: Participant;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => {
  const {t} = useTranslation();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
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
      {(props.showAuthors || props.viewer.user.id === props.authorId) && (
        <figure className={classNames("note-dialog__note-author", {"note-dialog__note-author--self": author.isSelf})}>
          <UserAvatar id={props.authorId} avatar={props.avatar} name={props.authorName} className="note-dialog__note-user-avatar" avatarClassName="note-dialog__note-user-avatar" />
          <figcaption className="note-dialog__note-author-name">{props.authorName}</figcaption>
        </figure>
      )}
      <div className="note-dialog__note-footer__options-and-votes">
        <Votes noteId={props.noteId!} />
        <NoteDialogNoteOptions {...props} />
      </div>
    </div>
  );
};
