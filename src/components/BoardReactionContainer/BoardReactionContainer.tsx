import {useEffect} from "react";
import {ReactionType} from "types/reaction";

export const BoardReactionContainer = () => {
  useEffect(() => {
    const handle = (e: CustomEvent<ReactionType>) => {
      console.log("evnt", e.detail);
    };
    document.addEventListener("BoardReaction", handle as EventListener);

    return () => document.removeEventListener("BoardReaction", handle as EventListener);
  }, []);

  return <div className="board-reaction-container__root" />;
};
