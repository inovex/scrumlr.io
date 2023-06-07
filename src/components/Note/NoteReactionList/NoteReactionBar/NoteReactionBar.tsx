import React from "react";
import {ReactionImageMap, ReactionType} from "../../../../types/reaction";
import "./NoteReactionBar.scss";

interface NoteReactionBarProps {
  // injecting state setter to easily communicate with parent
  setShowReactionBar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NoteReactionBar = (props: NoteReactionBarProps) => {
  const handleBarClick = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    e.stopPropagation();
    console.log(reactionType);
    props.setShowReactionBar(false);
  };

  return (
    <div className="note-reaction-bar__root">
      {[...ReactionImageMap.entries()].map(([type, emoji]) => (
        <button className="note-reaction-bar__reaction" onClick={(e) => handleBarClick(e, type)}>
          {emoji}
        </button>
      ))}
    </div>
  );
};
