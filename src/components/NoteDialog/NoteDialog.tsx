import "./NoteDialog.scss";
import avatar from "assets/avatar.png";
import Portal from "components/Portal/Portal";
import classNames from "classnames";
import Parse from "parse";
import IconButton from "components/IconButton/IconButton";
import {ReactComponent as deleteIcon} from "assets/icon-delete.svg";
import React from "react";
import {Color, getColorClassName} from "constants/colors";
import {NoteClientModel} from "types/note";

interface NoteDialogProps {
  text: string;
  authorId: string;
  columnName: string;
  columnColor: string;
  show: boolean;
  editable: boolean;
  authorName: string;
  onClose: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
  childrenNotes: Array<NoteClientModel>;
}

const NoteDialog = ({show, text, authorId, editable, authorName, columnName, columnColor, onClose, onDelete, onEdit, childrenNotes}: NoteDialogProps) => {
  const [noteText, setNoteText] = React.useState(text);

  if (!show) {
    return null;
  }

  const handleChangeNotetext = (e: React.FocusEvent<HTMLElement>) => {
    const textContent = e.target.textContent as string;
    if (editable) {
      onEdit(textContent);
      setNoteText(textContent);
    }
  };

  const handleDelete = () => {
    if (editable) {
      onDelete();
      onClose();
    }
  };

  return (
    <Portal onClose={onClose}>
      <div className={`note-dialog ${getColorClassName(columnColor as Color)}`}>
        <h2 className="note-dialog__header">{columnName}</h2>
        <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === authorId})}>
          <div className="note-dialog__content">
            <blockquote className="note-dialog__text" contentEditable={editable} suppressContentEditableWarning onBlur={handleChangeNotetext}>
              {noteText}
            </blockquote>
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
        {childrenNotes.map((note) => (
          <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === note.author})}>
            <div className="note-dialog__content">
              <blockquote className="note-dialog__text" contentEditable={editable} suppressContentEditableWarning onBlur={handleChangeNotetext}>
                {note.text}
              </blockquote>
            </div>

            <footer className="note-dialog__footer">
              <figure className="note-dialog__author">
                <img className="note-dialog__author-image" src={avatar} alt="User" />
                <figcaption className="note-dialog__author-name">{note.author}</figcaption>
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
        ))}
      </div>
    </Portal>
  );
};
export default NoteDialog;
