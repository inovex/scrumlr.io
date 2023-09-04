import {useEffect, useState} from "react";
import {BoardReactionType} from "types/reaction";
import {ADD_BOARD_REACTION, REMOVE_BOARD_REACTION} from "utils/boardReaction";
import {BoardReaction} from "components/BoardReaction/BoardReaction";
import "./BoardReactionContainer.scss";

export const BoardReactionContainer = () => {
  const [boardReactions, setBoardReactions] = useState<BoardReactionType[]>([]);

  useEffect(() => {
    // event handlers
    const handleAdd = (e: CustomEvent<BoardReactionType>) => {
      const newBoardReaction = e.detail;
      setBoardReactions((prevState) => [...prevState, newBoardReaction]); // add to state
    };

    const handleRemove = (e: CustomEvent<string>) => {
      const removeBoardReactionId = e.detail;
      setBoardReactions((prevState) => prevState.filter((br) => br.id !== removeBoardReactionId)); // remove from state
    };

    // event subscriptions
    document.addEventListener(ADD_BOARD_REACTION, handleAdd as EventListener);
    document.addEventListener(REMOVE_BOARD_REACTION, handleRemove as EventListener);

    // cleanup
    return () => {
      document.removeEventListener(ADD_BOARD_REACTION, handleAdd as EventListener);
      document.removeEventListener(REMOVE_BOARD_REACTION, handleRemove as EventListener);
    };
  }, [boardReactions]);

  return (
    <div className="board-reaction-container__root">
      {boardReactions.map((r) => (
        <BoardReaction key={r.id} reaction={r} />
      ))}
    </div>
  );
};
