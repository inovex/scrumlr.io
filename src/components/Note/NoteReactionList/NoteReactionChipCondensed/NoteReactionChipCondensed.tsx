import {hashCode} from "utils/hash";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {getEmojiDisplay, LEGACY_REACTION_EMOJI_MAP} from "store/features/reactions/types";
import {uniqueId} from "underscore";
import {TooltipPortal} from "components/TooltipPortal/TooltipPortal";
import {Emoji} from "emoji-picker-react";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionChipCondensed.scss";

interface NoteReactionChipPropsCondensed {
  reactions: ReactionModeled[];
  handleLongPressReaction: (e: LongPressReactEvents) => void;
}

export const NoteReactionChipCondensed = (props: NoteReactionChipPropsCondensed) => {
  // assertion: props.reactions > ACTIVATE_CONDENSED_VIEW_MIN_USER_AMOUNT > 0
  const {noteId} = props.reactions[0];
  // filter out own reaction if exists.
  const reactionsFiltered = props.reactions.filter((r) => !r.myReactionId);
  const reactionDisplays = reactionsFiltered.map((r) => ({
    display: getEmojiDisplay(r.reactionType),
    legacyReaction: LEGACY_REACTION_EMOJI_MAP.get(r.reactionType),
    reactionType: r.reactionType,
  }));
  // result example: [0]: "User 1, User 2: laughingEmoji"
  //                 [1]: "User 3: heartEmoji"
  const reactionUsersTitle = reactionsFiltered.map((r) => `${r.users.map((u) => u.user.name).join(", ")}: ${getEmojiDisplay(r.reactionType)}`);
  const totalAmount = reactionsFiltered.reduce((sum, reactionModeled) => sum + reactionModeled.amount, 0);

  const anchorId = uniqueId(`reactions-${noteId}-condensed`);

  const bindLongPress = useLongPress((e) => {
    if (props.handleLongPressReaction) {
      props.handleLongPressReaction(e);
    }
  });

  return (
    <>
      <div
        id={`${anchorId}`}
        className="note-reaction-chip-condensed__root"
        onTouchStart={(e) => e.stopPropagation()} // prevent note dragging from here
        {...bindLongPress()}
      >
        <div className="note-reaction-chip-condensed__reactions-container">
          {reactionDisplays.map((reaction) => (
            <div className="note-reaction-chip-condensed__reaction" key={`reaction-${reaction.reactionType}`}>
              {reaction.legacyReaction ? <Emoji unified={reaction.legacyReaction.unified} size={14} /> : reaction.display}
            </div>
          ))}
        </div>
        <div className="note-reaction-chip-condensed__amount">{totalAmount}</div>
      </div>
      <TooltipPortal anchor={anchorId} place="top" show>
        <div className="note-reaction-chip-condensed__tooltip-content">
          {reactionUsersTitle.map((t) => (
            // hash because a unique key is required to make linter happy
            <span key={hashCode(t)}>{t}</span>
          ))}
        </div>
      </TooltipPortal>
    </>
  );
};
