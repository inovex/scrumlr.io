import {BoardReaction} from "components/BoardReaction/BoardReaction";
import {useAppSelector} from "store";
import "./BoardReactionContainer.scss";

export const BoardReactionContainer = () => {
  const boardReactions = useAppSelector((state) => state.boardReactions);
  const showBoardReactions = useAppSelector((state) => state.view.showBoardReactions);

  return <div className="board-reaction-container__root">{showBoardReactions && boardReactions.map((r) => <BoardReaction key={r.id} reaction={r} />)}</div>;
};
