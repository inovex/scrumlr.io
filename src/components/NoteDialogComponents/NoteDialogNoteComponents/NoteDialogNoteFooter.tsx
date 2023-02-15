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
import {ReactComponent as ViewersIcon} from "assets/icon-visible.svg";

type NoteDialogNoteFooterProps = {
  showAuthors: boolean;
  authorId: string;
  avatar?: AvataaarProps;
  authorName: string;
  noteId: string;
  viewer: Participant;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => {
  const {t} = useTranslation();

  const them = useAppSelector((state) => state.participants!.others.filter((p) => p.connected), _.isEqual);
  const viewers = them.filter((participant) => participant.viewsSharedNote);
  const moderating = useAppSelector((state) => state.view.moderating);
  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === note?.author) ?? state.participants?.self;
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
          <UserAvatar
            id={props.authorId}
            avatar={props.avatar}
            title={props.authorName}
            className="note-dialog__note-user-avatar"
            avatarClassName="note-dialog__note-user-avatar"
          />
          <figcaption className="note-dialog__note-author-name">{props.authorName}</figcaption>
        </figure>
      )}
      {moderating && (
        <div className="note-dialog__note-viewers">
          {viewers?.length}/{them?.length} <ViewersIcon className="note-dialog__note-viewers-icon" />
        </div>
      )}
      <Votes {...props} className="note-dialog__note-votes" />
    </div>
  );
};
