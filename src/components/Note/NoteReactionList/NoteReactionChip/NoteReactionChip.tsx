import classNames from "classnames";
import React from "react";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap} from "../../../../types/reaction";

import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionImage = ReactionImageMap.get(props.reaction.reactionType);
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(",");

  const addReaction = () => {};
  const removeReaction = () => {};

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // in board overview, prevent note from opening stack view
    if (props.reaction.reactedSelf) {
      removeReaction();
    } else {
      addReaction();
    }
  };
  return (
    <button
      className={classNames("note-reaction-chip__root", {"note-reaction-chip__root--self": props.reaction.reactedSelf})}
      title={reactionUsers}
      onClick={(e) => handleClick(e)}
    >
      <div>{reactionImage}</div>
      <div>{props.reaction.amount}</div>
    </button>
  );
};
