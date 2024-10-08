import {hashCode} from "utils/hash";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {REACTION_EMOJI_MAP} from "store/features/reactions/types";
import {uniqueId} from "underscore";
import {TooltipPortal} from "components/TooltipPortal/TooltipPortal";
import {useAppSelector} from "store";
import {getEmojiWithSkinTone} from "utils/reactions";
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
  const reactionImages = reactionsFiltered.map((r) => REACTION_EMOJI_MAP.get(r.reactionType));
  // result example: [0]: "User 1, User 2: laughingEmoji"
  //                 [1]: "User 3: heartEmoji"
  const reactionUsersTitle = reactionsFiltered.map((r) => `${r.users.map((u) => u.user.name).join(", ")}: ${REACTION_EMOJI_MAP.get(r.reactionType)}`);
  const totalAmount = reactionsFiltered.reduce((sum, reactionModeled) => sum + reactionModeled.amount, 0);

  const anchorId = uniqueId(`reactions-${noteId}-condensed`);

  const skinTone = useAppSelector((state) => state.skinTone);

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
          {reactionImages.map((emoji) => (
            <div className="note-reaction-chip-condensed__reaction" key={`reaction-${emoji}`}>
              {getEmojiWithSkinTone(emoji!, skinTone)}
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
