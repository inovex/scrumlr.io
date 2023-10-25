import React from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ReactionType} from "types/reaction";
import {BOARD_REACTION_EMOJI_MAP} from "types/boardReaction";
import {Actions} from "store/action";
import {useDispatch} from "react-redux";
import {useHotkeys} from "react-hotkeys-hook";
import {useAppSelector} from "store";
import {Toast} from "utils/Toast";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import "./BoardReactionMenu.scss";

type BoardReactionMenuProps = {
  close: () => void;
};

const REACTION_DEBOUNCE_TIME = 300; // milliseconds

export const BoardReactionMenu = (props: BoardReactionMenuProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const boardReactions = [...BOARD_REACTION_EMOJI_MAP];

  const showBoardReactions = useAppSelector((state) => state.view.showBoardReactions);

  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, REACTION_DEBOUNCE_TIME);

  const onClickReaction = (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent, reaction: ReactionType) => {
    e.stopPropagation();
    if (!showBoardReactions) {
      Toast.info({
        title: t("Toast.boardReactionsDisabled"),
        buttons: [t("Toast.enable")],
        firstButtonOnClick: () => dispatch(Actions.setShowBoardReactions(true)),
      });
    } else if (debounce) {
      // not ready yet
    } else {
      dispatch(Actions.addBoardReaction(reaction));
      resetDebounce();
    }
  };

  // hotkey is converted to a number which is then used as the index for the reaction type
  useHotkeys(["1", "2", "3", "4", "5"], (e, k) => onClickReaction(e, boardReactions[+k.keys![0] - 1][0]));

  return (
    <div className="board-reactions__root">
      <div className="board-reactions__container">
        {boardReactions.map(([reactionType, emoji], index) => (
          <button
            key={reactionType}
            className={classNames("board-reactions__item board-reactions__reaction", {"board-reactions__reaction--disabled": !showBoardReactions})}
            aria-disabled={!showBoardReactions}
            aria-label={t("BoardReactionsMenu.react", {reaction: reactionType, shortcut: index + 1})}
            title={t("BoardReactionsMenu.react", {reaction: reactionType, shortcut: index + 1})}
            onClick={(e) => onClickReaction(e, reactionType)}
          >
            <span>{emoji}</span>
          </button>
        ))}

        <CloseIcon className="board-reactions__item board-reactions__close" onClick={props.close} aria-hidden />
      </div>
    </div>
  );
};
