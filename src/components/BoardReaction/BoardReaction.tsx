import {BoardReactionEventType, BoardReactionImageMap} from "types/reaction";
import "./BoardReaction.scss";

type BoardReactionProps = {
  reaction: BoardReactionEventType;
};

export const BoardReaction = (props: BoardReactionProps) => {
  const emoji = BoardReactionImageMap.get(props.reaction.reactionType);
  const {name} = props.reaction.user.user;

  return (
    <div className="board-reaction__root">
      <div className="board-reaction__emoji-container">{emoji}</div>
      <div className="board-reaction__name-container">{name}</div>
    </div>
  );
};
