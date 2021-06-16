import "./Note.scss";
import avatar from "assets/avatar.png";
import {useSelector} from "react-redux";
import {ApplicationState} from "types/store";
import classNames from "classnames";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import React from "react";
import NoteDialog from "components/NoteDialog/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";

export interface NoteProps {
  text: string;
  authorId: string;
  noteId?: string;
  columnName: string;
  columnColor: string;
}

const Note = ({text, authorId, noteId, columnName, columnColor}: NoteProps) => {
  const state = useSelector((state: ApplicationState) => ({
    board: state.board,
    notes: state.notes,
    users: state.users,
  }));

  const [showDialog, setShowDialog] = React.useState(false);
  const handleShowDialog = () => {
    setShowDialog(!showDialog);
  };

  const onEditNote = (noteText: string) => {
    if (Parse.User.current()?.id === authorId) {
      store.dispatch(ActionFactory.editNote(noteId!, noteText));
    }
  };

  const onDeleteNote = () => {
    if (Parse.User.current()?.id === authorId) {
      store.dispatch(ActionFactory.deleteNote(noteId!));
    }
  };

  return (
    <li className={classNames("note", {"note--own-card": Parse.User.current()?.id === authorId})} onClick={handleShowDialog}>
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
        editable={Parse.User.current()?.id === authorId}
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
