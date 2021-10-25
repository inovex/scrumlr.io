import {callAPI} from "api/callApi";

export const VoteAPI = {
  /**
   * Add a vote to a note.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   * @returns a {status, description} object
   */
  addVote: (boardId: string, noteId: string) => callAPI("addVote", {boardId, noteId}),
  /**
   * Removes/Deletes a vote from a note.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   * @returns a {status, description} object
   */
  deleteVote: (boardId: string, noteId: string) => callAPI("removeVote", {boardId, noteId}),
};
