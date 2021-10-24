import React from "react";
import "./NoteInput.scss";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import store from "store";
import {ActionFactory} from "store/action";

export interface NoteInputProps {
  columnId: string;
}

export const NoteInput = ({columnId}: NoteInputProps) => {
  const [value, setValue] = React.useState("");

  const handleChangeNotetext = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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
        placeholder="Add your note..."
        type="text"
        value={value}
        onChange={handleChangeNotetext}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            onAddNote();
          }
        }}
      />
      <PlusIcon onClick={onAddNote} className="note-input__icon" />
    </div>
  );
};
