import "./NoteDialog.scss";
import avatar from "assets/avatar.png";
import Backdrop from "components/Backdrop/Backdrop";
import deleteicon from "assets/icon-delete.svg";
import classNames from "classnames";
import Parse from "parse";

export interface NoteDialogProps {
  show: boolean;
  text: string;
  onClose?: () => void;
  onDelete: () => void;
  authorId: string;
  noteId?: string;
}

const NoteDialog = ({show, onClose, text, onDelete, authorId, noteId}: NoteDialogProps) => {
  if (!show) {
    return null;
  }

  return (
    <Backdrop onClose={onClose}>
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

          <div>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
};
export default NoteDialog;
