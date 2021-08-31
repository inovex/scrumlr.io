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
import store from "store";
import {ActionFactory} from "store/action";

interface NoteDialogProps {
  noteId?: string;
  isAdmin: boolean;
  text: string;
  authorId: string;
  columnName: string;
  columnColor: string;
  show: boolean;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  childrenNotes: Array<NoteClientModel & {authorName: string}>;
}

const NoteDialog = ({noteId, show, text, authorId, isAdmin, authorName, showAuthors, columnName, columnColor, onClose, childrenNotes}: NoteDialogProps) => {
  if (!show) {
    return null;
  }

  const editable = (authorId: string) => Parse.User.current()?.id === authorId || isAdmin;

  const onEdit = (id: string, authorId: string, text: string) => {
    if (editable(authorId)) {
      store.dispatch(ActionFactory.editNote({id, text}));
    }
  };

  const onDelete = (id: string, authorId: string) => {
    if (editable(authorId)) {
      store.dispatch(ActionFactory.deleteNote(id));
    }
  };

  return (
    <Portal onClose={onClose} darkBackground>
      <div className={`note-dialog ${getColorClassName(columnColor as Color)}`}>
        <h2 className="note-dialog__header">{columnName}</h2>
        <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === authorId})}>
          <div className="note-dialog__content">
            <blockquote
              className="note-dialog__text"
              contentEditable={editable(authorId)}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => {
                onEdit(noteId!, authorId, e.target.textContent as string);
              }}
            >
              {text}
            </blockquote>
          </div>

          <footer className="note-dialog__footer">
            {(showAuthors || Parse.User.current()?.id === authorId) && (
              <figure className="note-dialog__author">
                <img className="note-dialog__author-image" src={avatar} alt="User" />
                <figcaption className="note-dialog__author-name">{authorName}</figcaption>
              </figure>
            )}
          </footer>

          <aside>
            <ul className="note-dialog__options">
              <li className={classNames("note-dialog__option", {"note-dialog__option--not-editable": !editable(authorId)})}>
                <IconButton
                  onClick={() => {
                    onDelete(noteId!, authorId);
                    onClose();
                  }}
                  direction="right"
                  label="Delete"
                  icon={deleteIcon}
                />
              </li>
            </ul>
          </aside>
        </div>
        {childrenNotes.map((note) => (
          <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === note.author})}>
            <div className="note-dialog__content">
              <blockquote
                className="note-dialog__text"
                contentEditable={editable(note.author)}
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLElement>) => {
                  onEdit(note.id!, note.author, e.target.textContent as string);
                }}
              >
                {note.text}
              </blockquote>
            </div>

            <footer className="note-dialog__footer">
              {(showAuthors || Parse.User.current()?.id === note.author) && (
                <figure className="note-dialog__author">
                  <img className="note-dialog__author-image" src={avatar} alt="User" />
                  <figcaption className="note-dialog__author-name">{note.authorName}</figcaption>
                </figure>
              )}
            </footer>

            <aside>
              <ul className="note-dialog__options">
                <li className={classNames("note-dialog__option", {"note-dialog__option--not-editable": !editable(note.author)})}>
                  <IconButton onClick={() => onDelete(note.id!, note.author)} direction="right" label="Delete" icon={deleteIcon} />
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
