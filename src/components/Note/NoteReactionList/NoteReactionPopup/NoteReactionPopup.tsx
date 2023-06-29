import React from "react";
import {Portal} from "components/Portal";
import "./NoteReactionPopup.scss";

interface NoteReactionPopupProps {
  onClose: (e: React.MouseEvent) => void;
}

export const NoteReactionPopup = (props: NoteReactionPopupProps) => (
    <Portal hiddenOverflow onClick={props.onClose}>
      <div className="note-reaction-popup__root">
        Popup
        <button className="note-reaction-popup__close" onClick={props.onClose}>
          Close
        </button>
      </div>
    </Portal>
  );
