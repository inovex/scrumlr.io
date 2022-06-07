import "./Note.scss";
import classNames from "classnames";
import {Actions} from "store/action";
import React, {useEffect} from "react";
import {NoteDialog} from "components/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {Votes} from "components/Votes";
import {UserAvatar} from "components/BoardUsers";
import {TabIndex} from "constants/tabIndex";
import {useDispatch} from "react-redux";
import _ from "underscore";
import {Participant} from "types/participant";
import {useAppSelector} from "store";
import {useSortable} from "@dnd-kit/sortable";
import {Active, Collision, useDndContext} from "@dnd-kit/core";

interface NoteProps {
  noteId: string;
  columnId: string;
  columnName: string;
  columnColor: string;
  columnVisible: boolean;
  showAuthors: boolean;
  moderating: boolean;
  viewer: Participant;
  tabIndex?: number;
  noteIndex: number;
  dragActiveId?: string;
  noteDialogHandler: (noteDialogActive: boolean) => void;
}

export const Note = (props: NoteProps) => {
  const dispatch = useDispatch();

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), _.isEqual);
  const noteIsShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
  const childrenNotes = useAppSelector(
    (state) =>
      state.notes
        .filter((n) => n.position.stack === note?.id)
        .map((n) => ({
          ...n,
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? state.participants?.self.user.name ?? "",
        })),
    _.isEqual
  );

  const {collisions: collisionsCtx, active: activeCtx} = useDndContext();

  const author = useAppSelector((state) => state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self);
  const [showDialog, setShowDialog] = React.useState(noteIsShared);

  const {attributes, listeners, setNodeRef, transform, transition, isDragging, isOver} = useSortable({id: props.noteId});

  const style = transform
    ? {
        // transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined;

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

  useEffect(() => {
    props.noteDialogHandler(showDialog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showDialog) {
      handleShowDialog();
    }
  };

  const getIsCombinable = (collisions: Collision[] | null, active: Active | null) => {
    if (!collisions || collisions.length < 2) {
      return false;
    }
    const {id: firstCollisionId, data: collisionData} = collisions[0];

    if (!collisionData || firstCollisionId === active?.id || firstCollisionId !== props.noteId) {
      return false;
    }
    const collisionValue = collisionData.value;
    return collisionValue != null && collisionValue > 0.1 && collisionValue < 45;
  };

  const isCombinable = getIsCombinable(collisionsCtx, activeCtx);

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes} className={classNames("note__root")} onClick={handleShowDialog} onKeyDown={handleKeyDown}>
      <div
        className={classNames(
          "note",
          {"note--own-card": props.viewer.user.id === note?.author},
          {
            "note--isDragging": isDragging,
            "note--isOver": isOver && props.noteId !== props.dragActiveId,
            "note--isCombinable": isCombinable,
          }
        )}
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
          <Votes tabIndex={props.tabIndex} noteId={props.noteId!} aggregateVotes />
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
            moderating={props.moderating}
            columnVisible={props.columnVisible}
          />
        )}
      </div>
      {childrenNotes.length > 0 && <div className="note__in-stack" />}
    </li>
  );
};
