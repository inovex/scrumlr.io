import {BoardReactionEventType, BoardReactionImageMap} from "types/reaction";
import "./BoardReaction.scss";

type BoardReactionProps = {
  reaction: BoardReactionEventType;
};

export const BoardReaction = (props: BoardReactionProps) => {
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
};
