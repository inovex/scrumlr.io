import classNames from "classnames";
import React, {useRef, useEffect} from "react";
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

type NoteProps = {
  noteId: string;
  viewer: Participant;
};

export const Note = ({noteId, viewer}: NoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLButtonElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId), _.isEqual);
  const isStack = useAppSelector((state) => state.notes.filter((n) => n.position.stack === noteId).length > 0);
  const isShared = useAppSelector((state) => state.board.data?.sharedNote === noteId);
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
    if (isShared && !document.location.pathname.endsWith(noteId)) {
      navigate(`note/${note!.id}/stack`);
    }
  }, []);

  useEffect(() => {
    if (isShared) {
      if (!document.location.pathname.endsWith(noteId)) {
        navigate(`note/${note!.id}/stack`);
      }
    } else if (document.location.pathname.endsWith(noteId)) {
      navigate(`.`);
    }
  }, [isShared]);
  /* eslint-enable */

  const [{isDragging}, drag] = useDrag({
    type: isStack ? "STACK" : "NOTE",
    item: {id: noteId, columnId: note!.position.column},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{isOver}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        dispatch(Actions.editNote(item.id, {position: {stack: noteId!, column: note!.position.column, rank: 0}}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver({shallow: true})}),
    canDrop: (item: {id: string}) => item.id !== noteId,
  }));

  const handleClick = () => {
    if (moderating && (viewer.role === "MODERATOR" || viewer.role === "OWNER")) {
      dispatch(Actions.shareNote(noteId));
    }
    navigate(`note/${noteId}/stack`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`note/${noteId}/stack`);
    }
  };

  drag(noteRef);
  drop(noteRef);

  return (
    <div className={classNames("note__root")}>
      <button className={classNames("note", {"note--isDragging": isDragging}, {"note--isOver": isOver})} onClick={handleClick} onKeyPress={handleKeyPress} ref={noteRef}>
        <p className="note__text">{note!.text}</p>
        <div className="note__footer">
          {(showAuthors || viewer.user.id === author.user!.id) && (
            <figure className={classNames("note__author", {"note__author--self": author.isSelf})} aria-roledescription="author">
              <UserAvatar id={note!.author} avatar={author.user!.avatar} name={author.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{author.displayName}</figcaption>
            </figure>
          )}
          <Votes noteId={noteId!} aggregateVotes />
        </div>
      </button>
      {isStack && <div className="note__in-stack" />}
    </div>
  );
};
