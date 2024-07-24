import {FC, useState} from "react";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {Participant} from "types/participant";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {addProtocol} from "utils/images";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {isEqual} from "underscore";
import classNames from "classnames";
import {createPortal} from "react-dom";
import {Toast} from "utils/Toast";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import TextareaAutosize from "react-autosize-textarea";
import i18n from "../../../i18n";
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
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const editable = viewer.user.id === authorId || viewer.role === "OWNER" || viewer.role === "MODERATOR";
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);
  const isModerator = viewer.role === "OWNER" || viewer.role === "MODERATOR";

  const note = useAppSelector((state) => state.notes.find((n) => n.id === noteId));

  const author = useAppSelector((state) => {
    const noteAuthor = state.participants?.others.find((p) => p.user.id === authorId) ?? state.participants?.self;
    const isSelf = noteAuthor?.user.id === state.participants?.self.user.id;
    const displayName = isSelf ? t("Note.me") : noteAuthor!.user.name;
    return {
      ...noteAuthor,
      displayName,
      isSelf,
    };
  }, isEqual);

  const onFocus = () => {
    dispatch(Actions.onNoteFocus());
  };

  const onEdit = (id: string, newText: string) => {
    if (editable && newText !== text && newText.length > 0) {
      dispatch(Actions.editNote(id, {text: newText}));
    } else if (editable && newText.length === 0) {
      Toast.info({
        title: i18n.t("Toast.emptyNoteDialog"),
      });
    }
    dispatch(Actions.onNoteBlur());
  };

  const isImage = useImageChecker(text);

  const {...emoji} = useEmojiAutocomplete<HTMLDivElement>({
    initialValue: text,
    suggestionsHidden: isStackedNote,
  });

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
          <TextareaAutosize
            className={classNames("note-dialog__note-content-text", {"note-dialog__note-content-text--edited": note?.edited})}
            disabled={!editable || (!isModerator && boardLocked)}
            onBlur={(e) => onEdit(noteId!, e.target.value ?? "")}
            onFocus={onFocus}
            {...emoji.inputBindings}
            onKeyDown={(e) => {
              emoji.inputBindings.onKeyDown(e);
              if (e.defaultPrevented) return;

              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              }

              if (e.key === "Escape") {
                e.currentTarget.blur();
                e.stopPropagation();
              }
            }}
            // required for some reason
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />

          {note?.edited && <div className="note-dialog__marker-edited">({t("Note.edited")})</div>}
          {!isStackedNote && <EmojiSuggestions {...emoji.suggestionsProps} />}
        </>
      )}
    </div>
  );
};
