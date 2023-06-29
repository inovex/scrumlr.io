import React from "react";
import {Portal} from "components/Portal";
import "./NoteReactionPopup.scss";

interface NoteReactionPopupProps {
  onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const NoteReactionPopup = (props: NoteReactionPopupProps) => (
    <Portal hiddenOverflow onClick={(e) => e.stopPropagation()}>
      <div className="note-reaction-popup__root">
        Popup
        <button className="note-reaction-popup__close" onClick={props.onClose}>
          Close
        </button>
      </div>
    </Portal>
  );
