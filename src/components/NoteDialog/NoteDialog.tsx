import "./NoteDialog.scss";
import avatar from "assets/avatar.png";
import Portal from "components/Portal/Portal";
import classNames from "classnames";
import Parse from "parse";
import {NoteProps} from "components/Note/Note";
import IconButton from "components/IconButton/IconButton";
import {ReactComponent as deleteIcon} from "assets/icon-delete.svg";
import {createStyles, withStyles, FilledInput} from "@material-ui/core";
import React from "react";

export interface NoteDialogProps extends NoteProps {
  show: boolean;
  editable?: boolean;
  authorName: string;
  onClose?: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}

const NoteDialog = ({show, text, authorId, editable, authorName, onClose, onDelete, onEdit}: NoteDialogProps) => {
  if (!show) {
    return null;
  }

  // const theme = useContext(ThemeContext);

  const [noteText, setNoteText] = React.useState("");
  function handleChangeNotetext(e: React.ChangeEvent<HTMLInputElement>) {
    setNoteText(e.target.value);
  }

  const handleDelete = () => {
    if (editable) {
      onDelete();
      onClose!();
    }
  };

  const handleEdit = () => {
    if (editable) {
      onEdit(noteText);
    }
  };

  /*
  const handleBlur = (e: React.FormEvent<any>) => {
    const { textContent } = e.target as any;
    const { id, onUpdateText } = props;
    onUpdateText(id, textContent, props.card.iv);
  };
*/

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

  return (
    <Portal onClose={onClose}>
      <div className="note-dialog">
        <h2 className="note-dialog__header">Negative</h2>
        <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === authorId})}>
          <div className="note-dialog__content">
            <p className="note-dialog__text" onClick={handleEdit}>
              {text}
            </p>

            <button className={classNames("note__edit-button", {"note__edit-button--visible": Parse.User.current()?.id === authorId})} onClick={handleEdit}>
              Edit Note
            </button>
            <CustomInput
              placeholder="Edit note..."
              type="text"
              value={noteText}
              onChange={handleChangeNotetext}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  handleEdit();
                }
              }}
            />
          </div>

          <footer className="note-dialog__footer">
            <figure className="note-dialog__author">
              <img className="note-dialog__author-image" src={avatar} alt="User" />
              <figcaption className="note-dialog__author-name">{authorName}</figcaption>
            </figure>
          </footer>

          <aside>
            <ul className="note-dialog__options">
              <li className={classNames("note-dialog__option", {"note-dialog__option--not-editable": !editable})}>
                <IconButton onClick={handleDelete} direction="right" label="Delete" icon={deleteIcon} />
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </Portal>
  );
};
export default NoteDialog;
