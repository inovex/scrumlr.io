import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionType, BoardReactionImageMap, ReactionType} from "types/reaction";
import {useAppSelector} from "store";
import {uniqueId} from "underscore";
import {BoardReactionEmitter} from "utils/boardReaction";
import "./BoardReactionMenu.scss";

const REMOVAL_DELAY_MS = 5_000;

export const BoardReactionMenu = () => {
  const me = useAppSelector((state) => state.participants?.self);

  const removeAfterDelay = (id: string, delay: number) => {
    setTimeout(() => {
      BoardReactionEmitter.remove(id);
    }, delay);
  };

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reaction: ReactionType) => {
    e.stopPropagation();
    const id = uniqueId();
    const boardReaction: BoardReactionType = {id, reactionType: reaction, user: me!};
    BoardReactionEmitter.add(boardReaction);
    removeAfterDelay(id, REMOVAL_DELAY_MS);
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
