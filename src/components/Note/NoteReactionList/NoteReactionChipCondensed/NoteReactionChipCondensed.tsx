import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap} from "../../../../types/reaction";

import "./NoteReactionChipCondensed.scss";

interface NoteReactionChipPropsCondensed {
  reactions: ReactionModeled[];
}

export const NoteReactionChipCondensed = (props: NoteReactionChipPropsCondensed) => {
  // filter out own reaction if exists.
  const reactionsFiltered = props.reactions.filter((r) => !r.myReactionId);
  const reactionImages = reactionsFiltered.map((r) => ReactionImageMap.get(r.reactionType));
  // result: "User 1, User 2: laughingEmoji / User 3: heartEmoji"
  const title = reactionsFiltered.map((r) => `${r.users.map((u) => u.user.name).join(", ")}: ${ReactionImageMap.get(r.reactionType)}`).join(" / ");
  const totalAmount = reactionsFiltered.reduce((sum, reactionModeled) => sum + reactionModeled.amount, 0);

  return (
    <div className="note-reaction-chip-condensed__root" title={title}>
      {reactionImages.map((emoji) => (
        <div className="note-reaction-chip-condensed__reaction">{emoji}</div>
      ))}
      <div className="note-reaction-chip-condensed__amount">{totalAmount}</div>
    </div>
  );
};
