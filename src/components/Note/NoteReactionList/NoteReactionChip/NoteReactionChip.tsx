import classNames from "classnames";
import React from "react";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {uniqueId} from "underscore";
import {REACTION_EMOJI_MAP, ReactionType} from "types/reaction";
import {TooltipPortal} from "components/TooltipPortal/TooltipPortal";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
  handleClickReaction?: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
  handleLongPressReaction?: (e: LongPressReactEvents) => void;
  showTooltip?: boolean;
  overrideActive?: boolean; // if this is set, the chip will be highlighted no matter if yourself reacted to it
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionImage = REACTION_EMOJI_MAP.get(props.reaction.reactionType);
  // filter out users with nulled ID´s (due to the event filter)
  const reactionUsers =
    props.reaction.users
      .map((u) => (u && u.user && u.user.name ? u.user.name : ""))
      .filter((name) => name !== "") // when a name is empty, the next line appends a info string
      .join(", ") + (props.reaction.users.some((u) => !(u && u.user && u.user.name)) ? " and hidden users" : "");

  // guarantee unique labels. without it tooltip may anchor at multiple places (ReactionList and ReactionPopup)
  const anchorId = uniqueId(`reaction-${props.reaction.noteId}-${props.reaction.reactionType}`);

  const bindLongPress = useLongPress((e) => {
    if (props.handleLongPressReaction) {
      props.handleLongPressReaction(e);
    }
  });

  return (
    <>
      <button
        id={anchorId} // unique identifier
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
      <TooltipPortal anchor={anchorId} place="top" show={props.showTooltip}>
        {reactionUsers}
      </TooltipPortal>
    </>
  );
};
