import "./Note.scss";
import classNames from "classnames";
import {Actions} from "store/action";
import React, {useEffect, useRef} from "react";
import {NoteDialog} from "components/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {Votes} from "components/Votes";
import {Vote} from "types/vote";
import {useDrag, useDrop} from "react-dnd";
import {Note as NoteModel} from "types/note";
import {UserAvatar} from "components/BoardUsers";
import {TabIndex} from "constants/tabIndex";
import {useDispatch} from "react-redux";
import {Participant} from "../../types/participant";

interface NoteProps {
  text: string;
  authorId: string;
  authorName: string;
  noteId: string | undefined;
  columnId: string;
  columnName: string;
  columnColor: string;
  showAuthors: boolean;
  childrenNotes: Array<NoteModel & {authorName: string; votes: Vote[]}>;
  votes: Vote[];
  allVotesOfUser: Vote[];
  activeVoting: boolean;

  focus: boolean;
  moderating: boolean;
  viewer: Participant;
  tabIndex?: number;
}

export const Note = (props: NoteProps) => {
  const noteRef = useRef<HTMLLIElement>(null);
  const [showDialog, setShowDialog] = React.useState(props.focus);
  const dispatch = useDispatch();

  const handleShowDialog = () => {
    if (props.moderating && props.noteId) {
      if (props.focus) {
        dispatch(Actions.stopSharing());
      } else {
        dispatch(Actions.shareNote(props.noteId));
      }
      setShowDialog(!props.focus);
    } else {
      if ((props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR") && props.focus) {
        dispatch(Actions.stopSharing());
      }
      setShowDialog(!showDialog);
    }
  };

  useEffect(() => {
    if (props.moderating) {
      // Nothing to update
      if (showDialog === props.focus) {
        return;
      }

      // Moderator has already one dialog open
      if (showDialog && !props.focus && props.noteId) {
        dispatch(Actions.shareNote(props.noteId));
      } else {
        setShowDialog(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.moderating]);

  useEffect(() => {
    if (showDialog !== props.focus) {
      setShowDialog(props.focus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.focus]);

  const [{isDragging}, drag] = useDrag({
    type: props.childrenNotes.length > 0 ? "STACK" : "NOTE",
    item: {id: props.noteId, columnId: props.columnId},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{isOver}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        dispatch(Actions.dragNote({id: item.id, position: {stack: props.noteId!, column: props.columnId, rank: 0}}));
      }
    },
    collect: (monitor) => ({isOver: monitor.isOver({shallow: true})}),
    canDrop: (item: {id: string}) => item.id !== props.noteId,
  }));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showDialog) {
      handleShowDialog();
    }
  };

  drag(noteRef);
  drop(noteRef);

  return (
    <li className={classNames("note__root")} onClick={handleShowDialog} onKeyPress={handleKeyPress} ref={noteRef}>
      <div
        className={classNames("note", {"note--own-card": props.viewer.user.id === props.authorId}, {"note--isDragging": isDragging}, {"note--isOver": isOver})}
        tabIndex={props.tabIndex ?? TabIndex.default}
      >
        <div className="note__content">
          <p className="note__text">{props.text}</p>
          <EditIcon className={classNames("note__edit", {"note__edit--own-card": props.viewer.user.id === props.authorId})} />
        </div>
        <div className="note__footer">
          {(props.showAuthors || props.viewer.user.id === props.authorId) && (
            <figure className="note__author" aria-roledescription="author">
              <UserAvatar id={props.authorId} name={props.authorName} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{props.authorName}</figcaption>
            </figure>
          )}
          <Votes
            tabIndex={props.tabIndex}
            noteId={props.noteId!}
            votes={props.votes.concat(props.childrenNotes.flatMap((n) => n.votes))}
            activeVoting={props.activeVoting}
            usedVotesAsUser={props.allVotesOfUser.length}
          />
        </div>
        <NoteDialog {...props} onClose={handleShowDialog} show={showDialog} onDeleteOfParent={() => setShowDialog(false)} />
      </div>
      {props.childrenNotes.length > 0 && <div className="note__in-stack" />}
    </li>
  );
};
