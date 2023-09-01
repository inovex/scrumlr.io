import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionEventType, BoardReactionImageMap, ReactionType} from "types/reaction";
import {useAppSelector} from "store";
import {uniqueId} from "underscore";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import "./BoardReactionMenu.scss";

const REMOVAL_DELAY_MS = 5_000;

export const BoardReactionMenu = () => {
  const dispatch = useDispatch();
  const me = useAppSelector((state) => state.participants?.self);

  const removeAfterDelay = (id: string, delay: number) => {
    setTimeout(() => {
      dispatch(Actions.removeBoardReaction(id));
    }, delay);
  };

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reaction: ReactionType) => {
    e.stopPropagation();
    const id = uniqueId();
    const boardReaction: BoardReactionEventType = {id, reactionType: reaction, user: me!};
    dispatch(Actions.addBoardReaction(boardReaction));
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
