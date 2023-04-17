import React, {useRef, useState} from "react";
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
import {ReactComponent as DeleteIcon} from "assets/icon-delete.svg";
import {hotkeyMap} from "../../constants/hotkeys";

// To delete

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
  const noteInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleChangeNoteText = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Avoid long messages
    if (e.target.value.length <= maxNoteLength) {
      setValue(e.target.value);
    }
  };

  const onAddNote = () => {
    if (value) {
      dispatch(Actions.addNote(columnId!, value));
      if (!columnIsVisible && !toastDisplayed) {
        Toast.info({
          title: "Hidden column",
          message: t("Toast.noteToHiddenColumn"),
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
      <input
        ref={noteInputRef}
        className="note-input__input"
        placeholder={t("NoteInput.placeholder")}
        onClick={() =>
          Toast.success({
            title: "Karte gelöscht",
            // message: "At vero eos et accusam et justo is leta dolores et ea rebum lorem.",
            buttons: ["Rückgängig"],
            // hintMessage: "Don't show this again",
            // hintOnClick: () => console.log("hint clicked"),
            // firstButtonOnClick: () => console.log("button clicked"),
            // icon: DeleteIcon,
            // iconName: "delete",
            autoClose: false,
          })
        }
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
