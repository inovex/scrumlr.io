import "./NoteDialog.scss";
import avatar from "assets/avatar.png";

export interface NoteDialogProps {
  show: boolean;
  onClose(): any;
  text: string;
}

const NoteDialog = ({show, onClose, text}: NoteDialogProps) => {
  if (show == false) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="Backdrop">
      <div className="note-dialog">
        <div className="note-dialog__note">
          <div className="note-dialog__content">
            <p className="note-dialog__text">{text}</p>
          </div>
          <footer className="note-dialog__footer">
            <figure className="note-dialog__author">
              <img className="note-dialog__author-image" src={avatar} alt="User" />
              <figcaption className="note-dialog__author-name" />
            </figure>
          </footer>
          <div>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteDialog;
