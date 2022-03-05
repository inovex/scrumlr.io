import {SERVER_URL} from "../config";

export const ParticipantsAPI = {
  /**
   * Create join request for a board session.
   * The return value might have the status `accepted` (user is permitted to join the board), `rejected` (the join
   * request of the user was rejected by an admin) or `pending`. If the state is pending the response will include
   * the reference on the join request state in the attribute `joinRequestReference`.
   *
   * @param boardId the board id
   * @param passphrase optional passphrase for the join request
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  joinBoard: async (boardId: string, passphrase?: string) => {
    const response = await fetch(`${SERVER_URL}/boards/${boardId}/participants`, {
      method: "POST",
      credentials: "include",
      redirect: "manual",
      body: JSON.stringify({passphrase}),
    });

    if (response.type === "opaqueredirect") {
      return {
        status: "accepted",
        joinRequestReference: "",
      };
    }

    // FIXME
    return {
      status: "rejected",
      joinRequestReference: "",
    };
  },

  /**
   * Changes the permissions of a participant.
   *
   * @param userId the identifier of the user whose permissions are being changed
   * @param boardId the identifier of the board
   * @param moderator the flag whether the user receives or loses moderator permissions
   * @returns a {status, description} object
   */
  changePermission: (userId: string, boardId: string, moderator: boolean) => {
    // TODO
  },
};
