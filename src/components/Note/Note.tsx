import classNames from "classnames";
import {useRef, useEffect, KeyboardEvent} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {isEqual} from "underscore";
import {Votes} from "components/Votes";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Participant, ParticipantExtendedInfo} from "types/participant";
import "./Note.scss";
import {addProtocol} from "utils/images";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {Sortable} from "components/DragAndDrop/Sortable";
import {NoteAuthorList} from "./NoteAuthorList/NoteAuthorList";

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
  const noteRef = useRef<HTMLButtonElement>(null);

  const note = useAppSelector((state) => state.notes.find((n) => n.id === props.noteId), isEqual);
  const isStack = useAppSelector((state) => state.notes.filter((n) => n.position.stack === props.noteId).length > 0);
  const isShared = useAppSelector((state) => state.board.data?.sharedNote === props.noteId);
  const allowStacking = useAppSelector((state) => state.board.data?.allowStacking ?? true);
  const showAuthors = useAppSelector((state) => !!state.board.data?.showAuthors);
  const moderating = useAppSelector((state) => state.view.moderating);
  const isModerator = props.viewer.role === "MODERATOR" || props.viewer.role === "OWNER";

  // all authors of a note, including its children if it's a stack.
  // next to the Participant object there's also helper properties (displayName, isSelf) for easier identification.
  const authors: ParticipantExtendedInfo[] = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === note?.author) ?? state.participants?.self;
    const childrenNoteAuthors = state.notes
      // get all notes which are in the same stack as the main note
      .filter((n) => n.position.stack === props.noteId)
      // find the corresponding author for the respective note in the list of other participants. if none is found, the author is therefore yourself
      .map((c) => state.participants?.others.find((p) => p.user.id === c.author) ?? state.participants?.self);
    const allAuthorsRaw = [noteAuthor, ...childrenNoteAuthors];
    // process and filter
    const allAuthors = allAuthorsRaw
      .map((a) => {
        const isSelf = a?.user.id === state.participants?.self.user.id;
        const displayName = isSelf ? t("Note.me") : a!.user.name;
        return {
          ...a,
          displayName,
          isSelf,
        } as ParticipantExtendedInfo;
      })
      // remove duplicates (because notes can have multiple children by the same authors)
      .filter((v, i, self) => self.findIndex((a) => a.user?.id === v.user?.id) === i);

    // if self is part of the authors, we always want it to be visible
    const selfIndex = allAuthors.findIndex((a) => a.isSelf);
    if (selfIndex > 1) {
      // in-place swap with second author
      [allAuthors[selfIndex], allAuthors[1]] = [allAuthors[1], allAuthors[selfIndex]];
    }

    // if showAuthors is disabled, we still want to see cards written by yourself if you're the stack author.
    // the other authors are excluded as we only require the stack author
    if (!showAuthors && props.viewer.user.id === noteAuthor!.user!.id) {
      return [allAuthors[0]]; // stack author is always first element
    }

    return allAuthors;
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
      <button className={`note note--${stackSetting}`} onClick={handleClick} onKeyDown={handleKeyPress} ref={noteRef}>
        {isImage ? (
          <div className="note__image-wrapper">
            <img
              src={addProtocol(note.text)}
              className="note__image"
              alt={t("Note.userImageAlt", {user: authors[0].isSelf ? t("Note.you") : authors[0].displayName})}
              draggable={false} // safari bugfix
            />
          </div>
        ) : (
          <p className="note__text">{note.text}</p>
        )}
        <div className="note__footer">
          <div className="note__author-container">
            <NoteAuthorList authors={authors} showAuthors={showAuthors} viewer={props.viewer} />
          </div>
          <Votes noteId={props.noteId!} aggregateVotes />
        </div>
      </button>
      {isStack && <div className="note__in-stack" />}
    </Sortable>
  );
};
