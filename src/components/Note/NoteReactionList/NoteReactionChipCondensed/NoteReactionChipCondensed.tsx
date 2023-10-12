import {Tooltip} from "react-tooltip";
import {hashCode} from "utils/hash";
import {LongPressReactEvents, useLongPress} from "use-long-press";
import {ReactionImageMap} from "types/reaction";
import {uniqueId} from "underscore";
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
  const reactionImages = reactionsFiltered.map((r) => ReactionImageMap.get(r.reactionType));
  // result example: [0]: "User 1, User 2: laughingEmoji"
  //                 [1]: "User 3: heartEmoji"
  const reactionUsersTitle = reactionsFiltered.map((r) => `${r.users.map((u) => u.user.name).join(", ")}: ${ReactionImageMap.get(r.reactionType)}`);
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
          {reactionImages.map((emoji) => (
            <div className="note-reaction-chip-condensed__reaction" key={`reaction-${emoji}`}>
              {emoji}
            </div>
          ))}
        </div>
        <div className="note-reaction-chip-condensed__amount">{totalAmount}</div>
      </div>
      <Tooltip anchorSelect={`#${anchorId}`} className="note-reaction-chip-condensed__tooltip" place="top">
        <div className="note-reaction-chip-condensed__tooltip-content">
          {reactionUsersTitle.map((t) => (
            // hash because a unique key is required to make linter happy
            <span key={hashCode(t)}>{t}</span>
          ))}
        </div>
      </Tooltip>
    </>
  );
};
