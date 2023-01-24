import {Participant} from "types/participant";
import {SERVER_HTTP_URL} from "../config";

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
    const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/participants`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({passphrase}),
    });

    // accept user if session already exists or was created
    if ((response.redirected && response.url.includes("/participants/")) || response.status === 201) {
      return {
        status: "ACCEPTED",
      };
    }

    // if board is protected a join request will be created and will be handled by the moderators of the board
    if (response.redirected && response.url.includes("/requests/")) {
      const body = (await response.json()) as {user: string; status: "PENDING" | "ACCEPTED" | "REJECTED"};
      return {
        status: body.status,
        joinRequestReference: response.url,
      };
    }

    // wrong passphrase
    if (response.status === 403) {
      return {
        status: "WRONG_PASSPHRASE",
      };
    }

    if (response.status === 429) {
      return {
        status: "TOO_MANY_JOIN_REQUESTS",
      };
    }

    return {
      status: "REJECTED",
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
  editParticipant: async (boardId: string, userId: string, participant: Partial<Omit<Participant, "user" | "connected">>) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/participants/${userId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(participant),
      });

      if (response.status === 200) {
        return (await response.json()) as Participant;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update participant: ${error}`);
    }
  },
  /**
   * Updates the ready states of all participants.
   *
   * @param boardId the identifier of the board
   * @param desiredReadyStates the value for the ready states
   */
  updateReadyStates: async (boardId: string, desiredReadyStates: boolean) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/participants`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ready: desiredReadyStates}),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to update ready states with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update ready states: ${error}`);
    }
  },
};
