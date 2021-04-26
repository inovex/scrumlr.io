import "./NoteDialog.scss";
import avatar from "assets/avatar.png";
import Portal from "components/Portal/Portal";
import deleteicon from "assets/icon-delete.svg";
import classNames from "classnames";
import Parse from "parse";
import {NoteProps} from "components/Note/Note";

export interface NoteDialogProps extends NoteProps {
  show: boolean;
  onClose?: () => void;
  onDelete: () => void;
}

const NoteDialog = ({show, onClose, text, onDelete, authorId, noteId}: NoteDialogProps) => {
  if (!show) {
    return null;
  }

  return (
    <Portal onClose={onClose}>
      <div className="note-dialog">
        <h2 className="note-dialog__header">Negative</h2>
        <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === authorId})}>
          <div className="note-dialog__content">
            <p className="note-dialog__text">{text}</p>
          </div>

          <footer className="note-dialog__footer">
            <figure className="note-dialog__author">
              <img className="note-dialog__author-image" src={avatar} alt="User" />
              <figcaption className="note-dialog__author-name">{authorId}</figcaption>
            </figure>
          </footer>

          <aside>
            <ul className="note-dialog__options">
              <li className="note-dialog__option">
                <button className="note-dialog__option-button">Deck Cover</button>
              </li>

              <li className="note-dialog__option">
                <button className="note-dialog__option-button" onClick={onDelete}>
                  <img className="note-dialog__options-icon" src={deleteicon} alt="Delete" />
                  <p>Delete</p>
                </button>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </Portal>
  );
};
export default NoteDialog;
