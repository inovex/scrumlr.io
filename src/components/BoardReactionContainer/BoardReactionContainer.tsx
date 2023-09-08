import {BoardReaction} from "components/BoardReaction/BoardReaction";
import {useAppSelector} from "store";
import "./BoardReactionContainer.scss";

export const BoardReactionContainer = () => {
  const boardReactions = useAppSelector((state) => state.boardReactions);

  return (
    <div className="board-reaction-container__root">
      {boardReactions.map((r) => (
        <BoardReaction key={r.id} reaction={r} />
      ))}
    </div>
  );
};
