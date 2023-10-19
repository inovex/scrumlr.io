import React, {useCallback, useEffect, useRef, useState} from "react";
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
import {hotkeyMap} from "../../constants/hotkeys";

const emojiRegex = /^:([a-z0-9_]+):?$/i;

// const testJSON = import("./emoji-data.json");

type EmojiData = [slug: string, emoji: string, supportsSkintones: boolean];

export interface NoteInputProps {
  columnId: string;
  maxNoteLength: number;
  columnIndex: number;
  columnIsVisible: boolean;
  toggleColumnVisibility: () => void;
  hotkeyKey?: string;
}

export const NoteInput = ({columnIndex, columnId, maxNoteLength, columnIsVisible, toggleColumnVisibility, hotkeyKey}: NoteInputProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const [value, setValue] = useState("");
  const noteInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [toastDisplayed, setToastDisplayed] = useState(false);

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

  const [emojiData, setEmojiData] = useState<EmojiData[] | null>(null);

  const [autocompleteEmojis, setAutocompleteEmojis] = useState<EmojiData[] | null>(null);

  const [emojiAutocompleteName, setEmojiAutocompleteName] = useState<string | null>(null);

  useEffect(() => {
    if (!emojiAutocompleteName) {
      setAutocompleteEmojis(null);
      return;
    }
    if (!emojiData) {
      import("./emojis.json").then((data) => setEmojiData(data.default as EmojiData[]));
      return;
    }
    setAutocompleteEmojis(emojiData.filter(([slug]) => slug.includes(emojiAutocompleteName)));
  }, [emojiAutocompleteName, emojiData]);

  const checkEmoji = useCallback((newValue: string, cursor: number): string => {
    setEmojiAutocompleteName(null);

    const lastWord = newValue.slice(0, cursor).split(/\s+/).pop();
    if (!lastWord) return newValue;

    const [, emojiName] = lastWord.match(emojiRegex) || [];
    if (!emojiName) return newValue;

    // emoji autocomplete
    setEmojiAutocompleteName(emojiName);

    return newValue;
  }, []);

  const handleChangeNoteText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Avoid long messages

    const cursor = e.target.selectionStart;
    const newValue = checkEmoji(e.target.value, cursor);

    if (e.target.value.length > maxNoteLength) return;

    setValue(newValue);
  };

  const onAddNote = () => {
    if (value) {
      dispatch(Actions.addNote(columnId!, value));
      if (!columnIsVisible && !toastDisplayed) {
        Toast.info({
          title: t("Toast.noteToHiddenColumn"),
          buttons: [t("Toast.noteToHiddenColumnButton")],
          firstButtonOnClick: toggleColumnVisibility,
        });
        setToastDisplayed(true);
      }
      setValue("");
    }
  };
  return (
    <form className="note-input">
      {autocompleteEmojis && (
        <div className="note-input__emoji-autocomplete">
          <div className="note-input__emoji-autocomplete--emoji">found {autocompleteEmojis.length} emojis</div>
          <div className="note-input__emoji-autocomplete--name">{autocompleteEmojis[0]}</div>
        </div>
      )}
      <TextareaAutosize
        ref={noteInputRef}
        className="note-input__input"
        placeholder={t("NoteInput.placeholder")}
        value={value}
        onChange={handleChangeNoteText}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onAddNote();
          }
        }}
        onBlur={() => setEmojiAutocompleteName(null)}
        maxLength={maxNoteLength}
        id={`note-input-${columnId}`}
        data-tooltip-content={hotkeyKey}
      />
      <Tooltip
        anchorSelect={`#note-input-${columnId}`}
        place="bottom"
        variant={document.documentElement.getAttribute("theme") === "dark" ? "dark" : "light"}
        delayShow={500}
        style={{zIndex: 999}}
      />
      {isImage && (
        <div className="note-input__isImage" title={t("NoteInput.imageInfo")}>
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
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.preventDefault();
          onAddNote();
        }}
      >
        <PlusIcon className="note-input__icon--add" />
      </button>
    </form>
  );
};
