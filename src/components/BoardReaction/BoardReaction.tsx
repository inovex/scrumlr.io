import {BoardReactionType, BoardReactionImageMap} from "types/reaction";
import {memo} from "react";
import {getRandomNumberInRange} from "utils/random";
import {useAppSelector} from "store";
import "./BoardReaction.scss";

type BoardReactionProps = {
  reaction: BoardReactionType;
};

// component that displays a board reaction (emoji + name)
// memo prevents re-rendering even when parent state changes
export const BoardReaction = memo((props: BoardReactionProps) => {
  const emoji = BoardReactionImageMap.get(props.reaction.reactionType);
  const me = useAppSelector((state) => state.participants!.self);
  const others = useAppSelector((state) => state.participants!.others);
  const all = [me, ...others];
  const reactionUser = all.find((p) => p.user.id === props.reaction.user)!;
  const {name} = reactionUser.user;

  const leftOffset = getRandomNumberInRange(25, 75);

  return (
    <div className="board-reaction__root" style={{left: `${leftOffset}vw`}}>
      <div className="board-reaction__emoji-container">{emoji}</div>
      <div className="board-reaction__name-container">{name}</div>
    </div>
  );
});
