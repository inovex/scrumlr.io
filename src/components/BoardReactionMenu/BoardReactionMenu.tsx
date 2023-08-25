import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionEventType, BoardReactionImageMap, ReactionType} from "types/reaction";
import {useAppSelector} from "store";
import {uniqueId} from "underscore";
import "./BoardReactionMenu.scss";

export const BoardReactionMenu = () => {
  const me = useAppSelector((state) => state.participants?.self);

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reaction: ReactionType) => {
    e.stopPropagation();
    const id = uniqueId();
    document.dispatchEvent(new CustomEvent<BoardReactionEventType>("BoardReactionEvent", {detail: {id, reactionType: reaction, user: me!}}));
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
