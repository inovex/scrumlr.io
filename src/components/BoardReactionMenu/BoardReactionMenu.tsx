import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionImageMap, ReactionType} from "types/reaction";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {useHotkeys} from "react-hotkeys-hook";
import "./BoardReactionMenu.scss";

export const BoardReactionMenu = () => {
  const dispatch = useDispatch();

  const boardReactions = [...BoardReactionImageMap];

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent, reaction: ReactionType) => {
    e.stopPropagation();
    dispatch(Actions.addBoardReaction(reaction));
  };

  // hotkey is converted to a number which is then used as the index for the reaction type
  useHotkeys(["1", "2", "3", "4", "5"], (e, k) => onClickReaction(e, boardReactions[+k.keys![0]][0]));

  return (
    <div className="board-reactions__root">
      <div className="board-reactions__container">
        {boardReactions.map(([reactionType, emoji]) => (
          <button key={reactionType} className="board-reactions__item board-reactions__reaction" onClick={(e) => onClickReaction(e, reactionType)}>
            <span>{emoji}</span>
          </button>
        ))}

        <CloseIcon className="board-reactions__item board-reactions__close" aria-hidden />
      </div>
    </div>
  );
};
