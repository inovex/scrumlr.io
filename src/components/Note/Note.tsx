import "./Note.scss";
import avatar from "assets/avatar.png";
import {useSelector} from "react-redux";
import {ApplicationState} from "types/store";
import classNames from "classnames";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import edit from "assets/icon-edit.svg";
import React from "react";
import {createStyles, withStyles, FilledInput} from "@material-ui/core";
// import Modal from "components/Modal/Modal";
import NoteDialog from "components/NoteDialog/NoteDialog";

export interface NoteProps {
  text: string;
  authorId: string;
  noteId?: string;
}

const CustomInput = withStyles(
  () =>
    createStyles({
      root: {
        borderRadius: 20,
        height: 40,
        width: "100%",
        backgroundColor: "#EDEFF2",
        marginTop: 16,
        marginBottom: 32,
        "&.MuiFilledInput-underline::before , &.MuiFilledInput-underline::after": {
          display: "none",
        },
        "&:hover , &.Mui-focused": {
          backgroundColor: "white",
          boxShadow: "0 6px 9px 0 rgba(0,87,255,0.16)",
        },
      },
      input: {
        color: "black",
        fontSize: 14,
        fontWeight: "bold",
        lineHeight: 24,
        letterSpacing: 0.25,
        padding: "10px 20px 10px 20px",
        // Use the system font instead of the default Roboto font.
        fontFamily: ["Raleway", "sans-serif"].join(","),
        "& .MuiFilledInput-underline:before": {
          borderBottomColor: "green",
          borderBottom: 0,
          position: "relative",
          left: 20,
        },
      },
      "@media (prefers-color-scheme: dark)": {
        root: {
          backgroundColor: "#4C5566",
          "&:hover , &.Mui-focused": {
            backgroundColor: "#4C5566",
            boxShadow: "0 6px 9px 0 #232323",
          },
        },
        input: {
          color: "white",
        },
      },
    }),
  {name: "NoteInput"}
)(FilledInput);

const Note = ({text, authorId, noteId}: NoteProps) => {
  const state = useSelector((state: ApplicationState) => ({
    board: state.board,
    notes: state.notes,
    users: state.users,
  }));

  /*
  const [showModal, setShowModal] = React.useState(false);
  const handleShowModal = () => {
      setShowModal(!showModal);
  }
*/

  const [showDialog, setShowDialog] = React.useState(false);
  const handleShowDialog = () => {
    setShowDialog(!showDialog);
  };

  const [noteText, setNoteText] = React.useState("");
  function handleChangeNotetext(e: React.ChangeEvent<HTMLInputElement>) {
    setNoteText(e.target.value);
  }
  const onEditNote = () => {
    if (Parse.User.current()?.id === authorId) {
      store.dispatch(ActionFactory.editNote(noteId!, noteText));
      setNoteText("");
    }
  };

  const onDeleteNote = () => {
    if (Parse.User.current()?.id === authorId) {
      store.dispatch(ActionFactory.deleteNote(noteId!));
    }
  };

  return (
    <li className={classNames("note", {"note--own-card": Parse.User.current()?.id === authorId})}>
      <div className="note__content" onClick={handleShowDialog}>
        <p className="note__text">{text}</p>
        <img className={classNames("note__edit", {"note__edit--own-card": Parse.User.current()?.id === authorId})} src={edit} alt="Edit note" />
      </div>
      <footer className="note__footer">
        <figure className="note__author" aria-roledescription="author">
          <img className="note__author-image" src={avatar} alt="User" />
          <figcaption className="note__author-name">{state.users.all.filter((user) => user.id === authorId)[0]?.displayName}</figcaption>
        </figure>
      </footer>
      <button className={classNames("note__delete-button", {"note__delete-button--visible": Parse.User.current()?.id === authorId})} onClick={onDeleteNote}>
        Delete Note
      </button>
      <button className={classNames("note__edit-button", {"note__edit-button--visible": Parse.User.current()?.id === authorId})} onClick={onEditNote}>
        Edit Note
      </button>
      <CustomInput
        placeholder="Edit note..."
        type="text"
        value={noteText}
        onChange={handleChangeNotetext}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            onEditNote();
          }
        }}
      />

      <NoteDialog onClose={handleShowDialog} show={showDialog} text={text} />
    </li>
  );
};
export default Note;

/*
<button type="button" onClick={handleShowModal}>
Show Modal
</button>
<Modal onClose={handleShowModal} show={showModal}>
Message in Modal
</Modal>
*/
