import {BoardReactionEventType, BoardReactionImageMap} from "types/reaction";
import "./BoardReaction.scss";
import {memo} from "react";

type BoardReactionProps = {
  reaction: BoardReactionEventType;
};

// component that displays a board reaction (emoji + name)
// memo prevents re-rendering even when parent state changes
export const BoardReaction = memo((props: BoardReactionProps) => {
  const emoji = BoardReactionImageMap.get(props.reaction.reactionType);
  const {name} = props.reaction.user.user;

  const getRandomNumber = (min: number, max: number): number => {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
  };

  const leftOffset = getRandomNumber(25, 75);

  return (
    <div className="board-reaction__root" style={{left: `${leftOffset}vw`}}>
      <div className="board-reaction__emoji-container">{emoji}</div>
      <div className="board-reaction__name-container">{name}</div>
    </div>
  );
});
