import {useEffect, useState} from "react";
import {BoardReactionEventType} from "types/reaction";
import {BoardReaction} from "../BoardReaction/BoardReaction";
import "./BoardReactionContainer.scss";

export const BoardReactionContainer = () => {
  const [reactions, setReactions] = useState<BoardReactionEventType[]>([]);

  useEffect(() => {
    const removeAfterDelay = (id: string, delay: number) => {
      setTimeout(() => {
        setReactions((prevState) => prevState.filter((r) => r.id !== id));
      }, delay);
    };
    const handle = (e: CustomEvent<BoardReactionEventType>) => {
      setReactions((prevState) => [...prevState, e.detail]);
      removeAfterDelay(e.detail.id, 5_000);
    };
    document.addEventListener("BoardReactionEvent", handle as EventListener);

    return () => document.removeEventListener("BoardReactionEvent", handle as EventListener);
  }, [reactions]);

  return (
    <div className="board-reaction-container__root">
      {reactions.map((r) => (
        <BoardReaction key={r.id} reaction={r} />
      ))}
    </div>
  );
};
