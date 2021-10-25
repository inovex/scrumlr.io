import {callAPI} from "api/callApi";

export const VoteAPI = {
  /**
   * Changes the permissions of a participant.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   * @returns a {status, description} object
   */
  addVote: (boardId: string, noteId: string) => callAPI("addVote", {boardId, noteId}),
  /**
   * Changes the permissions of a participant.
   *
   * @param boardId the identifier of the board
   * @param noteId the note id
   * @returns a {status, description} object
   */
  deleteVote: (boardId: string, noteId: string) => callAPI("removeVote", {boardId, noteId}),
};
