import {ParticipantWithUserId, ParticipantRole} from "store/features/participants/types";
import {buildUrl} from "./index";

export const ParticipantsAPI = {
  /**
   * Get all sessions for a board
   *
   * @param boardId board id
   *
   * @return all sessions for a board
   */
  getParticipants: async (
    boardId: string,
    connected: boolean | null = null,
    ready: boolean | null = null,
    raisedHand: boolean | null = null,
    role: ParticipantRole | null = null
  ): Promise<ParticipantWithUserId[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/participants`, [
        {key: "connected", value: connected},
        {key: "ready", value: ready},
        {key: "raisedHand", value: raisedHand},
        {key: "role", value: role},
      ]);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as ParticipantWithUserId[];
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get participants`, {cause: error});
    }
  },

  /**
   * Get a session for a board
   *
   * @param boardId
   * @param userId
   *
   * @return a session for a board
   */
  getParticipant: async (boardId: string, userId: string): Promise<ParticipantWithUserId> => {
    try {
      const url = buildUrl(`./boards/${boardId}/participants/${userId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as ParticipantWithUserId;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get participant`, {cause: error});
    }
  },

  /**
   * Create join request for a board session.
   * The return value might have the status `accepted` (user is permitted to join the board), `rejected` (the join
   * request of the user was rejected by an admin) or `pending`. If the state is pending the response will include
   * the reference on the join request state in the attribute `joinRequestReference`.
   *
   * @param boardId the board id
   * @param passphrase optional passphrase for the join request
   *
   * @returns status of the join request
   */
  joinBoard: async (boardId: string, passphrase?: string) => {
    const url = buildUrl(`./boards/${boardId}/participants`);
    const response = await fetch(url, {
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

    // 403 is currently returned in multiple cases:
    // - user tried to join a protected board without a passphrase (first join request to check if board is protected)
    // - user tried to join a protected board with a wrong passphrase
    // - user tried to join a board where they are currently banned
    // TODO: doing this with proper error codes would be better, especially the check for the banned status
    if (response.status === 403 || response.status === 400) {
      const body = (await response.json()) as {status: string; error: string};
      if (body.error === "participant is currently banned from this session") {
        return {
          status: "BANNED",
        };
      }

      if (passphrase === undefined) {
        // board is protected by a passphrase
        return {
          status: "PASSPHRASE_REQUIRED",
        };
      }

      // wrong passphrase
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
   *
   * @returns updated session
   */
  editParticipant: async (boardId: string, userId: string, participant: Partial<Omit<ParticipantWithUserId, "user" | "connected">>): Promise<ParticipantWithUserId> => {
    try {
      const url = buildUrl(`./boards/${boardId}/participants/${userId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(participant),
      });

      if (response.status === 200) {
        return (await response.json()) as ParticipantWithUserId;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update participant`, {cause: error});
    }
  },

  /**
   * Updates the ready states of all participants.
   *
   * @param boardId the identifier of the board
   * @param desiredReadyStates the value for the ready states
   *
   * @return all updated sessions
   */
  updateReadyStates: async (boardId: string, desiredReadyStates: boolean): Promise<ParticipantWithUserId> => {
    try {
      const url = buildUrl(`./boards/${boardId}/participants`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ready: desiredReadyStates}),
      });

      if (response.status === 200) {
        return (await response.json()) as ParticipantWithUserId;
      }

      throw new Error(`unable to update ready states with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update ready states`, {cause: error});
    }
  },
};
