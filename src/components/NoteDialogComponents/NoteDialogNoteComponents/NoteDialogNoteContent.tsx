import {FC, FocusEvent, useState} from "react";
import {Participant} from "store/features/participants/types";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {addProtocol} from "utils/images";
import {useAppDispatch, useAppSelector} from "store";
import {editNote, onNoteBlur, onNoteFocus} from "store/features";
import {useTranslation} from "react-i18next";
import {isEqual} from "underscore";
import classNames from "classnames";
import {createPortal} from "react-dom";
import {Toast} from "utils/Toast";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import i18n from "i18n";
import Linkify from "linkify-react";
import "./NoteDialogNoteContent.scss";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  text: string;
  viewer: Participant;
  isStackedNote: boolean;
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, text, viewer, isStackedNote}: NoteDialogNoteContentProps) => {
  const [imageZoom, setImageZoom] = useState(false);
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const [editing, setEditing] = useState(false);
  const editable = viewer.user.id === authorId || viewer.role === "OWNER" || viewer.role === "MODERATOR";
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);
  const isModerator = viewer.role === "OWNER" || viewer.role === "MODERATOR";

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));

  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others?.find((p) => p.user.id === authorId) ?? state.participants?.self;
    const isSelf = noteAuthor?.user.id === state.participants?.self!.user.id;
    const displayName = isSelf ? t("Note.me") : noteAuthor!.user.name;
    return {
      ...noteAuthor,
      displayName,
      isSelf,
    };
  }, isEqual);

  const onEdit = (id: string, newText: string) => {
    if (editable && newText !== text && newText.length > 0) {
      dispatch(
        editNote({
          noteId: id,
          request: {
            text: newText,
          },
        })
      );
    } else if (editable && newText.length === 0) {
      Toast.info({
        title: i18n.t("Toast.emptyNoteDialog"),
      });
    }
    dispatch(onNoteBlur());
  };

  const onFocus = () => {
    dispatch(onNoteFocus());
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    onEdit(noteId!, e.target.innerText ?? "");
    setEditing(false);
  };

  const isImage = useImageChecker(text);

  const {value, ...emoji} = useEmojiAutocomplete<HTMLDivElement>({
    initialValue: text,
    suggestionsHidden: isStackedNote,
  });

  const {onClick, ...inputBindings} = emoji.inputBindings;

  // TODO move to util
  const renderLink = (content: {content: string}) => {
    const url = addProtocol(content.content);
    return (
      <a
        href={url}
        title={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames("note-text-content-url", {"note-text-content-url--truncate": true})}
        onClick={(e) => e.stopPropagation()}
      >
        {content.content}
      </a>
    );
  };

  // changes to edit move if user is eligible
  const tryEnablingEditMode = () => {
    if (!editable) return;

    setEditing(true);
  };

  const renderContent = () =>
    editing ? (
      value
    ) : (
      <Linkify
        options={{
          render: renderLink,
        }}
      >
        {value}
      </Linkify>
    );

  // content container modes:
  // - viewable (prettified, URLs)
  // - editable (pure content)
  const renderContentContainer = () => (
    <div
      className={classNames("note-dialog__note-content-text", {"note-dialog__note-content-text--edited": note?.edited})}
      contentEditable={!(!editable || (!isModerator && boardLocked))}
      suppressContentEditableWarning // yes, I know what I'm doing (hopefully)
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={(e) => {
        onClick(e); // emoji binding
        tryEnablingEditMode();
      }}
      role="textbox"
      {...inputBindings}
      onKeyDown={(e) => {
        inputBindings.onKeyDown(e);
        if (e.defaultPrevented) return;

        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.blur();
          setEditing(false);
        }

        if (e.key === "Escape") {
          e.currentTarget.blur();
          e.stopPropagation();
          setEditing(false);
        }
      }}
    >
      {renderContent()}
    </div>
  );

  return (
    <div className="note-dialog__note-content" ref={emoji.containerRef}>
      {isImage ? (
        <>
          <img
            src={addProtocol(text)}
            className={classNames("note-dialog__note-content--image")}
            alt={t("Note.userImageAlt", {user: author.isSelf ? t("Note.you") : author.displayName})}
            onClick={() => setImageZoom(!imageZoom)}
            draggable={false} // safari bugfix
          />
          {imageZoom &&
            createPortal(
              <>
                <img
                  src={addProtocol(text)}
                  className="note-dialog__note-content--image-zoom"
                  alt={t("Note.userImageAlt", {user: author.isSelf ? t("Note.you") : author.displayName})}
                  onClick={() => setImageZoom(false)}
                />
                <div className="note-dialog__note-content--image-zoom-backdrop" onClick={() => setImageZoom(false)} role="dialog" />
              </>,
              document.getElementsByClassName("stack-view")[0]!
            )}
        </>
      ) : (
        <>
          {renderContentContainer()}

          {note?.edited && <div className="note-dialog__marker-edited">({t("Note.edited")})</div>}
          {!isStackedNote && <EmojiSuggestions {...emoji.suggestionsProps} />}
        </>
      )}
    </div>
  );
};
