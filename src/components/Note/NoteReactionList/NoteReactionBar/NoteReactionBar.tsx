import React from "react";
import classNames from "classnames";
import {ReactionImageMap, ReactionType} from "types/reaction";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionBar.scss";

interface NoteReactionBarProps {
  closeReactionBar: () => void;
  reactions: ReactionModeled[];
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
}

export const NoteReactionBar = (props: NoteReactionBarProps) => {
  const handleClickBar = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    props.closeReactionBar();
    props.handleClickReaction(e, reactionType);
  };

  // after tabbing through the list of buttons, the bar should close automatically after leaving the focus
  // note that shift+tab is not possible while on the last item because the tabbing direction isn't an event property, I hope nobody minds
  const handleBlurButton = (index: number) => {
    if (index === ReactionImageMap.size - 1) {
      // only close upon leaving the last item
      props.closeReactionBar();
    }
  };

  return (
    <div className="note-reaction-bar__root">
      {[...ReactionImageMap.entries()].map(([type, emoji], index) => {
        // highlight reaction made by yourself
        const active = !!props.reactions.find((r) => r.reactionType === type && !!r.myReactionId);
        return (
          <button
            key={type}
            className={classNames("note-reaction-bar__reaction", {"note-reaction-bar__reaction--active": active})}
            onClick={(e) => handleClickBar(e, type)}
            onMouseDown={(e) => e.preventDefault() /* prevent note from losing focus */}
            tabIndex={0}
            onBlur={() => handleBlurButton(index)}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
};
