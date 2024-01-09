import {FC, useState} from "react";
import {Actions} from "store/action";
import "./NoteDialogNoteContent.scss";
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
import i18n from "../../../i18n";

type NoteDialogNoteContentProps = {
  noteId?: string;
  authorId: string;
  text: string;
  viewer: Participant;
  showNoteReactions: boolean; // used for style adjustments
  isStackedNote: boolean;
};

export const NoteDialogNoteContent: FC<NoteDialogNoteContentProps> = ({noteId, authorId, text, viewer, showNoteReactions, isStackedNote}: NoteDialogNoteContentProps) => {
  const [imageZoom, setImageZoom] = useState(false);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const editable = viewer.user.id === authorId || viewer.role === "OWNER" || viewer.role === "MODERATOR";

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

  const {value, ...emoji} = useEmojiAutocomplete<HTMLDivElement>({initialValue: text, suggestionsHidden: isStackedNote});

  return (
    <div className={classNames("note-dialog__note-content", {"note-dialog__note-content--extended": !showNoteReactions})} ref={emoji.containerRef}>
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
          <textarea
            className="note-dialog__note-content--text"
            disabled={!editable}
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
            }}
          />

          {!isStackedNote && (
            <div className="note-dialog__note-content--emoji-suggestions">
              <EmojiSuggestions {...emoji.suggestionsProps} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
