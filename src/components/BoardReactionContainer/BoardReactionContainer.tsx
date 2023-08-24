import {useEffect, useState} from "react";
import {BoardReaction} from "types/reaction";

export const BoardReactionContainer = () => {
  const [reactions, setReactions] = useState<BoardReaction[]>([]);
  useEffect(() => {
    const handle = (e: CustomEvent<BoardReaction>) => {
      setReactions([...reactions, e.detail]);
    };
    document.addEventListener("BoardReactionEvent", handle as EventListener);

    return () => document.removeEventListener("BoardReactionEvent", handle as EventListener);
  }, [reactions]);

  return (
    <div className="board-reaction-container__root">
      {reactions.map((r) => (
        <div>{r.reactionType}</div>
      ))}
    </div>
  );
};
