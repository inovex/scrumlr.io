import {ForwardedRef, forwardRef, MouseEvent} from "react";
import {Close} from "components/Icon";
import {ReactionType} from "store/features/reactions/types";
import {BOARD_REACTION_EMOJI_MAP} from "store/features/boardReactions/types";
import {useHotkeys} from "react-hotkeys-hook";
import {useAppDispatch, useAppSelector} from "store";
import {Toast} from "utils/Toast";
import {useTranslation} from "react-i18next";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import {animated, useTransition} from "@react-spring/web";
import "./BoardReactionMenu.scss";
import {addBoardReaction, setShowBoardReactions} from "store/features";

type BoardReactionMenuProps = {
  showMenu: boolean;
  close: () => void;
};

const REACTION_DEBOUNCE_TIME = 300; // milliseconds

export const BoardReactionMenu = forwardRef((props: BoardReactionMenuProps, ref: ForwardedRef<HTMLDivElement>) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  const boardReactions = [...BOARD_REACTION_EMOJI_MAP];

  const showBoardReactions = useAppSelector((state) => state.view.showBoardReactions);

  const skinTone = useAppSelector((state) => state.skinTone);

  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, REACTION_DEBOUNCE_TIME);

  const onClickReaction = (e: MouseEvent<HTMLButtonElement> | KeyboardEvent, reaction: ReactionType) => {
    e.stopPropagation();
    if (!showBoardReactions) {
      Toast.info({
        title: t("Toast.boardReactionsDisabled"),
        buttons: [t("Toast.enable")],
        firstButtonOnClick: () => dispatch(setShowBoardReactions(true)),
      });
    } else if (debounce) {
      // not ready yet
    } else {
      dispatch(addBoardReaction(reaction));
      resetDebounce();
    }
  };

  // hotkey is converted to a number which is then used as the index for the reaction type
  useHotkeys(["1", "2", "3", "4", "5"], (e, k) => onClickReaction(e, boardReactions[+k.keys![0] - 1][0]));

  const menuTransition = useTransition(props.showMenu, {
    from: {opacity: 0, transform: "scale(0.3, 0.9) translateY(100%)", "pointer-events": "none"},
    enter: {opacity: 1, transform: "scale(1, 1) translateY(0%)", "pointer-events": "auto"},
    leave: {opacity: 0, transform: "scale(0.3, 0.9) translateY(100%)", "pointer-events": "none"},
    config: {mass: 1, friction: 30, tension: 380},
  });

  return menuTransition(
    (style, item) =>
      item && (
        <animated.div className="board-reactions-menu" ref={ref} style={style}>
          {boardReactions.map(([reactionType, emoji], index) => {
            const emojiWithSkinTone = emoji.skinToneSupported ? emoji.emoji + skinTone.component : emoji.emoji;
            return (
              <button
                key={reactionType}
                className="board-reactions-menu__item"
                aria-label={t("BoardReactionsMenu.react", {reaction: reactionType, shortcut: index + 1})}
                title={t("BoardReactionsMenu.react", {reaction: reactionType, shortcut: index + 1})}
                onClick={(e) => onClickReaction(e, reactionType)}
                disabled={!showBoardReactions}
              >
                <span>{emojiWithSkinTone}</span>
              </button>
            );
          })}
          <button className="board-reactions-menu__item board-reactions-menu__close" onClick={props.close} tabIndex={0} aria-hidden>
            <Close />
          </button>
        </animated.div>
      )
  );
});
