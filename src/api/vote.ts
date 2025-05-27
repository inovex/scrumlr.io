import {SERVER_HTTP_URL} from "../config";
import {Vote} from "../store/features/votes/types";

export const VoteAPI = {
  /**
   * Add a vote to a note.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   * @returns a {status, description} object
   */
  addVote: async (boardId: string, noteId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/votes`, {
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
      throw new Error(`unable to create board: ${error}`);
    }
  },

  /**
   * Removes/Deletes a vote from a note.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   * @returns a {status, description} object
   */
  deleteVote: async (boardId: string, noteId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/votes`, {
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
      throw new Error(`unable to create board: ${error}`);
    }
  },
};
