import classNames from "classnames";
import React from "react";
import {Tooltip} from "react-tooltip";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap, ReactionType} from "../../../../types/reaction";

import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
  handleClickReaction?: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
  handleLongPressReaction?: (e: LongPressReactEvents) => void;
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionImage = ReactionImageMap.get(props.reaction.reactionType);
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(", ");

  const bindLongPress = useLongPress((e) => {
    if (props.handleLongPressReaction) {
      props.handleLongPressReaction(e);
    }
  });

  return (
    <>
      <button
        id={`reaction-${props.reaction.noteId}-${props.reaction.reactionType}`} // unique identifier
        className={classNames("note-reaction-chip__root", {"note-reaction-chip__root--self": props.reaction.myReactionId})} // highlight chips that yourself reacted to
        onClick={(e) => {
          if (props.handleClickReaction) {
            props.handleClickReaction(e, props.reaction.reactionType);
          }
        }} // bind short press
        onTouchStart={(e) => e.stopPropagation()} // prevent note dragging from here
        {...bindLongPress()} // bind long press
      >
        <div className="note-reaction-chip__reaction">{reactionImage}</div>
        <div className="note-reaction-chip__amount">{props.reaction.amount}</div>
      </button>
      <Tooltip
        anchorSelect={`#reaction-${props.reaction.noteId}-${props.reaction.reactionType}`}
        place="top"
        variant={document.documentElement.getAttribute("theme") === "dark" ? "dark" : "light"}
        content={reactionUsers}
      />
    </>
  );
};
