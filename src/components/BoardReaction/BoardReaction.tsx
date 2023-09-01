import {BoardReactionType, BoardReactionImageMap} from "types/reaction";
import {memo} from "react";
import {getRandomNumberInRange} from "utils/random";
import "./BoardReaction.scss";

type BoardReactionProps = {
  reaction: BoardReactionType;
};

// component that displays a board reaction (emoji + name)
// memo prevents re-rendering even when parent state changes
export const BoardReaction = memo((props: BoardReactionProps) => {
  const emoji = BoardReactionImageMap.get(props.reaction.reactionType);
  const {name} = props.reaction.user.user;

  const leftOffset = getRandomNumberInRange(25, 75);

  return (
    <div className="board-reaction__root" style={{left: `${leftOffset}vw`}}>
      <div className="board-reaction__emoji-container">{emoji}</div>
      <div className="board-reaction__name-container">{name}</div>
    </div>
  );
});
