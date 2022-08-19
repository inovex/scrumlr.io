import React, {useRef, useState} from "react";
import "./NoteInput.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {useHotkeys} from "react-hotkeys-hook";
import {hotkeyMap} from "../../constants/hotkeys";

export interface NoteInputProps {
  columnId: string;
  maxNoteLength: number;
  columnIndex: number;
}

export const NoteInput = ({columnIndex, columnId, maxNoteLength}: NoteInputProps) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const noteInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleChangeNoteText = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Avoid long messages
    if (e.target.value.length <= maxNoteLength) {
      setValue(e.target.value);
    }
  };
  const onAddNote = () => {
    if (value) {
      dispatch(Actions.addNote(columnId!, value));
      setValue("");
    }
  };
  return (
    <form className="note-input">
      <input
        ref={noteInputRef}
        className="note-input__input"
        placeholder={t("NoteInput.placeholder")}
        type="text"
        value={value}
        onChange={handleChangeNoteText}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAddNote();
          }
        }}
        maxLength={maxNoteLength}
      />
      <button
        type="submit"
        className="note-input__add-button"
        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.preventDefault();
          onAddNote();
        }}
      >
        <PlusIcon className="note-input__icon" />
      </button>
    </form>
  );
};
