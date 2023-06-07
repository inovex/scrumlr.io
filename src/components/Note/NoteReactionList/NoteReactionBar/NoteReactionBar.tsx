import React from "react";
import classNames from "classnames";
import {ReactionImageMap, ReactionType} from "../../../../types/reaction";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionBar.scss";

interface NoteReactionBarProps {
  // injecting state setter to easily communicate with parent
  setShowReactionBar: React.Dispatch<React.SetStateAction<boolean>>;
  reactions: ReactionModeled[];
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
}

export const NoteReactionBar = (props: NoteReactionBarProps) => {
  const handleClickBar = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    props.setShowReactionBar(false);
    props.handleClickReaction(e, reactionType);
  };

  return (
    <div className="note-reaction-bar__root">
      {[...ReactionImageMap.entries()].map(([type, emoji]) => {
        // highlight reaction made by yourself
        const active = !!props.reactions.find((r) => r.reactionType === type && !!r.myReactionId);
        return (
          <button className={classNames("note-reaction-bar__reaction", {"note-reaction-bar__reaction--active": active})} onClick={(e) => handleClickBar(e, type)}>
            {emoji}
          </button>
        );
      })}
    </div>
  );
};
