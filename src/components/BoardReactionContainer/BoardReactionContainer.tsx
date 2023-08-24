import {useEffect} from "react";
import {BoardReaction} from "types/reaction";

export const BoardReactionContainer = () => {
  useEffect(() => {
    const handle = (e: CustomEvent<BoardReaction>) => {
      console.log("evnt", e.detail);
    };
    document.addEventListener("BoardReactionEvent", handle as EventListener);

    return () => document.removeEventListener("BoardReactionEvent", handle as EventListener);
  }, []);

  return <div className="board-reaction-container__root" />;
};
