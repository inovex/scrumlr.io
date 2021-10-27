import {EditUserConfigurationRequest} from "types/user";
import {callAPI} from "api/callApi";

export const UserAPI = {
  /**
   * Changes the permissions of a participant.
   *
   * @param userId the identifier of the user whose permissions are being changed
   * @param boardId the identifier of the board
   * @param moderator the flag whether the user receives or loses moderator permissions
   * @returns a {status, description} object
   */
  changePermission: (userId: string, boardId: string, moderator: boolean) => callAPI("changePermission", {userId, boardId, moderator}),

  /**
   * Changes the configuration of a user.
   *
   * @param boardId the identifier of the board
   * @param userConfiguration user configuration which needs to be changed
   * @returns a {status, description} object
   */
  editUserConfiguration: (boardId: string, userConfiguration: EditUserConfigurationRequest) => callAPI("editUserConfiguration", {boardId, userConfiguration}),

  /**
   * Set the ready state of a user
   *
   * @param boardId the identifier of the board
   * @param ready the ready state of the user
   * @returns a {status, description} object
   */
  setReadyStatus: (boardId: string, ready: boolean) => callAPI("setReadyStatus", {boardId, ready}),
};
