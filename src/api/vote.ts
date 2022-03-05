import {SERVER_URL} from "../config";

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
      const response = await fetch(`${SERVER_URL}/boards/${boardId}/votes`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          note: noteId,
        }),
      });

      if (response.status === 201) {
        const body = await response.json();
        return {
          voting: body.voting,
          note: body.note,
        };
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
      const response = await fetch(`${SERVER_URL}/boards/${boardId}/votes`, {
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
