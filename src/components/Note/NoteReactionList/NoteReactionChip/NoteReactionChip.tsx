import classNames from "classnames";
import React from "react";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap, ReactionType} from "../../../../types/reaction";

import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionImage = ReactionImageMap.get(props.reaction.reactionType);
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(",");

  return (
    <button
      className={classNames("note-reaction-chip__root", {"note-reaction-chip__root--self": props.reaction.myReactionId})} // highlight chips that yourself reacted to
      title={reactionUsers}
      onClick={(e) => props.handleClickReaction(e, props.reaction.reactionType)}
    >
      <div className="note-reaction-chip__reaction">{reactionImage}</div>
      <div className="note-reaction-chip__amount">{props.reaction.amount}</div>
    </button>
  );
};
