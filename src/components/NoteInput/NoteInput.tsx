import {useRef, useState} from "react";
import {Plus, AddImage, Star} from "components/Icon";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useHotkeys} from "react-hotkeys-hook";
import {Toast} from "utils/Toast";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {useDispatch} from "react-redux";
import TextareaAutosize from "react-autosize-textarea";
import {hotkeyMap} from "constants/hotkeys";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {ReactComponent as LockIcon} from "assets/icon-lock.svg";
import {useAppSelector} from "store";
import "./NoteInput.scss";

export interface NoteInputProps {
  columnId: string;
  columnIndex: number;
  columnIsVisible: boolean;
  toggleColumnVisibility: () => void;
  hotkeyKey?: string;
}

export const NoteInput = ({columnIndex, columnId, columnIsVisible, toggleColumnVisibility}: NoteInputProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);
  const isModerator = useAppSelector((state) => ["OWNER", "MODERATOR"].some((role) => state.participants!.self.role === role));

  const addNote = (content: string) => {
    if (!content.trim()) return;
    dispatch(Actions.addNote(columnId!, content));
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
        addNote(value);
        setValue("");
      }}
      ref={emoji.containerRef}
    >
      {!isModerator && boardLocked && <LockIcon className="note-input__lock-icon" />}
      <TextareaAutosize
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
        // required for some reason
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <div className="note-input__emoji-suggestions">
        <EmojiSuggestions {...emoji.suggestionsProps} />
      </div>
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
