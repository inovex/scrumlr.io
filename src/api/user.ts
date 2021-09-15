import {callAPI} from "./callApi";

export const UserAPI = {
  /**
   * Changes the permissions of a participant.
   *
   * @param userId the identifier of the user whose permissions are being changed
   * @param boardId the identifier of the board
   * @param moderator the flag wheter the user recieves or loses moderator permissions
   * @returns a {status, description} object
   */
  changePermission: (userId: string, boardId: string, moderator: boolean) => callAPI("changePermission", {userId, boardId, moderator}),
};
