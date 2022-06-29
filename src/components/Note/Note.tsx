import "./Note.scss";
import classNames from "classnames";
import {Actions} from "store/action";
import React, {useEffect, useRef} from "react";
import {NoteDialog} from "components/NoteDialog";
import {Votes} from "components/Votes";
import {useDrag, useDrop} from "react-dnd";
import {UserAvatar} from "components/BoardUsers";
import {TabIndex} from "constants/tabIndex";
import {useDispatch} from "react-redux";
import _ from "underscore";
import {Participant} from "types/participant";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";

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
}

export const Note = (props: NoteProps) => {
  const {t} = useTranslation();
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
          authorName: state.participants?.others.find((p) => p.user.id === n.author)?.user.name ?? t("Note.me") ?? "",
        })),
    _.isEqual
  );
  const author = useAppSelector((state) => state.participants?.others.find((p) => p.user.id === note!.author) ?? state.participants?.self);
  const authorName = useAppSelector((state) => (author?.user.id === state.participants?.self.user.id ? t("Note.me") : author!.user.name));

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
        <p className="note__text">{note!.text}</p>
        <div className="note__footer">
          {(props.showAuthors || props.viewer.user.id === author!.user.id) && (
            <figure className="note__author" aria-roledescription="author">
              <UserAvatar id={note!.author} avatar={author!.user.avatar} name={authorName} className="note__user-avatar" avatarClassName="note__user-avatar" />
              <figcaption className="note__author-name">{authorName}</figcaption>
            </figure>
          )}
          <Votes tabIndex={props.tabIndex} noteId={props.noteId!} aggregateVotes />
        </div>
        {showDialog && (
          <NoteDialog
            {...props}
            text={note!.text}
            authorId={note!.author}
            authorName={authorName}
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
