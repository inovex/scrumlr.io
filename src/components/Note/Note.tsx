import "./Note.scss";
import classNames from "classnames";
import {Actions} from "store/action";
import React, {useEffect, useRef} from "react";
import {NoteDialog} from "components/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {Votes} from "components/Votes";
import {useDrag, useDrop} from "react-dnd";
import {UserAvatar} from "components/BoardUsers";
import {TabIndex} from "constants/tabIndex";
import {useDispatch} from "react-redux";
import _ from "underscore";
import {Participant} from "types/participant";
import {useAppSelector} from "store";

interface NoteProps {
  noteId: string;
  columnId: string;
  columnName: string;
  columnColor: string;
  showAuthors: boolean;
  moderating: boolean;
  viewer: Participant;
  tabIndex?: number;
}

export const Note = (props: NoteProps) => {
  const noteRef = useRef<HTMLLIElement>(null);
  const dispatch = useDispatch();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const noteIsShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
  const childrenNotes = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === note?.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.id)?.user.name ?? state.participants?.self.user.name ?? "",
          votes: state.votings.past[0]?.votes?.votesPerNote[n.id].total ?? 0,
          allVotesOfUser: state.votes.filter((v) => v.voting === state.votings.open?.id || v.voting === state.board.data?.showVoting).filter((v) => v.note === n.id),
        })),
    _.isEqual
  );
  const author = useAppSelector((state) => state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self);
  const activeVoting = useAppSelector((state) => !!state.votings.open);
  const [showDialog, setShowDialog] = React.useState(noteIsShared);

  const handleShowDialog = () => {
    if (props.moderating && props.noteId) {
      if (noteIsShared) {
        dispatch(Actions.stopSharing());
      } else {
        dispatch(Actions.shareNote(props.noteId));
      }
      setShowDialog(!noteIsShared);
    } else {
      if ((props.viewer.role === "OWNER" || props.viewer.role === "MODERATOR") && noteIsShared) {
        dispatch(Actions.stopSharing());
      }
      setShowDialog(!showDialog);
    }
  };

  useEffect(() => {
    if (props.moderating) {
      // Nothing to update
      if (showDialog === noteIsShared) {
        return;
      }

      // Moderator has already one dialog open
      if (showDialog && !noteIsShared && props.noteId) {
        dispatch(Actions.shareNote(props.noteId));
      } else {
        setShowDialog(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.moderating]);

  useEffect(() => {
    if (showDialog !== noteIsShared) {
      setShowDialog(noteIsShared);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteIsShared]);

  const [{isDragging}, drag] = useDrag({
    type: childrenNotes.length > 0 ? "STACK" : "NOTE",
    item: {id: props.noteId, columnId: props.columnId},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{isOver}, drop] = useDrop(() => ({
    accept: ["NOTE", "STACK"],
    drop: (item: {id: string}, monitor) => {
      if (!monitor.didDrop()) {
        dispatch(Actions.editNote(item.id, {position: {stack: props.noteId!, column: props.columnId, rank: 0}}));
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
        className={classNames("note", {"note--own-card": props.viewer.user.id === note?.author}, {"note--isDragging": isDragging}, {"note--isOver": isOver})}
        tabIndex={props.tabIndex ?? TabIndex.default}
      >
        <div className="note__content">
          <p className="note__text">{note!.text}</p>
          <EditIcon className={classNames("note__edit", {"note__edit--own-card": props.viewer.user.id === note?.author})} />
        </div>
        <div className="note__footer">
          {(props.showAuthors || props.viewer.user.id === author!.user.id) && (
            <figure className="note__author" aria-roledescription="author">
              <UserAvatar id={note!.author} name={author!.user.name} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{author!.user.name}</figcaption>
            </figure>
          )}
          {activeVoting && <Votes tabIndex={props.tabIndex} noteId={props.noteId!} />}
        </div>
        {showDialog && (
          <NoteDialog
            {...props}
            text={note!.text}
            authorId={note!.author}
            authorName={author!.user.name}
            childrenNotes={childrenNotes}
            onClose={handleShowDialog}
            onDeleteOfParent={() => setShowDialog(false)}
          />
        )}
      </div>
      {childrenNotes.length > 0 && <div className="note__in-stack" />}
    </li>
  );
};
