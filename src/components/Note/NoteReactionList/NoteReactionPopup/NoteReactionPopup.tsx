import React from "react";
import {Portal} from "components/Portal";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionPopup.scss";
import {NoteReactionChip} from "../NoteReactionChip/NoteReactionChip";

interface NoteReactionPopupProps {
  reactions: ReactionModeled[];
  onClose: (e: React.MouseEvent) => void;
}

export const NoteReactionPopup = (props: NoteReactionPopupProps) => {
  // sum total reactions
  const totalReactions = props.reactions.reduce((acc: number, curr: ReactionModeled) => acc + curr.amount, 0);
  return (
    <Portal hiddenOverflow onClick={props.onClose}>
      <div className="note-reaction-popup__root">
        <div className="note-reaction-popup__tab-bar">
          <button className="note-reaction-popup__tab--all">
            <div className="note-reaction-popup__tab--text">Alle</div>
            <div className="note-reaction-popup__tab--amount">{totalReactions}</div>
          </button>
          {props.reactions.map((r) => (
            <NoteReactionChip reaction={r} key={r.reactionType} />
          ))}
        </div>
      </div>
    </Portal>
  );
};
