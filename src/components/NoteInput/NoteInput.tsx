import React from "react";
import "./NoteInput.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import store from "store";
import {ActionFactory} from "store/action";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";

const MAX_NOTE_LENGTH = 1024;

export interface NoteInputProps {
  columnId: string;
  tabIndex?: number;
}

export const NoteInput = ({columnId, tabIndex}: NoteInputProps) => {
  const {t} = useTranslation();
  const [value, setValue] = React.useState("");

  const handleChangeNotetext = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Avoid long messages
    if (e.target.value.length <= MAX_NOTE_LENGTH) {
      setValue(e.target.value);
    }
  };
  const onAddNote = () => {
    if (value) {
      store.dispatch(ActionFactory.addNote(columnId!, value));
      setValue("");
    }
  };
  return (
    <div className="note-input">
      <input
        className="note-input__input"
        placeholder={t("NoteInput.placeholder")}
        type="text"
        value={value}
        onChange={handleChangeNotetext}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            onAddNote();
          }
        }}
        tabIndex={tabIndex ?? TabIndex.default}
      />
      <PlusIcon onClick={onAddNote} className="note-input__icon" />
    </div>
  );
};
