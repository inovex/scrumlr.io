import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {BoardReactionImageMap, ReactionType} from "types/reaction";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {useHotkeys} from "react-hotkeys-hook";
import {useAppSelector} from "store";
import {Toast} from "utils/Toast";
import "./BoardReactionMenu.scss";

type BoardReactionMenuProps = {
  close: () => void;
};

export const BoardReactionMenu = (props: BoardReactionMenuProps) => {
  const dispatch = useDispatch();

  const boardReactions = [...BoardReactionImageMap];

  const showBoardReactions = useAppSelector((state) => state.view.showBoardReactions);

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent, reaction: ReactionType) => {
    e.stopPropagation();
    if (!showBoardReactions) {
      Toast.info({
        title: "Board reaction are disabled. Click to enable.",
        buttons: ["Enable"],
        firstButtonOnClick: () => dispatch(Actions.setShowBoardReactions(true)),
      });
    } else {
      dispatch(Actions.addBoardReaction(reaction));
    }
  };

  // hotkey is converted to a number which is then used as the index for the reaction type
  useHotkeys(["1", "2", "3", "4", "5"], (e, k) => onClickReaction(e, boardReactions[+k.keys![0] - 1][0]));

  return (
    <div className="board-reactions__root">
      <div className="board-reactions__container">
        {boardReactions.map(([reactionType, emoji]) => (
          <button key={reactionType} className="board-reactions__item board-reactions__reaction" onClick={(e) => onClickReaction(e, reactionType)}>
            <span>{emoji}</span>
          </button>
        ))}

        <CloseIcon className="board-reactions__item board-reactions__close" onClick={props.close} aria-hidden />
      </div>
    </div>
  );
};
