import {Tooltip} from "react-tooltip";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap} from "../../../../types/reaction";

import "./NoteReactionChipCondensed.scss";

interface NoteReactionChipPropsCondensed {
  reactions: ReactionModeled[];
}

export const NoteReactionChipCondensed = (props: NoteReactionChipPropsCondensed) => {
  const {noteId} = props.reactions[0]; // assertion: props.reactions > ACTIVATE_CONDENSED_VIEW_MIN_USER_AMOUNT
  // filter out own reaction if exists.
  const reactionsFiltered = props.reactions.filter((r) => !r.myReactionId);
  const reactionImages = reactionsFiltered.map((r) => ReactionImageMap.get(r.reactionType));
  // result: "User 1, User 2: laughingEmoji / User 3: heartEmoji"
  const title = reactionsFiltered.map((r) => `${r.users.map((u) => u.user.name).join(", ")}: ${ReactionImageMap.get(r.reactionType)}`).join(" / ");
  const totalAmount = reactionsFiltered.reduce((sum, reactionModeled) => sum + reactionModeled.amount, 0);

  return (
    <>
      <div id={`reactions-condensed-${noteId}`} className="note-reaction-chip-condensed__root">
        {reactionImages.map((emoji) => (
          <div className="note-reaction-chip-condensed__reaction">{emoji}</div>
        ))}
        <div className="note-reaction-chip-condensed__amount">{totalAmount}</div>
      </div>
      <Tooltip anchorSelect={`#reactions-condensed-${noteId}`} place="top" variant={document.documentElement.getAttribute("theme") === "dark" ? "dark" : "light"} content={title} />
    </>
  );
};
