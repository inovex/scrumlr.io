import classNames from "classnames";
import React from "react";
import {Tooltip} from "react-tooltip";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap, ReactionType} from "../../../../types/reaction";

import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const reactionImage = ReactionImageMap.get(props.reaction.reactionType);
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(", ");

  return (
    <>
      <button
        id={`reaction-${props.reaction.noteId}-${props.reaction.reactionType}`} // unique identifier
        className={classNames("note-reaction-chip__root", {"note-reaction-chip__root--self": props.reaction.myReactionId})} // highlight chips that yourself reacted to
        onClick={(e) => props.handleClickReaction(e, props.reaction.reactionType)}
      >
        <div className="note-reaction-chip__reaction">{reactionImage}</div>
        <div className="note-reaction-chip__amount">{props.reaction.amount}</div>
      </button>
      <Tooltip
        anchorSelect={`#reaction-${props.reaction.noteId}-${props.reaction.reactionType}`}
        place="top"
        variant={document.documentElement.getAttribute("theme") === "dark" ? "dark" : "light"}
        content={reactionUsers}
      />
    </>
  );
};
