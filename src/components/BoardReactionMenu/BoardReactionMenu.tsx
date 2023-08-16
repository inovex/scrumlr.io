import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionImageMap, ReactionType} from "types/reaction";
import "./BoardReactionMenu.scss";

export const BoardReactionMenu = () => {
  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reaction: ReactionType) => {
    e.stopPropagation();
    console.log("click", reaction);
  };

  return (
    <div className="board-reactions__root">
      <div className="board-reactions__container">
        {[...BoardReactionImageMap].map(([reactionType, emoji]) => (
          <button key={reactionType} className="board-reactions__item board-reactions__reaction" onClick={(e) => onClickReaction(e, reactionType)}>
            <span>{emoji}</span>
          </button>
        ))}

        <CloseIcon className="board-reactions__item board-reactions__close" aria-hidden />
      </div>
    </div>
  );
};
