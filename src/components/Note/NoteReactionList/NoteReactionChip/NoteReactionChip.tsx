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
  showTooltip?: boolean;
  overrideActive?: boolean; // if this is set, the chip will be highlighted no matter if yourself reacted to it
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
        className={classNames("note-reaction-chip__root", {
          "note-reaction-chip__root--self": props.reaction.myReactionId && props.overrideActive === undefined, // highlight chips that yourself reacted to (if no override)
          "note-reaction-chip__root--override-active": props.overrideActive,
        })}
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
      {props.showTooltip && (
        <Tooltip anchorSelect={`#reaction-${props.reaction.noteId}-${props.reaction.reactionType}`} className="note-reaction-chip__tooltip" place="top" content={reactionUsers} />
      )}
    </>
  );
};
