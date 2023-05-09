import {SERVER_HTTP_URL} from "../config";
import {Reaction} from "../types/reaction";

export const ReactionAPI = {
  addReaction: async (board: string, note: string, reactionType: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/notes/${note}/reactions`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          reactionType,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Reaction;
      }

      throw new Error(`create note request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to add reaction with error: ${error}`);
    }
  },
};
