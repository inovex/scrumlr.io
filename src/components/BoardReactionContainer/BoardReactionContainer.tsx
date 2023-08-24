import {useEffect, useState} from "react";
import {BoardReactionEventType} from "types/reaction";
import {BoardReaction} from "../BoardReaction/BoardReaction";
import "./BoardReactionContainer.scss";

export const BoardReactionContainer = () => {
  const [reactions, setReactions] = useState<BoardReactionEventType[]>([]);
  useEffect(() => {
    const handle = (e: CustomEvent<BoardReactionEventType>) => {
      setReactions([...reactions, e.detail]);
    };
    document.addEventListener("BoardReactionEvent", handle as EventListener);

    return () => document.removeEventListener("BoardReactionEvent", handle as EventListener);
  }, [reactions]);

  return (
    <div className="board-reaction-container__root">
      {reactions.map((r) => (
        <BoardReaction reaction={r} />
      ))}
    </div>
  );
};
