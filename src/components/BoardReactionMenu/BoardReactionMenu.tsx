import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionImageMap, ReactionType} from "types/reaction";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import "./BoardReactionMenu.scss";

export const BoardReactionMenu = () => {
  const dispatch = useDispatch();

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reaction: ReactionType) => {
    e.stopPropagation();
    dispatch(Actions.addBoardReaction(reaction));
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
