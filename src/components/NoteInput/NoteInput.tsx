import {useRef, useState} from "react";
import {AddImage, LockClosed, Plus, Star} from "components/Icon";
import {useTranslation} from "react-i18next";
import {useHotkeys} from "react-hotkeys-hook";
import {Toast} from "utils/Toast";
import {useImageChecker} from "utils/hooks/useImageChecker";
import TextareaAutosize from "react-textarea-autosize";
import {hotkeyMap} from "constants/hotkeys";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {useAppDispatch, useAppSelector} from "store";
import "./NoteInput.scss";
import {addNote} from "store/features";

export interface NoteInputProps {
  columnId: string;
  columnIndex: number;
  columnIsVisible: boolean;
  toggleColumnVisibility: () => void;
  hotkeyKey?: string;
}

export const NoteInput = ({columnIndex, columnId, columnIsVisible, toggleColumnVisibility}: NoteInputProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);
  const isModerator = useAppSelector((state) => ["OWNER", "MODERATOR"].some((role) => state.participants!.self?.role === role));

  const dispatchAddNote = (content: string) => {
    if (!content.trim()) return;
    dispatch(addNote({columnId, text: content}));
    if (!columnIsVisible && !toastDisplayed) {
      Toast.info({
        title: t("Toast.noteToHiddenColumn"),
        buttons: [t("Toast.noteToHiddenColumnButton")],
        firstButtonOnClick: toggleColumnVisibility,
      });
      setToastDisplayed(true);
    }
  };

  const {value, setValue, ...emoji} = useEmojiAutocomplete<HTMLFormElement>();
  const noteInputRef = useRef<HTMLTextAreaElement | null>(null);

  const {SELECT_NOTE_INPUT_FIRST_KEY} = hotkeyMap;
  const hotkeyCombos = SELECT_NOTE_INPUT_FIRST_KEY.map((firstKey) => `${firstKey}+${columnIndex + 1}`).join(",");
  useHotkeys(
    hotkeyCombos,
    (e: KeyboardEvent) => {
      e.preventDefault();
      noteInputRef.current?.scrollIntoView({behavior: "smooth"});
      noteInputRef.current?.select();
    },
    {enabled: columnIndex + 1 <= 9},
    [noteInputRef]
  );

  const isImage = useImageChecker(value);

  return (
    <form
      className="note-input"
      onSubmit={(e) => {
        e.preventDefault();
        dispatchAddNote(value);
        setValue("");
      }}
      ref={emoji.containerRef}
    >
      {!isModerator && boardLocked && <LockClosed className="note-input__lock-icon" />}
      <TextareaAutosize
        data-clarity-mask="True"
        disabled={!isModerator && boardLocked}
        ref={noteInputRef}
        className="note-input__input"
        placeholder={t("NoteInput.placeholder")}
        {...emoji.inputBindings}
        onKeyDown={(e) => {
          // handle emoji input
          emoji.inputBindings.onKeyDown(e);
          if (e.defaultPrevented) return;

          // other functions
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }

          if (e.key === "Escape") {
            e.currentTarget.blur();
          }
        }}
      />
      <EmojiSuggestions {...emoji.suggestionsProps} />
      {isImage && (
        <div className="note-input__image-indicator" title={t("NoteInput.imageInfo")}>
          <AddImage className="note-input__icon--image" />
          <Star className="note-input__icon--star star-1" />
          <Star className="note-input__icon--star star-2" />
          <Star className="note-input__icon--star star-3" />
        </div>
      )}
      <button
        disabled={!isModerator && boardLocked}
        type="submit"
        tabIndex={-1} // skip focus
        className="note-input__add-button"
        aria-label={t("NoteInput.create")}
        title={t("NoteInput.create")}
      >
        <Plus className="note-input__icon--add" />
      </button>
    </form>
  );
};
