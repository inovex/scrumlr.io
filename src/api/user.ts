import {EditUserConfigurationRequest} from "types/user";
import {callAPI} from "./callApi";

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
   * @param userId the identifier of the user whose permissions are being changed
   * @param boardId the identifier of the board
   * @param editUserConfigurationRequest user configuration which needs to be changed
   * @returns a {status, description} object
   */
  editUserConfiguration: (userId: string, boardId: string, editUserConfigurationRequest: EditUserConfigurationRequest) =>
    callAPI("editUserConfiguration", {userId, boardId, editUserConfigurationRequest}),
};
