import {BOARD_REACTION_EMOJI_MAP, BoardReactionType} from "types/boardReaction";
import {memo, useRef} from "react";
import {getRandomNumberInRange} from "utils/random";
import {useAppSelector} from "store";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useSize} from "utils/hooks/useSize";
import "./BoardReaction.scss";

type BoardReactionProps = {
  reaction: BoardReactionType;
};

// component that displays a board reaction (emoji + name)
// memo prevents re-rendering even when parent state changes
export const BoardReaction = memo((props: BoardReactionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();
  const emoji = BOARD_REACTION_EMOJI_MAP.get(props.reaction.reactionType);
  const me = useAppSelector((state) => state.participants!.self);
  const others = useAppSelector((state) => state.participants!.others);
  const all = [me, ...others];
  const reactionUser = all.find((p) => p.user.id === props.reaction.user)!;
  const {name} = reactionUser.user;
  const reactedSelf = reactionUser.user.id === me.user.id;
  const displayName = reactedSelf ? t("BoardReaction.me") : name;

  // calculates a random offset, taking the width of the container and viewport into account
  // so that it is never displayed outside the viewport
  // returned value unit is in vw
  // display range: 0vw <= offset <= (100vw - containerWidth)
  const calcRandomOffsetVW = (dimensions?: DOMRect): number => {
    const {innerWidth} = window;
    // PX to VW formula from https://cssunitconverter.vercel.app/px-to-vw#faq
    const containerWidthVW = ((dimensions?.width ?? 0) / innerWidth) * 100;
    // choose offset randomly within the range defined above
    return getRandomNumberInRange(0, 100 - containerWidthVW);
  };

  const containerDimensions = useSize(containerRef);
  const offset = calcRandomOffsetVW(containerDimensions);

  return (
    <div className="board-reaction__root" ref={containerRef} style={{left: `${offset}vw`}}>
      <div className="board-reaction__emoji-container">{emoji}</div>
      <div className={classNames("board-reaction__name-container", {"board-reaction__name-container--self": reactedSelf})}>{displayName}</div>
    </div>
  );
});
