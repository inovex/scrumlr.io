import classNames from "classnames";
import {useId, MouseEvent} from "react";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {TooltipPortal} from "components/TooltipPortal/TooltipPortal";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
  handleClickReaction?: (e: MouseEvent<HTMLButtonElement>, reactionType: string) => void;
  handleLongPressReaction?: (e: LongPressReactEvents) => void;
  isDisabled: boolean;
  showTooltip?: boolean;
  overrideActive?: boolean; // if this is set, the chip will be highlighted no matter if yourself reacted to it
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(", ");
  // guarantee unique labels. without it tooltip may anchor at multiple places (ReactionList and ReactionPopup)
  const baseId = useId();
  const anchorId = `reaction-${props.reaction.noteId}-${props.reaction.reactionType}-${baseId}`;

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
          "note-reaction-chip__root--disabled": props.isDisabled,
        })}
        onClick={(e) => {
          if (props.handleClickReaction) {
            props.handleClickReaction(e, props.reaction.reactionType);
          }
        }} // bind short press
        onTouchStart={(e) => e.stopPropagation()} // prevent note dragging from here
        {...bindLongPress()} // bind long press
      >
        <div className="note-reaction-chip__reaction">{props.reaction.reactionType}</div>
        <div className="note-reaction-chip__amount">{props.reaction.amount}</div>
      </button>
      <TooltipPortal anchorId={anchorId} place="top" show={props.showTooltip}>
        {reactionUsers}
      </TooltipPortal>
    </>
  );
};
