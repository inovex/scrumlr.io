import "./Note.scss";
import avatar from "assets/avatar.png";
import {useSelector} from "react-redux";
import {ApplicationState} from "types/store";
import classNames from "classnames";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import React, {useRef} from "react";
import NoteDialog from "components/NoteDialog/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {useDrag, useDrop} from "react-dnd";

interface NoteProps {
  text: string;
  authorId: string;
  noteId: string | undefined;
  columnId: string;
  columnName: string;
  columnColor: string;
}

const Note = ({text, authorId, noteId, columnId, columnName, columnColor}: NoteProps) => {
  const noteRef = useRef<HTMLLIElement>(null);
  const state = useSelector((applicationState: ApplicationState) => ({
    board: applicationState.board,
    notes: applicationState.notes,
    users: applicationState.users,
  }));

  const [showDialog, setShowDialog] = React.useState(false);
  const handleShowDialog = () => {
    setShowDialog(!showDialog);
  };

  const isAdmin: boolean = Parse.User.current()?.id === state.users.admins[0].id;

  const onEditNote = (noteText: string) => {
    if (Parse.User.current()?.id === authorId || isAdmin) {
      store.dispatch(ActionFactory.editNote({id: noteId!, text: noteText}));
    }
  };

  const onDeleteNote = () => {
    if (Parse.User.current()?.id === authorId || isAdmin) {
      store.dispatch(ActionFactory.deleteNote(noteId!));
    }
  };

  const [{isDragging}, drag] = useDrag({
    type: "NOTE",
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
    <li
      className={classNames("note", {"note--own-card": Parse.User.current()?.id === authorId}, {"note--isDragging": isDragging}, {"note--isOver": isOver && canDrop})}
      onClick={handleShowDialog}
      ref={noteRef}
    >
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
        editable={Parse.User.current()?.id === authorId || isAdmin}
        onClose={handleShowDialog}
        onDelete={onDeleteNote}
        onEdit={onEditNote}
        show={showDialog}
        text={text}
        authorId={authorId}
        authorName={state.users.all.filter((user) => user.id === authorId)[0]?.displayName}
        columnName={columnName}
        columnColor={columnColor}
      />
    </li>
  );
};

export default Note;
