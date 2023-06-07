import classNames from "classnames";
import React from "react";
import {useDispatch} from "react-redux";
import {ReactionModeled} from "../NoteReactionList";
import {ReactionImageMap} from "../../../../types/reaction";
import {Actions} from "../../../../store/action";

import "./NoteReactionChip.scss";

interface NoteReactionChipProps {
  reaction: ReactionModeled;
}

export const NoteReactionChip = (props: NoteReactionChipProps) => {
  const dispatch = useDispatch();
  const reactionImage = ReactionImageMap.get(props.reaction.reactionType);
  const reactionUsers = props.reaction.users.map((u) => u.user.name).join(",");

  const addReaction = () => {
    dispatch(Actions.addReaction(props.reaction.noteId, props.reaction.reactionType));
  };
  const deleteReaction = () => {
    dispatch(
      Actions.deleteReaction(props.reaction.myReactionId!) // has to be set, since reactedSelf === true
    );
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // in board overview, prevent note from opening stack view
    if (props.reaction.myReactionId) {
      deleteReaction();
    } else {
      addReaction();
    }
  };
  return (
    <button
      className={classNames("note-reaction-chip__root", {"note-reaction-chip__root--self": props.reaction.myReactionId})} // highlight chips that yourself reacted to
      title={reactionUsers}
      onClick={(e) => handleClick(e)}
    >
      <div className="note-reaction-chip__reaction">{reactionImage}</div>
      <div className="note-reaction-chip__amount">{props.reaction.amount}</div>
    </button>
  );
};
