import "./Note.scss";
import classNames from "classnames";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import React, {useEffect, useRef} from "react";
import {NoteDialog} from "components/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {Votes} from "components/Votes";
import {VoteClientModel} from "types/vote";
import {useDrag, useDrop} from "react-dnd";
import {NoteClientModel} from "types/note";
import {UserAvatar} from "components/BoardUsers";

interface NoteProps {
  text: string;
  authorId: string;
  authorName: string;
  noteId: string | undefined;
  columnId: string;
  columnName: string;
  columnColor: string;
  showAuthors: boolean;
  childrenNotes: Array<NoteClientModel & {authorName: string; votes: VoteClientModel[]}>;
  votes: VoteClientModel[];
  activeVoting: boolean;
  activeModeration: {userId?: string; status: boolean};
  focus: boolean;
  currentUserIsModerator: boolean;
}

export const Note = (props: NoteProps) => {
  const noteRef = useRef<HTMLLIElement>(null);
  const [showDialog, setShowDialog] = React.useState(props.focus && props.activeModeration.status);
  const handleShowDialog = () => {
    if (props.activeModeration.status) {
      if (props.noteId && props.currentUserIsModerator) {
        store.dispatch(ActionFactory.editNote({id: props.noteId, focus: !props.focus}));
        setShowDialog(!props.focus);
      }
    } else {
      setShowDialog(!showDialog);
    }
  };

  useEffect(() => {
    if (props.activeModeration.status) {
      // Nothing to update
      if (showDialog === props.focus) {
        return;
      }
      // Moderator has already one dialog open
      if (showDialog && !props.focus && props.activeModeration.userId === Parse.User.current()?.id && props.noteId) {
        store.dispatch(ActionFactory.editNote({id: props.noteId, focus: true}));
      } else {
        setShowDialog(false);
      }
    } else if (props.activeModeration.userId !== Parse.User.current()?.id) {
      // Disable dialog for all other users
      setShowDialog(false);
    }
  }, [props.activeModeration.status]);

  useEffect(() => {
    if (showDialog !== props.focus) {
      if (props.activeModeration.status || props.activeModeration.userId !== Parse.User.current()?.id) {
        setShowDialog(props.focus);
      }
    }
  }, [props.focus]);

  const [{isDragging}, drag] = useDrag({
    type: props.childrenNotes.length > 0 ? "STACK" : "NOTE",
    item: {id: props.noteId, columnId: props.columnId},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !props.activeModeration.status || props.currentUserIsModerator,
  });

  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        store.dispatch(ActionFactory.editNote({id: item.id, parentId: props.noteId, columnId: props.columnId}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver({shallow: true}), canDrop: monitor.canDrop()}),
    canDrop: (item: {id: string; columnId: string}) => item.id !== props.noteId,
  }));

  drag(noteRef);
  drop(noteRef);

  return (
    <li
      className={classNames("note__root", {"note__root-disabled-click": props.activeModeration.status && !props.currentUserIsModerator})}
      onClick={!props.activeModeration.status || props.currentUserIsModerator ? handleShowDialog : () => {}}
      ref={noteRef}
    >
      <div
        className={classNames(
          "note",
          {"note--own-card": Parse.User.current()?.id === props.authorId},
          {"note--isDragging": isDragging},
          {"note--isOver": isOver && canDrop},
          {"note__disabled-click": props.activeModeration.status && !props.currentUserIsModerator}
        )}
      >
        <div className="note__content">
          <p className="note__text">{props.text}</p>
          <EditIcon className={classNames("note__edit", {"note__edit--own-card": Parse.User.current()?.id === props.authorId})} />
        </div>
        <div className="note__footer">
          {(props.showAuthors || Parse.User.current()?.id === props.authorId) && (
            <figure className="note__author" aria-roledescription="author">
              <UserAvatar id={props.authorId} name={props.authorName} className="note__user-avatar" />
              <figcaption className="note__author-name">{props.authorName}</figcaption>
            </figure>
          )}
          <Votes className="note__votes" noteId={props.noteId!} votes={props.votes.concat(props.childrenNotes.flatMap((n) => n.votes))} activeVoting={props.activeVoting} />
        </div>
        <NoteDialog {...props} onClose={handleShowDialog} show={showDialog} onDeleteOfParent={() => setShowDialog(false)} />
      </div>
      {props.childrenNotes.length > 0 && <div className="note__in-stack" />}
    </li>
  );
};
