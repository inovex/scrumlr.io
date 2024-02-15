import {useRef, useState} from "react";
import "./NoteInput.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {ReactComponent as ImageIcon} from "assets/icon-addimage.svg";
import {ReactComponent as StarIcon} from "assets/icon-star.svg";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useHotkeys} from "react-hotkeys-hook";
import {Toast} from "utils/Toast";
import {useImageChecker} from "utils/hooks/useImageChecker";
import {useDispatch} from "react-redux";
import {Tooltip} from "react-tooltip";
import TextareaAutosize from "react-autosize-textarea";
import {hotkeyMap} from "constants/hotkeys";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";

export interface NoteInputProps {
  columnId: string;
  columnIndex: number;
  columnIsVisible: boolean;
  toggleColumnVisibility: () => void;
  hotkeyKey?: string;
}

export const NoteInput = ({columnIndex, columnId, columnIsVisible, toggleColumnVisibility, hotkeyKey}: NoteInputProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [toastDisplayed, setToastDisplayed] = useState(false);

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
      <TextareaAutosize
        ref={noteInputRef}
        className="note-input__input"
        placeholder={t("NoteInput.placeholder")}
        id={`note-input-${columnId}`}
        data-tooltip-content={hotkeyKey}
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
      <div className="note-input__emoji-suggestions">
        <EmojiSuggestions {...emoji.suggestionsProps} />
      </div>
      <Tooltip
        anchorSelect={`#note-input-${columnId}`}
        place="bottom"
        variant={document.documentElement.getAttribute("theme") === "dark" ? "dark" : "light"}
        delayShow={500}
        style={{zIndex: 999}}
      />
      {isImage && (
        <div className="note-input__image-info" title={t("NoteInput.imageInfo")}>
          <ImageIcon className="note-input__icon--image" />
          <StarIcon className="note-input__icon--star star-1" />
          <StarIcon className="note-input__icon--star star-2" />
          <StarIcon className="note-input__icon--star star-3" />
        </div>
      )}
      <button
        type="submit"
        tabIndex={-1} // skip focus
        className="note-input__add-button"
        aria-label={t("NoteInput.create")}
        title={t("NoteInput.create")}
      >
        <PlusIcon className="note-input__icon--add" />
      </button>
    </form>
  );
};
