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

      throw new Error(`create reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to add reaction with error: ${error}`);
    }
  },

  removeReaction: async (board: string, note: string, reaction: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/notes/${note}/reactions/${reaction}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`create reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to remove reaction with error: ${error}`);
    }
  },
};
