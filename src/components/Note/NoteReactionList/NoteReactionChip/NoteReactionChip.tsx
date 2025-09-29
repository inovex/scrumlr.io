import classNames from "classnames";
import React from "react";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {uniqueId} from "underscore";
import {getEmojiDisplay, ReactionType, LEGACY_REACTION_EMOJI_MAP} from "store/features/reactions/types";
import {useAppSelector} from "store";
import {TooltipPortal} from "components/TooltipPortal/TooltipPortal";
import {Emoji} from "emoji-picker-react";
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
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(", ");
  // guarantee unique labels. without it tooltip may anchor at multiple places (ReactionList and ReactionPopup)
  const anchorId = uniqueId(`reaction-${props.reaction.noteId}-${props.reaction.reactionType}`);
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);
  const isModerator = useAppSelector((state) => ["OWNER", "MODERATOR"].some((role) => state.participants!.self!.role === role));

  // Check if this is a legacy reaction with unified code
  const legacyReaction = LEGACY_REACTION_EMOJI_MAP.get(props.reaction.reactionType);
  const reactionDisplay = getEmojiDisplay(props.reaction.reactionType);

  const bindLongPress = useLongPress((e) => {
    if (props.handleLongPressReaction) {
      props.handleLongPressReaction(e);
    }
  });

  return (
    <>
      <button
        disabled={!isModerator && boardLocked}
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
        <div className="note-reaction-chip__reaction">{legacyReaction ? <Emoji unified={legacyReaction.unified} size={16} /> : reactionDisplay}</div>
        <div className="note-reaction-chip__amount">{props.reaction.amount}</div>
      </button>
      <TooltipPortal anchor={anchorId} place="top" show={props.showTooltip}>
        {reactionUsers}
      </TooltipPortal>
    </>
  );
};
