import {SERVER_HTTP_URL} from "config";
import {BoardReactionType, ReactionType} from "types/reaction";

export const BoardReactionAPI = {
  addBoardReaction: async (boardId: string, reactionType: ReactionType) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/board-reactions`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          reactionType,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as BoardReactionType;
      }

      throw new Error(`create board reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board reaction with error: ${error}`);
    }
  },
};
