import classNames from "classnames";
import {useRef, useEffect, KeyboardEvent} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {isEqual} from "underscore";
import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Participant} from "types/participant";
import "./Note.scss";
import {addProtocol} from "utils/images";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {Sortable} from "components/DragAndDrop/Sortable";

interface NoteProps {
  noteId: string;
  viewer: Participant;
  setItems: (items: string[]) => void;
  colorClassName?: string;
}

export const Note = (props: NoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLButtonElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), isEqual);
  const isStack = useAppSelector((state) => state.notes.filter((n) => n.position.stack === props.noteId).length > 0);
  const isShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
  const allowStacking = useAppSelector((state) => state.board.data?.allowStacking ?? true);
  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self;
    const isSelf = noteAuthor?.user.id === state.participants?.self.user.id;
    const displayName = isSelf ? t("Note.me") : noteAuthor!.user.name;
    return {
      ...noteAuthor,
      displayName,
      isSelf,
    };
  }, isEqual);

  const showAuthors = useAppSelector((state) => !!state.board.data?.showAuthors);
  const moderating = useAppSelector((state) => state.view.moderating);
  const isModerator = props.viewer.role === "MODERATOR" || props.viewer.role === "OWNER";

  /* eslint-disable */
  useEffect(() => {
    if (isShared && !document.location.pathname.endsWith(props.noteId + "/stack")) {
      navigate(`note/${note!.id}/stack`);
    }
  }, []);

  useEffect(() => {
    if (isShared) {
      if (!document.location.pathname.endsWith(props.noteId + "/stack")) {
        navigate(`note/${note!.id}/stack`);
      }
    } else if (document.location.pathname.endsWith(props.noteId)) {
      navigate(`.`);
    }
  }, [isShared]);
  /* eslint-enable */

  const isImage = useImageChecker(note?.text ?? "");

  const handleClick = () => {
    if (moderating && isModerator) {
      dispatch(Actions.shareNote(props.noteId));
    }
    navigate(`note/${props.noteId}/stack`);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`note/${props.noteId}/stack`);
    }
  };

  // TODO: replace with stack setting from state when implemented. thanks, love u <3
  const stackSetting: "stackOntop" | "stackBetween" | "stackBelow" = "stackBetween";

  return (
    <Sortable
      setItems={props.setItems}
      id={props.noteId}
      columnId={note?.position.column}
      className={classNames("note__root", props.colorClassName)}
      disabled={!(isModerator || allowStacking)}
    >
      <button className={`note note--${stackSetting}`} onClick={handleClick} onKeyDown={handleKeyPress} ref={noteRef}>
        {isImage ? (
          <div className="note__image-wrapper">
            <img
              src={addProtocol(note!.text)}
              className="note__image"
              alt={t("Note.userImageAlt", {user: author.isSelf ? t("Note.you") : author.displayName})}
              draggable={false} // safari bugfix
            />
          </div>
        ) : (
          <p className="note__text">
            {note!.id} - {note!.position.rank}
          </p>
        )}
        <div className="note__footer">
          {(showAuthors || props.viewer.user.id === author.user!.id) && (
            <figure className={classNames("note__author", {"note__author--self": author.isSelf})} aria-roledescription="author">
              <UserAvatar id={note!.author} avatar={author.user!.avatar} title={author.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{author.displayName}</figcaption>
            </figure>
          )}
          <Votes noteId={props.noteId!} aggregateVotes />
        </div>
      </button>
      {isStack && <div className="note__in-stack" />}
    </Sortable>
  );
};
