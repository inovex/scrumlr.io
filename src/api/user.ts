import {callAPI} from "api/callApi";
import {SERVER_URL} from "../config";

export const UserAPI = {
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/user`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return await response.json();
      }
    } catch (error) {
      throw new Error(`unable to fetch current user: ${error}`);
    }

    return undefined;
  },

  /**
   * Changes the permissions of a participant.
   *
   * @param userId the identifier of the user whose permissions are being changed
   * @param boardId the identifier of the board
   * @param moderator the flag whether the user receives or loses moderator permissions
   * @returns a {status, description} object
   */
  changePermission: (userId: string, boardId: string, moderator: boolean) => callAPI("changePermission", {userId, boardId, moderator}),
};
