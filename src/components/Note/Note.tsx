import "./Note.scss";
import avatar from "assets/avatar.png";
import classNames from "classnames";
import Parse from "parse";
import store, {useAppSelector} from "store";
import {ActionFactory} from "store/action";
import React, {useRef} from "react";
import NoteDialog from "components/NoteDialog/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {useDrag, useDrop} from "react-dnd";
import {NoteClientModel} from "types/note";

interface NoteProps {
  isAdmin: boolean;
  text: string;
  authorId: string;
  noteId: string | undefined;
  columnId: string;
  columnName: string;
  columnColor: string;
  childrenNotes: Array<NoteClientModel>;
}

const Note = ({isAdmin, text, authorId, noteId, columnId, columnName, columnColor, childrenNotes}: NoteProps) => {
  const noteRef = useRef<HTMLLIElement>(null);

  const state = useAppSelector((applicationState) => ({
    users: applicationState.users,
  }));

  const [showDialog, setShowDialog] = React.useState(false);
  const handleShowDialog = () => {
    setShowDialog(!showDialog);
  };

  const [{isDragging}, drag] = useDrag({
    type: childrenNotes.length > 0 ? "STACK" : "NOTE",
    item: {id: noteId, columnId},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: "NOTE",
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        store.dispatch(ActionFactory.editNote({id: item.id, parentId: noteId, columnId}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver({shallow: true}), canDrop: monitor.canDrop()}),
    canDrop: (item: {id: string; columnId: string}) => item.id !== noteId,
  }));

  drag(noteRef);
  drop(noteRef);

  return (
    <li className="note__root" onClick={handleShowDialog} ref={noteRef}>
      <div className={classNames("note", {"note--own-card": Parse.User.current()?.id === authorId}, {"note--isDragging": isDragging}, {"note--isOver": isOver && canDrop})}>
        <div className="note__content">
          <p className="note__text">{text}</p>
          <EditIcon className={classNames("note__edit", {"note__edit--own-card": Parse.User.current()?.id === authorId})} />
        </div>
        <footer className="note__footer">
          <figure className="note__author" aria-roledescription="author">
            <img className="note__author-image" src={avatar} alt="User" />
            <figcaption className="note__author-name">{state.users.all.filter((user) => user.id === authorId)[0]?.displayName}</figcaption>
          </figure>
        </footer>
        <NoteDialog
          isAdmin={isAdmin}
          noteId={noteId}
          onClose={handleShowDialog}
          show={showDialog}
          text={text}
          authorId={authorId}
          authorName={state.users.all.filter((user) => user.id === authorId)[0]?.displayName}
          columnName={columnName}
          columnColor={columnColor}
          childrenNotes={childrenNotes.map((note) => ({...note, authorName: state.users.all.filter((user) => user.id === note.author)[0]?.displayName}))}
        />
      </div>
      {childrenNotes.length > 0 && <div className="note__in-stack" />}
    </li>
  );
};

export default Note;
