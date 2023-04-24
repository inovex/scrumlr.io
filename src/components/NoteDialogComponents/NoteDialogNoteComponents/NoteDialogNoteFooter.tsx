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
  isStackedNote: boolean;
};

export const NoteDialogNoteFooter: FC<NoteDialogNoteFooterProps> = (props: NoteDialogNoteFooterProps) => {
  const {t} = useTranslation();

  const participants = useAppSelector((state) => state.participants!.others.filter((p) => p.connected && !(p.role === "MODERATOR" || p.role === "OWNER")), _.isEqual);
  const viewers = participants.filter((p) => p.viewsSharedNote && !(p.role === "MODERATOR" || p.role === "OWNER"));
  const moderating = useAppSelector((state) => state.view.moderating);
  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const isInVisibleColumn = useAppSelector((state) => state.columns.find((c) => c.id === note?.position.column)?.visible);
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
      {moderating && !props.isStackedNote && (
        <div className="note-dialog__note-viewers" title={t("NoteDialogViewers.title")}>
          {isInVisibleColumn ? viewers?.length : 0}/{participants?.length} <ViewersIcon className="note-dialog__note-viewers-icon" />
        </div>
      )}
      <Votes {...props} className="note-dialog__note-votes" />
    </div>
  );
};
