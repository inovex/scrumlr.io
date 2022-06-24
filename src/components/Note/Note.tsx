import "./Note.scss";
import classNames from "classnames";
import {Actions} from "store/action";
import React, {useRef} from "react";
import {Votes} from "components/Votes";
import {useDrag, useDrop} from "react-dnd";
import {UserAvatar} from "components/BoardUsers";
import {TabIndex} from "constants/tabIndex";
import {useDispatch} from "react-redux";
import _ from "underscore";
import {Participant} from "types/participant";
import {useAppSelector} from "store";
import {useNavigate} from "react-router";

interface NoteProps {
  noteId: string;
  showAuthors: boolean;
  moderating: boolean;
  viewer: Participant;
  tabIndex?: number;
}

export const Note = (props: NoteProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLLIElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const noteIsStackParent = useAppSelector((state) => state.notes.filter((n) => n.position.stack === props.noteId).length > 0);
  const author = useAppSelector((state) => state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self);

  const [{isDragging}, drag] = useDrag({
    type: noteIsStackParent ? "STACK" : "NOTE",
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
    navigate(`stack/${props.noteId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // handleShowDialog();
      navigate(`stack/${props.noteId}`);
    }
  };

  drag(noteRef);
  drop(noteRef);

  return (
    <li className={classNames("note__root")} onClick={handleClick} onKeyPress={handleKeyPress} ref={noteRef}>
      <div
        className={classNames("note", {"note--own-card": props.viewer.user.id === note?.author}, {"note--isDragging": isDragging}, {"note--isOver": isOver})}
        tabIndex={props.tabIndex ?? TabIndex.default}
      >
        <p className="note__text">{note!.text}</p>
        <div className="note__footer">
          {(props.showAuthors || props.viewer.user.id === author!.user.id) && (
            <figure className="note__author" aria-roledescription="author">
              <UserAvatar id={note!.author} avatar={author!.user.avatar} name={author!.user.name} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{author!.user.name}</figcaption>
            </figure>
          )}
          <Votes tabIndex={props.tabIndex} noteId={props.noteId!} aggregateVotes />
        </div>
      </div>
      {noteIsStackParent && <div className="note__in-stack" />}
    </li>
  );
};
