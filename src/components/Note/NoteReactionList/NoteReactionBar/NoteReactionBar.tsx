import React, {useEffect} from "react";
import classNames from "classnames";
import {REACTION_EMOJI_MAP, ReactionType} from "types/reaction";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionBar.scss";

interface NoteReactionBarProps {
  isOpen: boolean;
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
    if (index === REACTION_EMOJI_MAP.size - 1) {
      // only close upon leaving the last item
      props.closeReactionBar();
    }
  };

  // this allows the selection of an emoji using the enter key
  // by preventing the note from being opened if it's active
  useEffect(() => {
    const handlePressEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && props.isOpen) {
        // only stop bubbling if the bar is open to prevent unintended behaviour
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handlePressEnter, true);
    return () => document.removeEventListener("keydown", handlePressEnter, true);
  }, [props.isOpen]);

  return (
    <div className="note-reaction-bar__root">
      {[...REACTION_EMOJI_MAP.entries()].map(([type, emoji], index) => {
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
