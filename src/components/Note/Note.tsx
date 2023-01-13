import classNames from "classnames";
import {useRef, useEffect, KeyboardEvent} from "react";
import {useDrag, useDrop} from "react-dnd";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import _ from "underscore";
import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Participant} from "types/participant";
import "./Note.scss";
import {getEmptyImage} from "react-dnd-html5-backend";
import {addProtocol} from "utils/images";
import {useImageChecker} from "utils/hooks/useImageChecker";

interface NoteProps {
  noteId: string;
  viewer: Participant;
}

export const Note = (props: NoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLButtonElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const isStack = useAppSelector((state) => state.notes.filter((n) => n.position.stack === props.noteId).length > 0);
  const isShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
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

  const showAuthors = useAppSelector((state) => !!state.board.data?.showAuthors);
  const moderating = useAppSelector((state) => state.view.moderating);
  const allowStacking = useAppSelector((state) => state.board.data?.allowStacking ?? true);
  const isModerator = useAppSelector((state) => state.participants?.self.role === "MODERATOR" || state.participants?.self.role === "OWNER");

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

  const [{isDragging}, drag, preview] = useDrag({
    type: isStack ? "STACK" : "NOTE",
    item: {id: props.noteId, columnId: note!.position.column},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isModerator || allowStacking,
  });

  const [{isOver}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        dispatch(Actions.editNote(item.id, {position: {stack: props.noteId!, column: note!.position.column, rank: 0}}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver({shallow: true}) && monitor.canDrop()}),
    canDrop: (item: {id: string}) => item.id !== props.noteId,
  }));

  useEffect(() => {
    preview(getEmptyImage());
  }, [preview]);

  const handleClick = () => {
    if (moderating && (props.viewer.role === "MODERATOR" || props.viewer.role === "OWNER")) {
      dispatch(Actions.shareNote(props.noteId));
    }
    navigate(`note/${props.noteId}/stack`);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`note/${props.noteId}/stack`);
    }
  };

  drag(noteRef);
  drop(noteRef);

  // TODO: replace with stack setting from state when implemented. thanks, love u <3
  const stackSetting: "stackOntop" | "stackBetween" | "stackBelow" = "stackBetween";

  return (
    <div className="note__root">
      <button
        className={classNames("note", {"note--isDragging": isDragging}, {"note--isOver": isOver}, `note--${stackSetting}`)}
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        ref={noteRef}
      >
        {isImage ? (
          <div className="note__image-wrapper">
            <img
              src={addProtocol(note!.text)}
              className="note__image"
              alt="note"
              draggable={false} // safari bugfix
            />
          </div>
        ) : (
          <p className="note__text">{note!.text}</p>
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
    </div>
  );
};
