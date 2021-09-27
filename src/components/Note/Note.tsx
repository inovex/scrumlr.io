import "./Note.scss";
import avatar from "assets/avatar.png";
import classNames from "classnames";
import Parse from "parse";
import store from "store";
import {ActionFactory} from "store/action";
import React, {useRef} from "react";
import NoteDialog from "components/NoteDialog/NoteDialog";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {Votes} from "components/Votes";
import {VoteClientModel} from "types/vote";
import {useDrag, useDrop} from "react-dnd";
import {NoteClientModel} from "types/note";
import {filterVotes} from "utils/votes";

interface NoteProps {
  isAdmin: boolean;
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
  activeModeration: boolean;
  focus: boolean;
  currentUserIsModerator: boolean;
}

const Note = (props: NoteProps) => {
  const noteRef = useRef<HTMLLIElement>(null);

  const [showDialog, setShowDialog] = React.useState(false);
  const handleShowDialog = () => {
    // Toggle cards for all users (note dialogs that were visible before the moderation phase are also visible after the moderation phase)
    if (props.activeModeration) {
      // Only moderators can show cards for all users (other users should not interact with the cards)
      if (props.noteId && props.currentUserIsModerator) {
        store.dispatch(ActionFactory.editNote({id: props.noteId, focus: !props.focus}));
        setShowDialog(!props.focus);
      }
    } else {
      setShowDialog(!showDialog);
    }
  };

  const [{isDragging}, drag] = useDrag({
    type: props.childrenNotes.length > 0 ? "STACK" : "NOTE",
    item: {id: props.noteId, columnId: props.columnId},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: "NOTE",
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

  const filteredVotes = filterVotes(props.votes, props.activeVoting);

  return (
    <li className="note__root" onClick={handleShowDialog} ref={noteRef}>
      <div className={classNames("note", {"note--own-card": Parse.User.current()?.id === props.authorId}, {"note--isDragging": isDragging}, {"note--isOver": isOver && canDrop})}>
        <div className="note__content">
          <p className="note__text">{props.text}</p>
          <EditIcon className={classNames("note__edit", {"note__edit--own-card": Parse.User.current()?.id === props.authorId})} />
        </div>
        <footer className="note__footer">
          {(props.showAuthors || Parse.User.current()?.id === props.authorId) && (
            <figure className="note__author" aria-roledescription="author">
              <img className="note__author-image" src={avatar} alt="User" />
              <figcaption className="note__author-name">{props.authorName}</figcaption>
            </figure>
          )}
          <Votes
            className="note__votes"
            noteId={props.noteId!}
            votes={filteredVotes.concat(
              filterVotes(
                props.childrenNotes.flatMap((n) => n.votes),
                props.activeVoting
              )
            )}
            activeVoting={props.activeVoting}
          />
        </footer>
        <NoteDialog {...props} votes={filteredVotes} onClose={handleShowDialog} show={(showDialog && !props.activeModeration) || (props.activeModeration && props.focus)} />
      </div>
      {props.childrenNotes.length > 0 && <div className="note__in-stack" />}
    </li>
  );
};

export default Note;
