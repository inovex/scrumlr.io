import {Vote} from "../store/features/votes/types";
import {buildUrl} from "./index";

export const VoteAPI = {
  /**
   * Get all votes for a board
   *
   * @param boardId board id
   *
   * @returns all votes
   */
  getVotes: async (boardId: string, votingId: string | null = null, noteId: string | null = null): Promise<Vote[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/votes`, [
        {key: "voting", value: votingId},
        {key: "note", value: noteId},
      ]);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Vote[];
      }

      throw new Error(`get votes request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get votes`, {cause: error});
    }
  },

  /**
   * Add a vote to a note.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   *
   * @returns created vote
   */
  addVote: async (boardId: string, noteId: string): Promise<Vote> => {
    try {
      const url = buildUrl(`./boards/${boardId}/votes`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          note: noteId,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Vote;
      }

      throw new Error(`add vote request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to add vote`, {cause: error});
    }
  },

  /**
   * Removes/Deletes a vote from a note.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   */
  deleteVote: async (boardId: string, noteId: string) => {
    try {
      const url = buildUrl(`./boards/${boardId}/votes`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        body: JSON.stringify({
          note: noteId,
        }),
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`delete vote request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete vote`, {cause: error});
    }
  },
};
