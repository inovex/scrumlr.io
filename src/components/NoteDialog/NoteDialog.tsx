import "./NoteDialog.scss";
import avatar from "assets/avatar.png";
import Portal from "components/Portal/Portal";
import classNames from "classnames";
import Parse from "parse";
import IconButton from "components/IconButton/IconButton";
import {ReactComponent as deleteIcon} from "assets/icon-delete.svg";
import {ReactComponent as unstackIcon} from "assets/icon-unstack.svg";
import React from "react";
import {Color, getColorClassName} from "constants/colors";
import {NoteClientModel} from "types/note";
import store from "store";
import {ActionFactory} from "store/action";
import {VoteClientModel} from "types/vote";
import {Votes} from "../Votes";

interface NoteDialogProps {
  noteId?: string;
  text: string;
  authorId: string;
  columnName: string;
  columnColor: string;
  show: boolean;
  authorName: string;
  showAuthors: boolean;
  onClose: () => void;
  onDeleteOfParent: () => void;
  childrenNotes: Array<NoteClientModel & {authorName: string; votes: VoteClientModel[]}>;
  votes: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  currentUserIsModerator: boolean;
}

const NoteDialog = (props: NoteDialogProps) => {
  if (!props.show) {
    return null;
  }

  const editable = (authorId: string) => (Parse.User.current()?.id === authorId || props.currentUserIsModerator) && !props.activeModeration.status;

  const deleteable = (authorId: string) => Parse.User.current()?.id === authorId || props.currentUserIsModerator;

  const showOptions = !props.activeModeration.status || props.currentUserIsModerator;

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

  const onUnstack = (id: string) => {
    store.dispatch(ActionFactory.editNote({id, parentId: "unstack"}));
  };

  return (
    <Portal onClose={props.onClose} darkBackground>
      <div
        className={classNames(
          "note-dialog",
          getColorClassName(props.columnColor as Color),
          {"note-dialog__pointer-moderator": props.currentUserIsModerator && props.activeModeration.status},
          {"note-dialog__disabled-pointer": !props.currentUserIsModerator && props.activeModeration.status}
        )}
      >
        <h2 className="note-dialog__header">{props.columnName}</h2>
        <div className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === props.authorId})}>
          <div className="note-dialog__content">
            <blockquote
              className={classNames("note-dialog__text", {".note-dialog__text-hover": editable(props.authorId)})}
              contentEditable={editable(props.authorId)}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLElement>) => {
                onEdit(props.noteId!, props.authorId, e.target.textContent as string);
              }}
            >
              {props.text}
            </blockquote>
          </div>
          <footer className="note-dialog__footer">
            {(props.showAuthors || Parse.User.current()?.id === props.authorId) && (
              <figure className="note-dialog__author">
                <img className="note-dialog__author-image" src={avatar} alt="User" />
                <figcaption className="note-dialog__author-name">{props.authorName}</figcaption>
              </figure>
            )}
            <Votes className="note__votes" noteId={props.noteId!} votes={props.votes} activeVoting={props.activeVoting} />
          </footer>

          {showOptions && (
            <aside>
              <ul className="note-dialog__options">
                <li className={classNames("note-dialog__option", {"note-dialog__option--not-editable": !deleteable(props.authorId)})}>
                  <IconButton
                    onClick={() => {
                      onDelete(props.noteId!, props.authorId);
                      props.onDeleteOfParent();
                    }}
                    direction="right"
                    label="Delete"
                    icon={deleteIcon}
                  />
                </li>
              </ul>
            </aside>
          )}
        </div>
        {props.childrenNotes.map((note) => (
          <div key={note.id} className={classNames("note-dialog__note", {"note-dialog__note--own-card": Parse.User.current()?.id === note.author})}>
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
              {(props.showAuthors || Parse.User.current()?.id === note.author) && (
                <figure className="note-dialog__author">
                  <img className="note-dialog__author-image" src={avatar} alt="User" />
                  <figcaption className="note-dialog__author-name">{note.authorName}</figcaption>
                </figure>
              )}
              <Votes className="note__votes" noteId={note.id!} votes={note.votes} activeVoting={props.activeVoting} />
            </footer>

            {showOptions && (
              <aside>
                <ul className="note-dialog__options">
                  <li className={classNames("note-dialog__option", {"note-dialog__option--not-editable": !deleteable(note.author)})}>
                    <IconButton onClick={() => onDelete(note.id!, note.author)} direction="right" label="Delete" icon={deleteIcon} />
                  </li>
                  <li className="note-dialog__option">
                    <IconButton
                      onClick={() => {
                        onUnstack(note.id!);
                        props.onClose();
                      }}
                      direction="right"
                      label="Unstack"
                      icon={unstackIcon}
                    />
                  </li>
                </ul>
              </aside>
            )}
          </div>
        ))}
      </div>
    </Portal>
  );
};
export default NoteDialog;
