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
import {useDrag} from "react-dnd";
import {Votes} from "components/Votes";

interface NoteProps {
  text: string;
  authorId: string;
  noteId: string | undefined;
  columnName: string;
  columnColor: string;
  numberOfVotes: number;
  activeVoting: boolean;
}

const Note = (props: NoteProps) => {
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
    if (Parse.User.current()?.id === props.authorId || isAdmin) {
      store.dispatch(ActionFactory.editNote({id: props.noteId!, text: noteText}));
    }
  };

  const onDeleteNote = () => {
    if (Parse.User.current()?.id === props.authorId || isAdmin) {
      store.dispatch(ActionFactory.deleteNote(props.noteId!));
    }
  };

  const [{isDragging}, drag] = useDrag({
    type: "NOTE",
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult() as {dropEffect: string; columnId: string};
      store.dispatch(ActionFactory.editNote({id: props.noteId!, columnId: dropResult.columnId}));
    },
  });

  return (
    <li className={classNames("note", {"note--own-card": Parse.User.current()?.id === props.authorId}, {"note--isDragging": isDragging})} onClick={handleShowDialog} ref={drag}>
      <div className="note__content">
        <p className="note__text">{props.text}</p>
        <EditIcon className={classNames("note__edit", {"note__edit--own-card": Parse.User.current()?.id === props.authorId})} />
      </div>
      <footer className="note__footer">
        <figure className="note__author" aria-roledescription="author">
          <img className="note__author-image" src={avatar} alt="User" />
          <figcaption className="note__author-name">{state.users.all.filter((user) => user.id === props.authorId)[0]?.displayName}</figcaption>
        </figure>
        <Votes className="note__votes" noteId={props.noteId!} numberOfVotes={props.numberOfVotes} activeVoting={props.activeVoting} />
      </footer>
      <NoteDialog
        editable={Parse.User.current()?.id === props.authorId || isAdmin}
        onClose={handleShowDialog}
        onDelete={onDeleteNote}
        onEdit={onEditNote}
        show={showDialog}
        text={props.text}
        authorId={props.authorId}
        authorName={state.users.all.filter((user) => user.id === props.authorId)[0]?.displayName}
        columnName={props.columnName}
        columnColor={props.columnColor}
      />
    </li>
  );
};

export default Note;
