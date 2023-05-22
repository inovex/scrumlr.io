import classNames from "classnames";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap} from "../../../../types/reaction";

import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionImage = ReactionImageMap.get(props.reaction.reactionType);
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(",");
  return (
    <div className={classNames("note-reaction-chip__root", {"note-reaction-chip__root--self": props.reaction.reactedSelf})} title={reactionUsers}>
      <div>{reactionImage}</div>
      <div>{props.reaction.amount}</div>
    </div>
  );
};
