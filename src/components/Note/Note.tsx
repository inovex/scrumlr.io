import classNames from "classnames";
import React, {useRef, useEffect} from "react";
import {useDrag, useDrop} from "react-dnd";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import _ from "underscore";
import {TabIndex} from "constants/tabIndex";
import {UserAvatar} from "components/BoardUsers";
import {Votes} from "components/Votes";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Participant} from "types/participant";
import "./Note.scss";

interface NoteProps {
  noteId: string;
  viewer: Participant;
  tabIndex?: number;
}

export const Note = (props: NoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLLIElement>(null);

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

  /* eslint-disable */
  useEffect(() => {
    if (isShared && !document.location.pathname.endsWith(props.noteId)) {
      navigate(`stack/${note!.id}`);
    }
  }, []);

  useEffect(() => {
    if (isShared) {
      if (!document.location.pathname.endsWith(props.noteId)) {
        navigate(`stack/${note!.id}`);
      }
    } else if (document.location.pathname.endsWith(props.noteId)) {
      navigate(`.`);
    }
  }, [isShared]);
  /* eslint-enable */

  const [{isDragging}, drag] = useDrag({
    type: isStack ? "STACK" : "NOTE",
    item: {id: props.noteId, columnId: note!.position.column},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{isOver}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        dispatch(Actions.editNote(item.id, {position: {stack: props.noteId!, column: note!.position.column, rank: 0}}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver({shallow: true})}),
    canDrop: (item: {id: string}) => item.id !== props.noteId,
  }));

  const handleClick = () => {
    if (moderating && (props.viewer.role === "MODERATOR" || props.viewer.role === "OWNER")) {
      dispatch(Actions.shareNote(props.noteId));
    }
    navigate(`stack/${props.noteId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`stack/${props.noteId}`);
    }
  };

  drag(noteRef);
  drop(noteRef);

  return (
    <li className={classNames("note__root")} onClick={handleClick} onKeyPress={handleKeyPress} ref={noteRef}>
      <div className={classNames("note", {"note--isDragging": isDragging}, {"note--isOver": isOver})} tabIndex={props.tabIndex ?? TabIndex.default}>
        <p className="note__text">{note!.text}</p>
        <div className="note__footer">
          {(showAuthors || props.viewer.user.id === author.user!.id) && (
            <figure className={classNames("note__author", {"note__author--self": author.isSelf})} aria-roledescription="author">
              <UserAvatar id={note!.author} avatar={author.user!.avatar} name={author.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{author.displayName}</figcaption>
            </figure>
          )}
          <Votes tabIndex={props.tabIndex} noteId={props.noteId!} aggregateVotes />
        </div>
      </div>
      {isStack && <div className="note__in-stack" />}
    </li>
  );
};
