import classNames from "classnames";
import {KeyboardEvent, useEffect, useRef} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {isEqual} from "underscore";
import {Votes} from "components/Votes";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Participant} from "types/participant";
import {addProtocol} from "utils/images";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {useSize} from "utils/hooks/useSize";
import {Sortable} from "components/DragAndDrop/Sortable";
import {NoteAuthorList} from "./NoteAuthorList/NoteAuthorList";
import {NoteReactionList} from "./NoteReactionList/NoteReactionList";
import "./Note.scss";

interface NoteProps {
  noteId: string;
  viewer: Participant;
  setItems?: (items: string[]) => void;
  colorClassName?: string;
}

export const Note = (props: NoteProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteRef = useRef<HTMLDivElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId));
  const isStack = useAppSelector((state) => state.notes.filter((n) => n.position.stack === props.noteId).length > 0);
  const isShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
  const allowStacking = useAppSelector((state) => state.board.data?.allowStacking ?? true);
  const showNoteReactions = useAppSelector((state) => state.board.data?.showNoteReactions ?? true);
  const showAuthors = useAppSelector((state) => !!state.board.data?.showAuthors);
  const me = useAppSelector((state) => state.participants?.self);
  const moderating = useAppSelector((state) => state.view.moderating);
  const isModerator = props.viewer.role === "MODERATOR" || props.viewer.role === "OWNER";

  // all authors of a note, including its children if it's a stack.
  const authors = useAppSelector((state) => {
    const allUsers = state.participants?.others.concat(state.participants?.self);
    const noteAuthor = allUsers?.find((p) => p.user.id === note?.author);
    const childrenNoteAuthors = state.notes
      // get all notes which are in the same stack as the main note
      .filter((n) => n.position.stack === props.noteId)
      // find the corresponding author for the respective note in the list of other participants.
      .map((c) => allUsers?.find((p) => p.user.id === c.author));

    // remove undefined values (could exist if a author is not in the list of participants or hidden)
    return [noteAuthor, ...childrenNoteAuthors].filter(Boolean) as Participant[];
  }, isEqual);

  /* eslint-disable */
  useEffect(() => {
    if (isShared && !document.location.pathname.endsWith(props.noteId + "/stack")) {
      navigate(`note/${note?.id}/stack`);
    }
  }, []);

  useEffect(() => {
    if (isShared) {
      if (!document.location.pathname.endsWith(props.noteId + "/stack")) {
        navigate(`note/${note?.id}/stack`);
      }
    } else if (document.location.pathname.endsWith(props.noteId)) {
      navigate(`.`);
    }
  }, [isShared]);
  /* eslint-enable */

  const isImage = useImageChecker(note?.text ?? "");

  const dimensions = useSize(noteRef);

  const handleClick = () => {
    if (moderating && isModerator) {
      dispatch(Actions.shareNote(props.noteId));
    }
    navigate(`note/${props.noteId}/stack`);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`note/${props.noteId}/stack`);
    }
  };

  // TODO: replace with stack setting from state when implemented. thanks, love u <3
  // de-activated in css for now
  const stackSetting: "stackOntop" | "stackBetween" | "stackBelow" = "stackBetween";

  if (!note) return null;

  return (
    <Sortable
      setItems={props.setItems}
      id={props.noteId}
      columnId={note.position.column}
      className={classNames("note__root", props.colorClassName)}
      disabled={!(isModerator || allowStacking)}
    >
      <div tabIndex={0} role="button" className={`note note--${stackSetting}`} onClick={handleClick} onKeyDown={handleKeyPress} ref={noteRef}>
        <header className="note__header">
          <div className="note__author-container">
            <NoteAuthorList authors={authors} showAuthors={showAuthors} viewer={props.viewer} />
          </div>
          <Votes noteId={props.noteId!} aggregateVotes />
        </header>
        {isImage ? (
          <div className="note__image-wrapper">
            <img
              src={addProtocol(note.text)}
              className="note__image"
              alt={t("Note.userImageAlt", {user: authors[0].user.id === me?.user.id ? t("Note.you") : authors[0].user.name})}
              draggable={false} // safari bugfix
            />
          </div>
        ) : (
          <main className={classNames("note__text", {"note__text--extended": !showNoteReactions})}>{note.text}</main>
        )}
        <footer className={classNames("note__footer", {"note__footer--collapsed": !showNoteReactions})}>
          <NoteReactionList noteId={props.noteId} dimensions={dimensions} colorClassName={props.colorClassName} show={showNoteReactions} />
        </footer>
      </div>
      {isStack && <div className="note__in-stack" />}
    </Sortable>
  );
};
