import {Reaction} from "../store/features/reactions/types";
import {buildUrl} from "./index";

export const ReactionAPI = {
  /**
   * Get all reactions for a board
   *
   * @param boardId the board id
   *
   * @returns the requested reactions
   */
  getReactions: async (boardId: string): Promise<Reaction[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/reactions`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status == 200) {
        return (await response.json()) as Reaction[];
      }

      throw new Error(`get reactions request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get reactions`, {cause: error});
    }
  },

  /**
   * Get a reaction for a board
   *
   * @param boardId the board id
   * @param reactionId the reaction id
   *
   * @returns the requested reaction
   */
  getReaction: async (boardId: string, reactionId: string): Promise<Reaction> => {
    try {
      const url = buildUrl(`./boards/${boardId}/reactions/${reactionId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status == 200) {
        return (await response.json()) as Reaction;
      }

      throw new Error(`get reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get reaction`, {cause: error});
    }
  },

  /**
   * Add a new reaction to a note
   *
   * @param boardId board id
   * @param note note id
   * @param emoji reaction to add
   *
   * @returns the created reaction
   */
  addReaction: async (boardId: string, note: string, emoji: string): Promise<Reaction> => {
    try {
      const url = buildUrl(`./boards/${boardId}/reactions`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          note,
          reactionType: emoji,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Reaction;
      }

      throw new Error(`create reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to add reaction`, {cause: error});
    }
  },

  /**
   * Delete a reaction from a note
   *
   * @param boardId board id
   * @param reactionId reaction id
   */
  deleteReaction: async (boardId: string, reactionId: string) => {
    try {
      const url = buildUrl(`./boards/${boardId}/reactions/${reactionId}`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`create reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to remove reaction`, {cause: error});
    }
  },

  /**
   * Update a reaction
   *
   * @param boardId board id
   * @param reactionId reaction id
   * @param reactionType new reaction
   *
   * @returns updated reaction
   */
  updateReaction: async (boardId: string, reactionId: string, reactionType: string): Promise<Reaction> => {
    try {
      const url = buildUrl(`./boards/${boardId}/reactions/${reactionId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({reactionType}),
      });

      if (response.status === 200) {
        return (await response.json()) as Reaction;
      }

      throw new Error(`patch reaction request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to patch reaction`, {cause: error});
    }
  },
};
