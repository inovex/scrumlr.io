import {BoardReactionType} from "store/features/boardReactions/types";
import {buildUrl} from "./index";

export const BoardReactionAPI = {
  /**
   * Add a board reaction
   *
   * @param boardId board id
   * @param reactionType reaction type
   *
   * @returns created board reaction
   */
  addBoardReaction: async (boardId: string, reactionType: string): Promise<BoardReactionType> => {
    try {
      const url = buildUrl(`./boards/${boardId}/board-reactions`);
      const response = await fetch(url, {
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
      throw new Error(`unable to create board reaction`, {cause: error});
    }
  },
};
